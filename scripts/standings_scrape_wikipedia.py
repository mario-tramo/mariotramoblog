#!/usr/bin/env python3
"""Fetch league standings from Wikipedia and send them to the ingest API.

FBref blocks GitHub Actions runners with 403/CAPTCHA responses, so the
scheduled standings job deliberately does not depend on FBref or soccerdata.
This script uses Wikipedia's public REST HTML endpoint, validates every table
before building a payload, and writes only through the authenticated Next.js
``/api/standings/ingest`` endpoint.

The current season is selected from UTC time. During the off-season, when the
new season article/table is not available yet, the script exits successfully
without overwriting the previous Redis data. It never relabels an old season
as the current one.
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [standings] %(levelname)s %(message)s",
)
log = logging.getLogger("standings")

REQUEST_HEADERS = {
    # Wikimedia asks automated clients to identify themselves clearly.
    "User-Agent": "TrmSportStandings/1.0 (https://trmsport.com; standings@trmsport.com)",
    "Accept": "text/html",
}
MAX_RETRIES = 3

LEAGUES = {
    "SA": {"name": "Serie A", "expectedTeams": 20},
    "PL": {"name": "Premier League", "expectedTeams": 20},
    "PD": {"name": "La Liga", "expectedTeams": 20},
    "BL1": {"name": "Bundesliga", "expectedTeams": 18},
    "FL1": {"name": "Ligue 1", "expectedTeams": 18},
}

NAME_MAP = {
    "Inter Milan": "Inter",
    "Hellas Verona": "Verona",
    "Tottenham Hotspur": "Tottenham",
    "Brighton & Hove Albion": "Brighton",
    "Manchester United": "Manchester Utd",
    "Wolverhampton Wanderers": "Wolves",
    "Nottingham Forest": "Nott'm Forest",
    "Athletic Bilbao": "Athletic Club",
    "Bayern Munich": "Bayern München",
    "Paris Saint-Germain": "Paris SG",
    "Olympique Marseille": "Marseille",
    "Olympique Lyonnais": "Lyon",
}


class ArticleNotFound(Exception):
    """Raised when a season article has not been published yet."""


def current_season_start(now: datetime | None = None) -> int:
    """Return the start year for the football season containing ``now``."""
    current = now or datetime.now(timezone.utc)
    return current.year if current.month >= 7 else current.year - 1


def season_label(start: int) -> str:
    return f"{start}\u2013{str(start + 1)[-2:]}"


def article_title_candidates(league: str, start: int) -> list[str]:
    """Return common Wikipedia title variants, preferred en-dash first."""
    label = season_label(start)
    hyphen_label = f"{start}-{str(start + 1)[-2:]}"
    return [f"{label} {league}", f"{hyphen_label} {league}"]


def to_int(value: Any) -> int:
    text = re.sub(r"\[[^\]]*\]", "", str(value or ""))
    text = text.replace("\u2212", "-").replace("\u2013", "-")
    match = re.search(r"-?\d+", text.replace(" ", ""))
    return int(match.group()) if match else 0


def clean_team(value: str) -> str:
    text = re.sub(r"\[[^\]]*\]", "", value)
    text = re.sub(r"\((?:C|R|O|A|P|E|Q|X)\)", "", text)
    text = re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()
    return NAME_MAP.get(text, text)


def normalized_header(value: str) -> str:
    label = re.sub(r"[^a-z]", "", value.lower())
    # Wikipedia standings tables append "v t e" (view / talk / edit) navigation
    # links to the Team header cell, e.g. "Team v t e" -> "teamvte". Strip the
    # suffix so the header still normalizes to "team".
    return label.replace("vte", "")


def find_table_and_columns(soup: BeautifulSoup) -> tuple[Any, dict[str, int]] | None:
    aliases = {
        "position": {"pos", "position", "rank"},
        "team": {"team", "club", "squad"},
        "playedGames": {"pld", "mp", "played"},
        "won": {"w", "won"},
        "draw": {"d", "draw", "drawn"},
        "lost": {"l", "lost"},
        "goalsFor": {"gf", "goalsfor"},
        "goalsAgainst": {"ga", "goalsagainst"},
        "points": {"pts", "points", "p"},
    }
    required = set(aliases)

    for table in soup.find_all("table"):
        for header_index, row in enumerate(table.find_all("tr")[:5]):
            cells = row.find_all(["th", "td"])
            labels = [normalized_header(cell.get_text(" ", strip=True)) for cell in cells]
            columns: dict[str, int] = {}
            for index, label in enumerate(labels):
                for field, accepted in aliases.items():
                    if label in accepted and field not in columns:
                        columns[field] = index
            if required.issubset(columns):
                return table, {"header": header_index, **columns}
    return None


def parse_table_html(html: str, title: str = "") -> list[dict[str, Any]]:
    """Parse a Wikipedia standings table into the ingest row shape."""
    soup = BeautifulSoup(html, "lxml")
    found = find_table_and_columns(soup)
    if found is None:
        raise ValueError(f"standings table not found for '{title}'")

    table, columns = found
    rows: list[dict[str, Any]] = []
    table_rows = table.find_all("tr")
    for row_idx, row in enumerate(table_rows[columns["header"] + 1 :], start=1):
        cells = row.find_all(["th", "td"])
        if not cells or max(columns.values()) >= len(cells):
            continue
        team = clean_team(cells[columns["team"]].get_text(" ", strip=True))
        if not team:
            continue
        # Position is assigned by row order rather than the cell value: some
        # league tables (e.g. Bundesliga) render tied teams as the same number
        # and skip the next, so the cell can't be trusted to yield a clean 1..N.
        position = row_idx
        goals_for = to_int(cells[columns["goalsFor"]].get_text(" ", strip=True))
        goals_against = to_int(cells[columns["goalsAgainst"]].get_text(" ", strip=True))
        rows.append(
            {
                "position": position,
                "team": team,
                "playedGames": to_int(cells[columns["playedGames"]].get_text(" ", strip=True)),
                "won": to_int(cells[columns["won"]].get_text(" ", strip=True)),
                "draw": to_int(cells[columns["draw"]].get_text(" ", strip=True)),
                "lost": to_int(cells[columns["lost"]].get_text(" ", strip=True)),
                "goalsFor": goals_for,
                "goalsAgainst": goals_against,
                "goalDifference": goals_for - goals_against,
                "points": to_int(cells[columns["points"]].get_text(" ", strip=True)),
            }
        )
    return sorted(rows, key=lambda row: row["position"])


def validate_table(rows: list[dict[str, Any]], code: str) -> None:
    """Reject incomplete or malformed data before it can reach Redis."""
    expected = LEAGUES[code]["expectedTeams"]
    if len(rows) != expected:
        raise ValueError(f"{code}: expected {expected} teams, found {len(rows)}")

    positions = [row["position"] for row in rows]
    if positions != list(range(1, expected + 1)):
        raise ValueError(f"{code}: positions are not a complete 1..{expected} sequence")

    teams = [row["team"] for row in rows]
    if len(set(teams)) != expected:
        raise ValueError(f"{code}: duplicate or missing team names")

    numeric_fields = (
        "playedGames",
        "won",
        "draw",
        "lost",
        "goalsFor",
        "goalsAgainst",
        "points",
    )
    for row in rows:
        if any(row[field] < 0 for field in numeric_fields):
            raise ValueError(f"{code}: negative value in row for {row['team']}")
        if row["won"] + row["draw"] + row["lost"] != row["playedGames"]:
            raise ValueError(f"{code}: match totals do not balance for {row['team']}")
        if row["goalDifference"] != row["goalsFor"] - row["goalsAgainst"]:
            raise ValueError(f"{code}: goal difference does not balance for {row['team']}")


def fetch_table(title: str, requester: Any = requests) -> list[dict[str, Any]]:
    """Fetch and parse a Wikipedia standings table with bounded retries."""
    encoded = quote(title, safe="")
    url = f"https://en.wikipedia.org/w/rest.php/v1/page/{encoded}/html"
    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requester.get(url, headers=REQUEST_HEADERS, timeout=40)
            if response.status_code == 404:
                raise ArticleNotFound(title)
            if response.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"retryable HTTP {response.status_code}")
            response.raise_for_status()
            return parse_table_html(response.text, title)
        except ArticleNotFound:
            raise
        except (requests.RequestException, ValueError) as error:
            last_error = error
            if attempt < MAX_RETRIES:
                time.sleep(2**attempt)
    assert last_error is not None
    raise last_error


def fetch_league(code: str, start: int, requester: Any = requests) -> list[dict[str, Any]] | None:
    league = LEAGUES[code]["name"]
    last_error: Exception | None = None
    for title in article_title_candidates(league, start):
        try:
            rows = fetch_table(title, requester)
            if rows:
                validate_table(rows, code)
                return rows
            log.info("%s exists but has no standings rows yet", title)
            return None
        except ArticleNotFound as error:
            last_error = error
            continue
        except (requests.RequestException, ValueError) as error:
            last_error = error
            log.warning("invalid or unavailable standings table for %s: %s", title, error)
    if last_error:
        log.info("no current-season article/table for %s", league)
    return None


def build_payload(start: int, standings: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {"season": str(start), "standings": standings}


def post_payload(payload: dict[str, Any], url: str, secret: str, requester: Any = requests) -> bool:
    endpoint = url.rstrip("/") + "/api/standings/ingest"
    headers = {
        "Authorization": f"Bearer {secret}",
        "Content-Type": "application/json",
    }
    expected = len(payload["standings"])
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requester.post(endpoint, headers=headers, json=payload, timeout=120)
            if response.status_code in (200, 204):
                try:
                    body = response.json()
                except (TypeError, ValueError):
                    body = {}
                written = body.get("competitionsWritten", expected)
                if isinstance(written, int) and written >= expected:
                    log.info("ingested %d competitions", written)
                    return True
                log.error("ingest acknowledged only %s/%s competitions", written, expected)
                return False
            if response.status_code in (429, 500, 502, 503, 504):
                wait = 2**attempt
                log.warning("ingest status %d, retrying in %ss", response.status_code, wait)
                time.sleep(wait)
                continue
            log.error("ingest status %d: %s", response.status_code, response.text[:300])
            return False
        except requests.RequestException as error:
            log.warning("ingest transport error: %s", error)
            if attempt < MAX_RETRIES:
                time.sleep(2**attempt)
    return False


def send_heartbeat(status: str = "ok", reason: str = "") -> None:
    base = os.environ.get("STANDINGS_HEARTBEAT_URL", "").rstrip("/")
    secret = os.environ.get("CRON_SECRET", "")
    if not base or not secret:
        return
    try:
        response = requests.get(
            base + "/api/cron/standings",
            headers={"x-cron-secret": secret, "User-Agent": REQUEST_HEADERS["User-Agent"]},
            params={"status": status, "reason": reason} if reason else {"status": status},
            timeout=15,
        )
        if response.status_code != 200:
            log.warning("heartbeat returned status %d", response.status_code)
    except requests.RequestException as error:
        log.warning("heartbeat failed: %s", error)


def main() -> int:
    start = int(os.environ.get("STANDINGS_SEASON_START", current_season_start()))
    standings: dict[str, dict[str, Any]] = {}
    missing: list[str] = []

    for code, config in LEAGUES.items():
        log.info("fetching %s (%s season)", config["name"], start)
        rows = fetch_league(code, start)
        if rows is None:
            missing.append(code)
            continue
        standings[code] = {
            "competition": {"code": code, "name": config["name"]},
            "season": str(start),
            "table": rows,
        }
        log.info("  -> %d teams for %s", len(rows), code)

    if missing and not os.environ.get("STANDINGS_ALLOW_PARTIAL", "").lower() in {"1", "true", "yes"}:
        if not standings and os.environ.get("STANDINGS_ALLOW_NO_DATA", "1").lower() in {"1", "true", "yes"}:
            log.info("no current-season tables are available yet; leaving existing data untouched")
            send_heartbeat(status="skipped", reason="current season tables unavailable")
            return 0
        log.error("refusing to ingest incomplete standings; missing: %s", ", ".join(missing))
        send_heartbeat(status="failed", reason=f"missing competitions: {','.join(missing)}")
        return 1

    if not standings:
        log.error("no valid standings found")
        send_heartbeat(status="failed", reason="no valid standings")
        return 1

    webhook_url = os.environ.get("STANDINGS_WEBHOOK_URL", "")
    secret = os.environ.get("STANDINGS_INGEST_SECRET", "")
    if not webhook_url or not secret:
        log.error("STANDINGS_WEBHOOK_URL and STANDINGS_INGEST_SECRET are required")
        return 1

    payload = build_payload(start, standings)
    if not post_payload(payload, webhook_url, secret):
        send_heartbeat(status="failed", reason="standings ingest failed")
        return 1

    fixture_path = os.environ.get("STANDINGS_FIXTURE_PATH", "")
    if fixture_path:
        with open(fixture_path, "w", encoding="utf-8") as output:
            json.dump(payload, output, ensure_ascii=False, indent=2)
            output.write("\n")
        log.info("wrote fixture -> %s", fixture_path)

    send_heartbeat()
    return 0


if __name__ == "__main__":
    sys.exit(main())
