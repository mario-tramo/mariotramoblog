#!/usr/bin/env python3
"""
Daily Fantasy Index scrape.

Reads public FBref data via the `soccerdata` library, normalizes per-player
per-match rows with conservative defaults so upstream column drift does
not break us, batches up to 2000 rows per request, then POSTs to the
Next.js ingest endpoint.

Anti-corruption choices:
  - All numeric fields are coerced via `.get(col, 0)` so a missing
    FBref column (rename, regression) becomes 0, not a KeyError.
  - We retry on 429 / 5xx with exponential backoff + jitter.
  - Batch chunks are bounded at 2000 to stay well under Upstash REST's
    payload cap.
"""

from __future__ import annotations

import json
import logging
import os
import random
import sys
import time
from datetime import datetime, timezone
from typing import Any, Iterable

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [fantasy] %(levelname)s %(message)s",
)
log = logging.getLogger("fantasy")

WEBHOOK_URL = os.environ["FANTASY_WEBHOOK_URL"].rstrip("/") + "/api/fantasy/ingest"
SECRET = os.environ["FANTASY_INGEST_SECRET"]
HEARTBEAT_URL = os.environ.get("FANTASY_HEARTBEAT_URL", "").rstrip("/") + "/api/cron/standings"
HEARTBEAT_SECRET = os.environ.get("CRON_SECRET", "")
LEAGUES = [s.strip() for s in os.environ.get("FANTASY_LEAGUES", "Serie A").split(",") if s.strip()]
BATCH_SIZE = int(os.environ.get("FANTASY_BATCH_SIZE", "2000"))
MAX_RETRIES = 3

LEAGUE_TO_CODE = {
    "Serie A": "SA",
    "Premier League": "PL",
    "La Liga": "PD",
    "Bundesliga": "BL1",
    "Ligue 1": "FL1",
}

STAT_DEFAULTS = {
    "player": "",
    "team": "",
    "position": "MID",
    "minutes": 0,
    "goals": 0,
    "assists": 0,
    "xG": 0.0,
    "xA": 0.0,
    "keyPasses": 0.0,
    "progressivePasses": 0.0,
    "tacklesWon": 0.0,
    "recoveries": 0.0,
    "cleanSheet": False,
}


def current_season() -> str:
    now = datetime.now(timezone.utc)
    start = now.year if now.month >= 7 else now.year - 1
    return f"{start}-{start + 1}"


def league_code(name: str) -> str:
    return LEAGUE_TO_CODE.get(name.strip(), name.strip()[:2].upper())


def to_int(value: Any) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def to_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def to_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    s = str(value).strip().lower()
    return s in ("1", "true", "t", "yes", "y")


def normalize(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "playerName": str(row.get("player") or STAT_DEFAULTS["player"]),
        "team": str(row.get("team") or row.get("squad") or STAT_DEFAULTS["team"]),
        "position": str(
            row.get("position") or row.get("pos") or STAT_DEFAULTS["position"]
        ),
        "minutes": to_int(row.get("minutes") or row.get("min")),
        "goals": to_int(row.get("goals") or row.get("gls")),
        "assists": to_int(row.get("assists") or row.get("ast")),
        "xG": to_float(row.get("xG")),
        "xA": to_float(row.get("xA")),
        "keyPasses": to_float(row.get("keyPasses") or row.get("kp")),
        "progressivePasses": to_float(
            row.get("progressivePasses") or row.get("prog") or row.get("prgp")
        ),
        "tacklesWon": to_float(row.get("tacklesWon") or row.get("tklw")),
        "recoveries": to_float(row.get("recoveries") or row.get("recov")),
        "cleanSheet": to_bool(row.get("cleanSheet") or row.get("cs")),
    }


def matchday_from(label: str) -> int | None:
    if not label:
        return None
    parts = str(label).replace("/", "-").split("-")
    out = None
    for tok in parts:
        for prefix in ("MD", "Wk", "GW", "Matchday "):
            if tok.startswith(prefix):
                try:
                    out = int(tok[len(prefix):])
                except ValueError:
                    pass
    return out or 1


def fetch_matches(season: str) -> Iterable[dict[str, Any]]:
    import soccerdata as sd  # type: ignore

    fbref = sd.FBref(leagues=LEAGUES, seasons=season)
    for league in LEAGUES:
        comp = league_code(league)
        try:
            df = fbref.read_player_match_stats(stat_type="shooting")
        except Exception as e:
            log.error("shooting read failed for %s: %s", league, e)
            continue
        try:
            pas = fbref.read_player_match_stats(stat_type="passing")
        except Exception as e:
            log.error("passing read failed for %s: %s", league, e)
            pas = None
        try:
            defn = fbref.read_player_match_stats(stat_type="defense")
        except Exception as e:
            log.warning("defense read failed for %s: %s", league, e)
            defn = None

        # soccerdata returns MultiIndex (player, team) or per-match.
        # We iterate defensively — adapt based on the produced frame.
        for idx, row in df.iterrows():
            row_dict = {**row.to_dict()}
            if pas is not None:
                try:
                    pas_row = pas.loc[idx] if idx in pas.index else None
                    if pas_row is not None:
                        row_dict.update(pas_row.to_dict())
                except Exception:
                    pass
            if defn is not None:
                try:
                    def_row = defn.loc[idx] if idx in defn.index else None
                    if def_row is not None:
                        row_dict.update(def_row.to_dict())
                except Exception:
                    pass

            matchday = matchday_from(getattr(idx, "match_week", "") or "")
            match_id = f"{season}-{comp}-md{matchday}-{getattr(idx, 'game_id', idx)}"
            player_id = f"{getattr(idx, 'player_id', row_dict.get('player', 'unk'))}-{row_dict.get('team', '')}"

            yield {
                "season": season,
                "competition": comp,
                "matchday": matchday,
                "matchId": str(match_id),
                "playerId": str(player_id),
                **normalize(row_dict),
            }


def post_batch(rows: list[dict[str, Any]]) -> bool:
    headers = {
        "Authorization": f"Bearer {SECRET}",
        "Content-Type": "application/json",
    }
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(WEBHOOK_URL, headers=headers, json=rows, timeout=120)
            if resp.status_code in (200, 204):
                log.info("ingested %d rows (status %d)", len(rows), resp.status_code)
                return True
            if resp.status_code in (429, 500, 502, 503, 504):
                wait = (2 ** attempt) + random.uniform(0, 3)
                log.warning("status %d, retrying in %.1fs", resp.status_code, wait)
                time.sleep(wait)
                continue
            log.error("non-retriable status %d: %s", resp.status_code, resp.text[:300])
            return False
        except requests.RequestException as e:
            log.error("transport error: %s", e)
            time.sleep((2 ** attempt) + random.uniform(0, 3))
    return False


def send_heartbeat(status: str = "ok", reason: str = "") -> None:
    """Notify the Next.js cron endpoint that this scrape completed."""
    if not HEARTBEAT_URL or not HEARTBEAT_SECRET:
        return
    try:
        resp = requests.get(
            HEARTBEAT_URL,
            headers={
                "x-cron-secret": HEARTBEAT_SECRET,
                "User-Agent": "fantasy-scraper/1.0",
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


def main() -> int:
    season = current_season()
    rows: list[dict[str, Any]] = []
    total = 0
    for row in fetch_matches(season):
        rows.append(row)
        if len(rows) >= BATCH_SIZE:
            if not post_batch(rows):
                send_heartbeat(status="failed", reason="batch ingest failure")
                return 1
            total += len(rows)
            rows = []

    if rows:
        if not post_batch(rows):
            send_heartbeat(status="failed", reason="final batch ingest failure")
            return 1
        total += len(rows)

    log.info("scrape complete: %d rows for season %s", total, season)
    send_heartbeat()
    return 0


if __name__ == "__main__":
    sys.exit(main())
