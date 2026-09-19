# CrisisOS — VoiceDispatch 911 Audio & Multilingual Pipeline

This document details the audio processing pipeline, speech-to-text integration, multilingual transcription, and automated entity extraction implemented in VoiceDispatch (`/voicedispatch`).

---

## 1. Audio Processing Pipeline Overview

```
[ Incoming 911 / Citizen Voice Call ]
                 │
                 ▼
[ Audio Frequency Waveform Visualizer (OPUS 48kHz) ]
                 │
                 ▼
[ Multilingual Speech-to-Text Streaming Engine (en / hi / gu) ]
                 │
                 ▼
[ Real-Time LLM Emergency Entity Extractor ]
  ├── Categorizes Incident Type (FLOOD, HAZMAT, ROAD_ACCIDENT, etc.)
  ├── Assigns Severity Level (CRITICAL, HIGH, MEDIUM)
  ├── Geocodes Landmark & Lat/Lng Coordinates
  ├── Counts Affected Persons & Trapped Victims
  ├── Flags Scene Hazards (Gas leak, Electrical, Structural)
  └── Identifies Required Capabilities (Boats, ALS Ambulances, Hazmat Suits)
                 │
                 ▼
[ Instant 1-Click Triage & Dispatch Handoff ]
```

---

## 2. Multilingual Support

The engine includes pre-calibrated transcription models for:
- **English (`en-IN` / `en-US`):** Standard dispatch terminology.
- **Hindi (`hi-IN`):** Regional emergency vocabulary.
- **Gujarati (`gu-IN`):** Local disaster idioms and landmark references.
