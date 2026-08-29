# MediKiosk

> **Pre-consultation clinical intake and information-structuring platform.**  
> Smart Automation — SIH Problem Statement PSID 26047 | Ministry of Ayush / AIIA  
> **Team:** LexCorps  

---

## 1. Overview & Architectural Philosophy

MediKiosk is designed to eliminate the OPD intake bottleneck in Indian hospitals by capturing patient history (via multilingual voice or accessible touch UI) and paper records (via OCR and clinical NER), structuring facts under a strict clinical state machine with provenance tracking, screening for red flags deterministically, and presenting a physician-verified summary for FHIR/HIS/ABDM export.

### Core Principle
```text
AI interprets.
Structured clinical state stores facts.
Rules control workflow and safety.
Validation rejects unsafe/inconsistent outputs.
Provenance records where information came from.
Physician remains the final authority.
```

---

## 2. Monorepo Structure

```text
medikiosk/
├── apps/
│   ├── kiosk-web/                # Touch/Voice Patient Kiosk (React + Vite + Tailwind)
│   └── doctor-dashboard/         # Physician Verification Dashboard
│
├── backend/
│   ├── src/
│   │   ├── ai/                   # AI Provider Interfaces (ASR, OCR, LLM, NER, TTS)
│   │   ├── config/               # Environment & Runtime Config
│   │   ├── database/             # PostgreSQL connection pool & migrations
│   │   ├── middleware/           # PHI-safe logger, error handler, auth, RBAC
│   │   ├── modules/
│   │   │   └── health/           # Verified dependency health check endpoints
│   │   ├── rules/                # Deterministic rules (Red flags, contradictions)
│   │   ├── storage/              # Redis (ephemeral state) & MinIO (object storage)
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # HTTP server entrypoint
│   └── tests/                    # Health, Schema & FHIR test suites
│
├── packages/
│   ├── shared-types/             # Core TypeScript domain models & DTOs
│   ├── clinical-schema/          # Zod validation schemas for all clinical entities
│   └── fhir-mapper/              # FHIR R4 mapping & ABDM export interfaces
│
├── infrastructure/
│   ├── docker/                   # Dockerfiles for backend and web
│   ├── postgres/                 # SQL migrations & synthetic seed datasets
│   └── nginx/                    # Nginx reverse proxy configuration
│
├── docs/
│   └── IMPLEMENTATION_STATUS.md  # Milestone & Audit status tracking
│
├── docker-compose.yml            # Local development orchestration
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 3. Quickstart & Local Development

### Prerequisites
- Node.js >= 20 (v24 LTS recommended)
- Docker & Docker Compose

### 1. Clone and Install Dependencies
```bash
git clone <repo-url>
cd "SIH 2026 ANTIGRAVITY"
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Launch Local Infrastructure (PostgreSQL, Redis, MinIO)
```bash
docker compose up -d
```

### 4. Build Workspace Packages & Start Backend
```bash
npm run build
npm run dev:backend
```

### 5. Verified Health Check Endpoints
- **System Health:** `GET http://localhost:4000/api/v1/health`
- **Database (PostgreSQL):** `GET http://localhost:4000/api/v1/health/database`
- **Session Cache (Redis):** `GET http://localhost:4000/api/v1/health/redis`
- **Object Storage (MinIO):** `GET http://localhost:4000/api/v1/health/storage`

---

## 4. Testing

Run all unit, schema, and API integration tests:
```bash
npm test
```

---

## 5. Security & Clinical Provenance

- **Human-in-the-Loop:** AI-extracted facts are marked `PENDING` until explicitly reviewed and verified by a clinician.
- **Provenance Mandatory:** Every clinical fact tracks its source (`PATIENT_REPORTED`, `DOCUMENT_OCR`, `AI_EXTRACTED`, `SYSTEM_RULE`, `PHYSICIAN_VERIFIED`) and extraction confidence score.
- **PHI Protection:** Structured logging automatically redacts patient identifiers, passwords, auth tokens, and sensitive headers.
- **Deterministic Red-Flag Rules:** Immediate escalation to triage on severe symptoms (e.g., crushing chest pain radiating to left arm) without LLM latency or hallucination risk.
