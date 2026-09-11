# JalMitra / JalSetu (जलमित्र / जलसेतु)
> **Autonomous Water-Sharing Dispute Mediation Agent & Digital Irrigation Governance Platform**  
> *Fair Water, Zero Dispute, Prosperous Harvest (न्यायपूर्ण जल, विवाद-मुक्त शेती)*

---

## 📌 Project Overview
Canal irrigation distribution in India is often plagued by intense farmer disputes, head-to-tail reach inequities, daytime sunlight competition, and upstream unauthorized siphoning. 

**JalMitra (जलमित्र)** is an end-to-end, dual-portal autonomous mediation platform that combines **10 specialized AI agents**, a **Universal 8-Rule Statutory Compliance Matrix**, **CADA Cadastral & Geodesic GIS matching**, and a **game-theoretic multi-user water allocation engine**.

It operates across both the **Farmer Experience** (simple, clean, voice & written grievance submission, hydraulic flow tracking) and the **Department Authority Portal** (Command Center, Water Intelligence, Live 4-Stage Mediation Room, and SDO Ratification).

---

## 🏛️ Dual-Portal Architecture

### 🌾 1. Farmer Portal (शेतकरी पोर्टल)
* **Clean Authentication**: Strict mobile number and PIN login; pre-seeded and dynamically registered farmers.
* **My Farm (माझे शेत)**: Real-time Cadastral & Hydraulic Delivery Route Visualizer (4-step flow pathway from Dam to Canal to Turnout Gate to Furrow Plot Gat No.).
* **Request Water & AI Calculator**: Dual hours $\leftrightarrow$ liters converter with immediate fair allocation recommendation.
* **Submit Grievance (Voice & Written)**:
  - Speak in Marathi, Hindi, or English or type complaint.
  - Background AI verifies grievance against the Universal 8-Rule Matrix without cluttering the farmer's interface.
* **Transparency**: View rotational schedule, assigned daylight/evening delivery slots, and official Water Turn Passes (*वारबंदी पास*).

### 🏛️ 2. Water Resources Department Authority Portal (अधिकारी पोर्टल)
* **Unified Officer Gateway**: SDO / Executive Engineer credentials with statutory role protection.
* **Command Center**: Real-time canal discharge, reservoir storage, active contention flags, and live vigilance alerts.
* **Water Intelligence & Complaint Intelligence**: Plain-language grievance diagnosis, with collapsible AI technical math & proofs for executive audits.
* **4-Stage Live Mediation Center**:
  1. *Stage 1*: Competing Demands & Hydraulic Deficit Detection.
  2. *Stage 2*: Initial Rotational Proposal.
  3. *Stage 3*: Contextual Farmer Objections & Concessions.
  4. *Stage 4*: Consensus Accord, Decision Explanation, and Official Water Sharing Agreement (*#AGR-2026-WUA-089*).
* **Cadastral Proximity & Sluice Gate Registry**:
  - Global reach distribution (Head 0-2km, Middle 2-5.5km, Tail 5.5-8.5km).
  - Quick Canal & Gate Lookup tool for any village or GPS coordinate.
  - Dynamic table showing every farmer's serving canal, nearest gate, lateral distance, and transit ETA.

---

## 🧠 Core Technologies & Algorithms

### 1. 10-Agent Autonomous Mediation Pipeline
* **Agent 1: Ingestion & Telemetry Agent**: Parses canal headworks, gates, and crop stages.
* **Agent 2: Agronomic Water Demand Agent**: Computes crop physiological water needs (FAO-56 Penman-Monteith).
* **Agent 3: Hydraulic & Conveyance Loss Agent**: Calculates friction loss ($1.5\%/\text{km}$) and transit lead time.
* **Agent 4: Warabandi Rotational Scheduler**: Generates non-overlapping delivery time windows.
* **Agent 5: Grievance Verification Agent**: Evaluates the Universal 8-Rule Matrix.
* **Agent 6: Farmer Persona & Objection Agent**: Models real-world stakeholder concerns.
* **Agent 7: Dispute Mediation & Consensus Agent**: Solves game-theoretic multi-user sharing under deficit.
* **Agent 8: Decision Explanation (XAI) Agent**: Produces 3-pillar plain-language rationale.
* **Agent 9: Digital Accord & Tamper-Proof Audit Agent**: Generates cryptographic SHA-256 consensus hashes.
* **Agent 10: Multi-Channel Broadcast Agent**: Formats SMS and notification passes for farmers.

### 2. Universal 8-Rule Matrix
1. **Rule 1**: Requested Allocation $\le$ Entitlement Quota.
2. **Rule 2**: Total Release $\le$ Available Canal Head Storage.
3. **Rule 3**: Critical Growth Stage Priority Boost ($+30$ points).
4. **Rule 4**: Rotational Fairness & Previous Shortfall Compensation ($+25$ points).
5. **Rule 5**: Mandatory Downstream Tail-End Buffer Reserve Protection.
6. **Rule 6**: Duplicate & Fraudulent Ticket Suppression.
7. **Rule 7**: Agronomic Evapotranspiration Crop Need Verification.
8. **Rule 8**: Statutory Sub-Divisional Officer (SDO) Final Ratification.

### 3. Pan-India & Multi-State GIS Extensibility
Built with Haversine Geodesic Distance matching ($R = 6371\text{ km}$):
* **Maharashtra (Western)**: Veer Dam & Nira Canals (`NLB-04`, `NRB-01`), Khadakwasla (`KRB-02`), Kukadi (`KUK-01`).
* **Maharashtra (Vidarbha / Nagpur)**: Totladoh Dam / Pench Left Bank Canal (`PEN-01`), Gosikhurd Wainganga Canal (`GOS-01`), with Nagpur Mandarin Orange (*संत्रा*) crop model (Sensitivity: 9.8).
* **Gujarat**: Sardar Sarovar Narmada Main Canal (`SSN-01`).
* **Punjab / Haryana**: Bhakra Main Line Canal (`BML-01`).
* **Karnataka**: Upper Krishna Project / Almatti Dam (`UKP-01`).

### 4. Data Persistence
* **Disk Database**: `data/database.json` (auto-persisted by backend REST API).
* **Browser Storage**: `localStorage` mirrored for instant offline resilience.

---

## 🚀 How to Run Locally

### Option A: Direct Browser (Zero Setup)
Simply open `index.html` in Google Chrome, Microsoft Edge, or Firefox.

### Option B: Node.js Backend Server
```bash
# 1. Install dependencies (if any) or run directly:
node server.js
# or with agy-node:
agy-node server.js

# 2. Open browser:
http://localhost:3000
```

---

## 🧪 Automated Verification Suite
Run the full 13-suite automated test suite:
```bash
agy-node scratch/test_verify.js
```
*Passed 100% across all 13 suites (including strict auth, 10 agents, 8 rules, REST APIs, disk persistence, and GIS detection).*

---

## 📁 Project Structure
```
jalsetu-water-mediation/
├── index.html              # Complete responsive Single-Page Application (Farmer & Authority)
├── server.js               # Node.js REST API server & database persistence engine
├── package.json            # Project manifest
├── README.md               # Complete documentation
├── css/
│   └── styles.css          # Custom styling, animations, print styles
├── data/
│   └── database.json       # Persistent JSON database on disk (Farmers, Requests, Accords)
└── js/
    ├── app.js              # Frontend controller, dual-portal navigation, UI event handlers
    ├── data.js             # GIS canal network, crop knowledge base, initial data models
    └── engine.js           # 10-Agent orchestrator, 8-rule matrix, Haversine GIS matching
```

---

## 📦 How to Push to GitHub

```bash
# 1. Initialize git repository in this folder
git init

# 2. Add all files
git add .

# 3. Commit your changes
git commit -m "Initial commit: JalMitra Autonomous Water Mediation Platform"

# 4. Set main branch and link remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to GitHub
git push -u origin main
```
