package main

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type inputRequest struct {
	Text string `json:"text"`
}

type inputResponse struct {
	SafeText          string `json:"safeText"`
	InjectionDetected bool   `json:"injectionDetected"`
	PiiRedacted       bool   `json:"piiRedacted"`
}

type outputRequest struct {
	Text        string `json:"text"`
	CrisisInput bool   `json:"crisisInput"`
}

type outputResponse struct {
	SafeText        string   `json:"safeText"`
	Passed          bool     `json:"passed"`
	NeedsDisclaimer bool     `json:"needsDisclaimer"`
	CrisisDetected  bool     `json:"crisisDetected"`
	Violations      []string `json:"violations"`
}

var (
	emails          = regexp.MustCompile(`(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`)
	phones          = regexp.MustCompile(`(?:\+?\d[\s().-]*){9,15}`)
	ssn             = regexp.MustCompile(`\b\d{3}[- ]?\d{2}[- ]?\d{4}\b`)
	aadhaar         = regexp.MustCompile(`\b\d{4}[ -]?\d{4}[ -]?\d{4}\b`)
	outputPhone     = regexp.MustCompile(`(?:\+?\d[\s().-]*){10,15}`)
	injection       = regexp.MustCompile(`(?i)ignore\s+(all\s+)?(previous|prior|system)\s+(instructions|messages)|reveal\s+(the\s+)?(system prompt|hidden instructions|secrets)|developer\s+message\s*:|\b(jailbreak|DAN mode)\b|act\s+as\s+(an?\s+)?(unrestricted|uncensored)\s+model`)
	clinical        = regexp.MustCompile(`(?i)\b(depression|depressed|anxiety disorder|panic disorder|bipolar|ptsd|ocd|schizophrenia|eating disorder|diagnos(?:is|ed)|medication|antidepressant|therapy|therapist|clinical)\b`)
	crisis          = regexp.MustCompile(`(?i)\b(suicid(?:e|al)|kill myself|end my life|self[- ]harm|hurt myself|don't want to live|do not want to live)\b`)
	disclaimer      = regexp.MustCompile(`(?i)not (?:a )?medical (?:professional|advice)|not a diagnosis|qualified clinician`)
	forbiddenClaims = []*regexp.Regexp{
		regexp.MustCompile(`(?i)\byou (?:definitely )?(?:have|are suffering from)\s+(?:clinical\s+)?(?:depression|anxiety|bipolar|ptsd|ocd|schizophrenia)\b`),
		regexp.MustCompile(`(?i)\byou should (?:start|stop|increase|decrease|change|take)\s+(?:your\s+)?(?:medication|meds|dose|antidepressants?)\b`),
		regexp.MustCompile(`(?i)\b(?:take|stop taking|double|halve)\s+(?:the\s+)?(?:dose|medication|antidepressants?)\b`),
	}
)

func jsonHandler(fn func(http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		fn(w, r)
	}
}

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 64*1024)
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return false
	}
	return true
}

func writeJSON(w http.ResponseWriter, value any) {
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(value)
}

func validateInput(w http.ResponseWriter, r *http.Request) {
	var request inputRequest
	if !decode(w, r, &request) {
		return
	}
	safe := request.Text
	for _, pattern := range []*regexp.Regexp{emails, phones, ssn, aadhaar} {
		safe = pattern.ReplaceAllString(safe, "[REDACTED]")
	}
	writeJSON(w, inputResponse{
		SafeText:          safe,
		InjectionDetected: injection.MatchString(request.Text),
		PiiRedacted:       safe != request.Text,
	})
}

func validateOutput(w http.ResponseWriter, r *http.Request) {
	var request outputRequest
	if !decode(w, r, &request) {
		return
	}
	crisisDetected := request.CrisisInput || crisis.MatchString(request.Text)
	violations := make([]string, 0)
	for _, pattern := range forbiddenClaims {
		if pattern.MatchString(request.Text) {
			violations = append(violations, pattern.String())
		}
	}
	if crisisDetected {
		writeJSON(w, outputResponse{
			SafeText:       "I’m really sorry you’re facing this. You deserve immediate, human support. If you may act on these thoughts or are in immediate danger, contact local emergency services now and stay with someone you trust. In India, call Tele-MANAS at 14416; in the United States, call or text 988. If you’re elsewhere, contact your local crisis line or emergency service.",
			Passed:         len(violations) == 0,
			CrisisDetected: true,
			Violations:     violations,
		})
		return
	}

	withoutHotlines := strings.NewReplacer("1800-89-14416", "", "1800 89 14416", "", "14416", "", "988", "").Replace(request.Text)
	if emails.MatchString(withoutHotlines) || ssn.MatchString(withoutHotlines) || aadhaar.MatchString(withoutHotlines) || outputPhone.MatchString(withoutHotlines) {
		violations = append(violations, "possible PII disclosure")
		writeJSON(w, outputResponse{
			SafeText:   "I can help with your question, but I can’t repeat personal contact or identity details. Please avoid sharing sensitive information here.",
			Passed:     false,
			Violations: violations,
		})
		return
	}
	if len(violations) > 0 {
		writeJSON(w, outputResponse{
			SafeText:        "I can’t diagnose a condition or recommend starting, stopping, or changing medication. A qualified clinician can help assess what’s going on. I’m not a medical professional, and this isn’t a diagnosis or a substitute for care from a qualified clinician.",
			Passed:          false,
			NeedsDisclaimer: true,
			Violations:      violations,
		})
		return
	}

	needsDisclaimer := clinical.MatchString(request.Text) && !disclaimer.MatchString(request.Text)
	safe := request.Text
	if needsDisclaimer {
		safe = strings.TrimSpace(safe) + "\n\nI’m not a medical professional, and this isn’t a diagnosis or a substitute for care from a qualified clinician."
	}
	writeJSON(w, outputResponse{SafeText: safe, Passed: true, NeedsDisclaimer: needsDisclaimer, Violations: violations})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("/validate/input", jsonHandler(validateInput))
	mux.HandleFunc("/validate/output", jsonHandler(validateOutput))
	server := &http.Server{Addr: ":8081", Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	log.Printf("rules engine listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
