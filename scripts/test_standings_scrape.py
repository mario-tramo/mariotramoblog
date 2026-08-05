#!/usr/bin/env python3
from __future__ import annotations

import os
import unittest
from unittest import mock

import standings_scrape as scraper
import standings_scrape_wikipedia as wiki


class FakeResponse:
    def __init__(self, status_code: int = 200, text: str = "") -> None:
        self.status_code = status_code
        self.text = text

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")


def make_rows(count: int) -> list[dict]:
    return [
        {
            "position": i,
            "team": f"Team {i}",
            "playedGames": 1,
            "won": 1,
            "draw": 0,
            "lost": 0,
            "goalsFor": 2,
            "goalsAgainst": 0,
            "goalDifference": 2,
            "points": 3,
        }
        for i in range(1, count + 1)
    ]


class StandingsScrapeTests(unittest.TestCase):
    def setUp(self) -> None:
        scraper._FBREF_AVAILABLE = None

    def tearDown(self) -> None:
        scraper._FBREF_AVAILABLE = None

    @mock.patch("standings_scrape.requests.get")
    def test_check_fbref_available_detects_challenge(self, get):
        get.return_value = FakeResponse(403, "<title>Just a moment...</title>")
        self.assertFalse(scraper.check_fbref_available())
        get.assert_called_once()

    @mock.patch("standings_scrape.requests.get")
    def test_check_fbref_available_accepts_real_page(self, get):
        get.return_value = FakeResponse(200, "<html><title>FBref</title></html>")
        self.assertTrue(scraper.check_fbref_available())
        get.assert_called_once()

    def test_scrape_fbref_league_skips_when_blocked(self):
        scraper._FBREF_AVAILABLE = False
        self.assertIsNone(scraper.scrape_fbref_league("Serie A", "SA", "2026-2027"))

    @mock.patch("standings_scrape_wikipedia.post_payload")
    @mock.patch("standings_scrape_wikipedia.fetch_league")
    @mock.patch("standings_scrape.requests.get")
    def test_main_falls_back_to_wikipedia_when_fbref_blocked(self, get, fetch_league, post):
        get.return_value = FakeResponse(403, "<title>Just a moment...</title>")
        fetch_league.return_value = make_rows(20)
        post.return_value = True
        with mock.patch.dict(
            os.environ,
            {
                "STANDINGS_WEBHOOK_URL": "https://example.test/",
                "STANDINGS_INGEST_SECRET": "secret",
            },
        ):
            self.assertEqual(scraper.main(), 0)
        payload = post.call_args.args[0]
        self.assertEqual(len(payload["standings"]), len(wiki.LEAGUES))
        self.assertEqual(len(payload["standings"]["SA"]["table"]), 20)

    @mock.patch("standings_scrape_wikipedia.fetch_league")
    @mock.patch("standings_scrape.requests.get")
    def test_main_no_data_allowed_exits_zero(self, get, fetch_league):
        get.return_value = FakeResponse(403, "<title>Just a moment...</title>")
        fetch_league.return_value = None
        with mock.patch.dict(
            os.environ,
            {
                "STANDINGS_WEBHOOK_URL": "https://example.test/",
                "STANDINGS_INGEST_SECRET": "secret",
                "STANDINGS_ALLOW_NO_DATA": "1",
            },
        ):
            self.assertEqual(scraper.main(), 0)


if __name__ == "__main__":
    unittest.main()
