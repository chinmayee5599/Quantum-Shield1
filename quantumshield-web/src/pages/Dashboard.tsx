import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Crosshair, Network, Cpu, Server, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(e => console.error(e));
  }, []);

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-display font-bold text-white mb-2">Command Center</h2>
          <p className="text-gray-400">Enterprise Attack Graph Intelligence & Optimization</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Live Environment</p>
          <div className="flex items-center gap-2 text-quantum-accent font-mono text-sm bg-quantum-accent/10 px-3 py-1.5 rounded border border-quantum-accent/30">
            <Activity size={16} /> Data Stream Connected
          </div>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-6 mb-8">
        <motion.div variants={item} className="bg-quantum-panel p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-red-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Critical Assets</h3>
            <Server size={20} className="text-gray-500" />
          </div>
          <p className="text-5xl font-display font-bold text-white">5</p>
        </motion.div>

        <motion.div variants={item} className="bg-quantum-panel p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">High Risk Paths</h3>
            <Network size={20} className="text-orange-400" />
          </div>
          <p className="text-5xl font-display font-bold text-orange-400">12</p>
        </motion.div>

        <motion.div variants={item} className="bg-quantum-panel p-6 rounded-xl border border-quantum-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-quantum-accent/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-quantum-accent/20"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-quantum-accent text-sm font-bold uppercase tracking-wider">Exploitable Nodes</h3>
            <ShieldAlert size={20} className="text-quantum-accent" />
          </div>
          <p className="text-5xl font-display font-bold text-quantum-accent">{metrics?.number_of_vulnerabilities ? '50' : '...'}</p>
          <p className="text-xs text-quantum-accent/70 mt-2">Sampled from {metrics?.number_of_vulnerabilities || '...'} CISA KEV</p>
        </motion.div>

        <motion.div variants={item} className="bg-quantum-panel p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-quantum-purple/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-quantum-purple/10"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Controls Available</h3>
            <Lock size={20} className="text-quantum-purple" />
          </div>
          <p className="text-5xl font-display font-bold text-white">5</p>
        </motion.div>
      </motion.div>

      <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-2 gap-8 mt-12">
        <div className="bg-quantum-panel/50 p-8 rounded-2xl border border-gray-800 flex flex-col justify-center items-start">
          <Crosshair size={40} className="text-quantum-accent mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">1. Map the Enterprise</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">Visualize critical assets, access policies, and vulnerabilities mapped against the live CISA KEV catalog to uncover active attack paths.</p>
          <Link to="/app/attack-graph" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors">
            Explore Attack Graph
          </Link>
        </div>

        <div className="bg-gradient-to-br from-quantum-panel to-[#131b35] p-8 rounded-2xl border border-quantum-purple/30 flex flex-col justify-center items-start shadow-[0_0_40px_rgba(112,0,255,0.1)]">
          <Cpu size={40} className="text-quantum-purple mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">2. Quantum Optimization</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">Translate the attack graph into a QUBO formulation and execute Qiskit QAOA to calculate the absolute optimal defense strategy.</p>
          <Link to="/app/benchmark" className="px-6 py-3 bg-quantum-purple hover:bg-quantum-purple/80 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(112,0,255,0.4)]">
            Run Hybrid Solver
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
