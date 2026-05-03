"""
Test suite for Tamil Nadu Smart Election Assistant API.
Covers: health check, constituency list, candidate lookup, search,
        edge cases, input validation, and 404 handling.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────

class TestHealthCheck:
    def test_health_returns_ok(self):
        res = client.get("/health")
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"

    def test_health_includes_candidate_count(self):
        res = client.get("/health")
        body = res.json()
        assert "candidates_loaded" in body
        assert isinstance(body["candidates_loaded"], int)
        assert body["candidates_loaded"] > 0

    def test_health_includes_constituency_count(self):
        res = client.get("/health")
        body = res.json()
        assert body.get("constituencies_loaded", 0) == 234


# ─────────────────────────────────────────────────────────────────────────────
# Constituency listing
# ─────────────────────────────────────────────────────────────────────────────

class TestConstituencies:
    def test_returns_all_234_constituencies(self):
        res = client.get("/api/constituencies")
        assert res.status_code == 200
        body = res.json()
        assert body["total"] == 234
        assert len(body["constituencies"]) == 234

    def test_constituencies_are_sorted_alphabetically(self):
        res = client.get("/api/constituencies")
        names = res.json()["constituencies"]
        assert names == sorted(names)

    def test_known_constituency_present(self):
        res = client.get("/api/constituencies")
        names = res.json()["constituencies"]
        assert "Perambur" in names
        assert "Kolathur" in names
        assert "Gummidipoondi" in names


# ─────────────────────────────────────────────────────────────────────────────
# Candidate lookup by constituency
# ─────────────────────────────────────────────────────────────────────────────

class TestCandidatesByConstituency:
    def test_perambur_returns_candidates(self):
        res = client.get("/api/candidates/Perambur")
        assert res.status_code == 200
        body = res.json()
        assert body["constituency"] == "Perambur"
        assert body["total"] > 0
        assert len(body["candidates"]) == body["total"]

    def test_perambur_contains_vijay(self):
        """C. Joseph Vijay (TVK) must appear in Perambur — data integrity check."""
        res = client.get("/api/candidates/Perambur")
        names = [c["name"] for c in res.json()["candidates"]]
        assert any("Vijay" in n for n in names), "C. Joseph Vijay not found in Perambur"

    def test_kolathur_contains_mk_stalin(self):
        """M.K. Stalin (DMK) must appear in Kolathur."""
        res = client.get("/api/candidates/Kolathur")
        names = [c["name"] for c in res.json()["candidates"]]
        assert any("Stalin" in n for n in names), "M.K. Stalin not found in Kolathur"

    def test_case_insensitive_lookup(self):
        """Constituency lookup should be case-insensitive."""
        res_upper = client.get("/api/candidates/PERAMBUR")
        res_lower = client.get("/api/candidates/perambur")
        assert res_upper.status_code == 200
        assert res_lower.status_code == 200
        assert res_upper.json()["total"] == res_lower.json()["total"]

    def test_candidate_has_required_fields(self):
        """Each candidate must have all required fields."""
        res = client.get("/api/candidates/Ambattur")
        candidates = res.json()["candidates"]
        required = {"name", "party", "alliance", "age", "gender", "assets", "education", "symbol"}
        for cand in candidates:
            missing = required - set(cand.keys())
            assert not missing, f"Candidate missing fields: {missing}"

    def test_unknown_constituency_returns_404(self):
        res = client.get("/api/candidates/NonExistentPlace123")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_very_short_name_returns_422(self):
        res = client.get("/api/candidates/X")
        assert res.status_code == 422

    def test_incumbent_field_is_boolean(self):
        res = client.get("/api/candidates/Kolathur")
        for cand in res.json()["candidates"]:
            assert isinstance(cand["incumbent"], bool)
            assert isinstance(cand["minister"], bool)

    def test_response_model_structure(self):
        res = client.get("/api/candidates/Avadi")
        body = res.json()
        assert "constituency" in body
        assert "total" in body
        assert "candidates" in body
        assert isinstance(body["candidates"], list)


# ─────────────────────────────────────────────────────────────────────────────
# Search endpoint
# ─────────────────────────────────────────────────────────────────────────────

class TestSearch:
    def test_search_by_name_returns_results(self):
        res = client.get("/api/search?q=Stalin")
        assert res.status_code == 200
        body = res.json()
        assert body["total"] > 0
        assert any("Stalin" in r["name"] for r in body["results"])

    def test_search_by_party_returns_results(self):
        res = client.get("/api/search?q=DMK")
        assert res.status_code == 200
        assert res.json()["total"] > 0

    def test_search_respects_limit(self):
        res = client.get("/api/search?q=Kumar&limit=5")
        assert res.status_code == 200
        assert len(res.json()["results"]) <= 5

    def test_search_limit_capped_at_50(self):
        res = client.get("/api/search?q=Raj&limit=999")
        assert res.status_code == 200
        assert len(res.json()["results"]) <= 50

    def test_search_empty_query_returns_422(self):
        res = client.get("/api/search?q=X")
        assert res.status_code == 422

    def test_search_no_query_param_returns_422(self):
        res = client.get("/api/search")
        assert res.status_code == 422

    def test_search_unknown_name_returns_empty(self):
        res = client.get("/api/search?q=Zxqwerty")
        assert res.status_code == 200
        assert res.json()["total"] == 0


# ─────────────────────────────────────────────────────────────────────────────
# Security headers
# ─────────────────────────────────────────────────────────────────────────────

class TestSecurityHeaders:
    def test_x_content_type_options(self):
        res = client.get("/health")
        assert res.headers.get("x-content-type-options") == "nosniff"

    def test_x_frame_options(self):
        res = client.get("/health")
        assert res.headers.get("x-frame-options") == "DENY"

    def test_response_time_header_present(self):
        res = client.get("/health")
        assert "x-response-time" in res.headers


# ─────────────────────────────────────────────────────────────────────────────
# Data integrity
# ─────────────────────────────────────────────────────────────────────────────

class TestDataIntegrity:
    def test_total_candidates_above_4000(self):
        res = client.get("/health")
        assert res.json()["candidates_loaded"] >= 4000

    def test_all_parties_have_alliance(self):
        """DMK candidates should be in spa alliance."""
        res = client.get("/api/candidates/Kolathur")
        dmk_candidates = [c for c in res.json()["candidates"] if c["party"] == "DMK"]
        for c in dmk_candidates:
            assert c["alliance"] == "spa"
