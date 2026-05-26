// src/components/Statuscard.jsx
function Statuscard({ title, value, color }) {
  const colorClasses = {
    green: "text-green-400",
    blue: "text-blue-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    red: "text-red-400"
  };

  const borderColors = {
    green: "border-green-500/20",
    blue: "border-blue-500/20",
    cyan: "border-cyan-500/20",
    purple: "border-purple-500/20",
    yellow: "border-yellow-500/20",
    red: "border-red-500/20"
  };

  return (
    <div className={`rounded-2xl border ${borderColors[color] || 'border-blue-500/20'} bg-slate-900/60 backdrop-blur-md p-6 transition-all duration-300 hover:scale-105`}>
      <h3 className="text-gray-400 mb-2 text-sm font-medium">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color] || 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

export default Statuscard;