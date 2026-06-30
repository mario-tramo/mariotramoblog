#!/usr/bin/env python3
"""
Daily Standings scrape.

Reads public FBref league tables via the `soccerdata` library, normalizes
each table to a flat list of dicts, then POSTs to the Next.js ingest
endpoint for Redis storage.

Team crests are extracted from the FBref standings page HTML using
BeautifulSoup, so no external API key is needed.

Anti-corruption choices:
  - All numeric fields are coerced via `.get(col, 0)` so a missing
    FBref column (rename, regression) becomes 0, not a KeyError.
  - We retry on 429 / 5xx with exponential backoff + jitter.
"""

from __future__ import annotations

import json
import logging
import os
import random
import sys
import time
from datetime import datetime, timezone
from typing import Any

import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [standings] %(levelname)s %(message)s",
)
log = logging.getLogger("standings")

WEBHOOK_URL = (
    os.environ["STANDINGS_WEBHOOK_URL"].rstrip("/") + "/api/standings/ingest"
)
SECRET = os.environ["STANDINGS_INGEST_SECRET"]
HEARTBEAT_URL = os.environ.get("STANDINGS_HEARTBEAT_URL", "").rstrip("/") + "/api/cron/standings"
HEARTBEAT_SECRET = os.environ.get("CRON_SECRET", "")
LEAGUES = [
    s.strip()
    for s in os.environ.get(
        "STANDINGS_LEAGUES",
        "Serie A,Premier League,La Liga,Bundesliga,Ligue 1",
    ).split(",")
    if s.strip()
]
MAX_RETRIES = 3

LEAGUE_TO_CODE = {
    "Serie A": "SA",
    "Premier League": "PL",
    "La Liga": "PD",
    "Bundesliga": "BL1",
    "Ligue 1": "FL1",
}

# FBref competition IDs (stable across seasons)
FBREF_COMP_IDS = {
    "Serie A": 11,
    "Premier League": 9,
    "La Liga": 12,
    "Bundesliga": 20,
    "Ligue 1": 13,
}

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


def current_season_start() -> int:
    now = datetime.now(timezone.utc)
    return now.year if now.month >= 7 else now.year - 1


def league_code(name: str) -> str:
    return LEAGUE_TO_CODE.get(name.strip(), name.strip()[:2].upper())


def to_int(value: Any) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def fbref_standings_url(league: str, season: str) -> str | None:
    """Construct the FBref standings page URL for a league + season."""
    comp_id = FBREF_COMP_IDS.get(league)
    if comp_id is None:
        return None
    slug = league.replace(" ", "-") + "-Stats"
    return f"https://fbref.com/en/comps/{comp_id}/{season}/{slug}"


def extract_crests(
    url: str,
) -> list[str]:
    """Parse FBref standings HTML and return crest URLs ordered by position.

    Returns a list of absolute crest URLs, one per table row, in the same
    order as the standings table (1st = position 1, etc.).  Empty strings
    for rows where no crest was found.
    """
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.warning("failed to fetch crest page: %s", e)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    # The standard standings table
    table = soup.find("table", id="stats_squads_standard")
    if not table:
        log.warning("standings table not found in FBref HTML")
        return []

    crests: list[str] = []
    for row in table.select("tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 2:
            continue
        squad_cell = cells[1]  # Second column is Squad
        img = squad_cell.find("img")
        if img:
            src = img.get("src", "") or ""
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                src = "https://fbref.com" + src
            crests.append(src)
        else:
            crests.append("")

    if crests:
        log.info("  extracted %d crest URLs from FBref HTML", len(crests))
    return crests


def normalize_table(df, crest_urls: list[str]) -> list[dict[str, Any]]:
    """Turn a soccerdata league-table DataFrame into plain dicts."""
    df_clean = df.reset_index()
    rows: list[dict[str, Any]] = []

    for i, (_, row) in enumerate(df_clean.iterrows()):
        row_dict = row.to_dict()
        entry: dict[str, Any] = {
            "position": to_int(row_dict.get("Rk")),
            "team": str(row_dict.get("Squad") or ""),
            "playedGames": to_int(row_dict.get("MP") or row_dict.get("P")),
            "won": to_int(row_dict.get("W")),
            "draw": to_int(row_dict.get("D")),
            "lost": to_int(row_dict.get("L")),
            "goalsFor": to_int(row_dict.get("GF")),
            "goalsAgainst": to_int(row_dict.get("GA")),
            "goalDifference": to_int(row_dict.get("GD")),
            "points": to_int(row_dict.get("Pts")),
        }
        # Attach crest URL from HTML parsing (matched by position)
        if i < len(crest_urls) and crest_urls[i]:
            entry["crest"] = crest_urls[i]
        rows.append(entry)

    return rows


def main() -> int:
    import soccerdata as sd

    season_start = current_season_start()
    season_str = f"{season_start}-{season_start + 1}"
    all_standings: dict[str, dict[str, Any]] = {}

    for league in LEAGUES:
        comp = league_code(league)
        log.info("scraping %s (%s) season %s", league, comp, season_str)

        # --- 1. Fetch crests from FBref HTML ---
        fb_url = fbref_standings_url(league, season_str)
        crest_urls: list[str] = []
        if fb_url:
            crest_urls = extract_crests(fb_url)
        else:
            log.warning("no FBref URL mapping for %s", league)

        # --- 2. Read structured data via soccerdata ---
        try:
            fbref = sd.FBref(leagues=[league], seasons=season_str)
            df = fbref.read_league_table()
        except Exception as e:
            log.error("failed to scrape %s: %s", league, e)
            continue

        if df is None or df.empty:
            log.warning("no data for %s", league)
            continue

        table = normalize_table(df, crest_urls)
        if not table:
            log.warning("empty table for %s", league)
            continue

        all_standings[comp] = {
            "competition": {"code": comp, "name": league},
            "season": str(season_start),
            "table": table,
        }
        log.info("  -> %d teams for %s", len(table), comp)

    if not all_standings:
        log.error("no standings scraped for any league")
        return 1

    payload = {
        "season": str(season_start),
        "standings": all_standings,
    }

    headers = {
        "Authorization": f"Bearer {SECRET}",
        "Content-Type": "application/json",
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                WEBHOOK_URL, headers=headers, json=payload, timeout=120
            )
            if resp.status_code in (200, 204):
                log.info(
                    "ingested %d competitions (status %d)",
                    len(all_standings),
                    resp.status_code,
                )
                send_heartbeat()
                return 0
            if resp.status_code in (429, 500, 502, 503, 504):
                wait = (2**attempt) + random.uniform(0, 3)
                log.warning("status %d, retrying in %.1fs", resp.status_code, wait)
                time.sleep(wait)
                continue
            log.error(
                "non-retriable status %d: %s", resp.status_code, resp.text[:300]
            )
            send_heartbeat(status="failed", reason=f"non-retriable status {resp.status_code}")
            return 1
        except requests.RequestException as e:
            log.error("transport error: %s", e)
            time.sleep((2**attempt) + random.uniform(0, 3))

    send_heartbeat(status="failed", reason="max retries exceeded")
    return 1


def send_heartbeat(status: str = "ok", reason: str = "") -> None:
    """Notify the Next.js cron endpoint that this scrape completed.

    The cron endpoint reports the heartbeat outcome to Sentry so the
    daily-scrape health is visible in the Sentry dashboard.
    """
    if not HEARTBEAT_URL or not HEARTBEAT_SECRET:
        return
    try:
        resp = requests.get(
            HEARTBEAT_URL,
            headers={
                "x-cron-secret": HEARTBEAT_SECRET,
                "User-Agent": "standings-scraper/1.0",
            },
            params={"status": status, "reason": reason} if reason else {"status": status},
            timeout=15,
        )
        if resp.status_code == 200:
            log.info("heartbeat sent (status=%s)", status)
        else:
            log.warning("heartbeat returned status %d", resp.status_code)
    except requests.RequestException as e:
        log.warning("heartbeat failed: %s", e)


if __name__ == "__main__":
    sys.exit(main())
