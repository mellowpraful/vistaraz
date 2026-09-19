/**
 * CrisisOS — Mock AI Service
 *
 * Provides AI-like capabilities for incident extraction, summarization,
 * and duplicate detection without requiring external API calls.
 * All outputs are Zod-validated and schema-compliant.
 * Replace with real AI service by implementing the same interface.
 */

import { AIExtractionSchema, type AIExtraction } from "@/lib/types";

// Multilingual sample transcripts for demo
export const SAMPLE_TRANSCRIPTS: Record<string, { language: string; label: string; text: string }> = {
  flood_english: {
    language: "en",
    label: "Flood Report (English)",
    text: `Caller: Hello? Is this the emergency number? Please help us!
Operator: Yes, this is the Emergency Control Room. What is the nature of your emergency?
Caller: There's a massive flood here in Sector 7, near the Sabarmati riverbank. The water level has risen almost 4 feet in the last hour. We have around 200 families trapped here, many elderly people and children. There are at least 15 people who are injured. The water is still rising and we need boats and medical teams urgently!
Operator: Can you confirm your exact location?
Caller: Yes, it's Sector 7, Kankaria area, near the old bridge. Please hurry, the electricity has also gone out!`,
  },
  flood_gujarati: {
    language: "gu",
    label: "Flood Report (Gujarati)",
    text: `ફોનકર્તા: હેલ્લો? ક્યા આ ઈમર્જન્સી નંબર છે? કૃપા કરી મદદ કરો!
ઓપરેટર: હા, આ ઈમર્જન્સી કંટ્રોલ રૂમ છે. શું સમસ્યા છે?
ફોનકર્તા: અહીં સેક્ટર 7 માં, સાબરમતી નદીની નજીક, ભારે પૂર આવ્યું છે. છેલ્લા 1 કલાકમાં પાણીની સપાટી 4 ફૂટ વધી ગઈ છે. અંદાજે 200 પરિવારો ફસાયા છે. 15 થી વધુ ઘાયલ છે. અમને હોડી અને ડૉક્ટરો ઝડપથી જોઈએ છે!`,
  },
  fire_hinglish: {
    language: "hi",
    label: "Fire Report (Hinglish)",
    text: `Caller: Bhai emergency hai! GIDC industrial area mein factory mein aag lag gayi hai!
Operator: Theek hai, location bataiye?
Caller: GIDC Phase 2, Plot number 47, chemical factory. Bahut bada fire hai, chemical tanks bhi hain wahan. 30-40 workers abhi andar hain. Ambulance aur fire brigade ko jaldi bhejo! Chemicals hain toh bahut dangerous situation hai!`,
  },
  road_accident_hindi: {
    language: "hi",
    label: "Road Accident (Hindi)",
    text: `कॉलर: नमस्ते, हाईवे पर बड़ा एक्सीडेंट हुआ है!
ऑपरेटर: जी, कहाँ पर?
कॉलर: अहमदाबाद-वडोदरा एक्सप्रेसवे पर, किलोमीटर मार्कर 45 के पास। एक ट्रक और दो कारें टकराई हैं। करीब 8-10 लोग घायल हैं, 2 बहुत गंभीर हैं। ट्रैफिक जाम हो गया है। एम्बुलेंस और पुलिस चाहिए।`,
  },
};

// Deterministic extraction based on text patterns
function extractFromText(text: string, language: string): AIExtraction {
  const lower = text.toLowerCase();

  // Detect incident type
  let type: AIExtraction["type"] = "OTHER";
  if (lower.includes("flood") || lower.includes("water") || lower.includes("पूर") || lower.includes("nadi") || lower.includes("river")) {
    type = "FLOOD";
  } else if (lower.includes("fire") || lower.includes("aag") || lower.includes("आग") || lower.includes("blaze") || lower.includes("burning")) {
    type = "FIRE";
  } else if (lower.includes("accident") || lower.includes("crash") || lower.includes("collision") || lower.includes("एक्सीडेंट") || lower.includes("highway")) {
    type = "ROAD_ACCIDENT";
  } else if (lower.includes("chemical") || lower.includes("industrial") || lower.includes("factory") || lower.includes("hazmat")) {
    type = "INDUSTRIAL";
  } else if (lower.includes("medical") || lower.includes("hospital") || lower.includes("heart")) {
    type = "MEDICAL";
  }

  // Detect severity
  let severity: AIExtraction["severity"] = "MEDIUM";
  if (lower.includes("critical") || lower.includes("life") || lower.includes("dying") || lower.includes("chemical") ||
      lower.includes("many injured") || lower.includes("urgent") || lower.includes("ज़रूरी") || lower.includes("ઝડપ")) {
    severity = "HIGH";
  }
  if ((lower.match(/\d+/) && parseInt(lower.match(/\d+/)?.[0] ?? "0") > 10) ||
      lower.includes("massive") || lower.includes("major") || lower.includes("200") || lower.includes("critical")) {
    severity = "CRITICAL";
  }

  // Extract numbers for affected count
  const numbers = lower.match(/\d+/g)?.map(Number) ?? [];
  const largeNumber = numbers.filter(n => n > 5 && n < 1000).sort((a, b) => b - a)[0];
  const injuryMatch = lower.match(/(\d+)\s*(?:people|persons|injured|hurt|घायल|ઘાયલ)/);
  const injuryCount = injuryMatch ? parseInt(injuryMatch[1]) : undefined;

  // Detect location
  let locationName: string | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let locationConfidence = 0.3;

  if (lower.includes("sector 7") || lower.includes("kankaria") || lower.includes("sabarmati")) {
    locationName = "Sector 7, Kankaria, Ahmedabad";
    latitude = 23.0009;
    longitude = 72.6017;
    locationConfidence = 0.85;
  } else if (lower.includes("gidc") || lower.includes("phase 2")) {
    locationName = "GIDC Phase 2, Ahmedabad";
    latitude = 22.9784;
    longitude = 72.5685;
    locationConfidence = 0.8;
  } else if (lower.includes("highway") || lower.includes("expressway") || lower.includes("km 45") || lower.includes("kilometer")) {
    locationName = "Ahmedabad-Vadodara Expressway, KM 45";
    latitude = 22.7196;
    longitude = 72.8365;
    locationConfidence = 0.75;
  }

  // Detect hazards
  const hazards: string[] = [];
  if (lower.includes("chemical") || lower.includes("hazmat")) hazards.push("Chemical Hazard");
  if (lower.includes("electric") || lower.includes("power")) hazards.push("Electrical Hazard");
  if (lower.includes("fire") || lower.includes("aag")) hazards.push("Active Fire");
  if (lower.includes("flood") || lower.includes("water")) hazards.push("Rising Water Levels");
  if (lower.includes("traffic") || lower.includes("highway")) hazards.push("Traffic Obstruction");

  // Determine required capabilities
  const requiredCapabilities: string[] = [];
  if (type === "FLOOD") {
    requiredCapabilities.push("WATER_RESCUE", "FLOOD_EVACUATION");
    if (injuryCount) requiredCapabilities.push("TRAUMA_CARE");
  } else if (type === "FIRE") {
    requiredCapabilities.push("FIRE_SUPPRESSION");
    if (lower.includes("chemical")) requiredCapabilities.push("HAZMAT_RESPONSE");
    if (injuryCount) requiredCapabilities.push("TRAUMA_CARE");
  } else if (type === "ROAD_ACCIDENT") {
    requiredCapabilities.push("TRAUMA_CARE", "PATIENT_TRANSPORT");
    requiredCapabilities.push("TRAFFIC_MANAGEMENT");
  } else if (type === "INDUSTRIAL") {
    requiredCapabilities.push("HAZMAT_RESPONSE", "FIRE_SUPPRESSION");
    if (injuryCount) requiredCapabilities.push("TRAUMA_CARE");
  }

  // Identify missing information
  const missingInfo: string[] = [];
  if (!locationName) missingInfo.push("Exact address or landmark");
  if (!injuryCount) missingInfo.push("Number of injured persons");
  if (!largeNumber) missingInfo.push("Total number of people affected");
  if (hazards.length === 0) missingInfo.push("Specific hazards present");

  // Suggested follow-up questions
  const suggestedQuestions = [
    ...(missingInfo.includes("Exact address") ? ["Can you provide the exact street address or a nearby landmark?"] : []),
    ...(missingInfo.includes("Number of injured") ? ["How many people are injured and what are their conditions?"] : []),
    "Are there any children, elderly, or people with disabilities?",
    "Is the situation still escalating?",
    "Is there access for emergency vehicles?",
  ];

  const titleMap: Record<string, string> = {
    FLOOD: `Major Flood Incident — ${locationName ?? "Location TBC"}`,
    FIRE: `Fire Emergency — ${locationName ?? "Location TBC"}`,
    ROAD_ACCIDENT: `Road Accident — ${locationName ?? "Highway Location TBC"}`,
    INDUSTRIAL: `Industrial Emergency — ${locationName ?? "Industrial Area TBC"}`,
    MEDICAL: `Medical Emergency — ${locationName ?? "Location TBC"}`,
    OTHER: `Emergency Incident — ${locationName ?? "Location TBC"}`,
  };

  return AIExtractionSchema.parse({
    title: titleMap[type] ?? `Emergency — ${locationName ?? "Unknown Location"}`,
    type,
    severity,
    locationName,
    latitude,
    longitude,
    locationConfidence,
    affectedCount: largeNumber,
    injuryCount,
    hazards,
    requiredCapabilities,
    missingInfo,
    suggestedQuestions: suggestedQuestions.slice(0, 4),
    confidence: locationName ? 0.75 : 0.55,
    summary: `${severity} severity ${type.replace("_", " ").toLowerCase()} incident${locationName ? ` at ${locationName}` : ""}. ${largeNumber ? `Approximately ${largeNumber} people affected.` : ""} ${injuryCount ? `${injuryCount} reported injured.` : ""}`,
    language,
  });
}

export async function analyzeReport(
  text: string,
  language = "en"
): Promise<AIExtraction> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 800));
  return extractFromText(text, language);
}

export async function generateSituationSummary(incidents: {
  title: string; severity: string; status: string; type: string;
}[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 400));

  const critical = incidents.filter(i => i.severity === "CRITICAL").length;
  const high = incidents.filter(i => i.severity === "HIGH").length;
  const active = incidents.filter(i => !["RESOLVED", "CLOSED"].includes(i.status)).length;

  const typeGroups = incidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});
  const dominantType = Object.entries(typeGroups).sort((a, b) => b[1] - a[1])[0];

  let urgency = "Situation is currently manageable.";
  if (critical > 0) urgency = `⚠️ CRITICAL: ${critical} incident(s) require immediate attention.`;
  else if (high > 0) urgency = `🔶 HIGH ALERT: ${high} high-severity incident(s) active.`;

  return `${urgency} Currently ${active} active incident(s) being managed across the operations area. ${dominantType ? `Primary incident type: ${dominantType[0].replace("_", " ")} (${dominantType[1]} incident(s)).` : ""} All units should maintain heightened alert status.`;
}

export async function detectDuplicates(
  newIncident: { title: string; locationName?: string | null; type: string; latitude?: number | null; longitude?: number | null },
  existing: { id: string; title: string; locationName?: string | null; type: string; latitude?: number | null; longitude?: number | null }[]
): Promise<{ isDuplicate: boolean; relatedIds: string[]; confidence: number }> {
  await new Promise((r) => setTimeout(r, 200));

  const related: string[] = [];
  let maxConfidence = 0;

  for (const ex of existing) {
    let confidence = 0;

    // Same type
    if (ex.type === newIncident.type) confidence += 0.3;

    // Similar location name
    if (newIncident.locationName && ex.locationName) {
      const words1 = newIncident.locationName.toLowerCase().split(/\s+/);
      const words2 = ex.locationName.toLowerCase().split(/\s+/);
      const overlap = words1.filter(w => words2.includes(w)).length;
      if (overlap > 1) confidence += 0.4;
    }

    // Close coordinates (within ~2km)
    if (newIncident.latitude && newIncident.longitude && ex.latitude && ex.longitude) {
      const dLat = Math.abs(newIncident.latitude - ex.latitude);
      const dLon = Math.abs(newIncident.longitude - ex.longitude);
      if (dLat < 0.02 && dLon < 0.02) confidence += 0.4;
    }

    if (confidence > 0.5) {
      related.push(ex.id);
      maxConfidence = Math.max(maxConfidence, confidence);
    }
  }

  return {
    isDuplicate: maxConfidence > 0.7,
    relatedIds: related,
    confidence: maxConfidence,
  };
}
