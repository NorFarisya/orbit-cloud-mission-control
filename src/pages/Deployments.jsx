import { useEffect, useState } from "react";
import { getDeployments, triggerDeploy } from "../services/api";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadDeployments() {
    const data = await getDeployments();
    setDeployments(data);
  }

  async function handleDeploy() {
    setLoading(true);
    await triggerDeploy();
    await loadDeployments();
    setLoading(false);
  }

  useEffect(() => {
    loadDeployments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deployments</h1>

        <button
          onClick={handleDeploy}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Deploying..." : "🚀 Trigger Deploy"}
        </button>
      </div>

      {deployments.length === 0 && (
        <div className="text-gray-400">
          No deployments found (backend offline or empty)
        </div>
      )}

      <div className="space-y-4">
        {deployments.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-slate-900/60 border border-white/10 p-4"
          >
            <p>Status: {item.status}</p>
            <p>Time: {item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Deployments;