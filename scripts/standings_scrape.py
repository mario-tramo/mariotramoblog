#!/usr/bin/env python3
"""
Daily Standings scrape (unified, robust).

Primary source: FBref via soccerdata.  FBref sits behind a Cloudflare managed
challenge that frequently blocks automated runners; when FBref is unreachable
or returns invalid data for a league, this script transparently falls back to
the Wikipedia REST source so standings are still ingested.

Both sources share the same ingest API payload shape and the same resilient
conventions as ``scripts/standings_scrape_wikipedia.py`` (whose helpers are
reused here): strict table validation, ``STANDINGS_ALLOW_PARTIAL`` /
``STANDINGS_ALLOW_NO_DATA`` handling, heartbeat via ``/api/cron/standings``,
and optional fixture output.

Team crests are extracted from the FBref standings page HTML using
BeautifulSoup, so no external API key is needed.

Anti-corruption choices:
  - A cheap circuit breaker probes FBref once per run; if it is challenge-gated
    we skip FBref for every league instead of burning minutes on its internal
    5x CAPTCHA retries.
  - All numeric fields are coerced via ``.get(col, 0)`` so a missing FBref
    column (rename, regression) becomes 0, not a KeyError.
"""

from __future__ import annotations

import json
import logging
import os
import sys
from typing import Any

import requests
from bs4 import BeautifulSoup

import standings_scrape_wikipedia as wiki

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [standings] %(levelname)s %(message)s",
)
log = logging.getLogger("standings")

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}

# FBref competition IDs (stable across seasons)
FBREF_COMP_IDS = {
    "Serie A": 11,
    "Premier League": 9,
    "La Liga": 12,
    "Bundesliga": 20,
    "Ligue 1": 13,
}

SOCCERDATA_LEAGUE_NAMES = {
    "Serie A": "ITA-Serie A",
    "Premier League": "ENG-Premier League",
    "La Liga": "ESP-La Liga",
    "Bundesliga": "GER-Bundesliga",
    "Ligue 1": "FRA-Ligue 1",
}

_FBREF_AVAILABLE: bool | None = None


def fbref_standings_url(league: str, season: str) -> str | None:
    """Construct the FBref standings page URL for a league + season."""
    comp_id = FBREF_COMP_IDS.get(league)
    if comp_id is None:
        return None
    slug = league.replace(" ", "-") + "-Stats"
    return f"https://fbref.com/en/comps/{comp_id}/{season}/{slug}"


def check_fbref_available() -> bool:
    """Circuit breaker: skip FBref entirely when it is challenge-gated.

    Probes the FBref homepage once per run.  Plain ``requests`` cannot solve
    the Cloudflare managed challenge, so a 403 / "Just a moment..." response
    means every league would fail its internal 5x retry loop; short-circuiting
    here makes the whole run fast and lets the Wikipedia fallback kick in.
    """
    global _FBREF_AVAILABLE
    if _FBREF_AVAILABLE is not None:
        return _FBREF_AVAILABLE
    try:
        resp = requests.get("https://fbref.com/", headers=REQUEST_HEADERS, timeout=20)
        html = resp.text[:500]
        _FBREF_AVAILABLE = resp.status_code == 200 and "Just a moment" not in html
    except requests.RequestException:
        _FBREF_AVAILABLE = False
    if not _FBREF_AVAILABLE:
        log.warning("FBref is challenge-gated; using Wikipedia fallback for all leagues")
    return _FBREF_AVAILABLE


def to_int(value: Any) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def extract_crests(url: str) -> list[str]:
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


def scrape_fbref_league(
    league: str, code: str, season_str: str
) -> list[dict[str, Any]] | None:
    """Try FBref for one league; return validated rows or None on any failure."""
    if not check_fbref_available():
        return None

    fb_url = fbref_standings_url(league, season_str)
    crest_urls: list[str] = []
    if fb_url:
        crest_urls = extract_crests(fb_url)

    try:
        import soccerdata as sd

        fbref = sd.FBref(
            leagues=[SOCCERDATA_LEAGUE_NAMES.get(league, league)],
            seasons=season_str,
        )
        df = fbref.read_team_season_stats(stat_type="standard")
    except Exception as e:
        log.warning("FBref scrape failed for %s: %s", league, e)
        return None

    if df is None or df.empty:
        log.warning("no FBref data for %s", league)
        return None

    rows = normalize_table(df, crest_urls)
    if not rows:
        log.warning("empty FBref table for %s", league)
        return None

    try:
        wiki.validate_table(rows, code)
    except ValueError as e:
        log.warning("FBref table for %s failed validation: %s", code, e)
        return None

    return rows


def main() -> int:
    start = int(os.environ.get("STANDINGS_SEASON_START", wiki.current_season_start()))
    season_str = f"{start}-{start + 1}"
    requested = {
        name.strip()
        for name in os.environ.get("STANDINGS_LEAGUES", "").split(",")
        if name.strip()
    }

    standings: dict[str, dict[str, Any]] = {}
    missing: list[str] = []

    for code, config in wiki.LEAGUES.items():
        if requested and config["name"] not in requested:
            continue
        log.info("fetching %s (%s) season %s", config["name"], code, start)

        source = "FBref"
        rows = scrape_fbref_league(config["name"], code, season_str)
        if rows is None:
            source = "Wikipedia"
            rows = wiki.fetch_league(code, start)

        if rows is None:
            missing.append(code)
            continue
        standings[code] = {
            "competition": {"code": code, "name": config["name"]},
            "season": str(start),
            "table": rows,
        }
        log.info("  -> %d teams for %s (via %s)", len(rows), code, source)

    allow_partial = os.environ.get("STANDINGS_ALLOW_PARTIAL", "").lower() in {"1", "true", "yes"}
    allow_no_data = os.environ.get("STANDINGS_ALLOW_NO_DATA", "1").lower() in {"1", "true", "yes"}

    if missing and not allow_partial:
        if not standings and allow_no_data:
            log.info("no current-season tables are available yet; leaving existing data untouched")
            wiki.send_heartbeat(status="skipped", reason="current season tables unavailable")
            return 0
        log.error("refusing to ingest incomplete standings; missing: %s", ", ".join(missing))
        wiki.send_heartbeat(status="failed", reason=f"missing competitions: {','.join(missing)}")
        return 1

    if not standings:
        log.error("no valid standings found")
        wiki.send_heartbeat(status="failed", reason="no valid standings")
        return 1

    webhook_url = os.environ.get("STANDINGS_WEBHOOK_URL", "")
    secret = os.environ.get("STANDINGS_INGEST_SECRET", "")
    if not webhook_url or not secret:
        log.error("STANDINGS_WEBHOOK_URL and STANDINGS_INGEST_SECRET are required")
        return 1

    payload = wiki.build_payload(start, standings)
    if not wiki.post_payload(payload, webhook_url, secret):
        wiki.send_heartbeat(status="failed", reason="standings ingest failed")
        return 1

    fixture_path = os.environ.get("STANDINGS_FIXTURE_PATH", "")
    if fixture_path:
        with open(fixture_path, "w", encoding="utf-8") as output:
            json.dump(payload, output, ensure_ascii=False, indent=2)
            output.write("\n")
        log.info("wrote fixture -> %s", fixture_path)

    wiki.send_heartbeat()
    return 0


if __name__ == "__main__":
    sys.exit(main())
