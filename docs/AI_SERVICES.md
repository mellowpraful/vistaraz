# CrisisOS — AI Services & Integration Architecture

This document describes the AI abstraction layer, prompt engineering strategies, entity extraction pipelines, and the procedure for swapping mock services with real LLM providers (e.g. OpenAI GPT-4o, Google Gemini 2.5 Flash, Anthropic Claude 3.7 Sonnet).

---

## 1. AI Service Abstraction (`src/lib/ai/mock-analyzer.ts`)

CrisisOS exposes a unified AI interface supporting three core capabilities:

1. **`analyzeReport(rawText)`**: Extracts structured entities from unstructured 911 calls, radio transcripts, or citizen reports.
2. **`generateSituationSummary(incidents, resources)`**: Generates executive multi-agency Situation Reports (SITREPs).
3. **`detectDuplicates(incidents)`**: Clusters multiple emergency reports referring to the same physical incident.

---

## 2. Swapping to Live LLM Provider (e.g. Gemini / OpenAI)

To connect live AI models, update `src/app/api/ai/analyze/route.ts` with your API key:

```typescript
// Example Google Gemini integration
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractWithGemini(rawText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `
    You are an emergency triage AI for CrisisOS.
    Extract the following JSON from the caller transcript:
    - title, type, severity, locationName, latitude, longitude, affectedCount, injuryCount, hazards, requiredCapabilities, summary
    Caller transcript: "${rawText}"
  `;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

---

## 3. Prompt Engineering Guidelines

- **Zero-Shot Triage:** Always prompt the model with strict JSON schema definitions.
- **Safety First:** If casualty or hazard information is ambiguous, assign the higher severity class (`HIGH` or `CRITICAL`) to ensure adequate initial response mobilization.
- **Topographic & Hazard Extraction:** Explicitly request extracted physical hazards (e.g., flammable gas, structural collapse risk, submerged electrical cables).
