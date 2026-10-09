import os

src_dir = r"c:\Users\Chinmayee RS\Downloads\quantumshield-web\src"
pages_dir = os.path.join(src_dir, "pages")
components_dir = os.path.join(src_dir, "components")

os.makedirs(pages_dir, exist_ok=True)
os.makedirs(components_dir, exist_ok=True)

app_tsx = """import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Benchmark from './pages/Benchmark';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="benchmark" element={<Benchmark />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
"""

with open(os.path.join(src_dir, "App.tsx"), "w") as f:
    f.write(app_tsx)

main_tsx = """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
"""

with open(os.path.join(src_dir, "main.tsx"), "w") as f:
    f.write(main_tsx)

layout_tsx = """import { Outlet, Link } from 'react-router-dom';
export default function Layout() {
  return (
    <div className="flex h-screen bg-quantum-bg text-white font-sans">
      <div className="w-64 bg-quantum-panel border-r border-quantum-accent/20 p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-quantum-accent">QuantumShield</h1>
        <nav className="flex flex-col gap-2 mt-8">
          <Link to="/app/dashboard" className="hover:text-quantum-accent transition-colors">Dashboard</Link>
          <Link to="/app/benchmark" className="hover:text-quantum-accent transition-colors">Classical vs QAOA</Link>
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  )
}
"""
with open(os.path.join(components_dir, "Layout.tsx"), "w") as f:
    f.write(layout_tsx)

landing_tsx = """import { Link } from 'react-router-dom';
export default function Landing() {
  return (
    <div className="h-screen bg-quantum-bg text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">See the attack path before the attacker does.</h1>
      <p className="text-xl text-gray-400 max-w-2xl text-center mb-8">QuantumShield combines cybersecurity attack-graph intelligence with hybrid quantum optimization to identify high-risk attack paths.</p>
      <Link to="/app/dashboard" className="px-6 py-3 bg-quantum-accent text-black font-semibold rounded shadow-[0_0_15px_rgba(0,240,255,0.5)]">Launch Security Console</Link>
    </div>
  )
}
"""
with open(os.path.join(pages_dir, "Landing.tsx"), "w") as f:
    f.write(landing_tsx)

dash_tsx = """import { useEffect, useState } from 'react';
export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Security Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-quantum-panel p-6 rounded border border-quantum-accent/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <h3 className="text-gray-400">Total Vulnerabilities</h3>
          <p className="text-4xl font-bold text-quantum-accent mt-2">{metrics?.number_of_vulnerabilities || '...'}</p>
        </div>
      </div>
    </div>
  )
}
"""
with open(os.path.join(pages_dir, "Dashboard.tsx"), "w") as f:
    f.write(dash_tsx)

bench_tsx = """import { useState } from 'react';
export default function Benchmark() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/benchmark', {method: 'POST'});
      const json = await res.json();
      setData(json);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Classical vs QAOA Optimization</h2>
      <button onClick={runBenchmark} disabled={loading} className="px-4 py-2 bg-quantum-purple text-white rounded mb-6">
        {loading ? 'Running Optimization (Expected ~45s)...' : 'Run Benchmark'}
      </button>
      {data && (
        <div className="grid grid-cols-2 gap-8">
           <div className="bg-quantum-panel p-6 border border-gray-600 rounded">
             <h3 className="text-xl font-bold mb-4">Classical (Exact MILP)</h3>
             <pre className="text-sm overflow-x-auto text-gray-300">{JSON.stringify(data.classical, null, 2)}</pre>
           </div>
           <div className="bg-quantum-panel p-6 border border-quantum-accent/50 rounded shadow-[0_0_15px_rgba(0,240,255,0.2)]">
             <h3 className="text-xl font-bold text-quantum-accent mb-4">QAOA (Simulator)</h3>
             <p className="text-xs text-gray-400 mb-4">{data.hardware_environment}</p>
             <pre className="text-sm overflow-x-auto text-gray-300">{JSON.stringify(data.qaoa, null, 2)}</pre>
           </div>
        </div>
      )}
    </div>
  )
}
"""
with open(os.path.join(pages_dir, "Benchmark.tsx"), "w") as f:
    f.write(bench_tsx)

index_css = """@import 'tailwindcss';

@theme {
  --color-quantum-bg: #050a15;
  --color-quantum-panel: #0c152a;
  --color-quantum-accent: #00f0ff;
  --color-quantum-purple: #7000ff;
}
"""
with open(os.path.join(src_dir, "index.css"), "w") as f:
    f.write(index_css)
