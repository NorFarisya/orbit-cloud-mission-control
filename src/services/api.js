// ================= BACKEND CONFIG =================
// LOCAL (for dev)
const LOCAL_BACKEND_URL = "http://localhost:5000";

// PRODUCTION (Render backend)
const PROD_BACKEND_URL = "https://orbit-backend-i536.onrender.com";

// 👉 Automatically choose based on where frontend is running
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? LOCAL_BACKEND_URL
    : PROD_BACKEND_URL;

// ================= SAFE FETCH WRAPPER =================
async function safeFetch(url, fallback) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error: ${url}`, err.message);
    return fallback;
  }
}

// ================= STATUS =================
export async function getStatus() {
  return safeFetch(`${BACKEND_URL}/status`, {
    system: "Orbit Cloud Mission Control",
    status: "Offline (backend not reachable)",
    deployments: 0,
    cloudHealth: "N/A",
    pipeline: "Unknown",
    timestamp: new Date().toISOString()
  });
}

// ================= DEPLOYMENTS =================
export async function getDeployments() {
  return safeFetch(`${BACKEND_URL}/deployments`, [
    {
      id: "mock_1",
      status: "⚠️ Backend Offline",
      time: new Date().toISOString(),
      version: "v0.0.0"
    }
  ]);
}

// ================= LOGS =================
export async function getLogs() {
  return safeFetch(`${BACKEND_URL}/logs`, []);
}

// ================= PIPELINE =================
export async function getPipeline() {
  return safeFetch(`${BACKEND_URL}/pipeline`, []);
}

// ================= CPU =================
export async function getCpuMonitoring() {
  return safeFetch(`${BACKEND_URL}/monitoring/cpu`, {
    data: [],
    lastUpdated: new Date().toISOString()
  });
}

// ================= MEMORY =================
export async function getMemoryMonitoring() {
  return safeFetch(`${BACKEND_URL}/monitoring/memory`, {
    data: [],
    lastUpdated: new Date().toISOString()
  });
}

// ================= SECURITY =================
export async function getSecurity() {
  return safeFetch(`${BACKEND_URL}/security`, {
    threatDetection: "Unknown",
    activeSessions: 0,
    firewallStatus: "Unknown",
    source: "offline",
    region: "N/A"
  });
}

// ================= UPDATE SECURITY =================
export async function updateSecurity(type, value) {
  try {
    const res = await fetch(`${BACKEND_URL}/security/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value })
    });

    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ================= DEPLOY TRIGGER =================
export async function triggerDeploy() {
  try {
    const res = await fetch(`${BACKEND_URL}/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}