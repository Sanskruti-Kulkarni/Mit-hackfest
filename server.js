const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

let JALSETU_DATA = {};
try {
  JALSETU_DATA = require('./js/data.js');
} catch (e) {
  console.warn('Notice: JALSETU_DATA loaded from memory fallback');
}

let TenAgentOrchestrator = null;
try {
  const engineModule = require('./js/engine.js');
  TenAgentOrchestrator = engineModule.TenAgentOrchestrator;
} catch (e) {
  console.warn('Notice: TenAgentOrchestrator loaded fallback in server.js');
}

// Persistent Disk Database for Farmer & Authority Backend
const DB_FILE = path.join(__dirname, 'data', 'database.json');

let backendDB = {
  registeredFarmers: [
    { name: "Ramesh Patil (रमेश पाटील)", phone: "9822012345", pin: "1234", farmerId: "MH-PUN-WUA-1092", gate: "Gate-03", acreage: 4.0, crop: "Cotton" },
    { name: "Dnyaneshwar Jagtap (ज्ञानेश्वर जगताप)", phone: "9822014890", pin: "2345", farmerId: "MH-PUN-WUA-0841", gate: "Gate-01", acreage: 5.5, crop: "Sugarcane" },
    { name: "Santosh Jadhav (संतोष जाधव)", phone: "9876543210", pin: "4321", farmerId: "MH-PUN-WUA-1420", gate: "Gate-02", acreage: 3.5, crop: "Soybean" },
    { name: "Balasaheb Shinde (बाळासाहेब शिंदे)", phone: "9765233109", pin: "5678", farmerId: "MH-PUN-WUA-2045", gate: "Gate-06", acreage: 3.0, crop: "Mixed Vegetables" }
  ],
  requests: Array.isArray(JALSETU_DATA.initialRequests) ? JSON.parse(JSON.stringify(JALSETU_DATA.initialRequests)) : [],
  complaints: Array.isArray(JALSETU_DATA.initialComplaints) ? JSON.parse(JSON.stringify(JALSETU_DATA.initialComplaints)) : [],
  notifications: Array.isArray(JALSETU_DATA.initialNotifications) ? JSON.parse(JSON.stringify(JALSETU_DATA.initialNotifications)) : [],
  mediationAccords: [],
  auditLog: []
};

function loadDatabaseFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.requests) && data.requests.length > 0) backendDB.requests = data.requests;
      if (Array.isArray(data.complaints) && data.complaints.length > 0) backendDB.complaints = data.complaints;
      if (Array.isArray(data.registeredFarmers) && data.registeredFarmers.length > 0) backendDB.registeredFarmers = data.registeredFarmers;
      if (Array.isArray(data.mediationAccords)) backendDB.mediationAccords = data.mediationAccords;
      if (Array.isArray(data.auditLog)) backendDB.auditLog = data.auditLog;
      console.log(`💾 Loaded persistent database from ${DB_FILE}: ${backendDB.requests.length} requests, ${backendDB.complaints.length} complaints, ${backendDB.registeredFarmers.length} farmers`);
    } else {
      saveDatabaseToDisk();
    }
  } catch (err) {
    console.warn('⚠️ Notice: Loading database from disk fallback:', err.message);
  }
}

function saveDatabaseToDisk() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const payload = {
      metadata: {
        system: "JalMitra Water Governance & Mediation Platform",
        version: "2.5.0",
        filePath: "data/database.json",
        storageType: "Persistent File-Backed JSON Storage",
        lastSaved: new Date().toISOString(),
        canalNetwork: "Nira Left Bank Sub-Canal Branch 4 (NLB-04)"
      },
      registeredFarmers: backendDB.registeredFarmers || [],
      requests: backendDB.requests || [],
      complaints: backendDB.complaints || [],
      mediationAccords: backendDB.mediationAccords || [],
      auditLog: backendDB.auditLog || []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`💾 Saved persistent database to ${DB_FILE}`);
  } catch (err) {
    console.error('❌ Failed to save database to disk:', err.message);
  }
}

// Initialize database from disk
loadDatabaseFromDisk();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function parseJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err, {});
    }
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS Pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const reqPath = parsedUrl.pathname;

  // ==========================================
  // FARMER BACKEND REST API ENDPOINTS
  // ==========================================

  // 1. Calculate Water & AI Feasibility Assessment
  if (req.method === 'POST' && reqPath === '/api/farmer/calculate-water') {
    parseJsonBody(req, (err, payload) => {
      let hours = parseFloat(payload.hours);
      let liters = parseInt(payload.waterQuantityLiters, 10);
      const acres = parseFloat(payload.acres) || 4.0;
      const cropKey = (payload.cropKey || 'cotton').toLowerCase();
      const cropStage = payload.cropStage || 'Peak Flowering & Boll Formation';

      // Conversion rule: 1 Hour of farm sluice turnout flow = 30,000 Liters
      const LITERS_PER_HOUR = 30000;

      if (!hours && liters) {
        hours = Math.round((liters / LITERS_PER_HOUR) * 10) / 10;
      } else if (hours && !liters) {
        liters = Math.round(hours * LITERS_PER_HOUR);
      } else if (!hours && !liters) {
        hours = 4.0;
        liters = 120000;
      }

      // Crop-specific agronomic single-turn optimal requirement
      const cropDemandMap = {
        cotton: 3.0,      // 3.0 Hours (90,000 L)
        sugarcane: 5.0,   // 5.0 Hours (150,000 L)
        soybean: 2.5,     // 2.5 Hours (75,000 L)
        wheat: 3.0,       // 3.0 Hours (90,000 L)
        vegetables: 2.0,  // 2.0 Hours (60,000 L)
        onion: 2.0        // 2.0 Hours (60,000 L)
      };

      const optimalHours = cropDemandMap[cropKey] || 3.0;
      const optimalLiters = optimalHours * LITERS_PER_HOUR;

      let providedHours = hours;
      let providedLiters = liters;
      let percentage = 100;
      let status = "AI_FEASIBLE_100";
      let statusText = "100% Full Allocation Feasible";
      let deferredHours = 0;
      let deferredLiters = 0;
      let aiExplanation = "";

      if (hours <= optimalHours) {
        providedHours = hours;
        providedLiters = Math.round(hours * LITERS_PER_HOUR);
        percentage = 100;
        status = "AI_FEASIBLE_100";
        statusText = "100% Full Allocation Feasible";
        aiExplanation = `AI Water Intelligence Agent: Requested demand of ${hours.toFixed(1)} Hours (${providedLiters.toLocaleString()} Liters) matches optimal agronomic evapotranspiration for ${acres} acres of ${cropKey}. Canal branch discharge is 25.0 Cusecs with a 45.0 Cusec-hour reserve. 100% volume is safely deliverable without downstream deficit. Recommended for SDO approval.`;
      } else {
        providedHours = optimalHours;
        providedLiters = optimalLiters;
        percentage = Math.round((providedHours / hours) * 100);
        deferredHours = Math.round((hours - providedHours) * 10) / 10;
        deferredLiters = Math.round(deferredHours * LITERS_PER_HOUR);
        status = "AI_RECOMMENDED_PARTIAL";
        statusText = `${percentage}% Fair Allocation Recommended`;
        aiExplanation = `AI Water Intelligence & Agronomic Agent: You requested ${hours.toFixed(1)} Hours (${liters.toLocaleString()} Liters). Based on 25.0 Cusecs branch discharge and ${cropKey} at ${cropStage}, providing ${providedHours.toFixed(1)} Hours (${providedLiters.toLocaleString()} Liters) delivers 92% of critical root moisture needs. Releasing the full ${hours.toFixed(1)}h would cause surface waterlogging and deprive downstream tail-end farmers. AI recommends granting ${providedHours.toFixed(1)} Hours (${percentage}%), deferring ${deferredHours.toFixed(1)} Hours to the Sept 18 rotation cycle.`;
      }

      sendJson(res, 200, {
        success: true,
        requestedHours: hours,
        requestedLiters: liters,
        providedHours: providedHours,
        providedLiters: providedLiters,
        percentageProvided: percentage,
        status: status,
        statusText: statusText,
        canalDischarge: 25.0,
        canalBufferCusecHours: 45.0,
        aiExplanation: aiExplanation,
        nextShiftDeferred: deferredHours > 0 ? `${deferredHours.toFixed(1)}h (${deferredLiters.toLocaleString()} L) on Sept 18` : null
      });
    });
    return;
  }

  // 2. Submit Water Request
  if (req.method === 'POST' && reqPath === '/api/farmer/request-water') {
    parseJsonBody(req, (err, payload) => {
      const hours = parseFloat(payload.hours) || 4.0;
      const quantityLiters = parseInt(payload.quantityLiters, 10) || Math.round(hours * 30000);
      const providedHours = parseFloat(payload.providedHours) || Math.min(hours, 3.0);
      const providedLiters = parseInt(payload.providedLiters, 10) || Math.round(providedHours * 30000);
      const preferredWindow = payload.preferredWindow || "06:00 - 14:00 (Daylight Morning)";
      const cropStage = payload.cropStage || "Cotton (Peak Flowering)";
      const urgency = payload.urgency || "HIGH";
      const reason = payload.reason || "Agronomic moisture stress mitigation";

      const ticketId = 'REQ-2026-' + (100 + backendDB.requests.length + 1);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const newReq = {
        ticketId: ticketId,
        date: dateStr,
        requestedHours: hours,
        quantityLiters: quantityLiters,
        providedHours: providedHours,
        providedLiters: providedLiters,
        allocatedHours: providedHours,
        preferredWindow: preferredWindow,
        scheduledSlot: "06:00 - 10:00 (Next Turn)",
        crop: cropStage,
        urgency: urgency,
        reason: reason,
        status: "APPROVED_SCHEDULED",
        aiExplanation: payload.aiExplanation || `JalMitra AI evaluated request against 25 Cusecs flow and allocated ${providedHours.toFixed(1)} Hours (${providedLiters.toLocaleString()} L).`,
        timeline: [
          { time: "Just now", event: "Demand Submitted via Farmer Portal" },
          { time: "Automated", event: `AI Water Intelligence calculated ${providedHours.toFixed(1)}h (${providedLiters.toLocaleString()} L) feasibility` },
          { time: "Autonomous", event: "SDO Executive Clearance Pending (AI recommends. Humans govern.)" }
        ]
      };

      backendDB.requests.unshift(newReq);
      saveDatabaseToDisk();
      sendJson(res, 201, { success: true, ticketId: ticketId, request: newReq });
    });
    return;
  }

  // 3. Get Farmer Requests
  if (req.method === 'GET' && reqPath === '/api/farmer/requests') {
    sendJson(res, 200, { success: true, requests: backendDB.requests });
    return;
  }

  // 4. Submit & Query Complaints
  if (req.method === 'GET' && reqPath === '/api/farmer/complaints') {
    sendJson(res, 200, { success: true, complaints: backendDB.complaints });
    return;
  }

  if (req.method === 'POST' && reqPath === '/api/farmer/complaints') {
    parseJsonBody(req, (err, payload) => {
      payload = payload || {};
      const ticketId = payload.ticketId || ('CMP-2026-' + (200 + backendDB.complaints.length + 1));
      let rules = payload.rules;
      let multiUser = payload.multiUserComparison;

      if ((!rules || !multiUser) && TenAgentOrchestrator) {
        try {
          const orch = new TenAgentOrchestrator(JALSETU_DATA);
          const evalRes = orch.evaluateUniversal8RuleMatrix({
            text: payload.description || payload.text || "",
            complaintType: (payload.category && payload.category.includes('Theft')) ? 'UNAUTHORIZED_SIPHON_THEFT' : 'WATER_DEFICIT_STRESS',
            farmer: payload.farmer || { name: "Ramesh Patil", landAcreage: 4.0, cropKey: "cotton", cropName: "Cotton (कापूस)", cropStage: "Peak Flowering", gateId: payload.gate || "Gate-03", previousShortfallLiters: 15000 },
            requestedLiters: payload.requestedLiters || 70000,
            requestedHours: payload.requestedHours || 7.0
          });
          rules = rules || evalRes.rules;
          multiUser = multiUser || evalRes.multiUserComparison;
        } catch (e) {
          console.warn("Notice: 8-rule evaluation in server.js:", e.message);
        }
      }

      const newCmp = {
        ticketId: ticketId,
        date: new Date().toISOString().split('T')[0],
        category: payload.category || "Low Canal Head Pressure [8-Rule Redressal]",
        description: payload.description || payload.text || "Water flow irregularity reported",
        gate: payload.gate || "Gate-03",
        status: "UNDER_INVESTIGATION",
        slaRemainingHours: 24,
        rules: rules || [],
        multiUserComparison: multiUser || null
      };
      backendDB.complaints.unshift(newCmp);
      saveDatabaseToDisk();
      sendJson(res, 201, { success: true, ticketId: ticketId, complaint: newCmp, rules: rules, multiUserComparison: multiUser });
    });
    return;
  }

  // 4b. Database Status & Storage Persistence Info
  if (req.method === 'GET' && reqPath === '/api/database/status') {
    sendJson(res, 200, {
      success: true,
      filePath: "data/database.json",
      storageType: "Persistent File-Backed JSON Storage",
      lastSaved: new Date().toISOString(),
      requestsCount: (backendDB.requests || []).length,
      complaintsCount: (backendDB.complaints || []).length,
      registeredFarmersCount: (backendDB.registeredFarmers || []).length,
      accordsCount: (backendDB.mediationAccords || []).length,
      auditLogCount: (backendDB.auditLog || []).length
    });
    return;
  }

  // 4c. Live Mediation Pool (Aggregated Live Demands & Complaints)
  if (req.method === 'GET' && reqPath === '/api/mediation/live-pool') {
    sendJson(res, 200, {
      success: true,
      canal: "Nira Left Bank Sub-Canal Branch 4 (NLB-04)",
      availableWaterLiters: 150000,
      canalDischargeCusecs: 25.0,
      requests: backendDB.requests || [],
      complaints: backendDB.complaints || []
    });
    return;
  }

  // 4d. SDO Ratify Live Mediation Accord
  if (req.method === 'POST' && reqPath === '/api/mediation/ratify') {
    parseJsonBody(req, (err, payload) => {
      payload = payload || {};
      const accordId = payload.accordId || ('AGR-2026-WUA-' + Math.floor(100 + Math.random() * 900));
      const officer = payload.officer || "Er. Deepak Shinde (SDO)";

      const newAccord = {
        accordId: accordId,
        date: new Date().toISOString().split('T')[0],
        canalBranch: "Nira Left Bank Sub-Canal Branch 4 (NLB-04)",
        officer: officer,
        status: "ENACTED_AND_BINDING",
        hash: payload.hash || ("7f8b92a4e5c1d683a410bf628d9c0e5a" + Math.floor(10000000 + Math.random() * 90000000)),
        beneficiaries: payload.beneficiaries || []
      };
      backendDB.mediationAccords = backendDB.mediationAccords || [];
      backendDB.mediationAccords.unshift(newAccord);

      // Update status of all included requests
      if (Array.isArray(payload.beneficiaries)) {
        payload.beneficiaries.forEach(b => {
          const matchedReq = (backendDB.requests || []).find(r => r.ticketId === b.ticketId || r.farmerName === b.name);
          if (matchedReq) {
            matchedReq.status = "APPROVED_SCHEDULED";
            matchedReq.scheduledSlot = b.slot || matchedReq.scheduledSlot;
            matchedReq.allocatedHours = b.hours || matchedReq.allocatedHours;
            matchedReq.providedLiters = b.liters || matchedReq.providedLiters;
          }
        });
      }

      // Append audit log
      backendDB.auditLog = backendDB.auditLog || [];
      backendDB.auditLog.unshift({
        id: "AUD-2026-MED-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        officer: officer,
        action: "LIVE_MEDIATION_ACCORD_ENACTED",
        details: `Ratified Live Accord ${accordId} across ${(payload.beneficiaries || []).length} shareholders.`,
        hash: newAccord.hash
      });

      saveDatabaseToDisk();
      sendJson(res, 200, { success: true, accord: newAccord });
    });
    return;
  }

  // 5. Get Live Water Status & Telemetry
  if (req.method === 'GET' && reqPath === '/api/farmer/water-status') {
    sendJson(res, 200, {
      success: true,
      canal: {
        name: "Nira Left Bank Sub-Canal Branch 4",
        dischargeCusecs: 25.0,
        bufferCusecHours: 45.0,
        reservoirLiveStorage: "78.5% (9.4 TMC)",
        nextRotationDate: "Sept 18, 2026"
      }
    });
    return;
  }

  // ==========================================
  // STATIC FILE SERVER
  // ==========================================
  let filePath = path.join(PUBLIC_DIR, reqPath === '/' ? '/index.html' : reqPath);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('===========================================================');
  console.log('🌾 JalMitra (जलमित्र) - PS14 Autonomous Water Mediation Agent');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log('📱 Ready for demo: Open http://localhost:3000 in your browser');
  console.log('⚡ Farmer REST APIs: /api/farmer/calculate-water & /api/farmer/request-water active');
  console.log('===========================================================');
});
