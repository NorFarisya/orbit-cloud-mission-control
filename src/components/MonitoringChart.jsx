// src/components/MonitoringChart.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { getCpuMonitoring, getMemoryMonitoring } from "../services/api";

function MonitoringChart() {
  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadCpuData() {
    try {
      const data = await getCpuMonitoring();
      setCpuData(data.data || []);
      setLastUpdate(data.lastUpdated);
    } catch (error) {
      console.error("Error loading CPU data:", error);
    }
  }

  async function loadMemoryData() {
    try {
      const data = await getMemoryMonitoring();
      setMemoryData(data.data || []);
    } catch (error) {
      console.error("Error loading Memory data:", error);
    }
  }

  async function loadAllData() {
    await Promise.all([loadCpuData(), loadMemoryData()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
    // Refresh every 10 seconds
    const interval = setInterval(loadAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md p-6">
          <div className="text-center text-gray-400">Loading CPU data...</div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-md p-6">
          <div className="text-center text-gray-400">Loading Memory data...</div>
        </div>
      </section>
    );
  }

  const currentCpu = cpuData[cpuData.length - 1]?.value || 0;
  const currentMemory = memoryData[memoryData.length - 1]?.value || 0;

  return (
    <section className="space-y-6 mb-8">
      {/* Last Update Indicator */}
      <div className="text-right text-xs text-gray-500">
        Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-cyan-400">CPU Usage</h3>
            <span className="text-xs text-green-400">● Live</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2f', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 4 }}
                  name="CPU %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Current: {currentCpu}%
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-purple-400">Memory Usage</h3>
            <span className="text-xs text-green-400">● Live</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2f', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#c084fc" 
                  strokeWidth={2}
                  dot={{ fill: '#c084fc', r: 4 }}
                  name="Memory %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Current: {currentMemory}%
          </div>
        </div>
      </div>
    </section>
  );
}

export default MonitoringChart;