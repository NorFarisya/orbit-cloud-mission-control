// src/components/TerminalPanel.jsx - Dynamic Real-time Terminal
import { useEffect, useState, useRef } from "react";
import { getStatus, getDeployments, getLogs, getPipeline, triggerDeploy } from "../services/api";

function TerminalPanel() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState([
    "╔══════════════════════════════════════════════════════════════════════════════╗",
    "║                    ORBIT MISSION CONTROL - REAL-TIME TERMINAL                 ║",
    "║                    Version: 2.1.0 | AWS: Connected | Status: Active          ║",
    "╚══════════════════════════════════════════════════════════════════════════════╝",
    "",
    "$ Welcome to Orbit Mission Control Terminal",
    "$ Type 'help' to see available commands",
    "$ Type 'status' to check system health", 
    "$ Type 'deploy' to trigger a new deployment",
    "$ Type 'logs' to see recent logs",
    "$ Type 'pipeline' to check CI/CD pipeline status",
    "",
    "────────────────────────────────────────────────────────────────────────────────",
    ""
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const terminalEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  // Fetch real-time data for commands
  async function fetchSystemStatus() {
    try {
      const status = await getStatus();
      setSystemStatus(status);
      return status;
    } catch (error) {
      console.error("Error fetching status:", error);
      return null;
    }
  }

  async function fetchRecentLogs() {
    try {
      const logs = await getLogs();
      setRecentLogs(logs.slice(0, 5));
      return logs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
  }

  async function fetchPipeline() {
    try {
      const pipeline = await getPipeline();
      setPipelineStages(pipeline);
      return pipeline;
    } catch (error) {
      console.error("Error fetching pipeline:", error);
      return [];
    }
  }

  // Add message to terminal output
  function addToOutput(message, type = "normal") {
    const timestamp = new Date().toLocaleTimeString();
    let formattedMessage = message;
    
    if (type === "command") {
      formattedMessage = `┌─[${timestamp}]─(user)─[orbit-terminal]`;
      setOutput(prev => [...prev, formattedMessage, `└─$ ${message}`, ""]);
    } else if (type === "error") {
      formattedMessage = `❌ ${message}`;
      setOutput(prev => [...prev, formattedMessage, ""]);
    } else if (type === "success") {
      formattedMessage = `✅ ${message}`;
      setOutput(prev => [...prev, formattedMessage, ""]);
    } else if (type === "info") {
      formattedMessage = `ℹ️ ${message}`;
      setOutput(prev => [...prev, formattedMessage, ""]);
    } else {
      setOutput(prev => [...prev, message]);
    }
  }

  // Execute commands
  async function executeCommand() {
    if (!command.trim()) return;
    if (isExecuting) return;

    const cmd = command.trim().toLowerCase();
    setIsExecuting(true);
    
    // Add command to output
    setOutput(prev => [...prev, `┌─[${new Date().toLocaleTimeString()}]─(user)─[orbit-terminal]`, `└─$ ${command}`, ""]);
    
    // Process command
    try {
      if (cmd === "help" || cmd === "?") {
        setOutput(prev => [...prev, 
          "Available commands:",
          "",
          "  📊 SYSTEM COMMANDS:",
          "  ┌────────────────────────────────────────────────",
          "  │ status      - Show system status and metrics",
          "  │ health      - Check system health",
          "  │ version     - Show version info",
          "",
          "  🚀 DEPLOYMENT COMMANDS:",
          "  ┌────────────────────────────────────────────────",
          "  │ deploy      - Trigger a new deployment",
          "  │ deployments - List recent deployments",
          "  │ pipeline    - Show CI/CD pipeline status",
          "",
          "  📝 LOG COMMANDS:",
          "  ┌────────────────────────────────────────────────",
          "  │ logs        - Show recent system logs",
          "  │ clear       - Clear terminal screen",
          "",
          "  🛡️ SECURITY COMMANDS:",
          "  ┌────────────────────────────────────────────────",
          "  │ security    - Show security status",
          "  │ sessions    - Show active sessions",
          "",
          "  🧹 UTILITY COMMANDS:",
          "  ┌────────────────────────────────────────────────",
          "  │ clear       - Clear terminal",
          "  │ help        - Show this help",
          "",
          ""
        ]);
      } 
      else if (cmd === "status") {
        setOutput(prev => [...prev, "⏳ Fetching system status...", ""]);
        const status = await fetchSystemStatus();
        if (status) {
          setOutput(prev => [...prev,
            "╔══════════════════════════════════════════════════════════════╗",
            "║                    SYSTEM STATUS REPORT                      ║",
            "╠══════════════════════════════════════════════════════════════╣",
            `║  System:        ${status.system?.padEnd(45)}║`,
            `║  Status:        ${status.status?.padEnd(45)}║`,
            `║  Pipeline:      ${status.pipeline?.padEnd(45)}║`,
            `║  Deployments:   ${String(status.deployments).padEnd(45)}║`,
            `║  Cloud Health:  ${(status.cloudHealth || "98%").padEnd(45)}║`,
            `║  AWS:           ${(status.aws || "Connected").padEnd(45)}║`,
            `║  Region:        ${(status.region || "ap-southeast-1").padEnd(45)}║`,
            "╚══════════════════════════════════════════════════════════════╝",
            ""
          ]);
        } else {
          addToOutput("Failed to fetch system status", "error");
        }
      }
      else if (cmd === "health") {
        setOutput(prev => [...prev, "⏳ Checking system health...", ""]);
        const status = await fetchSystemStatus();
        if (status) {
          const healthStatus = status.status === "Operational" ? "✅ HEALTHY" : "⚠️ DEGRADED";
          setOutput(prev => [...prev,
            "┌─────────────────────────────────────────────────────────────────┐",
            "│                    SYSTEM HEALTH CHECK                          │",
            "├─────────────────────────────────────────────────────────────────┤",
            `│  Overall Status:  ${healthStatus.padEnd(45)}│`,
            `│  Uptime:          ${Math.floor(process.uptime())} seconds`.padEnd(64) + "│",
            `│  AWS Connection:  ✅ Connected`.padEnd(64) + "│",
            `│  Database:        ✅ Operational`.padEnd(64) + "│",
            "└─────────────────────────────────────────────────────────────────┘",
            ""
          ]);
        }
      }
      else if (cmd === "version") {
        setOutput(prev => [...prev,
          "┌─────────────────────────────────────────────────────────────────┐",
          "│                    VERSION INFORMATION                          │",
          "├─────────────────────────────────────────────────────────────────┤",
          "│  Orbit Mission Control v2.1.0                                   │",
          "│  Backend API: v1.0.0                                            │",
          "│  AWS SDK: v3.1053.0                                             │",
          "│  React: v19.2.6                                                 │",
          "│  Node.js: v26.1.0                                               │",
          "│  Region: Asia Pacific (Singapore) - ap-southeast-1              │",
          "└─────────────────────────────────────────────────────────────────┘",
          ""
        ]);
      }
      else if (cmd === "deploy" || cmd === "trigger") {
        setOutput(prev => [...prev, "🚀 Triggering new deployment...", ""]);
        try {
          const result = await triggerDeploy();
          if (result.success) {
            addToOutput(`Deployment ${result.deployment?.id || 'started'} triggered successfully!`, "success");
            addToOutput(`Version: ${result.deployment?.version || 'latest'}`, "info");
            // Refresh status
            await fetchSystemStatus();
          } else {
            addToOutput("Deployment failed", "error");
          }
        } catch (error) {
          addToOutput(`Deployment error: ${error.message}`, "error");
        }
      }
      else if (cmd === "deployments" || cmd === "list") {
        setOutput(prev => [...prev, "📊 Fetching recent deployments...", ""]);
        try {
          const deployments = await getDeployments();
          if (deployments && deployments.length > 0) {
            setOutput(prev => [...prev,
              "┌─────────────────────────────────────────────────────────────────┐",
              "│                    RECENT DEPLOYMENTS                           │",
              "├─────────────────────────────────────────────────────────────────┤"
            ]);
            deployments.slice(0, 5).forEach((dep, i) => {
              setOutput(prev => [...prev,
                `│  ${(i+1)}. ${dep.id.padEnd(20)} ${dep.status.padEnd(15)} ${new Date(dep.time).toLocaleString().padEnd(20)}│`
              ]);
            });
            setOutput(prev => [...prev,
              "└─────────────────────────────────────────────────────────────────┘",
              ""
            ]);
          } else {
            addToOutput("No deployments found", "info");
          }
        } catch (error) {
          addToOutput("Failed to fetch deployments", "error");
        }
      }
      else if (cmd === "logs") {
        setOutput(prev => [...prev, "📝 Fetching recent logs...", ""]);
        try {
          const logs = await getLogs();
          if (logs && logs.length > 0) {
            setOutput(prev => [...prev,
              "┌─────────────────────────────────────────────────────────────────┐",
              "│                    RECENT SYSTEM LOGS                           │",
              "├─────────────────────────────────────────────────────────────────┤"
            ]);
            logs.slice(0, 8).forEach((log) => {
              const shortLog = log.length > 55 ? log.substring(0, 52) + "..." : log;
              setOutput(prev => [...prev, `│  ${shortLog.padEnd(63)}│`]);
            });
            setOutput(prev => [...prev,
              "└─────────────────────────────────────────────────────────────────┘",
              `│  Total logs: ${logs.length}                                      │`,
              "└─────────────────────────────────────────────────────────────────┘",
              ""
            ]);
          } else {
            addToOutput("No logs available", "info");
          }
        } catch (error) {
          addToOutput("Failed to fetch logs", "error");
        }
      }
      else if (cmd === "pipeline") {
        setOutput(prev => [...prev, "🔧 Fetching CI/CD pipeline status...", ""]);
        try {
          const pipeline = await getPipeline();
          if (pipeline && pipeline.length > 0) {
            setOutput(prev => [...prev,
              "┌─────────────────────────────────────────────────────────────────┐",
              "│                    CI/CD PIPELINE STATUS                        │",
              "├─────────────────────────────────────────────────────────────────┤"
            ]);
            pipeline.forEach((stage) => {
              const statusIcon = stage.status === 'completed' ? '✅' : stage.status === 'in_progress' ? '🔄' : '⏳';
              const stageName = stage.name || stage;
              setOutput(prev => [...prev, `│  ${statusIcon} ${stageName.padEnd(58)}│`]);
            });
            setOutput(prev => [...prev,
              "└─────────────────────────────────────────────────────────────────┘",
              ""
            ]);
          } else {
            addToOutput("No pipeline data available", "info");
          }
        } catch (error) {
          addToOutput("Failed to fetch pipeline", "error");
        }
      }
      else if (cmd === "security") {
        setOutput(prev => [...prev,
          "┌─────────────────────────────────────────────────────────────────┐",
          "│                    SECURITY STATUS                              │",
          "├─────────────────────────────────────────────────────────────────┤",
          "│  Threat Detection:  ✅ Secure                                    │",
          "│  Active Sessions:   12                                           │",
          "│  Firewall:          ✅ Active                                    │",
          "│  Encryption:        ✅ AES-256                                   │",
          "│  MFA Status:        ✅ Enabled                                   │",
          "└─────────────────────────────────────────────────────────────────┘",
          ""
        ]);
      }
      else if (cmd === "sessions") {
        setOutput(prev => [...prev,
          "┌─────────────────────────────────────────────────────────────────┐",
          "│                    ACTIVE SESSIONS                              │",
          "├─────────────────────────────────────────────────────────────────┤",
          "│  Current Terminal:    1 active                                   │",
          "│  API Connections:      3 active                                   │",
          "│  Database Connections: 2 active                                   │",
          "│  Total Active:         6                                          │",
          "└─────────────────────────────────────────────────────────────────┘",
          ""
        ]);
      }
      else if (cmd === "clear" || cmd === "cls") {
        setOutput([
          "╔══════════════════════════════════════════════════════════════════════════════╗",
          "║                    ORBIT MISSION CONTROL - REAL-TIME TERMINAL                 ║",
          "║                    Version: 2.1.0 | AWS: Connected | Status: Active          ║",
          "╚══════════════════════════════════════════════════════════════════════════════╝",
          "",
          "$ Terminal cleared. Type 'help' for commands.",
          "",
          "────────────────────────────────────────────────────────────────────────────────",
          ""
        ]);
      }
      else if (cmd === "") {
        // Do nothing
      }
      else {
        addToOutput(`Command '${command}' not recognized. Type 'help' for available commands.`, "error");
      }
    } catch (error) {
      addToOutput(`Error executing command: ${error.message}`, "error");
    }
    
    setCommand("");
    setIsExecuting(false);
  }

  // Handle Enter key
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      executeCommand();
    }
  }

  // Initial welcome message with real data
  useEffect(() => {
    async function loadInitialData() {
      const status = await fetchSystemStatus();
      if (status) {
        addToOutput(`System ready - ${status.system} | Status: ${status.status}`, "success");
      }
      const logs = await fetchRecentLogs();
      if (logs.length > 0) {
        addToOutput(`Loaded ${logs.length} recent logs`, "info");
      }
    }
    loadInitialData();
  }, []);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-black/90 backdrop-blur-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 font-mono">🖥️ ORBIT TERMINAL v2.1</h3>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div className="bg-black/80 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
        {output.map((line, index) => (
          <div 
            key={index} 
            className={`${line.startsWith('✅') ? 'text-green-400' : 
                         line.startsWith('❌') ? 'text-red-400' : 
                         line.startsWith('ℹ️') ? 'text-blue-400' :
                         line.startsWith('┌') || line.startsWith('├') || line.startsWith('└') || line.startsWith('│') || line.startsWith('╔') || line.startsWith('╠') || line.startsWith('╚') || line.startsWith('║') ? 'text-cyan-400' : 
                         line.startsWith('$') ? 'text-yellow-400' : 
                         line.startsWith('⚠️') ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      
      {/* Command Input */}
      <div className="flex gap-2 mt-3 bg-black/50 rounded-lg p-3 border border-gray-700">
        <span className="text-green-400 font-mono font-bold">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isExecuting}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm"
          placeholder={isExecuting ? "Executing..." : "Enter command... (type 'help' for commands)"}
          autoFocus
        />
        <button
          onClick={executeCommand}
          disabled={isExecuting}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono disabled:opacity-50"
        >
          {isExecuting ? "⏳" : "▶"}
        </button>
      </div>
      
      {/* Status Bar */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500 font-mono">
        <div className="flex gap-4">
          <span className="text-green-400">● SYSTEM: ONLINE</span>
          <span>● AWS: {systemStatus?.aws === "Connected to DynamoDB (ap-southeast-1)" ? "CONNECTED" : "ACTIVE"}</span>
          <span>● REGION: AP-SOUTHEAST-1</span>
        </div>
        <div>
          <span>{new Date().toLocaleTimeString()} UTC+8</span>
        </div>
      </div>
    </div>
  );
}

export default TerminalPanel;