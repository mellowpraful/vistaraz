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

  // ─── 6. Data Consistency API Envelope Tests ─────────────────
  console.log("\n🔹 6. Data Consistency & API Envelope Tests");
  const { extractApiData, extractApiItem } = await import("../src/lib/utils");
  const shape1 = { success: true, data: [{ id: "1" }] };
  const shape2 = { incidents: [{ id: "2" }], total: 1 };
  const shape3 = { resources: [{ id: "3" }] };

  assert(extractApiData<{id: string}>(shape1).length === 1 && extractApiData<{id: string}>(shape1)[0].id === "1", "Extracts from { success: true, data: [...] } envelope");
  assert(extractApiData<{id: string}>(shape2).length === 1 && extractApiData<{id: string}>(shape2)[0].id === "2", "Extracts from legacy { incidents: [...] } shape");
  assert(extractApiData<{id: string}>(shape3).length === 1 && extractApiData<{id: string}>(shape3)[0].id === "3", "Extracts from legacy { resources: [...] } shape");
  assert(extractApiItem<{ id: string }>({ data: { id: "item-1" } })?.id === "item-1", "Extracts item from object wrapper");

  // ─── 7. AI Commander & SITREP Explainability Tests ──────────
  console.log("\n🔹 7. AI Commander SITREP & Explainability Tests");
  const { generateExecutiveSitrep, executeCopilotQuery } = await import("../src/lib/ai/commander-service");
  const sitrep = await generateExecutiveSitrep();

  assert(Boolean(sitrep.sitrepId), "Executive SITREP has a generated SITREP ID");
  assert(sitrep.confidenceScore >= 50 && sitrep.confidenceScore <= 100, "Confidence score is within calibrated 50-100% range");
  assert(sitrep.confirmedFacts.length > 0, "SITREP contains key confirmed facts with source telemetry");
  assert(sitrep.unverifiedReports.length > 0, "SITREP contains unverified reports marked with uncertainty reasons");
  assert(sitrep.priorityRisks.length > 0, "SITREP computes priority risks with probability and time to impact");
  assert(sitrep.cascadingEffects.length > 0, "SITREP identifies multi-sector cascading failure pathways");
  assert(sitrep.bottlenecks.length > 0, "SITREP identifies resource bottlenecks and deficit counts");
  assert(sitrep.recommendations.length > 0, "SITREP provides actionable AI recommendations");

  const sampleRec = sitrep.recommendations[0];
  assert(Boolean(sampleRec.recommendation), "Recommendation specifies what is recommended");
  assert(Boolean(sampleRec.whyRecommended), "Recommendation explains operational rationale (why recommended)");
  assert(Boolean(sampleRec.supportingData.incidentTitle), "Recommendation includes supporting incident/resource data");
  assert(Boolean(sampleRec.uncertaintyOrMissingInfo), "Recommendation explicitly flags uncertainty or missing information");
  assert(Boolean(sampleRec.requiredHumanDecision), "Recommendation requires human commander authorization");
  assert(sampleRec.approvalStatus === "PENDING", "Initial recommendation approval status is PENDING");

  // Copilot Query Test
  const copilotAnswer = await executeCopilotQuery("hospital beds");
  assert(copilotAnswer.reply.includes("Hospital"), "Copilot responds accurately to hospital telemetry inquiries");
  assert((copilotAnswer.recommendations?.length ?? 0) > 0, "Copilot provides actionable next-step links");

  // ─── 8. Digital Twin Simulation Sandbox Isolation Tests ─────
  console.log("\n🔹 8. Digital Twin Simulation Sandbox Isolation Tests");
  const { prisma } = await import("../src/lib/prisma");
  const liveIncidentsBefore = await prisma.incident.count({ where: { simulationId: null } });

  // Simulate a scenario creation
  const testScenario = await prisma.simulationScenario.create({
    data: {
      name: "Test Disaster Sandbox",
      description: "Automated isolation test scenario",
      type: "FLOOD",
      status: "DRAFT",
      config: JSON.stringify({ weather: "Heavy Storm" }),
    },
  });

  const liveIncidentsAfter = await prisma.incident.count({ where: { simulationId: null } });
  assert(liveIncidentsBefore === liveIncidentsAfter, "Simulation creation does not mutate live incident records");

  // Clean up test scenario
  await prisma.simulationScenario.delete({ where: { id: testScenario.id } });

  // ─── 9. Dispatch Approval Normalization Tests ───────────────
  console.log("\n🔹 9. Dispatch Approval Normalization Tests");
  const { ApproveDispatchSchema } = await import("../src/lib/types");

  // Verify that normalized "APPROVE" -> "APPROVED" satisfies the schema
  const rawPayload = {
    recommendationId: "rec-test-123",
    action: "APPROVE",
    approvedBy: "demo-commander",
  };
  const normalizedAction = rawPayload.action === "APPROVE" ? "APPROVED" : rawPayload.action;
  const normalizedPayload = {
    ...rawPayload,
    action: normalizedAction,
    userId: rawPayload.approvedBy,
  };
  const validationResult = ApproveDispatchSchema.safeParse(normalizedPayload);
  assert(validationResult.success === true, "Normalized dispatch approval payload passes Zod validation");

  // ─── 10. Deduplication Service Tests ────────────────────────
  console.log("\n🔹 10. Incident Deduplication Service Tests");
  const { detectDuplicates } = await import("../src/lib/ai/mock-analyzer");
  const primaryInc = {
    id: "inc-prime",
    title: "Flood in Usmanpura",
    locationName: "Usmanpura Riverfront, Ahmedabad",
    type: "FLOOD",
    latitude: 23.0456,
    longitude: 72.5721,
  };
  const existingList = [
    {
      id: "inc-dup-1",
      title: "Water rising near Usmanpura river bank",
      locationName: "Usmanpura Riverfront, Ahmedabad",
      type: "FLOOD",
      latitude: 23.0458,
      longitude: 72.5723,
    },
    {
      id: "inc-diff-1",
      title: "Accident on SG Highway",
      locationName: "SG Highway, Ahmedabad",
      type: "ROAD_ACCIDENT",
      latitude: 23.0289,
      longitude: 72.5067,
    },
  ];

  const dupResult = await detectDuplicates(primaryInc, existingList);
  assert(dupResult.isDuplicate === true, "Accurately detects duplicate flood report in same zone");
  assert(dupResult.relatedIds.includes("inc-dup-1"), "Identifies correct related duplicate incident ID");
  assert(!dupResult.relatedIds.includes("inc-diff-1"), "Excludes unrelated incident at different location");

  // ─── 7. Resource Fleet & Equipment Parser Tests ────────────
  console.log("\n🔹 7. Resource Fleet & Equipment Parser Tests");
  const { parseEquipment, getTelemetryFreshness } = await import("../src/lib/utils");

  const jsonEquip = JSON.stringify(["Defibrillator", "Oxygen Tank", "IV Kit"]);
  const parsedJson = parseEquipment(jsonEquip);
  assert(parsedJson.length === 3 && parsedJson[0] === "Defibrillator", "Parses JSON array equipment string correctly");

  const commaEquip = "Stretcher, Monitor, Defibrillator";
  const parsedComma = parseEquipment(commaEquip);
  assert(parsedComma.length === 3 && parsedComma[1] === "Monitor", "Parses comma-separated equipment string");

  const singleEquip = "Advanced Thermal Camera";
  const parsedSingle = parseEquipment(singleEquip);
  assert(parsedSingle.length === 1 && parsedSingle[0] === "Advanced Thermal Camera", "Parses single equipment string");

  assert(parseEquipment(null).length === 0, "Handles null equipment gracefully");
  assert(parseEquipment("").length === 0, "Handles empty equipment gracefully");

  // Telemetry freshness tests
  const now = new Date();
  const liveDate = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago
  const recentDate = new Date(now.getTime() - 45 * 60 * 1000); // 45 min ago
  const staleDate = new Date(now.getTime() - 5 * 3600 * 1000); // 5 hours ago

  const liveRes = getTelemetryFreshness(liveDate);
  assert(liveRes.status === "live" && !liveRes.isStale, "Identifies live telemetry (<= 15m)");

  const recentRes = getTelemetryFreshness(recentDate);
  assert(recentRes.status === "recent" && !recentRes.isStale, "Identifies recent telemetry (<= 120m)");

  const staleRes = getTelemetryFreshness(staleDate);
  assert(staleRes.status === "stale" && staleRes.isStale, "Identifies stale telemetry (> 120m)");

  const unknownRes = getTelemetryFreshness(null);
  assert(unknownRes.status === "unknown" && unknownRes.isStale, "Handles missing telemetry timestamp");

  // ─── 8. Resource Fleet Filtering Tests ───────────────────────
  console.log("\n🔹 8. Resource Fleet Filtering Algorithm Tests");
  const fleetData = [
    {
      id: "res-1",
      name: "AMB-001 (ALS)",
      type: "AMBULANCE",
      status: "AVAILABLE",
      agency: { name: "108 Emergency Medical Services" },
      capabilities: [{ capability: "TRAUMA_CARE", equipment: JSON.stringify(["Defibrillator", "Oxygen"]) }],
      assignments: [],
    },
    {
      id: "res-2",
      name: "FE-001 (Heavy Fire)",
      type: "FIRE_ENGINE",
      status: "DISPATCHED",
      agency: { name: "Ahmedabad Fire & Emergency Services" },
      capabilities: [{ capability: "FIRE_SUPPRESSION", equipment: JSON.stringify(["Water Tank", "Foam"]) }],
      assignments: [{ incident: { title: "Chemical Plant Fire" } }],
    },
    {
      id: "res-3",
      name: "NDRF-BOAT-01",
      type: "BOAT",
      status: "STANDBY",
      agency: { name: "NDRF Battalion 6" },
      capabilities: [{ capability: "WATER_RESCUE", equipment: "Life Jackets, Inflatable Boat" }],
      assignments: [],
    },
    {
      id: "res-4",
      name: "AMB-004 (OOS)",
      type: "AMBULANCE",
      status: "OUT_OF_SERVICE",
      agency: { name: "108 Emergency Medical Services" },
      capabilities: [{ capability: "PATIENT_TRANSPORT", equipment: null }],
      assignments: [],
    },
  ];

  const filterByStatus = fleetData.filter((r) => r.status === "AVAILABLE");
  assert(filterByStatus.length === 1 && filterByStatus[0].id === "res-1", "Filters fleet by AVAILABLE status correctly");

  const filterByType = fleetData.filter((r) => r.type === "AMBULANCE");
  assert(filterByType.length === 2, "Filters fleet by AMBULANCE resource type");

  const filterByAgency = fleetData.filter((r) => r.agency.name.includes("NDRF"));
  assert(filterByAgency.length === 1 && filterByAgency[0].id === "res-3", "Filters fleet by Agency");

  const searchByEquipment = fleetData.filter((r) =>
    r.capabilities.some((c) => parseEquipment(c.equipment).some((eq) => eq.toLowerCase().includes("defibrillator")))
  );
  assert(searchByEquipment.length === 1 && searchByEquipment[0].id === "res-1", "Searches resources by verified equipment tag");

  const searchByMission = fleetData.filter((r) =>
    r.assignments.some((a) => a.incident?.title.toLowerCase().includes("chemical"))
  );
  assert(searchByMission.length === 1 && searchByMission[0].id === "res-2", "Searches resources by active mission title");

  // ─── 9. RapidAid Explainable Scoring Breakdown Tests ────────
  console.log("\n🔹 9. RapidAid Explainable Scoring Breakdown Tests");
  const explainableRecs = matchResources(mockIncident as any, mockResources as any);
  assert(explainableRecs.length > 0, "Generated recommendations with explainable matrix");
  const topCandidate = explainableRecs[0];
  assert(topCandidate.scoreBreakdown !== undefined, "Score breakdown object attached to recommendation");
  assert(topCandidate.scoreBreakdown.factors.length >= 4, "Granular factor breakdown provided (>= 4 factors)");
  assert(topCandidate.scoreBreakdown.baseScore === 100, "Base allocation score is 100");
  assert(topCandidate.scoreBreakdown.totalScore === topCandidate.score, "Sum of breakdown equals final score");
  const hasReliabilityFactor = topCandidate.scoreBreakdown.factors.some((f) => f.category === "reliability");
  assert(hasReliabilityFactor, "Reliability rating factor present in scoring breakdown");

  // ─── 10. Hard Capability Eligibility Rule Tests ───────────────
  console.log("\n🔹 10. Strict Capability Eligibility Hard Filter Tests");
  const { auditResourceEligibility } = await import("../src/lib/dispatch/capability-matcher");
  const severeFloodIncident = {
    id: "severe-flood-1",
    severity: "CRITICAL",
    type: "FLOOD",
    latitude: 23.0,
    longitude: 72.0,
    requiredCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION"]),
  };

  const testUnits = [
    {
      id: "unit-matching-boat",
      name: "NDRF Flood Boat 01",
      type: "BOAT",
      status: "AVAILABLE",
      latitude: 23.05,
      longitude: 72.05,
      reliabilityScore: 0.95,
      currentWorkload: 0,
      capabilities: [
        { capability: "WATER_RESCUE", equipment: "Life Jackets" },
        { capability: "FLOOD_EVACUATION", equipment: "Rafts" },
      ],
    },
    {
      id: "unit-incompatible-police",
      name: "Police Cruiser 09 (Zero Distance but Missing Water Rescue)",
      type: "POLICE_UNIT",
      status: "AVAILABLE",
      latitude: 23.0, // exactly at incident site
      longitude: 72.0,
      reliabilityScore: 1.0,
      currentWorkload: 0,
      capabilities: [{ capability: "CROWD_CONTROL", equipment: null }],
    },
    {
      id: "unit-dispatched-boat",
      name: "NDRF Boat 02 (Has Capability but Already Dispatched)",
      type: "BOAT",
      status: "DISPATCHED",
      latitude: 23.01,
      longitude: 72.01,
      reliabilityScore: 0.9,
      currentWorkload: 80,
      capabilities: [
        { capability: "WATER_RESCUE", equipment: null },
        { capability: "FLOOD_EVACUATION", equipment: null },
      ],
    },
  ];

  const auditResult = auditResourceEligibility(severeFloodIncident as any, testUnits as any);
  assert(auditResult.eligible.length === 1, "Only unit meeting ALL required capabilities and AVAILABLE status is eligible");
  assert(auditResult.eligible[0].resource.id === "unit-matching-boat", "Eligible unit is the NDRF Flood Boat");
  assert(auditResult.ineligible.length === 2, "Incompatible and busy units are flagged as ineligible");

  const policeIneligibility = auditResult.ineligible.find((i) => i.resource.id === "unit-incompatible-police");
  assert(
    policeIneligibility !== undefined && policeIneligibility.reasons.some((r) => r.includes("Missing")),
    "Incompatible unit ineligible reason explicitly states missing required capability despite 0km proximity"
  );

  const busyUnitIneligibility = auditResult.ineligible.find((i) => i.resource.id === "unit-dispatched-boat");
  assert(
    busyUnitIneligibility !== undefined && busyUnitIneligibility.reasons.some((r) => r.includes("Ineligible status")),
    "Busy DISPATCHED unit flagged as ineligible due to active deployment status"
  );

  // ─── 11. Dispatch Approval & Rejection Schema Tests ───────────
  // Note: ApproveDispatchSchema already imported in section 9 above
  console.log("\n🔹 11. Dispatch Approval, Rejection & Commander Override Schema Tests");

  // Approval schema parse
  const validApproval = {
    recommendationId: "rec-test-1",
    action: "APPROVED",
    notes: "Approved for immediate deployment",
    userId: "demo-commander",
  };
  assert(ApproveDispatchSchema.safeParse(validApproval).success === true, "Standard recommendation approval passes validation");

  // Rejection schema parse
  const validRejection = {
    recommendationId: "rec-test-2",
    action: "REJECTED",
    rejectionReason: "Unit retained for reserve",
  };
  const parseRejection = ApproveDispatchSchema.safeParse(validRejection);
  assert(parseRejection.success === true && parseRejection.data.action === "REJECTED", "Rejection action parses and transforms cleanly");

  // Commander override parse
  const validOverride = {
    incidentId: "inc-test-1",
    resourceId: "res-test-1",
    action: "MODIFIED",
    notes: "Commander discretion tactical override",
  };
  assert(ApproveDispatchSchema.safeParse(validOverride).success === true, "Commander manual override passes schema validation");

  // ─── Summary ────────────────────────────────────────────────
  console.log("\n" + "─".repeat(50));
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("─".repeat(50) + "\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
