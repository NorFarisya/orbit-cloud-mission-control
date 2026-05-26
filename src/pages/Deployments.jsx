import { useEffect, useState } from "react";
import {
  getDeployments,
  triggerDeploy
} from "../services/api";

function Deployments() {

  const [deployments, setDeployments] = useState([]);

  async function loadDeployments() {

    const data = await getDeployments();

    setDeployments(data);

  }

  async function handleDeploy() {

    await triggerDeploy();

    loadDeployments();

  }

  useEffect(() => {

    loadDeployments();

  }, []);

  return (

    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Deployments
        </h1>

        <button
          onClick={handleDeploy}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          🚀 Trigger Deploy
        </button>

      </div>

      <div className="space-y-4">

        {deployments.map((item)=>(

          <div
            key={item.id}
            className="rounded-xl bg-slate-900/60 border border-white/10 p-4"
          >

            <p>
              Status: {item.status}
            </p>

            <p>
              Time: {item.time}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Deployments;