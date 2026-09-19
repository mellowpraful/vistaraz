/**
 * CrisisOS — Seed Data
 * Realistic synthetic emergency data for demonstration.
 * All data is fictional and for demo purposes only.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CrisisOS database...");

  // ─── Cleanup ─────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.dispatchApproval.deleteMany();
  await prisma.dispatchRecommendation.deleteMany();
  await prisma.resourceAssignment.deleteMany();
  await prisma.incidentEvent.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.resourceCapability.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.simulationEvent.deleteMany();
  await prisma.simulationScenario.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // ─── Agencies ────────────────────────────────────────────────────
  const stateEmergency = await prisma.agency.create({
    data: { name: "Gujarat State Emergency Management Authority", type: "GOVERNMENT" },
  });
  const fireService = await prisma.agency.create({
    data: { name: "Ahmedabad Fire & Emergency Services", type: "FIRE" },
  });
  const medicalService = await prisma.agency.create({
    data: { name: "108 Emergency Medical Services", type: "MEDICAL" },
  });
  const policeService = await prisma.agency.create({
    data: { name: "Ahmedabad City Police", type: "POLICE" },
  });
  const rescueService = await prisma.agency.create({
    data: { name: "NDRF Battalion 6", type: "RESCUE" },
  });

  // ─── Users ───────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      id: "demo-admin",
      email: "admin@crisisos.gov.in",
      name: "Administrator",
      role: "ADMIN",
      agencyId: stateEmergency.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "demo-commander",
      email: "commander@crisisos.gov.in",
      name: "Cmdr. Rajesh Sharma",
      role: "COMMANDER",
      agencyId: stateEmergency.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "demo-operator",
      email: "operator@crisisos.gov.in",
      name: "Op. Priya Patel",
      role: "OPERATOR",
      agencyId: stateEmergency.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "demo-dispatcher",
      email: "dispatch@crisisos.gov.in",
      name: "Dispatcher Anil Kumar",
      role: "DISPATCHER",
      agencyId: stateEmergency.id,
    },
  });

  // ─── Resources ───────────────────────────────────────────────────
  const amb1 = await prisma.resource.create({
    data: {
      name: "AMB-001 (Advanced Life Support)",
      type: "AMBULANCE",
      status: "AVAILABLE",
      latitude: 23.0225,
      longitude: 72.5714,
      locationName: "Maninagar Station, Ahmedabad",
      agencyId: medicalService.id,
      reliabilityScore: 0.95,
      currentWorkload: 10,
      capabilities: {
        create: [
          { capability: "TRAUMA_CARE", equipment: JSON.stringify(["Defibrillator", "Oxygen", "IV Kit"]) },
          { capability: "PATIENT_TRANSPORT", equipment: JSON.stringify(["Stretcher", "Immobilization Board"]) },
          { capability: "ADVANCED_LIFE_SUPPORT", equipment: JSON.stringify(["Ventilator", "Monitor"]) },
        ],
      },
    },
  });

  const amb2 = await prisma.resource.create({
    data: {
      name: "AMB-002 (Basic Life Support)",
      type: "AMBULANCE",
      status: "AVAILABLE",
      latitude: 23.0096,
      longitude: 72.5040,
      locationName: "Satellite, Ahmedabad",
      agencyId: medicalService.id,
      reliabilityScore: 0.88,
      currentWorkload: 20,
      capabilities: {
        create: [
          { capability: "TRAUMA_CARE", equipment: JSON.stringify(["First Aid Kit", "Oxygen"]) },
          { capability: "PATIENT_TRANSPORT", equipment: JSON.stringify(["Stretcher"]) },
          { capability: "BASIC_LIFE_SUPPORT", equipment: JSON.stringify(["AED", "Oxygen"]) },
        ],
      },
    },
  });

  const amb3 = await prisma.resource.create({
    data: {
      name: "AMB-003 (Mobile ICU)",
      type: "AMBULANCE",
      status: "DISPATCHED",
      latitude: 23.0500,
      longitude: 72.6100,
      locationName: "Naroda, Ahmedabad",
      agencyId: medicalService.id,
      reliabilityScore: 0.97,
      currentWorkload: 80,
      capabilities: {
        create: [
          { capability: "TRAUMA_CARE", equipment: JSON.stringify(["Full ICU Equipment"]) },
          { capability: "ADVANCED_LIFE_SUPPORT", equipment: JSON.stringify(["Ventilator", "ECMO"]) },
          { capability: "PATIENT_TRANSPORT", equipment: JSON.stringify(["ICU Stretcher"]) },
        ],
      },
    },
  });

  const fire1 = await prisma.resource.create({
    data: {
      name: "FE-001 (Heavy Fire Engine)",
      type: "FIRE_ENGINE",
      status: "AVAILABLE",
      latitude: 22.9971,
      longitude: 72.5694,
      locationName: "Bapunagar Fire Station, Ahmedabad",
      agencyId: fireService.id,
      reliabilityScore: 0.92,
      currentWorkload: 0,
      capabilities: {
        create: [
          { capability: "FIRE_SUPPRESSION", equipment: JSON.stringify(["10,000L Water Tank", "Foam"]) },
          { capability: "RESCUE", equipment: JSON.stringify(["Hydraulic Cutters", "Spreaders"]) },
          { capability: "WATER_SUPPLY", equipment: JSON.stringify(["High-pressure Pump"]) },
        ],
      },
    },
  });

  const fire2 = await prisma.resource.create({
    data: {
      name: "FE-002 (Hazmat Unit)",
      type: "FIRE_ENGINE",
      status: "AVAILABLE",
      latitude: 22.9851,
      longitude: 72.5432,
      locationName: "GIDC Fire Station, Ahmedabad",
      agencyId: fireService.id,
      reliabilityScore: 0.90,
      currentWorkload: 15,
      capabilities: {
        create: [
          { capability: "FIRE_SUPPRESSION", equipment: JSON.stringify(["Foam System", "Dry Powder"]) },
          { capability: "HAZMAT_RESPONSE", equipment: JSON.stringify(["Protective Suits", "Chemical Detectors"]) },
          { capability: "WATER_SUPPLY", equipment: JSON.stringify(["8,000L Tank"]) },
        ],
      },
    },
  });

  const boat1 = await prisma.resource.create({
    data: {
      name: "BOAT-001 (NDRF Rescue Boat)",
      type: "BOAT",
      status: "AVAILABLE",
      latitude: 23.0300,
      longitude: 72.5800,
      locationName: "Sabarmati River Station, Ahmedabad",
      agencyId: rescueService.id,
      reliabilityScore: 0.94,
      currentWorkload: 0,
      capabilities: {
        create: [
          { capability: "WATER_RESCUE", equipment: JSON.stringify(["Life Jackets", "Rescue Ropes", "Inflatable Raft"]) },
          { capability: "FLOOD_EVACUATION", equipment: JSON.stringify(["Motor Boat", "Megaphone"]) },
          { capability: "SUPPLY_DELIVERY", equipment: JSON.stringify(["Storage Bay"]) },
        ],
      },
    },
  });

  const boat2 = await prisma.resource.create({
    data: {
      name: "BOAT-002 (State Flood Rescue)",
      type: "BOAT",
      status: "AVAILABLE",
      latitude: 23.0150,
      longitude: 72.5950,
      locationName: "Kankaria Lake Station",
      agencyId: rescueService.id,
      reliabilityScore: 0.87,
      currentWorkload: 5,
      capabilities: {
        create: [
          { capability: "WATER_RESCUE", equipment: JSON.stringify(["Life Jackets", "Throw Bags"]) },
          { capability: "FLOOD_EVACUATION", equipment: JSON.stringify(["Pontoon Boat"]) },
        ],
      },
    },
  });

  const rescue1 = await prisma.resource.create({
    data: {
      name: "NDRF-TEAM-01",
      type: "RESCUE_TEAM",
      status: "AVAILABLE",
      latitude: 23.0059,
      longitude: 72.6191,
      locationName: "NDRF Base Camp, Ahmedabad",
      agencyId: rescueService.id,
      reliabilityScore: 0.98,
      currentWorkload: 20,
      capabilities: {
        create: [
          { capability: "WATER_RESCUE", equipment: JSON.stringify(["Dive Gear", "Inflatable Boats"]) },
          { capability: "URBAN_RESCUE", equipment: JSON.stringify(["Cutting Tools", "USAR Equipment"]) },
          { capability: "ROPE_RESCUE", equipment: JSON.stringify(["Ropes", "Harnesses"]) },
          { capability: "FLOOD_EVACUATION", equipment: JSON.stringify(["Boats", "Life Jackets"]) },
        ],
      },
    },
  });

  const police1 = await prisma.resource.create({
    data: {
      name: "POLICE-UNIT-05",
      type: "POLICE_UNIT",
      status: "AVAILABLE",
      latitude: 23.0300,
      longitude: 72.5600,
      locationName: "Shahibaug Police Station",
      agencyId: policeService.id,
      reliabilityScore: 0.85,
      currentWorkload: 30,
      capabilities: {
        create: [
          { capability: "CROWD_CONTROL", equipment: JSON.stringify(["Barricades", "Megaphone"]) },
          { capability: "EVACUATION", equipment: JSON.stringify(["Police Van"]) },
          { capability: "TRAFFIC_MANAGEMENT", equipment: JSON.stringify(["Cones", "Radios"]) },
        ],
      },
    },
  });

  const hazmat1 = await prisma.resource.create({
    data: {
      name: "HAZMAT-01",
      type: "HAZMAT_UNIT",
      status: "STANDBY",
      latitude: 22.9800,
      longitude: 72.5500,
      locationName: "GIDC Industrial Zone Base",
      agencyId: fireService.id,
      reliabilityScore: 0.93,
      currentWorkload: 0,
      capabilities: {
        create: [
          { capability: "HAZMAT_RESPONSE", equipment: JSON.stringify(["Level A Suits", "Chemical Detectors"]) },
          { capability: "DECONTAMINATION", equipment: JSON.stringify(["Decon Shower", "Neutralizing Agents"]) },
          { capability: "CHEMICAL_DETECTION", equipment: JSON.stringify(["Multi-gas Detectors"]) },
        ],
      },
    },
  });

  const drone1 = await prisma.resource.create({
    data: {
      name: "DRONE-SURV-01",
      type: "DRONE",
      status: "AVAILABLE",
      latitude: 23.0200,
      longitude: 72.5700,
      locationName: "EOC Rooftop, Ahmedabad",
      agencyId: stateEmergency.id,
      reliabilityScore: 0.82,
      currentWorkload: 0,
      capabilities: {
        create: [
          { capability: "AERIAL_SURVEILLANCE", equipment: JSON.stringify(["4K Camera", "Thermal Imaging"]) },
          { capability: "SEARCH_ASSISTANCE", equipment: JSON.stringify(["Thermal Camera", "Spotlight"]) },
        ],
      },
    },
  });

  // Unavailable resource to test filtering
  const amb_oos = await prisma.resource.create({
    data: {
      name: "AMB-004 (Out of Service)",
      type: "AMBULANCE",
      status: "OUT_OF_SERVICE",
      latitude: 23.0400,
      longitude: 72.5400,
      locationName: "Maintenance Depot",
      agencyId: medicalService.id,
      reliabilityScore: 0.60,
      currentWorkload: 100,
      capabilities: {
        create: [
          { capability: "TRAUMA_CARE", equipment: null },
          { capability: "PATIENT_TRANSPORT", equipment: null },
        ],
      },
    },
  });

  // ─── Incidents ───────────────────────────────────────────────────
  const floodInc = await prisma.incident.create({
    data: {
      title: "Major Flood — Sector 7, Kankaria, Ahmedabad",
      description: "Severe flooding in residential area near Sabarmati riverbank. Water level risen 4 feet in last hour. Multiple families trapped. Road access blocked.",
      type: "FLOOD",
      severity: "CRITICAL",
      status: "VERIFIED",
      source: "EMERGENCY_CALL",
      locationName: "Sector 7, Kankaria, Ahmedabad",
      latitude: 23.0009,
      longitude: 72.6017,
      locationConfidence: 0.85,
      affectedCount: 200,
      injuryCount: 15,
      hazards: JSON.stringify(["Rising Water Levels", "Electrical Hazard", "Debris in Water"]),
      requiredCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION", "TRAUMA_CARE"]),
      language: "en",
      originalReport: "Caller reported massive flood in Sector 7, Kankaria area, near old bridge. ~200 families trapped, 15 injured. Water still rising. Electricity out.",
      aiExtracted: true,
      confidence: 0.82,
    },
  });

  await prisma.incidentReport.create({
    data: {
      incidentId: floodInc.id,
      reporterName: "Ramesh Patel",
      reporterPhone: "+91-98765-43210",
      rawText: "Sector 7 mein bahut bada flood aa gaya hai. 200 se zyada log fanse hain. Jaldi help bhejo.",
      language: "hi",
      channel: "CALL",
      transcript: "There's a massive flood here in Sector 7, near the Sabarmati riverbank. The water level has risen almost 4 feet in the last hour. We have around 200 families trapped here...",
    },
  });

  await prisma.incidentEvent.createMany({
    data: [
      { incidentId: floodInc.id, type: "CREATED", description: "Incident created from emergency call", userId: "demo-operator" },
      { incidentId: floodInc.id, type: "STATUS_CHANGE", description: "Status changed from REPORTED to VERIFIED — Field team confirmed flooding", userId: "demo-commander" },
      { incidentId: floodInc.id, type: "NOTE", description: "Water level still rising — reinforcement boats requested", userId: "demo-operator" },
    ],
  });

  const fireInc = await prisma.incident.create({
    data: {
      title: "Chemical Fire — GIDC Phase 2, Ahmedabad",
      description: "Large industrial fire with chemical tanks involved. Workers trapped inside. Hazmat risk identified.",
      type: "INDUSTRIAL",
      severity: "CRITICAL",
      status: "ASSIGNED",
      source: "EMERGENCY_CALL",
      locationName: "GIDC Phase 2, Plot 47, Ahmedabad",
      latitude: 22.9784,
      longitude: 72.5685,
      locationConfidence: 0.8,
      affectedCount: 40,
      injuryCount: 8,
      hazards: JSON.stringify(["Chemical Hazard", "Active Fire", "Explosion Risk", "Toxic Fumes"]),
      requiredCapabilities: JSON.stringify(["FIRE_SUPPRESSION", "HAZMAT_RESPONSE", "TRAUMA_CARE"]),
      language: "hi",
      originalReport: "GIDC Phase 2, Plot 47 chemical factory mein aag lag gayi. Chemical tanks hain. 30-40 workers andar hain.",
      aiExtracted: true,
      confidence: 0.78,
    },
  });

  await prisma.incidentEvent.createMany({
    data: [
      { incidentId: fireInc.id, type: "CREATED", description: "Incident created from Hinglish emergency call", userId: "demo-operator" },
      { incidentId: fireInc.id, type: "STATUS_CHANGE", description: "Status changed to VERIFIED — Fire confirmed by field unit", userId: "demo-commander" },
      { incidentId: fireInc.id, type: "RESOURCE_ASSIGNED", description: "FE-002 (Hazmat Unit) dispatched to scene", userId: "demo-dispatcher" },
      { incidentId: fireInc.id, type: "STATUS_CHANGE", description: "Status changed to ASSIGNED", userId: "demo-commander" },
    ],
  });

  const roadInc = await prisma.incident.create({
    data: {
      title: "Multi-Vehicle Accident — NH48, KM 45",
      description: "Truck and two cars collided. Multiple casualties. Road blocked in both directions.",
      type: "ROAD_ACCIDENT",
      severity: "HIGH",
      status: "IN_PROGRESS",
      source: "EMERGENCY_CALL",
      locationName: "Ahmedabad-Vadodara Expressway, KM 45",
      latitude: 22.7196,
      longitude: 72.8365,
      locationConfidence: 0.75,
      affectedCount: 10,
      injuryCount: 8,
      hazards: JSON.stringify(["Traffic Obstruction", "Fuel Leak Risk", "Debris on Road"]),
      requiredCapabilities: JSON.stringify(["TRAUMA_CARE", "PATIENT_TRANSPORT", "TRAFFIC_MANAGEMENT"]),
      language: "hi",
      originalReport: "NH48 highway par truck aur do gaadi ki takkar. 8 ghayal hain, 2 critical. Traffic jam ho gaya.",
      aiExtracted: true,
      confidence: 0.80,
    },
  });

  await prisma.incidentEvent.createMany({
    data: [
      { incidentId: roadInc.id, type: "CREATED", description: "Incident created from Hindi emergency call", userId: "demo-operator" },
      { incidentId: roadInc.id, type: "STATUS_CHANGE", description: "REPORTED → IN_PROGRESS", userId: "demo-commander" },
      { incidentId: roadInc.id, type: "RESOURCE_ASSIGNED", description: "AMB-001 and POLICE-UNIT-05 dispatched", userId: "demo-dispatcher" },
    ],
  });

  const floodInc2 = await prisma.incident.create({
    data: {
      title: "Flood Report — Riverfront Area (Possible Duplicate)",
      description: "Citizen report via app of flooding near riverfront. May be related to Sector 7 incident.",
      type: "FLOOD",
      severity: "HIGH",
      status: "REPORTED",
      source: "CITIZEN_REPORT",
      locationName: "Riverfront, Ahmedabad",
      latitude: 23.0070,
      longitude: 72.5950,
      locationConfidence: 0.5,
      affectedCount: 50,
      injuryCount: null,
      hazards: JSON.stringify(["Rising Water Levels"]),
      requiredCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION"]),
      language: "gu",
      originalReport: "Riverfront area maathi flood ni jaankari. Pani vadhi rahyu chhe.",
      aiExtracted: true,
      confidence: 0.65,
      duplicateOfId: floodInc.id,
    },
  });

  const medInc = await prisma.incident.create({
    data: {
      title: "Mass Casualty Event — Navrangpura",
      description: "Building partial collapse with multiple trapped persons. Medical emergency.",
      type: "BUILDING_COLLAPSE",
      severity: "CRITICAL",
      status: "REPORTED",
      source: "FIELD_TEAM",
      locationName: "Navrangpura, Ahmedabad",
      latitude: 23.0314,
      longitude: 72.5617,
      locationConfidence: 0.7,
      affectedCount: 25,
      injuryCount: 12,
      hazards: JSON.stringify(["Structural Instability", "Dust", "Gas Leak Risk"]),
      requiredCapabilities: JSON.stringify(["URBAN_RESCUE", "TRAUMA_CARE", "SEARCH_ASSISTANCE"]),
      language: "en",
      originalReport: "Field team reports partial collapse of 4-storey residential building. ~25 persons affected, 12 with injuries. Structural stability uncertain.",
      aiExtracted: false,
      confidence: 0.9,
    },
  });

  const resolvedInc = await prisma.incident.create({
    data: {
      title: "Minor Gas Leak — CG Road",
      description: "Residential gas leak reported and contained by fire unit.",
      type: "HAZMAT",
      severity: "MEDIUM",
      status: "RESOLVED",
      source: "CITIZEN_REPORT",
      locationName: "CG Road, Ahmedabad",
      latitude: 23.0258,
      longitude: 72.5517,
      locationConfidence: 0.9,
      affectedCount: 12,
      injuryCount: 0,
      hazards: JSON.stringify(["Gas Leak"]),
      requiredCapabilities: JSON.stringify(["HAZMAT_RESPONSE"]),
      language: "en",
      aiExtracted: false,
    },
  });

  await prisma.incidentEvent.createMany({
    data: [
      { incidentId: resolvedInc.id, type: "CREATED", description: "Reported via citizen app", userId: "demo-operator" },
      { incidentId: resolvedInc.id, type: "STATUS_CHANGE", description: "REPORTED → RESOLVED — Leak sealed by FE-001", userId: "demo-commander" },
    ],
  });

  // ─── Dispatch Recommendations ─────────────────────────────────────
  const rec1 = await prisma.dispatchRecommendation.create({
    data: {
      incidentId: floodInc.id,
      resourceId: boat1.id,
      rank: 1,
      score: 94.5,
      etaMinutes: 8,
      distanceKm: 3.2,
      matchedCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION"]),
      missingCapabilities: JSON.stringify([]),
      reasons: JSON.stringify([
        "Equipped with required capabilities: WATER_RESCUE, FLOOD_EVACUATION",
        "Currently available and ready to dispatch",
        "Located 3.2 km from the incident",
        "Estimated arrival: 8 minutes",
        "High reliability score: 94%",
        "Low current workload — full capacity available",
        "Prioritized for CRITICAL severity incident",
      ]),
      status: "PENDING",
    },
  });

  await prisma.dispatchRecommendation.create({
    data: {
      incidentId: floodInc.id,
      resourceId: rescue1.id,
      rank: 2,
      score: 88.0,
      etaMinutes: 12,
      distanceKm: 5.1,
      matchedCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION"]),
      missingCapabilities: JSON.stringify([]),
      reasons: JSON.stringify([
        "NDRF team with full water rescue capability",
        "Equipped with: WATER_RESCUE, URBAN_RESCUE, FLOOD_EVACUATION",
        "Located 5.1 km from the incident",
        "Estimated arrival: 12 minutes",
        "Highest reliability score: 98%",
      ]),
      status: "PENDING",
    },
  });

  await prisma.dispatchRecommendation.create({
    data: {
      incidentId: floodInc.id,
      resourceId: amb1.id,
      rank: 3,
      score: 72.0,
      etaMinutes: 15,
      distanceKm: 7.8,
      matchedCapabilities: JSON.stringify(["TRAUMA_CARE"]),
      missingCapabilities: JSON.stringify(["WATER_RESCUE", "FLOOD_EVACUATION"]),
      reasons: JSON.stringify([
        "Can provide TRAUMA_CARE for injured persons",
        "ALS-equipped ambulance for critical injuries",
        "Recommend staging at safe distance until water rescue clears zone",
      ]),
      constraints: JSON.stringify([
        "Missing capabilities: WATER_RESCUE, FLOOD_EVACUATION — requires supplementary water rescue resources",
        "Should not enter flood zone — stage at perimeter",
      ]),
      status: "PENDING",
    },
  });

  // ─── Resource Assignments ─────────────────────────────────────────
  await prisma.resourceAssignment.create({
    data: {
      resourceId: fire2.id,
      incidentId: fireInc.id,
      status: "ON_SCENE",
      assignedAt: new Date(Date.now() - 45 * 60 * 1000),
      arrivedAt: new Date(Date.now() - 38 * 60 * 1000),
    },
  });

  await prisma.resourceAssignment.create({
    data: {
      resourceId: amb1.id,
      incidentId: roadInc.id,
      status: "EN_ROUTE",
      assignedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  });

  // ─── Hospitals ───────────────────────────────────────────────────
  await prisma.hospital.createMany({
    data: [
      {
        name: "Civil Hospital Ahmedabad",
        latitude: 23.0458,
        longitude: 72.5873,
        address: "Asarwa, Ahmedabad",
        agencyId: medicalService.id,
        totalBeds: 1800,
        availableBeds: 250,
        icuBeds: 120,
        availableIcu: 18,
        status: "OPERATIONAL",
        specialties: JSON.stringify(["Trauma", "Burns", "General Surgery", "ICU"]),
      },
      {
        name: "VS Hospital",
        latitude: 23.0228,
        longitude: 72.5800,
        address: "Ellisbridge, Ahmedabad",
        agencyId: medicalService.id,
        totalBeds: 600,
        availableBeds: 85,
        icuBeds: 40,
        availableIcu: 5,
        status: "OPERATIONAL",
        specialties: JSON.stringify(["General Medicine", "Surgery", "Pediatrics"]),
      },
      {
        name: "L.G. Hospital",
        latitude: 23.0338,
        longitude: 72.5823,
        address: "Maninagar, Ahmedabad",
        agencyId: medicalService.id,
        totalBeds: 400,
        availableBeds: 30,
        icuBeds: 25,
        availableIcu: 2,
        status: "REDUCED",
        specialties: JSON.stringify(["General Medicine", "Emergency"]),
      },
      {
        name: "AIMS Hospital",
        latitude: 22.9984,
        longitude: 72.5001,
        address: "Satellite, Ahmedabad",
        totalBeds: 300,
        availableBeds: 60,
        icuBeds: 30,
        availableIcu: 8,
        status: "OPERATIONAL",
        specialties: JSON.stringify(["Multi-specialty", "Trauma", "Cardiac"]),
      },
    ],
  });

  // ─── Shelters ────────────────────────────────────────────────────
  await prisma.shelter.createMany({
    data: [
      {
        name: "Sabarmati Relief Camp A",
        latitude: 23.0650,
        longitude: 72.5800,
        address: "Sabarmati, Ahmedabad",
        agencyId: stateEmergency.id,
        capacity: 500,
        occupied: 180,
        status: "OPEN",
        amenities: JSON.stringify(["Food", "Water", "Medical Aid", "Toilets"]),
      },
      {
        name: "Kankaria Relief Centre",
        latitude: 23.0050,
        longitude: 72.6000,
        address: "Kankaria, Ahmedabad",
        agencyId: stateEmergency.id,
        capacity: 300,
        occupied: 295,
        status: "FULL",
        amenities: JSON.stringify(["Food", "Water", "Toilets"]),
      },
      {
        name: "GMDC Exhibition Centre",
        latitude: 23.0320,
        longitude: 72.5480,
        address: "Bodakdev, Ahmedabad",
        agencyId: stateEmergency.id,
        capacity: 1000,
        occupied: 120,
        status: "OPEN",
        amenities: JSON.stringify(["Food", "Water", "Medical Aid", "Toilets", "Blankets", "Counselling"]),
      },
    ],
  });

  // ─── Simulation Scenario ─────────────────────────────────────────
  const simScenario = await prisma.simulationScenario.create({
    data: {
      name: "Flood Escalation — Sabarmati Overflow",
      description: "Simulated scenario: Monsoon causes Sabarmati to overflow, leading to cascading flooding across 5 wards, hospital capacity stress, and resource shortage.",
      type: "FLOOD",
      status: "DRAFT",
      config: JSON.stringify({
        startLocation: { lat: 23.02, lng: 72.58 },
        durationHours: 12,
        escalationSteps: 5,
        affectedWards: ["Sector 7", "Kankaria", "Behrampura", "Vatva", "Narol"],
        weatherCondition: "Heavy Monsoon",
        hospitalCapacityReduction: 0.4,
        roadBlockages: ["NH48 KM 32", "Kankaria Bypass", "Ring Road Junction 7"],
      }),
    },
  });

  await prisma.simulationEvent.createMany({
    data: [
      {
        scenarioId: simScenario.id,
        timeOffset: 0,
        type: "FLOOD_START",
        description: "Sabarmati water level crosses danger mark — 15.5m at Sardar Bridge",
        data: JSON.stringify({ waterLevel: 15.5, dangerMark: 14.0 }),
      },
      {
        scenarioId: simScenario.id,
        timeOffset: 1800,
        type: "AREA_INUNDATED",
        description: "Sector 7 and Kankaria areas begin flooding — evacuation initiated",
        data: JSON.stringify({ affectedAreas: ["Sector 7", "Kankaria"], evacuees: 500 }),
      },
      {
        scenarioId: simScenario.id,
        timeOffset: 3600,
        type: "RESOURCE_SHORTAGE",
        description: "All available boats deployed — additional 3 boats required",
        data: JSON.stringify({ requiredBoats: 8, availableBoats: 5, shortfall: 3 }),
      },
      {
        scenarioId: simScenario.id,
        timeOffset: 7200,
        type: "HOSPITAL_STRESS",
        description: "Civil Hospital at 85% capacity — overflow to VS Hospital initiated",
        data: JSON.stringify({ civilHospitalCapacity: 85, vsHospitalCapacity: 60 }),
      },
      {
        scenarioId: simScenario.id,
        timeOffset: 10800,
        type: "ROAD_BLOCKAGE",
        description: "NH48 and Ring Road blocked — rerouting emergency vehicles via SG Highway",
        data: JSON.stringify({ blockedRoads: ["NH48 KM 32", "Ring Road Junction 7"] }),
      },
    ],
  });

  // ─── AI Recommendations ───────────────────────────────────────────
  await prisma.aIRecommendation.createMany({
    data: [
      {
        type: "SITUATION_SUMMARY",
        content: "⚠️ CRITICAL: 2 critical incidents active simultaneously — flood (200+ affected) and industrial fire with chemical hazard. 3 additional incidents require monitoring. Resource pressure is HIGH.",
        confidence: 0.88,
        reasoning: "Based on severity distribution and active incident count",
        reviewed: false,
      },
      {
        type: "RESOURCE_SHORTAGE",
        content: "Water rescue resources are critically low. Only 2 boats and 1 rescue team available for 2 flood-affected areas. Recommend activating SDRF reserve units and requesting mutual aid from Gandhinagar district.",
        confidence: 0.85,
        reasoning: "2 available boats vs estimated need of 5 for current flood scale",
        reviewed: false,
      },
      {
        type: "PRIORITY",
        content: "Prioritize Sector 7 flood rescue over Riverfront report (possible duplicate). Deploy BOAT-001 and NDRF-TEAM-01 immediately. Stage AMB-001 at Kankaria perimeter.",
        confidence: 0.82,
        reasoning: "Sector 7 has higher affected count, confirmed location, and CRITICAL severity",
        reviewed: false,
      },
    ],
  });

  // ─── Audit Logs ───────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: "demo-operator",
        action: "INCIDENT_CREATED",
        entity: "Incident",
        entityId: floodInc.id,
        after: JSON.stringify({ title: floodInc.title, severity: "CRITICAL", status: "REPORTED" }),
        metadata: JSON.stringify({ source: "EMERGENCY_CALL", channel: "PHONE" }),
      },
      {
        userId: "demo-commander",
        action: "STATUS_CHANGED",
        entity: "Incident",
        entityId: floodInc.id,
        before: JSON.stringify({ status: "REPORTED" }),
        after: JSON.stringify({ status: "VERIFIED" }),
        metadata: JSON.stringify({ notes: "Field team confirmed flooding on ground" }),
      },
      {
        userId: "demo-dispatcher",
        action: "DISPATCH_RECOMMENDED",
        entity: "DispatchRecommendation",
        entityId: rec1.id,
        after: JSON.stringify({ resourceId: boat1.id, rank: 1, score: 94.5 }),
        metadata: JSON.stringify({ algorithm: "capability-matcher-v1" }),
      },
      {
        userId: "demo-dispatcher",
        action: "INCIDENT_CREATED",
        entity: "Incident",
        entityId: fireInc.id,
        after: JSON.stringify({ title: fireInc.title, severity: "CRITICAL" }),
      },
      {
        userId: "demo-commander",
        action: "RESOURCE_DISPATCHED",
        entity: "Resource",
        entityId: fire2.id,
        before: JSON.stringify({ status: "AVAILABLE" }),
        after: JSON.stringify({ status: "ON_SCENE" }),
        metadata: JSON.stringify({ incidentId: fireInc.id }),
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${await prisma.agency.count()} agencies`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.resource.count()} resources`);
  console.log(`   - ${await prisma.incident.count()} incidents`);
  console.log(`   - ${await prisma.hospital.count()} hospitals`);
  console.log(`   - ${await prisma.shelter.count()} shelters`);
  console.log(`   - ${await prisma.dispatchRecommendation.count()} dispatch recommendations`);
  console.log(`   - ${await prisma.simulationScenario.count()} simulation scenarios`);
  console.log(`   - ${await prisma.auditLog.count()} audit log entries`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
