#!/usr/bin/env python3
"""
Standings scrape — Wikipedia source.

Fallback scraper used when FBref blocks the runner (HTTP 403) and the
`soccerdata` library is unavailable. Reads the final league tables from
Wikipedia's season articles, normalizes each to the same flat dict shape
as `scripts/standings_scrape.py` (ScrapedStandingRow), then:

  1. writes the result into `scripts/standings_fixture.json`, and
  2. SETs each competition table directly into Upstash Redis using the
     same key format as `src/lib/standings/store.ts`
     (`<prefix>:<code>:<season>`), reading credentials from `.env.local`.

No external API key is required. Logos/crests are intentionally omitted
(the standings UI no longer renders them).
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
FIXTURE = ROOT / "scripts" / "standings_fixture.json"
ENV_FILE = ROOT / ".env.local"

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    )
}

# season start year -> stored as just the start year (matches store.ts)
SEASON_START = 2025
SEASON_LABEL = "2025–26"  # 2025–26 (en dash), used in Wikipedia titles

# code -> (display name, wikipedia article title)
LEAGUES = {
    "SA": ("Serie A", f"{SEASON_LABEL} Serie A"),
    "PL": ("Premier League", f"{SEASON_LABEL} Premier League"),
    "PD": ("La Liga", f"{SEASON_LABEL} La Liga"),
    "BL1": ("Bundesliga", f"{SEASON_LABEL} Bundesliga"),
    "FL1": ("Ligue 1", f"{SEASON_LABEL} Ligue 1"),
}

# Normalize Wikipedia team names to the concise display names used on the site.
NAME_MAP = {
    "Inter Milan": "Inter",
    "Hellas Verona": "Verona",
    "Tottenham Hotspur": "Tottenham",
    "Brighton & Hove Albion": "Brighton",
    "Manchester United": "Manchester Utd",
    "Wolverhampton Wanderers": "Wolves",
    "Nottingham Forest": "Nott'm Forest",
    "Atlético Madrid": "Atlético Madrid",
    "Athletic Bilbao": "Athletic Club",
    "Real Sociedad": "Real Sociedad",
    "Bayern Munich": "Bayern München",
    "Borussia Dortmund": "Borussia Dortmund",
    "Bayer Leverkusen": "Bayer Leverkusen",
    "Eintracht Frankfurt": "Eintracht Frankfurt",
    "Paris Saint-Germain": "Paris SG",
    "Olympique Marseille": "Marseille",
    "Marseille": "Marseille",
    "Olympique Lyonnais": "Lyon",
    "Lyon": "Lyon",
}


def to_int(value: str) -> int:
    # handle unicode minus, spaces, footnote markers like "45 [ b ]"
    s = re.sub(r"\[[^\]]*\]", "", value)
    s = s.replace("−", "-").replace("–", "-")
    s = s.replace(" ", "").replace("\xa0", "")
    m = re.search(r"-?\d+", s)
    return int(m.group()) if m else 0


def clean_team(value: str) -> str:
    # strip champion/relegation markers, footnotes, and (v t e) noise
    s = re.sub(r"\[[^\]]*\]", "", value)
    s = re.sub(r"\((?:C|R|O|A|P|E|Q|X)\)", "", s)
    s = s.replace("\xa0", " ").strip()
    return NAME_MAP.get(s, s)


def fetch_table(title: str) -> list[dict]:
    enc = title.replace(" ", "_")
    url = f"https://en.wikipedia.org/api/rest_v1/page/html/{requests.utils.quote(enc, safe='_')}"
    r = requests.get(url, headers=UA, timeout=40)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")

    target = None
    for t in soup.find_all("table"):
        head = t.get_text(" ", strip=True)[:200]
        if "Pld" in head and "Pts" in head and "Pos" in head:
            target = t
            break
    if target is None:
        raise RuntimeError(f"standings table not found for '{title}'")

    rows: list[dict] = []
    for tr in target.find_all("tr")[1:]:
        cells = tr.find_all(["td", "th"])
        if len(cells) < 10:
            continue
        txt = [c.get_text(" ", strip=True) for c in cells]
        # columns: Pos, Team, Pld, W, D, L, GF, GA, GD, Pts, [Qualification]
        pos = to_int(txt[0])
        if pos == 0:
            continue
        won = to_int(txt[3])
        draw = to_int(txt[4])
        lost = to_int(txt[5])
        gf = to_int(txt[6])
        ga = to_int(txt[7])
        rows.append(
            {
                "position": pos,
                "team": clean_team(txt[1]),
                "playedGames": to_int(txt[2]),
                "won": won,
                "draw": draw,
                "lost": lost,
                "goalsFor": gf,
                "goalsAgainst": ga,
                "goalDifference": gf - ga,
                "points": to_int(txt[9]),
            }
        )
    return rows


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def write_redis(env: dict[str, str], standings: dict, season: str) -> None:
    url = env.get("UPSTASH_REDIS_REST_URL")
    token = env.get("UPSTASH_REDIS_REST_TOKEN")
    prefix = env.get("STANDINGS_REDIS_PREFIX", "standings")
    if not url or not token:
        print("  [redis] credentials missing — skipping Redis write")
        return
    commands = [
        ["SET", f"{prefix}:{code}:{season}", json.dumps(data["table"])]
        for code, data in standings.items()
    ]
    resp = requests.post(
        f"{url}/pipeline",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        data=json.dumps(commands),
        timeout=30,
    )
    resp.raise_for_status()
    results = resp.json()
    ok = sum(1 for r in results if not r.get("error"))
    print(f"  [redis] wrote {ok}/{len(commands)} competition keys")


def main() -> int:
    standings: dict[str, dict] = {}
    for code, (name, title) in LEAGUES.items():
        try:
            table = fetch_table(title)
        except Exception as e:  # noqa: BLE001
            print(f"  [{code}] FAILED: {e}")
            continue
        if not table:
            print(f"  [{code}] empty table — skipped")
            continue
        standings[code] = {
            "competition": {"code": code, "name": name},
            "season": str(SEASON_START),
            "table": table,
        }
        print(f"  [{code}] {len(table)} teams — 1st: {table[0]['team']} ({table[0]['points']} pts)")

    if "SA" not in standings:
        print("Serie A scrape failed — aborting")
        return 1

    payload = {"season": str(SEASON_START), "standings": standings}
    FIXTURE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(f"  wrote fixture -> {FIXTURE.relative_to(ROOT)}")

    write_redis(load_env(ENV_FILE), standings, str(SEASON_START))
    return 0


if __name__ == "__main__":
    sys.exit(main())
