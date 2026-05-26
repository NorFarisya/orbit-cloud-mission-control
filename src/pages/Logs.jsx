// src/pages/Logs.jsx - Real-time Logs from AWS DynamoDB
import { useEffect, useState, useRef } from "react";
import { getLogs } from "../services/api";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [logSource, setLogSource] = useState("Loading...");
  const logsEndRef = useRef(null);

  async function loadLogs() {
    try {
      const data = await getLogs();
      console.log("Logs from AWS:", data?.length);
      setLogs(data || []);
      setLastUpdate(new Date());
      setLogSource(data?.source === "DynamoDB" ? "AWS DynamoDB" : "Connected");
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filteredLogs = filter === "ALL" 
    ? logs 
    : logs.filter(log => log.includes(filter));

  const getLogColor = (log) => {
    if (log.includes("ERROR")) return "text-red-400";
    if (log.includes("SUCCESS")) return "text-green-400";
    if (log.includes("WARNING") || log.includes("WARN")) return "text-yellow-400";
    return "text-gray-300";
  };

  const getLogIcon = (log) => {
    if (log.includes("ERROR")) return "❌";
    if (log.includes("SUCCESS")) return "✅";
    if (log.includes("WARNING") || log.includes("WARN")) return "⚠️";
    if (log.includes("Deployment")) return "🚀";
    return "📝";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time logs from AWS DynamoDB</p>
        </div>
        <div className="text-right">
          <div className={`text-xs ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}>
            {autoRefresh ? "● Live from AWS" : "⏸ Paused"}
          </div>
          <div className="text-xs text-gray-500">
            Source: {logSource}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              autoRefresh 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {autoRefresh ? "⏸ Pause" : "▶️ Resume"}
          </button>
          <button
            onClick={loadLogs}
            className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === "ALL" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("INFO")}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === "INFO" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            INFO
          </button>
          <button
            onClick={() => setFilter("SUCCESS")}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === "SUCCESS" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ✅ SUCCESS
          </button>
          <button
            onClick={() => setFilter("ERROR")}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === "ERROR" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ❌ ERROR
          </button>
        </div>
      </div>

      {/* Logs Display */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading logs from AWS DynamoDB...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {filter === "ALL" ? "No logs available in DynamoDB" : `No ${filter} logs found`}
        </div>
      ) : (
        <div className="space-y-2 font-mono text-sm max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`rounded-lg bg-slate-900/60 p-3 border border-white/10 hover:border-blue-500/30 transition group ${getLogColor(log)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getLogIcon(log)}</span>
                <span className="break-all">{log}</span>
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}

      {/* Status Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        <span className="text-green-400">●</span> Real-time logs from AWS DynamoDB
        <span className="mx-2">|</span>
        <span className="text-blue-400">📝 Total logs: {logs.length}</span>
        <span className="mx-2">|</span>
        <span className="text-purple-400">🔍 Filtered: {filteredLogs.length}</span>
        <span className="mx-2">|</span>
        <span className="text-yellow-400">📍 Region: ap-southeast-1 (Singapore)</span>
      </div>
    </div>
  );
}

export default Logs;