import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="h-screen bg-quantum-bg text-white overflow-hidden relative flex items-center justify-center font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="quantum-grid opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.1)_0%,rgba(3,7,18,1)_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8 p-4 rounded-2xl bg-quantum-panel/50 border border-quantum-accent/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] backdrop-blur-md"
        >
          <Shield size={64} className="text-quantum-accent drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-7xl font-bold font-display tracking-tight mb-6 leading-tight"
        >
          See the attack path <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-quantum-accent to-quantum-purple">before the attacker does.</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed"
        >
          QuantumShield combines active enterprise attack-graph intelligence with hybrid <strong className="text-white font-medium">quantum optimization</strong> to instantly identify high-risk attack vectors and mathematically prioritize defensive controls.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            to="/app/dashboard" 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
          >
            <span className="relative z-10">Launch Security Console</span>
            <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-quantum-accent to-quantum-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors z-0"></div>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex items-center gap-6 text-sm font-mono text-gray-500 uppercase tracking-widest"
        >
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-quantum-accent animate-pulse"></span> Powered by Qiskit QAOA</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-quantum-purple animate-pulse"></span> CISA KEV Intelligence</span>
        </motion.div>
      </div>
    </div>
  );
}
