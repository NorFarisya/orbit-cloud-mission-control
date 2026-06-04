import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-white/10 bg-slate-950/60 backdrop-blur-xl p-6">

      <h1 className="text-4xl font-bold mb-10 text-white">
        ORBIT
      </h1>

      <nav className="flex flex-col gap-4">

        <Link
          to="/"
          className="rounded-xl px-4 py-3 hover:bg-blue-500/20 transition"
        >
          📊 Dashboard
        </Link>

        <Link
          to="/deployments"
          className="rounded-xl px-4 py-3 hover:bg-blue-500/20 transition"
        >
          🚀 Deployments
        </Link>

        <Link
          to="/monitoring"
          className="rounded-xl px-4 py-3 hover:bg-blue-500/20 transition"
        >
          📈 Cloud Monitoring
        </Link>

        <Link
          to="/logs"
          className="rounded-xl px-4 py-3 hover:bg-blue-500/20 transition"
        >
          📜 Logs
        </Link>

        <Link
          to="/security"
          className="rounded-xl px-4 py-3 hover:bg-blue-500/20 transition"
        >
          🔒 Security
        </Link>

      </nav>

    </aside>
  );
}

export default Sidebar;