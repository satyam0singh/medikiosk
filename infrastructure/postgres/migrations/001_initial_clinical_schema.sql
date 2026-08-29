-- ============================================================================
-- MediKiosk Clinical PostgreSQL Schema
-- Version: 001_initial_clinical_schema.sql
-- Problem Statement: SIH26047 - Team LexCorps
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Enumerations
-- ============================================================================

CREATE TYPE user_role_type AS ENUM (
    'PATIENT',
    'PHYSICIAN',
    'TRIAGE',
    'AYUSH_PRACTITIONER',
    'ADMIN',
    'IT_ADMIN'
);

CREATE TYPE provenance_type AS ENUM (
    'PATIENT_REPORTED',
    'DOCUMENT_OCR',
    'AI_EXTRACTED',
    'SYSTEM_RULE',
    'PHYSICIAN_VERIFIED'
);

CREATE TYPE verification_status_type AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'MODIFIED'
);

CREATE TYPE encounter_status_type AS ENUM (
    'CREATED',
    'IN_PROGRESS',
    'AWAITING_PHYSICIAN',
    'VERIFIED',
    'EXPORTED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE session_state_type AS ENUM (
    'CREATED',
    'IDENTIFICATION',
    'CONSENT_PENDING',
    'CONSENTED',
    'LANGUAGE_SELECTED',
    'HISTORY_ACTIVE',
    'SAFETY_REVIEW',
    'DOCUMENT_CAPTURE',
    'DOCUMENT_PROCESSING',
    'VALIDATION',
    'SUMMARY_GENERATION',
    'PHYSICIAN_REVIEW',
    'VERIFIED',
    'EXPORTED',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE consent_status_type AS ENUM (
    'PENDING',
    'GRANTED',
    'REVOKED',
    'EXPIRED'
);

CREATE TYPE document_type_enum AS ENUM (
    'PRESCRIPTION',
    'LAB_REPORT',
    'DISCHARGE_SUMMARY',
    'RADIOLOGY_REPORT',
    'OTHER'
);

CREATE TYPE document_processing_state_type AS ENUM (
    'UPLOADED',
    'VALIDATED',
    'PROCESSING',
    'OCR_COMPLETE',
    'EXTRACTION_COMPLETE',
    'COMPLETED',
    'LOW_CONFIDENCE',
    'REVIEW_REQUIRED',
    'FAILED'
);

CREATE TYPE red_flag_severity_type AS ENUM (
    'CRITICAL_EMERGENCY',
    'PRIORITY_URGENT',
    'WARNING',
    'INFO'
);

CREATE TYPE timeline_event_type AS ENUM (
    'CHIEF_COMPLAINT',
    'SYMPTOM_ONSET',
    'MEDICATION_STARTED',
    'MEDICATION_STOPPED',
    'LAB_INVESTIGATION',
    'HOSPITALIZATION',
    'SURGERY',
    'DIAGNOSIS',
    'ALLERGY_REACTION',
    'CONSULTATION'
);

-- ============================================================================
-- 2. Users & Roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    hospital_id VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- ============================================================================
-- 3. Patients & Consents
-- ============================================================================

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abha_id VARCHAR(100) UNIQUE,
    hospital_patient_id VARCHAR(100) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    contact_number VARCHAR(30),
    preferred_language VARCHAR(20) NOT NULL DEFAULT 'en',
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_abha ON patients(abha_id);
CREATE INDEX idx_patients_mrn ON patients(hospital_patient_id);
CREATE INDEX idx_patients_contact ON patients(contact_number);

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status consent_status_type NOT NULL DEFAULT 'PENDING',
    scope JSONB NOT NULL, -- Array of strings e.g. ["CLINICAL_INTAKE", "DOCUMENT_OCR"]
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    captured_via VARCHAR(50) NOT NULL, -- VOICE, TOUCH_SCREEN, PAPER_SIGNED
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    audit_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consents_patient ON consents(patient_id);

-- ============================================================================
-- 4. Encounters & Clinical Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status encounter_status_type NOT NULL DEFAULT 'CREATED',
    department VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
    encounter_type VARCHAR(50) NOT NULL DEFAULT 'OPD_GENERAL',
    chief_complaint_summary TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_physician ON encounters(physician_id);
CREATE INDEX idx_encounters_status ON encounters(status);

CREATE TABLE IF NOT EXISTS clinical_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    current_state session_state_type NOT NULL DEFAULT 'CREATED',
    selected_language VARCHAR(20) NOT NULL DEFAULT 'en',
    is_degraded_mode BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_encounter ON clinical_sessions(encounter_id);
CREATE INDEX idx_sessions_state ON clinical_sessions(current_state);

-- ============================================================================
-- 5. Questions & Answers
-- ============================================================================

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    section VARCHAR(50) NOT NULL,
    prompt JSONB NOT NULL, -- Multilingual prompts {"en": "...", "hi": "..."}
    audio_urls JSONB,
    input_type VARCHAR(50) NOT NULL,
    options JSONB, -- Array of QuestionOption
    target_field VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL REFERENCES questions(id),
    raw_text TEXT,
    selected_options JSONB,
    audio_record_id VARCHAR(255),
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    source_type provenance_type NOT NULL DEFAULT 'PATIENT_REPORTED',
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_session ON session_answers(session_id);
CREATE INDEX idx_answers_question ON session_answers(question_id);

-- ============================================================================
-- 6. Clinical Facts & Medical Details (Source of Truth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinical_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    field VARCHAR(100) NOT NULL, -- e.g. 'symptom.chest_pain', 'medication.amlodipine'
    value JSONB NOT NULL,
    normalized_value JSONB,
    source_type provenance_type NOT NULL,
    source_id VARCHAR(255),
    source_page INTEGER,
    confidence NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0.000 AND confidence <= 1.000),
    verification_status verification_status_type NOT NULL DEFAULT 'PENDING',
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facts_patient ON clinical_facts(patient_id);
CREATE INDEX idx_facts_encounter ON clinical_facts(encounter_id);
CREATE INDEX idx_facts_field ON clinical_facts(field);
CREATE INDEX idx_facts_status ON clinical_facts(verification_status);

CREATE TABLE IF NOT EXISTS symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES clinical_facts(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    character VARCHAR(100),
    severity_scale INTEGER CHECK (severity_scale BETWEEN 1 AND 10),
    onset_duration VARCHAR(100),
    onset_date DATE,
    frequency VARCHAR(100),
    aggravating_factors JSONB,
    relieving_factors JSONB,
    associated_symptoms JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES clinical_facts(id) ON DELETE SET NULL,
    drug_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    route VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    indication VARCHAR(200),
    prescribed_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    source_document_id UUID,
    source_page INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES clinical_facts(id) ON DELETE SET NULL,
    allergen VARCHAR(150) NOT NULL,
    allergy_type VARCHAR(50) NOT NULL,
    reaction VARCHAR(200),
    severity VARCHAR(20) NOT NULL DEFAULT 'MODERATE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES clinical_facts(id) ON DELETE SET NULL,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    test_date DATE,
    result_value VARCHAR(100),
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    source_document_id UUID,
    source_page INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. Documents & Extractions
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    document_type document_type_enum NOT NULL DEFAULT 'OTHER',
    processing_state document_processing_state_type NOT NULL DEFAULT 'UPLOADED',
    page_count INTEGER DEFAULT 1,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_patient ON documents(patient_id);
CREATE INDEX idx_docs_encounter ON documents(encounter_id);
CREATE INDEX idx_docs_state ON documents(processing_state);

CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    raw_ocr_text TEXT NOT NULL,
    classified_type document_type_enum NOT NULL,
    overall_confidence NUMERIC(4, 3) NOT NULL,
    extracted_entities JSONB NOT NULL,
    low_confidence_reasons JSONB,
    status verification_status_type NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. Safety Rules & Red Flag Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS red_flag_rules (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity red_flag_severity_type NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    deterministic_logic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS red_flag_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) NOT NULL REFERENCES red_flag_rules(id),
    severity red_flag_severity_type NOT NULL,
    alert_message TEXT NOT NULL,
    trigger_facts JSONB NOT NULL,
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redflags_encounter ON red_flag_events(encounter_id);
CREATE INDEX idx_redflags_ack ON red_flag_events(is_acknowledged);

-- ============================================================================
-- 9. Timeline Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    event_date DATE,
    is_date_estimated BOOLEAN NOT NULL DEFAULT FALSE,
    event_type timeline_event_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    source_type provenance_type NOT NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    source_page INTEGER,
    confidence NUMERIC(4, 3) NOT NULL,
    verification_status verification_status_type NOT NULL DEFAULT 'PENDING',
    has_conflict BOOLEAN NOT NULL DEFAULT FALSE,
    conflict_details TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_patient ON timeline_events(patient_id);
CREATE INDEX idx_timeline_date ON timeline_events(event_date);

-- ============================================================================
-- 10. Clinical Summaries, Physician Reviews & FHIR Exports
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinical_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    chief_complaint TEXT NOT NULL,
    hpi_narrative TEXT NOT NULL,
    ayush_assessment JSONB,
    completeness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    unanswered_required_fields JSONB NOT NULL DEFAULT '[]',
    conflicting_facts_count INTEGER NOT NULL DEFAULT 0,
    overall_confidence NUMERIC(4, 3) NOT NULL,
    is_verified_by_physician BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summaries_encounter ON clinical_summaries(encounter_id);

CREATE TABLE IF NOT EXISTS physician_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES users(id),
    summary_id UUID NOT NULL REFERENCES clinical_summaries(id) ON DELETE CASCADE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    edited_fields JSONB NOT NULL DEFAULT '{}',
    clinical_notes TEXT,
    triage_classification VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fhir_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    fhir_bundle JSONB NOT NULL,
    destination_target VARCHAR(100) NOT NULL DEFAULT 'SANDBOX_MOCK',
    export_status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. Audit Logs (Immutable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role user_role_type,
    action VARCHAR(100) NOT NULL,
    patient_id UUID,
    encounter_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload JSONB, -- Safe masked metadata only (no raw PHI / passwords / tokens)
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_patient ON audit_logs(patient_id);
CREATE INDEX idx_audit_encounter ON audit_logs(encounter_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
