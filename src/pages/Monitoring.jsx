// src/pages/Monitoring.jsx - Complete CI/CD Pipeline View
import { useEffect, useState } from "react";
import { getPipeline } from "../services/api";

function Monitoring() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function loadPipeline() {
    try {
      const data = await getPipeline();
      console.log("Pipeline stages:", data);
      setStages(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading pipeline:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPipeline();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadPipeline, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/10 border-green-500/20';
      case 'in_progress': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getProgressColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const totalCount = stages.length;
  const overallProgress = (completedCount / totalCount) * 100;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cloud Monitoring</h1>
        <div className="text-center py-8 text-gray-400">Loading CI/CD Pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CI/CD Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Continuous Integration & Continuous Deployment</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-400">● Live Pipeline Status</div>
          <div className="text-xs text-gray-500">
            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="rounded-2xl border border-blue-500/20 bg-slate-900/60 backdrop-blur-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-400">Pipeline Progress</h3>
          <span className="text-sm font-semibold text-blue-400">{Math.floor(overallProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>✅ {completedCount} completed</span>
          <span>🔄 {stages.filter(s => s.status === 'in_progress').length} in progress</span>
          <span>⏳ {stages.filter(s => s.status === 'pending').length} pending</span>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`rounded-xl bg-slate-900/60 border p-4 transition-all duration-300 ${getStatusBg(stage.status)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(stage.status)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">{stage.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{stage.description}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {stage.progress > 0 && (
                  <div className="mt-3 ml-12">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{stage.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(stage.status)}`}
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Details */}
                <div className="mt-3 ml-12">
                  <div className="flex flex-wrap gap-4 text-xs">
                    {stage.command && (
                      <div className="font-mono text-gray-500">
                        <span className="text-gray-400">Command:</span> {stage.command}
                      </div>
                    )}
                    {stage.duration && (
                      <div>
                        <span className="text-gray-400">Duration:</span> {stage.duration}
                      </div>
                    )}
                    {stage.startTime && (
                      <div>
                        <span className="text-gray-400">Started:</span> {new Date(stage.startTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-sm font-semibold ${getStatusColor(stage.status)}`}>
                  {stage.status === 'completed' ? 'Completed' : 
                   stage.status === 'in_progress' ? 'In Progress' :
                   stage.status === 'failed' ? 'Failed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        <span className="text-green-400">●</span> Auto-refreshing every 5 seconds 
        <span className="mx-2">|</span>
        <span className="text-blue-400">📍 AWS Region: Asia Pacific (Singapore) - ap-southeast-1</span>
        <span className="mx-2">|</span>
        <span className="text-purple-400">🔄 Real-time CI/CD Pipeline Status</span>
      </div>
    </div>
  );
}

export default Monitoring;