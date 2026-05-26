import { Routes, Route } from "react-router-dom";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Deployments from "./pages/Deployments";
import Monitoring from "./pages/Monitoring";
import Logs from "./pages/Logs";
import Security from "./pages/Security";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      <StarsBackground className="absolute inset-0 z-0" />

      <div className="relative z-10 flex">

        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/security" element={<Security />} />
          </Routes>

        </main>

      </div>

    </div>
  );
}

export default App;