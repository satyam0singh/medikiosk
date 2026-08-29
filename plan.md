# MediKiosk — Phased Development Plan

## 0. Purpose

This plan converts `project.md` into an executable implementation roadmap for the SIH26047 MediKiosk project.

The plan is intentionally **dependency-driven**: build the clinical data contract and deterministic workflow before adding expensive/unstable AI components.

---

# 1. Execution Strategy

## Golden rule

> **Build the complete deterministic product skeleton first; then progressively replace mocked perception components with real AI.**

Do not start by integrating an LLM or ASR before the core data model and state machine exist.

## Priority order

```text
1. Repository + infrastructure
2. Data model + API contracts
3. Patient workflow without AI
4. Clinical state + adaptive rules
5. Doctor dashboard
6. Safety engine
7. Document pipeline
8. ASR/TTS
9. LLM extraction + controlled summary
10. Provenance/confidence/contradictions
11. FHIR/ABDM adapter
12. Security hardening
13. Evaluation + demo cases
14. Deployment + SIH demo polish
```

---

# 2. Phase 0 — Project Bootstrap

## Objective

Create a stable monorepo and reproducible local environment.

## Tasks

### Repository

- initialize Git repository
- create README
- create project directory structure
- add `.gitignore`
- add `.env.example`
- define branch strategy
- establish commit conventions

### Frontend

- create React/Vite/TypeScript app
- install Tailwind
- configure routing
- create accessibility-first component primitives

### Backend

- initialize Node.js + TypeScript
- choose Express or Fastify and lock it
- create `/api/v1` routing
- add validation framework
- add structured error handler
- add request logging

### Infrastructure

Create Docker Compose for:

```text
postgres
redis
minio
backend
frontend
nginx
```

## Deliverables

- project boots with one command
- all containers healthy
- frontend can call backend `/health`
- backend can connect to PostgreSQL/Redis/MinIO

## Acceptance criteria

```text
docker compose up
        ↓
all services healthy
        ↓
http://localhost/... works
```

No AI integration yet.

---

# 3. Phase 1 — Database & Domain Contracts

## Objective

Freeze the core clinical data model before parallel development begins.

## Build

Tables/entities:

- users
- roles
- patients
- encounters
- consents
- clinical_sessions
- questions
- answers
- clinical_facts
- documents
- document_extractions
- medications
- allergies
- investigations
- timeline_events
- red_flag_events
- summaries
- physician_reviews
- fhir_exports
- audit_logs

## Also define

- TypeScript shared types
- API DTOs
- clinical JSON schemas
- provenance enum
- verification enum
- confidence model
- document processing states

## Deliverables

- PostgreSQL migrations
- seed data
- schema validation package
- shared DTO package

## Acceptance criteria

A synthetic patient can be created with:

```text
Patient
 → Encounter
 → Session
 → Answer
 → Clinical Fact
```

and everything is persisted correctly.

---

# 4. Phase 2 — Authentication, RBAC & Consent

## Objective

Secure the platform before clinical UI is built around it.

## Build

### Roles

```text
PATIENT
PHYSICIAN
TRIAGE
AYUSH_PRACTITIONER
ADMIN
IT_ADMIN
```

### Authentication

- login
- JWT access token
- refresh mechanism
- expiry
- logout/invalidation strategy

### Authorization

Implement server-side checks for:

```text
user → role → patient → encounter → operation
```

### Consent

Create:

- consent creation
- consent version
- purpose
- scope
- timestamp
- status
- revocation

## Acceptance criteria

- unauthorized requests fail
- users cannot access arbitrary patient IDs
- consent denial prevents clinical intake progression
- every consent action is auditable

---

# 5. Phase 3 — Patient Kiosk Skeleton

## Objective

Implement the complete patient journey using **mock/static questions** before AI.

## Screens

1. Welcome
2. Identify
3. Language
4. Consent
5. Chief complaint
6. Interview
7. Document upload
8. Review
9. Completion

## Implement

- accessible large-button UI
- keyboard/touch support
- progress indicator
- language persistence
- session recovery
- responsive kiosk layout

## Mock question example

```text
Question: Where is the pain?
Options: Center / Left / Right / Other
```

## Acceptance criteria

A tester can finish an entire session without speaking into the system.

This is critical: the product must work even when AI services are temporarily unavailable.

---

# 6. Phase 4 — Clinical State Machine & Question Engine

## Objective

Turn the kiosk into an adaptive clinical workflow.

## Build

### Clinical state

```text
CURRENT_COMPLAINT
KNOWN_FACTS
MISSING_FIELDS
UNCERTAIN_FIELDS
COMPLETED_SECTIONS
SAFETY_STATE
LANGUAGE
SESSION_STATUS
```

### Question bank

Each question should have metadata:

```json
{
  "id": "chest_pain_onset",
  "section": "HPI",
  "type": "text_or_choice",
  "required": true,
  "conditions": [
    "chiefComplaint == chest_pain"
  ],
  "field": "hpi.onset"
}
```

## Build complaint flows

Start with a small set of representative complaints rather than dozens.

Suggested initial set:

- chest pain
- fever
- abdominal pain
- headache
- cough/breathlessness

## Acceptance criteria

Given the same clinical state, the question engine produces deterministic next-question results.

LLM is still not required for branching.

---

# 7. Phase 5 — Safety / Red-Flag Engine

## Objective

Create deterministic screening and triage before introducing LLM-based reasoning.

## Build

- rule representation
- rule evaluator
- severity/priority
- alert creation
- alert queue
- staff acknowledgement
- audit record

## Test scenarios

### Normal
No red flag.

### Positive
Synthetic case triggers one known rule.

### Negative
Similar case does not trigger.

### Escalation
Trigger creates a priority alert visible to triage.

## Acceptance criteria

```text
structured symptom
      ↓
rule engine
      ↓
priority alert
```

No LLM is the final authority for red-flag decisions.

---

# 8. Phase 6 — Doctor Dashboard

## Objective

Create the physician workspace before the final summary engine.

## Build panels

- patient header
- chief complaint
- HPI
- medical history
- medications
- allergies
- investigations
- documents
- timeline
- red flags
- missing data
- evidence/confidence
- summary
- edit/verify
- export

## Acceptance criteria

A doctor can open a synthetic encounter and understand the complete collected information without inspecting the database.

---

# 9. Phase 7 — Document Upload & Storage

## Objective

Implement reliable file capture and storage before OCR.

## Build

- upload endpoint
- file type restrictions
- file size limits
- MinIO storage
- document metadata
- preview
- deletion/retention handling
- processing status

## Document states

```text
UPLOADED
VALIDATED
PROCESSING
COMPLETED
LOW_CONFIDENCE
FAILED
REVIEW_REQUIRED
```

## Acceptance criteria

Uploaded synthetic PDF/image is securely stored and retrievable through an authorized session.

---

# 10. Phase 8 — OCR & Document Intelligence

## Objective

Convert documents into structured clinical facts.

## Step 1 — OCR

Start with printed documents.

Then add handwritten examples.

## Step 2 — Document classification

Classify:

- prescription
- lab
- discharge summary
- other

## Step 3 — Extraction

Extract:

- medicine
- dosage
- frequency
- diagnosis
- investigation
- result
- unit
- date
- procedure

## Step 4 — Confidence

Every extracted entity receives a confidence score and source reference.

## Step 5 — Validation

Reject or route suspicious values.

## Acceptance criteria

At least three synthetic document types pass through:

```text
upload → OCR → extraction → validation → DB → timeline
```

with low-confidence cases routed to review.

---

# 11. Phase 9 — Timeline Builder

## Objective

Combine patient-reported and document-derived events.

## Build

- chronological ordering
- date normalization
- event typing
- episode grouping
- source mapping
- unknown-date handling
- date conflict detection

## Acceptance criteria

Given 3–5 synthetic documents with different dates, the timeline is correctly ordered and each event links to its source.

---

# 12. Phase 10 — ASR + Voice Interaction

## Objective

Replace text-only patient input with real multilingual voice interaction.

## Start small

Languages:

- Hindi
- English
- Hinglish

## Pipeline

```text
Microphone
 ↓
VAD / preprocessing
 ↓
ASR
 ↓
Transcript
 ↓
Language normalization
 ↓
Clinical extraction
```

## UI requirements

Every voice interaction still needs:

- tap alternative
- repeat question
- confirmation state
- recording state
- error/fallback state

## Acceptance criteria

A synthetic interview can be completed using speech alone, with touch available as fallback.

---

# 13. Phase 11 — LLM/NLU Integration

## Objective

Use the LLM only for the parts where natural language understanding is genuinely useful.

## First LLM task

Speech/text → structured clinical JSON.

Example:

```text
"Kal raat se chest mein burning hai"
```

→

```json
{
  "symptom": "chest discomfort",
  "character": "burning",
  "onset": "last night"
}
```

## Required guardrails

- strict JSON schema
- low temperature where supported
- field whitelist
- validation
- retry/fallback
- confidence
- provenance

## Second LLM task

Controlled summary generation.

## Do not build yet

- autonomous diagnosis
- autonomous treatment
- broad RAG agent
- multiple autonomous agents

## Acceptance criteria

Malformed LLM output cannot reach the main clinical state without being validated.

---

# 14. Phase 12 — Completeness & Contradiction Engine

## Objective

Add the stronger innovation layer.

## Build

### Completeness

```text
Required fields
       ↓
Known fields
       ↓
Missing fields
       ↓
Targeted questions
```

### Contradictions

Compare:

- patient-reported facts
- document facts
- previous encounter facts

Output:

```text
CONFLICT
Source A: ...
Source B: ...
Action: Physician verification
```

## Acceptance criteria

A synthetic contradiction is surfaced without the system automatically choosing a source as truth.

---

# 15. Phase 13 — Provenance + Confidence UI

## Objective

Make the system explainable to the physician.

## Build

Every fact should expose:

```text
SOURCE
CONFIDENCE
VERIFICATION STATUS
```

## Suggested UI

```text
🟢 High confidence
🟡 Review recommended
🔴 Verification required
```

Do not imply that confidence is equivalent to clinical correctness.

---

# 16. Phase 14 — Controlled Summary Generator

## Objective

Produce a physician-ready briefing from structured data.

## Pipeline

```text
Clinical DB
   ↓
Verified/structured fields
   ↓
Summary schema
   ↓
LLM
   ↓
Schema validation
   ↓
Contradiction/provenance check
   ↓
Doctor edit
   ↓
Verify
```

## Acceptance criteria

- summary contains only supported fields
- no unsupported diagnosis appears from free-form generation
- doctor can edit
- edit is audited
- summary has verification state

---

# 17. Phase 15 — AYUSH Mode

## Objective

Implement the AYUSH extension using the same clinical workflow engine.

## Build fields

- Prakriti
- Vikriti
- Sara
- Samhanana
- Pramana
- Satmya
- Sattva
- Ahara Shakti
- Vyayama Shakti
- Vaya
- Ahara-Vihara

## Rules

- configurable schema
- practitioner-visible
- physician/practitioner verification
- no invented diagnostic rules

## Acceptance criteria

A synthetic AYUSH case can complete additional fields without breaking modern clinical intake.

---

# 18. Phase 16 — FHIR / ABDM / HIS Adapter

## Objective

Convert structured internal data to interoperability payloads without coupling core business logic to one external system.

## Build

### FHIR mapping

Start with a small validated subset:

- Patient
- Encounter
- Condition
- Observation
- Medication
- AllergyIntolerance
- DiagnosticReport
- DocumentReference
- Composition
- Consent
- Provenance

## Modes

```text
FHIR MOCK
FHIR SANDBOX
FHIR PRODUCTION (future)
```

## Acceptance criteria

Internal encounter data can produce deterministic FHIR JSON.

Production integration must not be claimed unless actually verified.

---

# 19. Phase 17 — Offline/Recovery

## Objective

Prevent loss of patient sessions under intermittent connectivity.

## Build

- local draft state
- pending sync queue
- reconnect handling
- idempotency keys
- session resume
- conflict handling

## Acceptance criteria

Disconnecting the network during a synthetic session does not erase already captured data.

---

# 20. Phase 18 — Flutter Client

## Objective

Add the mobile client after backend APIs are stable.

## Features

- registration/pre-registration
- consent
- history completion
- document upload
- session status
- optional patient summary/review

## Rule

Reuse the same API/DTO contracts.

Do not duplicate clinical logic in Flutter.

## Acceptance criteria

Flutter can execute at least one complete secondary patient flow using the production-like backend.

---

# 21. Phase 19 — Security Hardening

## Build checklist

### Backend

- secure headers
- input validation
- JWT expiry/rotation strategy
- RBAC enforcement
- object authorization
- rate limiting
- upload validation
- safe error responses
- audit events

### Storage

- encrypted DB/storage where supported
- signed/private object access
- retention policy
- cleanup jobs

### Logs

- avoid raw medical text unless essential
- mask secrets/tokens
- never log authentication credentials

## Acceptance criteria

Run an internal security checklist against:

- broken access control
- injection
- insecure upload
- token leakage
- excessive data exposure
- session misuse

---

# 22. Phase 20 — Observability & Operations

## Build

- health endpoints
- structured logs
- metrics
- tracing where useful
- alert monitoring
- document processing queue metrics
- AI latency metrics

## Dashboard metrics

```text
Active sessions
Completed sessions
Failed sessions
Average session time
OCR failures
ASR failures
Low-confidence extractions
Red flags
Unacknowledged alerts
```

Avoid presenting operational metrics as clinical outcomes.

---

# 23. Phase 21 — End-to-End Integration

## Objective

Connect the entire system into one demo path.

### Golden demo

```text
Patient
 ↓
Identify
 ↓
Consent
 ↓
Hindi/Hinglish voice
 ↓
Adaptive chest-pain interview
 ↓
Red-flag screening
 ↓
Handwritten prescription upload
 ↓
OCR
 ↓
Extraction
 ↓
Confidence
 ↓
Timeline
 ↓
Summary
 ↓
Doctor dashboard
 ↓
Contradiction/uncertainty review
 ↓
Physician verification
 ↓
FHIR export
 ↓
Audit log
```

## Acceptance criteria

No manual database edits or code changes during the demo.

---

# 24. Phase 22 — Evaluation Benchmark

## Create a fixed test set

### ASR set

- quiet Hindi
- noisy Hindi
- English
- Hinglish
- medical terminology

### OCR set

- printed prescription
- handwritten prescription
- laboratory report
- discharge summary

### Safety set

- positive red flag
- near-match negative
- missing information

### Contradiction set

- patient vs document
- document vs document

### Summary set

- complete patient
- incomplete patient
- conflicting facts

## Record metrics

Do not pre-select flattering numbers.

Record actual results and report methodology.

---

# 25. Phase 23 — Demo Hardening

## Reliability checklist

- seed database reset works
- demo patients load automatically
- all API dependencies have health checks
- AI timeout has fallback UI
- low-confidence path works
- red-flag path works
- doctor edit works
- export works
- logs are clean
- no secret appears on screen
- no real patient data is used

## Demo fallback strategy

Every major external dependency should have a controlled fallback for the SIH presentation environment.

Example:

```text
Real ASR unavailable
        ↓
Demo audio fixture
        ↓
Same ASR output schema
        ↓
Same clinical pipeline
```

Do not fake a live API connection and describe it as live.

---

# 26. Parallel Team Allocation

## Track A — Frontend

- React kiosk
- doctor dashboard
- triage UI
- design system
- accessibility

## Track B — Backend

- auth
- patient/encounter APIs
- session APIs
- document APIs
- summary APIs
- audit

## Track C — Clinical Intelligence

- question bank
- clinical state machine
- completeness
- contradiction detection
- safety rules
- timeline rules
- AYUSH schema

## Track D — AI

- ASR
- TTS
- OCR
- extraction
- LLM prompts
- JSON validation
- benchmarks

## Track E — Infrastructure

- PostgreSQL
- Redis
- MinIO
- Docker
- Nginx
- TLS
- monitoring
- backups

## Integration owner

One senior developer should own:

- shared DTOs
- API compatibility
- merge coordination
- end-to-end build
- release branches

---

# 27. Suggested Milestones

## Milestone 1 — Skeleton

```text
React + Backend + PostgreSQL + Redis + MinIO
```

## Milestone 2 — Deterministic MVP

```text
Patient flow + question engine + doctor dashboard
```

## Milestone 3 — Safety + Documents

```text
Red flags + OCR + extraction + timeline
```

## Milestone 4 — AI

```text
ASR + LLM extraction + TTS + summary
```

## Milestone 5 — Trust Layer

```text
Provenance + confidence + contradiction + verification
```

## Milestone 6 — Integration

```text
FHIR + sandbox/mock ABDM/HIS
```

## Milestone 7 — SIH Demo

```text
Fully integrated, benchmarked, containerized, reproducible
```

---

# 28. What to Build First — Exact Order for Antigravity

An AI coding assistant should follow this order unless a human explicitly changes it.

```text
STEP 01
Create monorepo

STEP 02
Create Docker Compose

STEP 03
Create PostgreSQL migrations

STEP 04
Create shared TypeScript clinical schemas

STEP 05
Create auth + RBAC

STEP 06
Create Patient / Encounter / Consent APIs

STEP 07
Create Clinical Session APIs

STEP 08
Create Question Bank + Clinical State machine

STEP 09
Create React Kiosk deterministic flow

STEP 10
Create Doctor Dashboard

STEP 11
Create deterministic Red-Flag Engine

STEP 12
Create document upload + MinIO

STEP 13
Create OCR pipeline

STEP 14
Create extraction + confidence + provenance

STEP 15
Create Timeline Builder

STEP 16
Integrate ASR

STEP 17
Integrate structured LLM extraction

STEP 18
Create controlled Summary Generator

STEP 19
Add contradiction/completeness engine

STEP 20
Add AYUSH mode

STEP 21
Create FHIR mapper/export

STEP 22
Add Flutter client

STEP 23
Add offline/recovery

STEP 24
Security hardening

STEP 25
Automated tests + AI benchmarks

STEP 26
Dockerized end-to-end demo
```

---

# 29. AI Coding Assistant Rules

When working from this plan, an AI coding assistant must follow these rules:

1. **Do not invent missing requirements.** Ask or flag ambiguity.
2. **Do not silently modify the clinical data model.** Update schemas deliberately.
3. **Do not place clinical decision authority inside LLM prompts.** Safety rules remain deterministic.
4. **Do not store unvalidated model output as authoritative patient data.**
5. **Preserve provenance for every AI-derived clinical fact.**
6. **Every new AI service requires a fallback and failure state.**
7. **Use synthetic patient data in development and demos.**
8. **Do not claim external integration unless the connector has actually been tested.**
9. **Do not introduce microservices, agents, vector databases, blockchain, or model training unless the team explicitly decides they are justified.**
10. **Prefer a small working vertical slice over an incomplete collection of advanced modules.**

---

# 30. Definition of a Release Candidate

A release candidate is ready when the following are all true:

### Product

- patient flow works
- doctor flow works
- triage flow works
- AYUSH flow works
- document flow works

### AI

- ASR works for tested languages
- OCR works for the benchmark set
- extraction returns valid structured JSON
- summary generation is schema-constrained

### Safety

- red-flag rules are deterministic
- alerts are visible and auditable
- low-confidence data is reviewable
- contradictions are surfaced
- physician verification is mandatory before finalization

### Security

- authentication works
- RBAC works
- patient access is authorized server-side
- audit logs are generated
- secrets are not in the repository

### Integration

- FHIR export works
- sandbox/mock adapters are clearly labeled

### Operations

- Docker environment starts from clean machine
- health checks work
- synthetic dataset loads
- demo can run without manual database edits

---

# 31. Final Success Definition

The project is not judged complete because it contains an ASR model, OCR library, LLM, dashboard, and database independently.

It is complete when the parts form a reliable workflow:

```text
PATIENT
   ↓
VOICE / TOUCH / DOCUMENTS
   ↓
AI PERCEPTION
   ↓
STRUCTURED CLINICAL STATE
   ↓
RULES + VALIDATION + PROVENANCE
   ↓
SAFETY GATE
   ↓
TIMELINE + SUMMARY
   ↓
PHYSICIAN VERIFICATION
   ↓
FHIR / HIS / ABDM
```

That is the implementation target for SIH26047.
