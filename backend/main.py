"""
Tamil Nadu Smart Election Assistant – FastAPI Backend
Covers: Google Gemini AI, rate limiting, caching, security headers, structured logging.
"""

import csv
import logging
import os
import time
from functools import lru_cache
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from ai_handler import process_voice_intent

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("tn_election_api")

# ── Rate limiter (Google Cloud / production pattern) ─────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Tamil Nadu Smart Election Assistant API",
    description="AI-powered election information portal for Tamil Nadu 2026 Assembly Elections",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Security headers middleware ───────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Response-Time"] = f"{duration}ms"
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
    return response

# ── Pydantic models ───────────────────────────────────────────────────────────
class VoiceRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=500, description="User voice transcript")
    language: str = Field(default="en", pattern="^(en|ta)$", description="Language code")

class CandidateOut(BaseModel):
    name: str
    party: str
    alliance: str
    age: str
    gender: str
    assets: str
    education: str
    symbol: str
    incumbent: bool
    minister: bool

class ConstituencyResponse(BaseModel):
    constituency: str
    total: int
    candidates: list[CandidateOut]

# ── CSV data loading with LRU cache ──────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), "tamil_nadu_2026_candidates_full.csv")

@lru_cache(maxsize=1)
def _load_candidates_cached() -> tuple[list[dict], list[str]]:
    """Load and cache the full candidate dataset. Called once at startup."""
    if not os.path.exists(CSV_PATH):
        logger.warning("CSV not found at %s", CSV_PATH)
        return [], []
    with open(CSV_PATH, encoding="utf-8") as f:
        candidates = list(csv.DictReader(f))
    names = sorted({row["constituency"] for row in candidates if row.get("constituency")})
    logger.info("Loaded %d candidates across %d constituencies", len(candidates), len(names))
    return candidates, names

def get_candidates() -> list[dict]:
    return _load_candidates_cached()[0]

def get_constituency_names() -> list[str]:
    return _load_candidates_cached()[1]

# Pre-load on startup
@app.on_event("startup")
async def startup_event():
    _load_candidates_cached()
    logger.info("API startup complete. Data loaded and cached.")

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Monitoring"])
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Health check endpoint for uptime monitoring."""
    candidates, names = _load_candidates_cached()
    return {
        "status": "ok",
        "candidates_loaded": len(candidates),
        "constituencies_loaded": len(names),
    }

@app.get("/api/constituencies", tags=["Election Data"])
@limiter.limit("100/minute")
async def list_constituencies(request: Request):
    """Return all 234 constituency names for the login autocomplete dropdown."""
    return {"constituencies": get_constituency_names(), "total": len(get_constituency_names())}

@app.get(
    "/api/candidates/{constituency}",
    response_model=ConstituencyResponse,
    tags=["Election Data"],
)
@limiter.limit("60/minute")
async def get_candidates_by_area(request: Request, constituency: str):
    """
    Return all candidates for a given constituency.
    Performs case-insensitive matching against the 2026 Tamil Nadu election dataset.
    """
    if not constituency or len(constituency.strip()) < 2:
        raise HTTPException(status_code=422, detail="Constituency name too short")

    candidates = get_candidates()
    matches = [
        c for c in candidates
        if c.get("constituency", "").strip().lower() == constituency.strip().lower()
    ]

    if not matches:
        logger.warning("No candidates found for constituency: %s", constituency)
        raise HTTPException(status_code=404, detail=f"No candidates found for '{constituency}'")

    return ConstituencyResponse(
        constituency=matches[0]["constituency"],
        total=len(matches),
        candidates=[
            CandidateOut(
                name=c.get("name", ""),
                party=c.get("party", ""),
                alliance=c.get("alliance", ""),
                age=c.get("age", ""),
                gender=c.get("gender", ""),
                assets=c.get("assets", ""),
                education=c.get("education", ""),
                symbol=c.get("symbol", ""),
                incumbent=c.get("incumbent", "False") == "True",
                minister=c.get("minister", "") == "True",
            )
            for c in matches
        ],
    )

@app.get("/api/search", tags=["Election Data"])
@limiter.limit("30/minute")
async def search_candidates(request: Request, q: str, limit: int = 20):
    """
    Full-text search across all candidates by name or party.
    Returns up to `limit` results (max 50).
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=422, detail="Query must be at least 2 characters")

    limit = min(limit, 50)
    q_lower = q.strip().lower()
    candidates = get_candidates()

    results = [
        {
            "name": c.get("name"),
            "party": c.get("party"),
            "constituency": c.get("constituency"),
            "alliance": c.get("alliance"),
        }
        for c in candidates
        if q_lower in c.get("name", "").lower() or q_lower in c.get("party", "").lower()
    ][:limit]

    return {"query": q, "total": len(results), "results": results}

@app.post("/api/ai/command", tags=["AI"])
@limiter.limit("20/minute")
async def process_voice_command(request: Request, body: VoiceRequest):
    """
    Process a voice/text command via Google Gemini and return a structured navigation action.
    Rate limited to prevent abuse.
    """
    logger.info("AI command received: '%s' [lang=%s]", body.transcript[:60], body.language)
    try:
        result = process_voice_intent(body.transcript, body.language)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as e:
        logger.error("AI command failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to process command")
