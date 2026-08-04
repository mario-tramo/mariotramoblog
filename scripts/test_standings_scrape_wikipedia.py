#!/usr/bin/env python3
from __future__ import annotations

import unittest
from datetime import datetime, timezone

import standings_scrape_wikipedia as scraper


HTML = """
<table>
  <tr><th>Pos</th><th>Team</th><th>Pld</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>
  {rows}
</table>
"""


def make_rows(count: int) -> str:
    return "".join(
        f"<tr><td>{i}</td><td>Team {i}</td><td>1</td><td>1</td><td>0</td><td>0</td><td>2</td><td>0</td><td>2</td><td>3</td></tr>"
        for i in range(1, count + 1)
    )


class FakeResponse:
    def __init__(self, status_code: int = 200, text: str = "") -> None:
        self.status_code = status_code
        self.text = text

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def json(self):
        return {"competitionsWritten": 5}


class FakeRequester:
    def __init__(self, response: FakeResponse) -> None:
        self.response = response
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append(("GET", url, kwargs))
        return self.response

    def post(self, url, **kwargs):
        self.calls.append(("POST", url, kwargs))
        return self.response


class StandingsScraperTests(unittest.TestCase):
    def test_current_season_boundary(self):
        self.assertEqual(
            scraper.current_season_start(datetime(2026, 7, 1, tzinfo=timezone.utc)),
            2026,
        )
        self.assertEqual(
            scraper.current_season_start(datetime(2026, 6, 30, tzinfo=timezone.utc)),
            2025,
        )

    def test_title_candidates_use_en_dash_first(self):
        self.assertEqual(
            scraper.article_title_candidates("Serie A", 2026),
            ["2026–27 Serie A", "2026-27 Serie A"],
        )

    def test_parse_and_validate_serie_a_table(self):
        rows = scraper.parse_table_html(HTML.format(rows=make_rows(20)), "test")
        self.assertEqual(len(rows), 20)
        self.assertEqual(rows[0]["position"], 1)
        self.assertEqual(rows[0]["goalDifference"], 2)
        scraper.validate_table(rows, "SA")

    def test_validation_rejects_incomplete_table(self):
        rows = scraper.parse_table_html(HTML.format(rows=make_rows(19)), "test")
        with self.assertRaises(ValueError):
            scraper.validate_table(rows, "SA")

    def test_post_payload_uses_authenticated_ingest_endpoint(self):
        requester = FakeRequester(FakeResponse(200, "{}"))
        payload = scraper.build_payload(2026, {"SA": {"table": []}})
        self.assertTrue(scraper.post_payload(payload, "https://example.test/", "secret", requester))
        method, url, kwargs = requester.calls[0]
        self.assertEqual(method, "POST")
        self.assertEqual(url, "https://example.test/api/standings/ingest")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer secret")


if __name__ == "__main__":
    unittest.main()
