import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Network, Zap, Settings, Activity, Info } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const statuses = [
    { name: "QUANTUM ENGINE", status: "ONLINE", type: "Simulated", color: "text-quantum-accent" },
    { name: "ATTACK GRAPH", status: "ONLINE", type: "Live", color: "text-green-400" },
    { name: "THREAT INTEL", status: "CONNECTED", type: "CISA KEV", color: "text-blue-400" },
    { name: "OPTIMIZER", status: "READY", type: "QAOA", color: "text-quantum-purple" }
  ];

  return (
    <div className="flex h-screen bg-quantum-bg text-white font-sans overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="quantum-grid opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-quantum-bg via-transparent to-quantum-bg"></div>
      </div>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }} animate={{ x: 0 }}
        className="w-72 bg-quantum-panel/80 backdrop-blur-xl border-r border-gray-800 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="text-quantum-accent" size={28} />
            <h1 className="text-2xl font-bold font-display tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              QuantumShield
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-widest">SOC Intelligence Platform</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest pl-3">Modules</div>
          
          <NavLink to="/app/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-quantum-accent/10 text-quantum-accent shadow-[inset_2px_0_0_#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Activity size={18} /> <span className="font-medium">Dashboard</span>
          </NavLink>
          
          <NavLink to="/app/attack-graph" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-quantum-accent/10 text-quantum-accent shadow-[inset_2px_0_0_#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Network size={18} /> <span className="font-medium">Attack Graph Explorer</span>
          </NavLink>
          
          <NavLink to="/app/controls" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-quantum-accent/10 text-quantum-accent shadow-[inset_2px_0_0_#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Settings size={18} /> <span className="font-medium">Security Controls</span>
          </NavLink>
          
          <NavLink to="/app/benchmark" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-quantum-accent/10 text-quantum-accent shadow-[inset_2px_0_0_#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Zap size={18} /> <span className="font-medium">Experiment & Benchmark</span>
          </NavLink>
        </nav>

        {/* System Status Indicators */}
        <div className="p-4 border-t border-gray-800 bg-black/20">
          <h3 className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">System Status</h3>
          <div className="space-y-3">
            {statuses.map(sys => (
              <div key={sys.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sys.color} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                  <span className="text-[11px] font-mono text-gray-300">{sys.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold ${sys.color}`}>{sys.status}</span>
                  <span className="text-[9px] text-gray-600 uppercase">{sys.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-quantum-accent/5 border-t border-quantum-accent/20">
          <div className="flex items-start gap-2 text-quantum-accent/80">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p className="text-[10px] leading-tight font-medium">
              Quantum results are executed using a local classical quantum simulator unless otherwise indicated.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
