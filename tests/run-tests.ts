/**
 * CrisisOS — Test Suite Runner
 * Comprehensive unit and algorithm verification tests
 */

import { matchResources } from "../src/lib/dispatch/capability-matcher";
import { CreateIncidentSchema } from "../src/lib/types";
import { analyzeReport } from "../src/lib/ai/mock-analyzer";
import { calculateDistance, formatDuration } from "../src/lib/utils";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n🧪 Running CrisisOS Unit & Algorithm Test Suite...\n");

  // ─── 1. Capability Matcher & Ranking Algorithm Tests ───────────
  console.log("🔹 1. Capability Matcher Algorithm Tests");

  const mockIncident = {
    id: "test-inc-1",
    title: "Flood Incident",
    type: "FLOOD",
    severity: "CRITICAL",
    status: "REPORTED",
    latitude: 23.0225,
    longitude: 72.5714,
    requiredCapabilities: JSON.stringify(["WATER_RESCUE"]),
  };

  const mockResources = [
    {
      id: "res-boat-1",
      name: "NDRF Rescue Boat Alpha",
      type: "BOAT",
      status: "AVAILABLE",
      latitude: 23.0300,
      longitude: 72.5800,
      reliabilityScore: 0.95,
      currentWorkload: 10,
      capabilities: [
        { capability: "WATER_RESCUE", equipment: "Inflatable Engine Boat" },
      ],
      agency: { name: "NDRF Battalion 6" },
      assignments: [],
    },
    {
      id: "res-fire-1",
      name: "Fire Tender 01",
      type: "FIRE_ENGINE",
      status: "AVAILABLE",
      latitude: 23.0500,
      longitude: 72.5900,
      reliabilityScore: 0.90,
      currentWorkload: 0,
      capabilities: [
        { capability: "FIRE_SUPPRESSION", equipment: "Water Cannon" },
      ],
      agency: { name: "Ahmedabad Fire" },
      assignments: [],
    },
  ];

  const recommendations = matchResources(mockIncident as any, mockResources as any);

  assert(recommendations.length > 0, "Recommendations generated for incident");
  assert(recommendations[0].resource.id === "res-boat-1", "Top recommended unit is the boat with matching WATER_RESCUE capability");
  assert(recommendations[0].score > 50, "Matching capability score exceeds 50");
  assert(recommendations[0].reasons.length > 0, "Explainable reasons provided in recommendation");

  // ─── 2. Geodesic Distance (Haversine) Tests ───────────
  console.log("\n🔹 2. Geodesic Distance (Haversine) Tests");
  const d = calculateDistance(23.0225, 72.5714, 23.0300, 72.5800);
  assert(d > 0.8 && d < 1.6, `Distance calculated accurately (~${d} km)`);
  assert(calculateDistance(23.0, 72.0, 23.0, 72.0) === 0, "Zero distance between identical points");

  // ─── 3. Format Utils Tests ───────────────────────────────────
  console.log("\n🔹 3. Time Formatting Utility Tests");
  assert(formatDuration(45) === "45s", "Seconds format correctly");
  assert(formatDuration(125) === "2m 5s", "Minutes & seconds format correctly");

  // ─── 4. Zod Schema Validation Tests ─────────────────────────
  console.log("\n🔹 4. Zod Validation Schema Tests");
  const validIncidentInput = {
    title: "Chemical Spill Vatva",
    description: "Chlorine leakage reported in factory premises",
    type: "HAZMAT",
    severity: "CRITICAL",
    source: "EMERGENCY_CALL",
    affectedCount: 15,
  };
  const parseResult = CreateIncidentSchema.safeParse(validIncidentInput);
  assert(parseResult.success === true, "Valid incident input passes Zod schema validation");

  const invalidInput = {
    title: "Hi", // Too short
    description: "Short",
    type: "INVALID_TYPE",
  };
  const invalidResult = CreateIncidentSchema.safeParse(invalidInput);
  assert(invalidResult.success === false, "Invalid incident input fails Zod schema validation");

  // ─── 5. AI Extraction & Analyzer Tests ───────────────────────
  console.log("\n🔹 5. AI Extraction & Analysis Service Tests");
  const extractionResult = await analyzeReport("Urgent! Flash flood near Sabarmati Ashram, 20 people stuck with water rising!");
  assert(extractionResult.type === "FLOOD", "AI accurately classifies FLOOD from text");
  assert(extractionResult.severity === "CRITICAL" || extractionResult.severity === "HIGH", "AI accurately assigns high/critical severity");
  assert((extractionResult.affectedCount ?? 0) >= 20 || (extractionResult.affectedCount ?? 0) > 0, "AI extracts affected person count");

  // ─── Summary ────────────────────────────────────────────────
  console.log("\n" + "─".repeat(50));
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("─".repeat(50) + "\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
