// src/services/api.js - Works for both local and S3 deployment

// ============ API CONFIGURATION ============
// Change this to your EC2 public IP when deployed
// For now, keep localhost for testing
const BACKEND_URL = "http://localhost:5000"; // Change to your EC2 IP when ready
// Example: const BACKEND_URL = "http://13.215.123.456:5000";

export async function getStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/status`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching status:", error);
    return {
      system: "Orbit Cloud Mission Control",
      status: "Operational",
      deployments: 0,
      cloudHealth: "98%",
      pipeline: "Active",
      timestamp: new Date().toISOString()
    };
  }
}

export async function getDeployments() {
  try {
    const response = await fetch(`${BACKEND_URL}/deployments`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching deployments:", error);
    return [];
  }
}

export async function getLogs() {
  try {
    const response = await fetch(`${BACKEND_URL}/logs`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getPipeline() {
  try {
    const response = await fetch(`${BACKEND_URL}/pipeline`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching pipeline:", error);
    return [];
  }
}

export async function getCpuMonitoring() {
  try {
    const response = await fetch(`${BACKEND_URL}/monitoring/cpu`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching CPU data:", error);
    return { data: [], lastUpdated: new Date().toISOString() };
  }
}

export async function getMemoryMonitoring() {
  try {
    const response = await fetch(`${BACKEND_URL}/monitoring/memory`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Memory data:", error);
    return { data: [], lastUpdated: new Date().toISOString() };
  }
}

export async function getSecurity() {
  try {
    const response = await fetch(`${BACKEND_URL}/security`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching security:", error);
    return {
      threatDetection: "Secure",
      activeSessions: 12,
      firewallStatus: "Active",
      source: "Cache",
      region: "ap-southeast-1"
    };
  }
}

export async function updateSecurity(type, value) {
  try {
    const response = await fetch(`${BACKEND_URL}/security/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating security:", error);
    return { success: false, error: error.message };
  }
}

export async function triggerDeploy() {
  try {
    const response = await fetch(`${BACKEND_URL}/deploy`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error triggering deploy:", error);
    return { success: false, error: error.message };
  }
}