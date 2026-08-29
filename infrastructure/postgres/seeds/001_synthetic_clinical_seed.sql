-- ============================================================================
-- MediKiosk Synthetic Clinical Seed Data
-- Version: 001_synthetic_clinical_seed.sql
-- Problem Statement: SIH26047 - Team LexCorps
-- ============================================================================

-- 1. Users & Staff Credentials (Default synthetic passwords hashed with bcrypt: "Medikiosk@2026")
-- Hash: $2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6
INSERT INTO users (id, email, password_hash, full_name, is_active, hospital_id, department)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'dr.sharma@aiia.gov.in', '$2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6', 'Dr. Rajesh Sharma', TRUE, 'AIIA-ND-01', 'General Medicine'),
    ('a0000000-0000-0000-0000-000000000002', 'priya.triage@aiia.gov.in', '$2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6', 'Nurse Priya Nair', TRUE, 'AIIA-ND-01', 'Emergency Triage'),
    ('a0000000-0000-0000-0000-000000000003', 'dr.vaidya@aiia.gov.in', '$2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6', 'Dr. Ananya Vaidya', TRUE, 'AIIA-ND-01', 'Kayachikitsa / AYUSH'),
    ('a0000000-0000-0000-0000-000000000004', 'admin@medikiosk.local', '$2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6', 'System Administrator', TRUE, 'AIIA-ND-01', 'IT Admin')
ON CONFLICT (id) DO NOTHING;

-- 2. User Roles Assignment
INSERT INTO user_roles (user_id, role)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'PHYSICIAN'),
    ('a0000000-0000-0000-0000-000000000002', 'TRIAGE'),
    ('a0000000-0000-0000-0000-000000000003', 'AYUSH_PRACTITIONER'),
    ('a0000000-0000-0000-0000-000000000004', 'ADMIN')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Core Deterministic Red-Flag Rules
INSERT INTO red_flag_rules (id, code, title, description, severity, category, is_enabled, deterministic_logic)
VALUES
    ('rf_chest_pain_severe', 'RF_CARD_001', 'Acute Chest Pain with Radiation / Breathlessness', 'Patient reports severe chest pain radiating to left arm or neck, or associated with acute breathlessness.', 'CRITICAL_EMERGENCY', 'CARDIOLOGY', TRUE, 'symptom.chest_pain == true AND (symptom.severity >= 7 OR symptom.radiation == "left_arm" OR symptom.breathlessness == true)'),
    ('rf_fever_meningismus', 'RF_NEURO_001', 'High Fever with Neck Stiffness / Confusion', 'High grade fever associated with neck stiffness or altered consciousness.', 'CRITICAL_EMERGENCY', 'NEUROLOGY', TRUE, 'symptom.fever == true AND (symptom.stiff_neck == true OR symptom.confusion == true)'),
    ('rf_dyspnea_acute', 'RF_RESP_001', 'Acute Severe Dyspnea / Stridor', 'Sudden onset difficulty breathing at rest.', 'CRITICAL_EMERGENCY', 'RESPIRATORY', TRUE, 'symptom.shortness_of_breath == true AND symptom.at_rest == true'),
    ('rf_abd_guarding', 'RF_SURG_001', 'Acute Abdominal Rigidity / Guarding', 'Severe abdominal pain with board-like rigidity or persistent vomiting.', 'PRIORITY_URGENT', 'SURGICAL', TRUE, 'symptom.abdominal_pain == true AND (symptom.guarding == true OR symptom.persistent_vomiting == true)')
ON CONFLICT (id) DO NOTHING;

-- 4. Standard Question Bank (Bilingual Hindi/English with touch options)
INSERT INTO questions (id, code, section, prompt, input_type, options, target_field, is_required)
VALUES
    (
        'q_chief_complaint',
        'Q_CC_001',
        'CHIEF_COMPLAINT',
        '{"en": "What is the main problem bringing you to the hospital today?", "hi": "आज अस्पताल आने का आपका मुख्य कारण या परेशानी क्या है?"}',
        'VOICE_OR_TOUCH',
        '[
            {"id": "opt_chest_pain", "value": "chest_pain", "label": {"en": "Chest Pain / Discomfort", "hi": "सीने में दर्द या भारीपन"}},
            {"id": "opt_fever", "value": "fever", "label": {"en": "Fever / Chills", "hi": "बुखार या ठंड लगना"}},
            {"id": "opt_abd_pain", "value": "abdominal_pain", "label": {"en": "Stomach Pain / Acidity", "hi": "पेट में दर्द या गैस"}},
            {"id": "opt_cough", "value": "cough_breathlessness", "label": {"en": "Cough / Breathlessness", "hi": "खांसी या सांस फूलना"}},
            {"id": "opt_joint_pain", "value": "joint_pain", "label": {"en": "Joint / Body Pain", "hi": "जोड़ों या बदन में दर्द"}},
            {"id": "opt_other", "value": "other", "label": {"en": "Other Problem", "hi": "अन्य परेशानी"}}
        ]',
        'chief_complaint.primary',
        TRUE
    ),
    (
        'q_chest_onset',
        'Q_CP_001',
        'HPI',
        '{"en": "When did this chest pain or discomfort start?", "hi": "सीने में यह दर्द या परेशानी कब से शुरू हुई?"}',
        'VOICE_OR_TOUCH',
        '[
            {"id": "opt_hours", "value": "few_hours_ago", "label": {"en": "A few hours ago", "hi": "कुछ घंटे पहले"}},
            {"id": "opt_yesterday", "value": "since_yesterday", "label": {"en": "Since yesterday", "hi": "कल से"}},
            {"id": "opt_days", "value": "several_days", "label": {"en": "2-3 days ago", "hi": "2-3 दिन से"}},
            {"id": "opt_weeks", "value": "over_a_week", "label": {"en": "More than a week", "hi": "एक हफ्ते से ज्यादा"}}
        ]',
        'hpi.pain_onset',
        TRUE
    ),
    (
        'q_chest_character',
        'Q_CP_002',
        'HPI',
        '{"en": "How does the pain feel?", "hi": "दर्द किस प्रकार का महसूस होता है?"}',
        'SINGLE_CHOICE',
        '[
            {"id": "opt_heavy", "value": "heaviness_pressure", "label": {"en": "Heavy pressure / squeezing", "hi": "भारीपन या दबाव"}},
            {"id": "opt_burning", "value": "burning", "label": {"en": "Burning sensation / acidity", "hi": "जलन या गैस जैसा"}},
            {"id": "opt_sharp", "value": "sharp_pricking", "label": {"en": "Sharp / pricking", "hi": "चुभने वाला तेज दर्द"}},
            {"id": "opt_dull", "value": "dull_ache", "label": {"en": "Dull continuous ache", "hi": "हल्का लगातार दर्द"}}
        ]',
        'hpi.pain_character',
        TRUE
    ),
    (
        'q_chest_severity',
        'Q_CP_003',
        'HPI',
        '{"en": "On a scale of 1 to 10, how severe is the pain?", "hi": "1 से 10 के पैमाने पर दर्द कितना तेज है?"}',
        'NUMERIC_SCALE',
        '[
            {"id": "1", "value": "1", "label": {"en": "1 (Mild)", "hi": "1 (बहुत हल्का)"}},
            {"id": "5", "value": "5", "label": {"en": "5 (Moderate)", "hi": "5 (मध्यम)"}},
            {"id": "10", "value": "10", "label": {"en": "10 (Unbearable)", "hi": "10 (असहनीय)"}}
        ]',
        'hpi.pain_severity',
        TRUE
    ),
    (
        'q_prior_medications',
        'Q_MED_001',
        'MEDICATIONS',
        '{"en": "Are you currently taking any regular medicines for BP, Sugar, or other conditions?", "hi": "क्या आप बीपी, शुगर या किसी अन्य बीमारी की नियमित दवा ले रहे हैं?"}',
        'VOICE_OR_TOUCH',
        '[
            {"id": "opt_bp", "value": "bp_medicines", "label": {"en": "Blood Pressure Medicines", "hi": "बीपी की दवा"}},
            {"id": "opt_diabetes", "value": "diabetes_medicines", "label": {"en": "Diabetes / Sugar Medicines", "hi": "शुगर की दवा"}},
            {"id": "opt_heart", "value": "heart_medicines", "label": {"en": "Heart / Cholesterol Medicines", "hi": "हार्ट या कोलेस्ट्रॉल की दवा"}},
            {"id": "opt_none", "value": "no_medicines", "label": {"en": "No regular medicines", "hi": "कोई नियमित दवा नहीं"}}
        ]',
        'medications.history',
        FALSE
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Synthetic Demo Patient: Ramesh Kumar (Chest Pain OPD Case)
INSERT INTO patients (id, abha_id, hospital_patient_id, full_name, gender, date_of_birth, age, contact_number, preferred_language, address)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        '91-4829-1029-4820',
        'MRN-2026-00482',
        'Ramesh Kumar',
        'MALE',
        '1972-04-15',
        54,
        '+91 98765 43210',
        'hi',
        '{"city": "New Delhi", "state": "Delhi", "pincode": "110076", "line1": "Sarita Vihar"}'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Synthetic Encounter for Ramesh Kumar
INSERT INTO encounters (id, patient_id, physician_id, status, department, encounter_type, chief_complaint_summary, started_at)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'AWAITING_PHYSICIAN',
        'General Medicine',
        'OPD_GENERAL',
        'Retro-sternal chest burning since yesterday night with exertion discomfort',
        NOW() - INTERVAL '20 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Consent Record for Ramesh Kumar
INSERT INTO consents (id, patient_id, status, scope, version, captured_via, granted_at)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'GRANTED',
        '["CLINICAL_INTAKE", "DOCUMENT_OCR", "AI_STRUCTURING", "ABDM_SHARING"]',
        'v1.0',
        'TOUCH_SCREEN',
        NOW() - INTERVAL '18 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Clinical Facts for Ramesh Kumar with Provenance
INSERT INTO clinical_facts (id, patient_id, encounter_id, field, value, normalized_value, source_type, confidence, verification_status)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'symptom.chest_pain',
        '{"character": "burning", "onset": "yesterday night", "severity": 6}',
        '{"standard_code": "SNOMED_29857009", "name": "Chest pain"}',
        'PATIENT_REPORTED',
        0.950,
        'PENDING'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'medication.amlodipine',
        '{"drugName": "Amlodipine 5mg", "frequency": "OD", "duration": "6 months"}',
        '{"rxnorm": "17767", "name": "Amlodipine"}',
        'DOCUMENT_OCR',
        0.910,
        'PENDING'
    )
ON CONFLICT (id) DO NOTHING;
