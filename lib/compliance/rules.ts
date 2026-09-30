export type InputAssessment = {
  safeText: string;
  injectionDetected: boolean;
  piiRedacted: boolean;
};

export type OutputAssessment = {
  safeText: string;
  passed: boolean;
  needsDisclaimer: boolean;
  crisisDetected: boolean;
  violations: string[];
};

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|system)\s+(instructions|messages)/i,
  /reveal\s+(the\s+)?(system prompt|hidden instructions|secrets)/i,
  /developer\s+message\s*:/i,
  /\b(jailbreak|DAN mode)\b/i,
  /act\s+as\s+(an?\s+)?(unrestricted|uncensored)\s+model/i,
];

const PII_PATTERNS: RegExp[] = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /(?<!\d)(?:\+?\d[\s().-]*){9,15}(?!\d)/g,
  /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
];

const CLINICAL_TERMS = /\b(depression|depressed|anxiety disorder|panic disorder|bipolar|ptsd|ocd|schizophrenia|eating disorder|diagnos(?:is|ed)|medication|antidepressant|therapy|therapist|clinical)\b/i;
const CRISIS_TERMS = /\b(suicid(?:e|al)|kill myself|end my life|self[- ]harm|hurt myself|don't want to live|do not want to live)\b/i;
const PRESCRIPTIVE_CLAIMS = [
  /\byou (?:definitely )?(?:have|are suffering from)\s+(?:clinical\s+)?(?:depression|anxiety|bipolar|ptsd|ocd|schizophrenia)\b/i,
  /\byou should (?:start|stop|increase|decrease|change|take)\s+(?:your\s+)?(?:medication|meds|dose|antidepressants?)\b/i,
  /\b(?:take|stop taking|double|halve)\s+(?:the\s+)?(?:dose|medication|antidepressants?)\b/i,
];
const OUTPUT_PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/,
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/,
  /(?<!\d)(?:\+?\d[\s().-]*){10,15}(?!\d)/,
];

export const MEDICAL_DISCLAIMER = "I’m not a medical professional, and this isn’t a diagnosis or a substitute for care from a qualified clinician.";
export const CRISIS_SUPPORT = "If you may act on these thoughts or are in immediate danger, contact local emergency services now and stay with someone you trust. In India, call Tele-MANAS at 14416; in the United States, call or text 988. If you’re elsewhere, contact your local crisis line or emergency service.";

export function assessInput(text: string): InputAssessment {
  const safeText = PII_PATTERNS.reduce((value, pattern) => value.replace(pattern, "[REDACTED]"), text);
  return {
    safeText,
    injectionDetected: INJECTION_PATTERNS.some((pattern) => pattern.test(text)),
    piiRedacted: safeText !== text,
  };
}

export function assessOutput(text: string, crisisInput = false): OutputAssessment {
  const crisisDetected = crisisInput || CRISIS_TERMS.test(text);
  const violations = PRESCRIPTIVE_CLAIMS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  const withoutHelplines = text.replace(/1800[\s-]?89[\s-]?14416|14416|988/g, "");
  const piiLeak = OUTPUT_PII_PATTERNS.some((pattern) => pattern.test(withoutHelplines));
  if (crisisDetected) {
    return {
      safeText: `I’m really sorry you’re facing this. You deserve immediate, human support. ${CRISIS_SUPPORT}`,
      passed: violations.length === 0,
      needsDisclaimer: false,
      crisisDetected: true,
      violations,
    };
  }
  if (piiLeak) {
    return { safeText: "I can help with your question, but I can’t repeat personal contact or identity details. Please avoid sharing sensitive information here.", passed: false, needsDisclaimer: false, crisisDetected: false, violations: ["possible PII disclosure", ...violations] };
  }
  if (violations.length > 0) {
    return {
      safeText: `I can’t diagnose a condition or recommend starting, stopping, or changing medication. A qualified clinician can help assess what’s going on. ${MEDICAL_DISCLAIMER}`,
      passed: false,
      needsDisclaimer: true,
      crisisDetected: false,
      violations,
    };
  }
  const needsDisclaimer = CLINICAL_TERMS.test(text) && !/not (?:a )?medical (?:professional|advice)|not a diagnosis|qualified clinician/i.test(text);
  return {
    safeText: needsDisclaimer ? `${text.trim()}\n\n${MEDICAL_DISCLAIMER}` : text,
    passed: true,
    needsDisclaimer,
    crisisDetected: false,
    violations,
  };
}

export function hasCrisisLanguage(text: string): boolean {
  return CRISIS_TERMS.test(text);
}
