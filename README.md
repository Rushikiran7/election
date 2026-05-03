# Tamil Nadu Smart Election Assistant 2026 🗳️

An AI-powered election information portal for the **2026 Tamil Nadu Legislative Assembly Elections**, built for hackathon evaluation.

![Tamil Nadu Election 2026](https://img.shields.io/badge/Tamil%20Nadu-Election%202026-orange?style=for-the-badge)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue?style=for-the-badge&logo=google)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)

---

## ✨ Features

- 🔍 **Real Candidate Data** — Full dataset of 4,023 candidates across all 234 constituencies from the official 2026 election data
- 🤖 **TN Election Bot** — AI assistant powered directly by Google Gemini 2.5 Flash, answering election queries in English and Tamil
- 🗺️ **Constituency Lookup** — Searchable dropdown of all 234 Tamil Nadu constituencies
- 📊 **Candidate Cards** — Party colors, incumbent/minister badges, assets, education, alliance info
- 🔒 **Rate Limiting** — slowapi-powered rate limits on all endpoints
- ♿ **Accessibility** — Skip-to-content, ARIA labels, semantic HTML, keyboard navigation
- 🧪 **27 Tests** — Full pytest suite covering health, search, security headers, and data integrity

---

## 🏗️ Architecture

```
election/
├── backend/               # FastAPI Python backend
│   ├── main.py            # API routes, rate limiting, caching, security headers
│   ├── ai_handler.py      # Google Gemini integration (google-genai SDK)
│   ├── tamil_nadu_2026_candidates_full.csv   # Real 4,023 candidate dataset
│   ├── tests/
│   │   └── test_main.py   # 27 pytest tests
│   └── requirements.txt
│
└── frontend/              # Next.js 16 frontend
    └── src/
        ├── app/
        │   ├── page.tsx           # Login with constituency selector
        │   ├── dashboard/         # Candidate display + TN Election Bot
        │   ├── education/         # EVM guide
        │   └── voting-day/        # Voting day info
        └── components/
            ├── NavBar.tsx         # Sticky nav with all 4 routes
            ├── GeminiAssistant.tsx  # TN Election Bot (direct Gemini API)
            └── CountdownTimer.tsx   # Election countdown
```

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_key_here > .env

python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```
API runs at: http://localhost:8080  
Swagger docs: http://localhost:8080/docs

### Frontend
```bash
cd frontend
npm install

# Create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:8080 > .env.local
echo NEXT_PUBLIC_GEMINI_API_KEY=your_key_here >> .env.local

npm run dev
```
App runs at: http://localhost:3000

### Tests
```bash
cd backend
python -m pytest tests/ -v
# Expected: 27 passed
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: http://localhost:8080) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google AI Studio API key (for TN Election Bot) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health + data stats |
| GET | `/api/constituencies` | All 234 constituency names |
| GET | `/api/candidates/{constituency}` | Candidates for a constituency |
| GET | `/api/search?q=Stalin` | Full-text candidate search |
| POST | `/api/ai/command` | AI navigation command via Gemini |

---

## 🛡️ Security
- Rate limiting: 20/min (AI), 60/min (candidates), 200/min (global)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
- Input validation via Pydantic with field constraints
- API keys never committed (`.gitignore` enforced)

---

## 🧪 Test Coverage

```
TestHealthCheck              3 tests
TestConstituencies           3 tests  
TestCandidatesByConstituency 9 tests
TestSearch                   7 tests
TestSecurityHeaders          3 tests
TestDataIntegrity            2 tests
─────────────────────────────────────
Total: 27 passed ✅
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.9+, Uvicorn |
| AI | Google Gemini 2.5 Flash (google-genai SDK) |
| Rate Limiting | slowapi |
| Testing | pytest, httpx |
| Data | 4,023 real candidates from tnelections2026.in |
