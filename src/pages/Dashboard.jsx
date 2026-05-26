// src/pages/Dashboard.jsx - Clean Version (No Duplicates)
import { useEffect, useState } from "react";
import Statuscard from "../components/Statuscard";
import MonitoringChart from "../components/MonitoringChart";
import TerminalPanel from "../components/TerminalPanel";
import { getStatus } from "../services/api";

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await getStatus();
        console.log("Dashboard status:", data);
        setStatus(data);
      } catch (error) {
        console.error("Error loading status:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orbit Mission Control</h1>
        <div className="text-center py-8 text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orbit Mission Control</h1>
        <div className="text-right">
          <div className="text-xs text-green-400">● System Operational</div>
          <div className="text-xs text-gray-500">
            AWS: {status?.region || "ap-southeast-1"}
          </div>
        </div>
      </div>

      {/* Status Cards - ONLY ONE SET */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Statuscard title="Pipeline Status" value={status.pipeline || "Active"} color="green" />
          <Statuscard title="Total Deployments" value={status.deployments || 0} color="blue" />
          <Statuscard title="Cloud Health" value={status.cloudHealth || "98%"} color="cyan" />
        </div>
      )}

      {/* Monitoring Charts */}
      <MonitoringChart />
      
      {/* Terminal Panel */}
      <TerminalPanel />
    </div>
  );
}

export default Dashboard;