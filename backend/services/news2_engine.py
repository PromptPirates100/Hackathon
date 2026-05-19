import json
import re
from utils.logger import setup_logger

logger = setup_logger(__name__)

def analyse_prompt(prompt: str) -> dict:
    """
    Entry point for the rule engine.
    Calls the appropriate handler based on the prompt type.
    """
    if "emergency intake assistant" in prompt:
        return _handle_intake(prompt)
    elif "emergency triage coordinator" in prompt:
        return _handle_triage(prompt)
    elif "emergency logistics coordinator" in prompt:
        return _handle_logistics(prompt)
    else:
        logger.warning("Unknown prompt pattern – returning default")
        return {
            "summary": "Unable to analyse",
            "possible_condition": "Unknown",
            "emergency_level": "medium",
            "risk_indicators": []
        }

# ------------------------------------------------------------------
# Intake handler
# ------------------------------------------------------------------
def _handle_intake(prompt: str) -> dict:
    symptoms = _extract_list(prompt, r"Symptoms:\s*(.*?)\n")
    vitals_str = _extract_value(prompt, r"Vital Signs:\s*(.*?)\n")
    notes = _extract_value(prompt, r"Notes:\s*(.*?)\n")
    vitals = _parse_vitals(vitals_str)

    emergency_level = "low"
    risk_indicators = []
    summary_parts = []

    # Oxygen saturation
    oxygen = vitals.get("oxygen")
    if oxygen is not None:
        try:
            oxygen = int(oxygen)
            if oxygen < 90:
                risk_indicators.append("severe hypoxia")
                emergency_level = "high"
                summary_parts.append(f"oxygen critically low ({oxygen}%)")
            elif oxygen < 95:
                risk_indicators.append("mild hypoxia")
                if emergency_level != "high":
                    emergency_level = "medium"
                summary_parts.append(f"oxygen slightly low ({oxygen}%)")
        except:
            pass

    # Blood pressure
    bp = vitals.get("bp", "")
    if "unstable" in bp.lower() or "low" in bp.lower():
        risk_indicators.append("unstable blood pressure")
        if emergency_level != "high":
            emergency_level = "high"
        summary_parts.append("unstable blood pressure")
    elif "high" in bp.lower():
        risk_indicators.append("hypertensive")
        if emergency_level != "high":
            emergency_level = "medium"

    # Heart rate
    hr = vitals.get("heart_rate")
    if hr is not None:
        try:
            hr = int(hr)
            if hr > 120:
                risk_indicators.append("tachycardia")
                emergency_level = "high"
                summary_parts.append("severe tachycardia")
            elif hr > 100:
                risk_indicators.append("mild tachycardia")
                if emergency_level != "high":
                    emergency_level = "medium"
            elif hr < 50:
                risk_indicators.append("bradycardia")
                emergency_level = "high"
        except:
            pass

    # Symptom keywords
    symptom_str = " ".join(symptoms).lower()
    critical_symptoms = ["chest pain", "breathing difficulty", "unconscious", "seizure",
                         "stroke", "severe bleeding", "cyanosis", "cardiac arrest"]
    medium_symptoms = ["dizziness", "confusion", "fever", "vomiting", "pain", "swelling"]

    for word in critical_symptoms:
        if word in symptom_str:
            risk_indicators.append(word)
            emergency_level = "high"
            summary_parts.append(f"critical symptom: {word}")
            break

    if emergency_level != "high":
        for word in medium_symptoms:
            if word in symptom_str:
                risk_indicators.append(word)
                if emergency_level != "high":
                    emergency_level = "medium"
                summary_parts.append(f"concerning symptom: {word}")

    # Possible condition
    if "cardiac" in symptom_str or "chest pain" in symptom_str:
        possible = "Potential cardiac event"
    elif "breathing" in symptom_str or "respiratory" in symptom_str:
        possible = "Respiratory distress"
    elif "stroke" in symptom_str or "paralysis" in symptom_str:
        possible = "Possible stroke"
    elif "bleeding" in symptom_str:
        possible = "Hemorrhagic emergency"
    elif "fever" in symptom_str and "cough" in symptom_str:
        possible = "Possible infection"
    else:
        possible = "Non-specific medical complaint"

    summary = "Patient presents with " + ", ".join(summary_parts) if summary_parts else "Mild or no acute distress"

    return {
        "summary": summary,
        "possible_condition": possible,
        "emergency_level": emergency_level,
        "risk_indicators": list(set(risk_indicators))
    }

# ------------------------------------------------------------------
# Triage handler (uses NEWS2)
# ------------------------------------------------------------------
def _handle_triage(prompt: str) -> dict:
    age = _extract_value(prompt, r"Age:\s*(\d+)")
    age = int(age) if age else 0
    symptoms = _extract_list(prompt, r"Symptoms:\s*(.*?)\n")
    vitals_str = _extract_value(prompt, r"Vital Signs:\s*(.*?)\n")
    vitals = _parse_vitals(vitals_str)

    # 1. NEWS2 score
    news2_score, news2_risks = _calculate_news2(vitals)

    # 2. Symptom risk modifiers
    symptom_risks = _symptom_risk_modifiers(symptoms)

    # 3. Age modifier
    age_risk = []
    if age >= 70:
        age_risk.append("advanced age (≥70)")
    elif age >= 60:
        age_risk.append("older adult (60‑69)")

    all_risks = news2_risks + symptom_risks + age_risk

    # 4. Severity & priority from NEWS2 score
    if news2_score >= 7:
        severity = "critical"
        priority = "RED"
        risk_score = min(90 + (news2_score - 7) * 2, 99)
        recommendation = "Immediate life‑saving intervention required"
    elif news2_score >= 5:
        severity = "high"
        priority = "RED"
        risk_score = 75 + (news2_score - 5) * 5
        recommendation = "Urgent medical review within 30 minutes"
    elif news2_score >= 3:
        severity = "moderate"
        priority = "YELLOW"
        risk_score = 40 + news2_score * 5
        recommendation = "Escalate care, increase monitoring frequency"
    else:
        severity = "stable"
        priority = "GREEN"
        risk_score = news2_score * 10
        recommendation = "Routine care, continue observation"

    risk_score = min(risk_score, 100)

    # Reasoning
    reasoning = all_risks[:4] if all_risks else ["No acute risk indicators"]

    return {
        "severity": severity,
        "priority": priority,
        "risk_score": risk_score,
        "recommendation": recommendation,
        "reasoning": reasoning
    }

# ------------------------------------------------------------------
# Logistics handler
# ------------------------------------------------------------------
def _handle_logistics(prompt: str) -> dict:
    severity = _extract_value(prompt, r"Severity:\s*(\S+)")
    location = _extract_value(prompt, r"Patient Location:\s*(.*?)\n")

    if severity and "critical" in severity.lower():
        urgency = "Immediate transfer"
        response = "3 mins"
        hospital = "City Trauma Center (Level 1 Emergency Department)"
    elif severity and "high" in severity.lower():
        urgency = "Urgent transfer"
        response = "8 mins"
        hospital = "General Hospital Emergency Room"
    else:
        urgency = "Routine transfer"
        response = "15 mins"
        hospital = "Community Medical Center"

    return {
        "nearest_hospital": hospital,
        "urgency": urgency,
        "estimated_response": response,
        "transfer_notes": f"Patient located at {location or 'unknown location'}. Coordinate with EMS."
    }

# ------------------------------------------------------------------
# NEWS2 calculation
# ------------------------------------------------------------------
def _calculate_news2(vitals: dict) -> tuple:
    score = 0
    risks = []

    # Oxygen
    oxygen = vitals.get("oxygen")
    if oxygen is not None:
        try:
            oxygen = int(oxygen)
            if oxygen <= 91:
                score += 3
                risks.append("severe hypoxia (SpO₂ ≤ 91%)")
            elif oxygen <= 93:
                score += 2
                risks.append("moderate hypoxia (SpO₂ 92‑93%)")
            elif oxygen <= 95:
                score += 1
                risks.append("mild hypoxia (SpO₂ 94‑95%)")
        except:
            pass

    # Systolic BP
    bp = vitals.get("bp", "").lower()
    if "unstable" in bp:
        score += 3
        risks.append("unstable blood pressure (possible shock)")
    else:
        sbp = _extract_systolic(bp)
        if sbp is not None:
            if sbp <= 90:
                score += 3
                risks.append(f"hypotension (SBP {sbp} ≤ 90)")
            elif sbp <= 100:
                score += 2
                risks.append(f"low blood pressure (SBP {sbp} 91‑100)")
            elif sbp <= 110:
                score += 1
                risks.append(f"borderline low BP (SBP {sbp} 101‑110)")
            elif sbp >= 220:
                score += 3
                risks.append(f"severe hypertension (SBP {sbp} ≥ 220)")

    # Heart rate
    hr = vitals.get("heart_rate")
    if hr is not None:
        try:
            hr = int(hr)
            if hr >= 131:
                score += 3
                risks.append("severe tachycardia (HR ≥ 131)")
            elif hr >= 111:
                score += 2
                risks.append("tachycardia (HR 111‑130)")
            elif hr >= 101:
                score += 1
                risks.append("mild tachycardia (HR 101‑110)")
            elif hr <= 40:
                score += 3
                risks.append("severe bradycardia (HR ≤ 40)")
            elif hr <= 50:
                score += 1
                risks.append("bradycardia (HR 41‑50)")
        except:
            pass

    # Temperature (optional)
    temp = vitals.get("temperature")
    if temp is not None:
        try:
            temp = float(temp)
            if temp >= 39.1:
                score += 2
                risks.append("hyperthermia (temp ≥ 39.1°C)")
            elif temp >= 38.1:
                score += 1
                risks.append("mild fever (temp 38.1‑39.0°C)")
            elif temp <= 35.0:
                score += 3
                risks.append("hypothermia (temp ≤ 35.0°C)")
            elif temp <= 36.0:
                score += 1
                risks.append("low temperature (temp 35.1‑36.0°C)")
        except:
            pass

    # Consciousness (AVPU)
    consciousness = vitals.get("consciousness", "").upper()
    if consciousness in ("V", "P", "U"):
        score += 3
        risks.append(f"altered consciousness ({consciousness})")

    return score, risks

def _extract_systolic(bp_str: str):
    if not bp_str:
        return None
    bp_str = re.sub(r'[^\d/]', '', bp_str)
    parts = bp_str.split('/')
    if parts and parts[0].isdigit():
        return int(parts[0])
    return None

def _symptom_risk_modifiers(symptoms: list) -> list:
    risks = []
    symptom_str = " ".join(symptoms).lower()
    critical = ["chest pain", "breathing difficulty", "unconscious", "seizure",
                "stroke", "severe bleeding", "cyanosis", "cardiac arrest"]
    for word in critical:
        if word in symptom_str:
            risks.append(f"critical symptom: {word}")
    if not risks:
        medium = ["dizziness", "confusion", "fever", "vomiting", "pain", "swelling"]
        for word in medium:
            if word in symptom_str:
                risks.append(f"concerning symptom: {word}")
    return risks

# ------------------------------------------------------------------
# Parsing helpers
# ------------------------------------------------------------------
def _extract_value(text: str, pattern: str) -> str:
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""

def _extract_list(text: str, pattern: str) -> list:
    raw = _extract_value(text, pattern)
    if not raw:
        return []
    try:
        import ast
        return ast.literal_eval(raw)
    except:
        return [item.strip() for item in raw.replace('[','').replace(']','').replace("'","").split(',') if item.strip()]

def _parse_vitals(vitals_str: str) -> dict:
    if not vitals_str:
        return {}
    try:
        json_str = vitals_str.replace("'", '"')
        return json.loads(json_str)
    except:
        vitals = {}
        for part in vitals_str.strip('{}').split(','):
            if ':' in part:
                k, v = part.split(':', 1)
                k = k.strip().strip("'\"")
                v = v.strip().strip("'\"")
                vitals[k] = v
        return vitals