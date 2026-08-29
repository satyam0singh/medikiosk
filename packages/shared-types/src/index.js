"use strict";
/**
 * MediKiosk Core Shared Domain Types & Contracts
 * Authoritative contracts for SIH26047 - LexCorps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = exports.TimelineEventType = exports.RedFlagSeverity = exports.DocumentProcessingState = exports.DocumentType = exports.ConsentStatus = exports.ClinicalSessionState = exports.EncounterStatus = exports.ConfidenceLevel = exports.VerificationStatus = exports.ProvenanceType = exports.UserRole = void 0;
// ============================================================================
// 1. Core Enumerations
// ============================================================================
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "PATIENT";
    UserRole["PHYSICIAN"] = "PHYSICIAN";
    UserRole["TRIAGE"] = "TRIAGE";
    UserRole["AYUSH_PRACTITIONER"] = "AYUSH_PRACTITIONER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["IT_ADMIN"] = "IT_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var ProvenanceType;
(function (ProvenanceType) {
    ProvenanceType["PATIENT_REPORTED"] = "PATIENT_REPORTED";
    ProvenanceType["DOCUMENT_OCR"] = "DOCUMENT_OCR";
    ProvenanceType["AI_EXTRACTED"] = "AI_EXTRACTED";
    ProvenanceType["SYSTEM_RULE"] = "SYSTEM_RULE";
    ProvenanceType["PHYSICIAN_VERIFIED"] = "PHYSICIAN_VERIFIED";
})(ProvenanceType || (exports.ProvenanceType = ProvenanceType = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["MODIFIED"] = "MODIFIED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["HIGH"] = "HIGH";
    ConfidenceLevel["MEDIUM"] = "MEDIUM";
    ConfidenceLevel["LOW"] = "LOW";
})(ConfidenceLevel || (exports.ConfidenceLevel = ConfidenceLevel = {}));
var EncounterStatus;
(function (EncounterStatus) {
    EncounterStatus["CREATED"] = "CREATED";
    EncounterStatus["IN_PROGRESS"] = "IN_PROGRESS";
    EncounterStatus["AWAITING_PHYSICIAN"] = "AWAITING_PHYSICIAN";
    EncounterStatus["VERIFIED"] = "VERIFIED";
    EncounterStatus["EXPORTED"] = "EXPORTED";
    EncounterStatus["COMPLETED"] = "COMPLETED";
    EncounterStatus["CANCELLED"] = "CANCELLED";
})(EncounterStatus || (exports.EncounterStatus = EncounterStatus = {}));
var ClinicalSessionState;
(function (ClinicalSessionState) {
    ClinicalSessionState["CREATED"] = "CREATED";
    ClinicalSessionState["IDENTIFICATION"] = "IDENTIFICATION";
    ClinicalSessionState["CONSENT_PENDING"] = "CONSENT_PENDING";
    ClinicalSessionState["CONSENTED"] = "CONSENTED";
    ClinicalSessionState["LANGUAGE_SELECTED"] = "LANGUAGE_SELECTED";
    ClinicalSessionState["HISTORY_ACTIVE"] = "HISTORY_ACTIVE";
    ClinicalSessionState["SAFETY_REVIEW"] = "SAFETY_REVIEW";
    ClinicalSessionState["DOCUMENT_CAPTURE"] = "DOCUMENT_CAPTURE";
    ClinicalSessionState["DOCUMENT_PROCESSING"] = "DOCUMENT_PROCESSING";
    ClinicalSessionState["VALIDATION"] = "VALIDATION";
    ClinicalSessionState["SUMMARY_GENERATION"] = "SUMMARY_GENERATION";
    ClinicalSessionState["PHYSICIAN_REVIEW"] = "PHYSICIAN_REVIEW";
    ClinicalSessionState["VERIFIED"] = "VERIFIED";
    ClinicalSessionState["EXPORTED"] = "EXPORTED";
    ClinicalSessionState["COMPLETED"] = "COMPLETED";
    ClinicalSessionState["FAILED"] = "FAILED";
})(ClinicalSessionState || (exports.ClinicalSessionState = ClinicalSessionState = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["PENDING"] = "PENDING";
    ConsentStatus["GRANTED"] = "GRANTED";
    ConsentStatus["REVOKED"] = "REVOKED";
    ConsentStatus["EXPIRED"] = "EXPIRED";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["PRESCRIPTION"] = "PRESCRIPTION";
    DocumentType["LAB_REPORT"] = "LAB_REPORT";
    DocumentType["DISCHARGE_SUMMARY"] = "DISCHARGE_SUMMARY";
    DocumentType["RADIOLOGY_REPORT"] = "RADIOLOGY_REPORT";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentProcessingState;
(function (DocumentProcessingState) {
    DocumentProcessingState["UPLOADED"] = "UPLOADED";
    DocumentProcessingState["VALIDATED"] = "VALIDATED";
    DocumentProcessingState["PROCESSING"] = "PROCESSING";
    DocumentProcessingState["OCR_COMPLETE"] = "OCR_COMPLETE";
    DocumentProcessingState["EXTRACTION_COMPLETE"] = "EXTRACTION_COMPLETE";
    DocumentProcessingState["COMPLETED"] = "COMPLETED";
    DocumentProcessingState["LOW_CONFIDENCE"] = "LOW_CONFIDENCE";
    DocumentProcessingState["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
    DocumentProcessingState["FAILED"] = "FAILED";
})(DocumentProcessingState || (exports.DocumentProcessingState = DocumentProcessingState = {}));
var RedFlagSeverity;
(function (RedFlagSeverity) {
    RedFlagSeverity["CRITICAL_EMERGENCY"] = "CRITICAL_EMERGENCY";
    RedFlagSeverity["PRIORITY_URGENT"] = "PRIORITY_URGENT";
    RedFlagSeverity["WARNING"] = "WARNING";
    RedFlagSeverity["INFO"] = "INFO";
})(RedFlagSeverity || (exports.RedFlagSeverity = RedFlagSeverity = {}));
var TimelineEventType;
(function (TimelineEventType) {
    TimelineEventType["CHIEF_COMPLAINT"] = "CHIEF_COMPLAINT";
    TimelineEventType["SYMPTOM_ONSET"] = "SYMPTOM_ONSET";
    TimelineEventType["MEDICATION_STARTED"] = "MEDICATION_STARTED";
    TimelineEventType["MEDICATION_STOPPED"] = "MEDICATION_STOPPED";
    TimelineEventType["LAB_INVESTIGATION"] = "LAB_INVESTIGATION";
    TimelineEventType["HOSPITALIZATION"] = "HOSPITALIZATION";
    TimelineEventType["SURGERY"] = "SURGERY";
    TimelineEventType["DIAGNOSIS"] = "DIAGNOSIS";
    TimelineEventType["ALLERGY_REACTION"] = "ALLERGY_REACTION";
    TimelineEventType["CONSULTATION"] = "CONSULTATION";
})(TimelineEventType || (exports.TimelineEventType = TimelineEventType = {}));
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["HI"] = "hi";
    LanguageCode["EN"] = "en";
    LanguageCode["HINGLISH"] = "hinglish";
    LanguageCode["MR"] = "mr";
    LanguageCode["TA"] = "ta";
    LanguageCode["TE"] = "te";
    LanguageCode["BN"] = "bn";
})(LanguageCode || (exports.LanguageCode = LanguageCode = {}));
//# sourceMappingURL=index.js.map