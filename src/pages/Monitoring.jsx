// src/pages/Monitoring.jsx
import { useEffect, useState } from "react";
import { getPipeline } from "../services/api";

function Monitoring() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function loadPipeline() {
    try {
      const data = await getPipeline();

      console.log("GitHub Actions:", data);

      setRuns(data.runs || []);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Error loading pipeline:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPipeline();

    const interval = setInterval(loadPipeline, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "in_progress":
        return "🔄";
      default:
        return "⏳";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "in_progress":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const completed = runs.filter(r => r.status === "completed").length;
  const failed = runs.filter(r => r.status === "failed").length;
  const running = runs.filter(r => r.status === "in_progress").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">CI/CD Pipeline</h1>
        <div className="text-center py-8 text-gray-400">
          Loading GitHub Actions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            GitHub Actions Pipeline
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Real-time CI/CD workflow monitoring
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-green-400">
            ● Live GitHub Actions
          </div>

          <div className="text-xs text-gray-500">
            Last update: {lastUpdate?.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-2xl bg-slate-900/60 border border-green-500/20 p-5">
          <p className="text-gray-400 text-sm">Successful Runs</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {completed}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-red-500/20 p-5">
          <p className="text-gray-400 text-sm">Failed Runs</p>
          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {failed}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-yellow-500/20 p-5">
          <p className="text-gray-400 text-sm">Running</p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {running}
          </h2>
        </div>

      </div>

      {/* Workflow Runs */}
      <div className="space-y-4">

        {runs.map((run) => (

          <div
            key={run.id}
            className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 hover:border-blue-500/30 transition"
          >

            <div className="flex justify-between items-start">

              <div className="flex-1">

                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getStatusIcon(run.status)}
                  </span>

                  <div>
                    <h2 className="text-lg font-semibold">
                      {run.name}
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      {run.commit}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 ml-11">

                  <div>
                    🌿 Branch: {run.branch}
                  </div>

                  <div>
                    ⏱ Duration: {run.duration}
                  </div>

                  <div>
                    🕒 Started:{" "}
                    {new Date(run.created_at).toLocaleString()}
                  </div>

                </div>

              </div>

              <div className="text-right">
                <p className={`font-semibold ${getStatusColor(run.status)}`}>
                  {run.status}
                </p>
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">

        <span className="text-green-400">
          ● Auto-refreshing every 5 seconds
        </span>

        <span className="mx-2">|</span>

        <span className="text-blue-400">
          🔥 Live GitHub Actions API
        </span>

        <span className="mx-2">|</span>

        <span className="text-purple-400">
          ☁️ AWS S3 + Render Deployment
        </span>

      </div>

    </div>
  );
}

export default Monitoring;