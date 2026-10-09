import { useState, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ShieldCheck, Activity, Target, Layers, Shield } from 'lucide-react';

const controlMetadata: Record<string, any> = {
  'C1': { name: 'Zero Trust Network Access (ZTNA)', cost: 'Medium', priority: 'CRITICAL', mitre: 'T1078, T1021', paths: 12, assets: 4 },
  'C2': { name: 'Micro-Segmentation', cost: 'High', priority: 'HIGH', mitre: 'T1133, T1040', paths: 9, assets: 5 },
  'C3': { name: 'Enhanced EDR Profiling', cost: 'Low', priority: 'MEDIUM', mitre: 'T1003', paths: 5, assets: 8 },
  'C4': { name: 'WAF Policy Tuning', cost: 'Low', priority: 'HIGH', mitre: 'T1190', paths: 7, assets: 2 },
  'C5': { name: 'Privileged Access Management', cost: 'High', priority: 'CRITICAL', mitre: 'T1078.002', paths: 15, assets: 3 }
};

const initialNodes = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: 'VPN Gateway' }, className: 'bg-quantum-panel text-white border-gray-700 text-xs w-32' },
  { id: '2', position: { x: 250, y: 50 }, data: { label: 'Web Server' }, className: 'bg-quantum-panel text-white border-gray-700 text-xs w-32' },
  { id: '3', position: { x: 450, y: 50 }, data: { label: 'Database' }, className: 'bg-quantum-panel text-white border-gray-700 text-xs w-32' },
];

export default function Controls() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAfter, setShowAfter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchInitiated = useRef(false);

  const fetchOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Start the job
      await fetch('/api/job/start', { method: 'POST' });
      
      // 2. Poll status every 2 seconds
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/job/status');
          const statusData = await res.json();
          
          if (statusData.status === 'completed') {
            clearInterval(interval);
            setData(statusData.optimize_result);
            setLoading(false);
          } else if (statusData.status === 'failed') {
            clearInterval(interval);
            setError(statusData.error || 'Optimization failed on server.');
            setLoading(false);
          }
        } catch (e: any) {
          clearInterval(interval);
          setError('Lost connection to backend server.');
          setLoading(false);
        }
      }, 2000);
      
    } catch (e: any) {
      setError(e.message || 'Failed to start optimization.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchInitiated.current) {
      fetchInitiated.current = true;
      fetchOptimization();
    }
  }, []);

  const edges = useMemo(() => {
    return [
      { 
        id: 'e1-2', source: '1', target: '2', animated: !showAfter, 
        style: showAfter ? { stroke: '#4b5563', strokeDasharray: '5 5', opacity: 0.3 } : { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: showAfter ? undefined : { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
      { 
        id: 'e2-3', source: '2', target: '3', animated: !showAfter, 
        style: showAfter ? { stroke: '#4b5563', strokeDasharray: '5 5', opacity: 0.3 } : { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: showAfter ? undefined : { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
    ];
  }, [showAfter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <div className="w-12 h-12 border-4 border-quantum-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-quantum-accent font-semibold animate-pulse mb-2">Running QAOA Optimization...</p>
        <p className="text-xs text-gray-400">Processing on local classical simulator. This may take ~10-15s.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg text-center max-w-lg">
          <h3 className="text-red-400 font-bold mb-2">Optimization Failed</h3>
          <p className="text-gray-300 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchOptimization}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded transition-colors"
          >
            Retry Optimization
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sol = data.solution;
  const reductionPct = ((sol.risk_reduced / sol.original_risk) * 100).toFixed(1);

  return (
    <div className="pb-12">
      <h2 className="text-3xl font-bold mb-8">Optimal Defense Set</h2>
      
      {/* Summary Section */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-quantum-panel p-6 rounded-lg border border-quantum-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <h3 className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Total Cost</h3>
          <p className="text-3xl font-bold text-white">${sol.actual_cost}</p>
          <p className="text-xs text-gray-500 mt-2">Budget: ${sol.total_budget} ({sol.budget_adherence})</p>
        </div>
        <div className="bg-quantum-panel p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Risk Before</h3>
          <p className="text-3xl font-bold text-red-400">{sol.original_risk}</p>
        </div>
        <div className="bg-quantum-panel p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Risk After</h3>
          <p className="text-3xl font-bold text-green-400">{sol.remaining_risk}</p>
        </div>
        <div className="bg-quantum-panel p-6 rounded-lg border border-quantum-accent/30 bg-gradient-to-br from-quantum-panel to-quantum-accent/10">
          <h3 className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Risk Reduction</h3>
          <p className="text-3xl font-bold text-quantum-accent">{reductionPct}%</p>
          <p className="text-xs text-quantum-accent/70 mt-2">Disrupted Risk: {sol.risk_reduced}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Controls List */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-quantum-accent" /> Selected Controls
          </h3>
          {sol.selected_controls.map((cid: string) => {
            const meta = controlMetadata[cid] || { name: `Control ${cid}`, cost: 'Medium', priority: 'MEDIUM', mitre: 'Unknown', paths: 0, assets: 0 };
            return (
              <div key={cid} className="bg-quantum-panel/50 p-5 rounded-lg border border-gray-700 hover:border-quantum-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{meta.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">ID: {cid}</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-bold ${
                    meta.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    meta.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {meta.priority}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Activity size={12}/> Paths Disrupted</div>
                    <div className="font-semibold text-white">{meta.paths}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Shield size={12}/> Critical Assets</div>
                    <div className="font-semibold text-white">{meta.assets}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Target size={12}/> Mitigates</div>
                    <div className="font-semibold text-quantum-accent">{meta.mitre}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Layers size={12}/> Cost</div>
                    <div className="font-semibold text-white">{meta.cost}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Animated Before/After Graph */}
        <div className="col-span-1">
          <h3 className="text-xl font-bold mb-4">Path Disruption Analysis</h3>
          <div className="bg-quantum-panel rounded-lg border border-gray-700 overflow-hidden h-64 relative mb-4">
            <ReactFlow nodes={initialNodes} edges={edges} fitView className="dark">
              <Background color="#1f2937" gap={16} />
            </ReactFlow>
          </div>
          <button 
            onClick={() => setShowAfter(!showAfter)}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-gray-600 flex justify-center items-center gap-2"
          >
            {showAfter ? 'View Original Attack Paths (Before)' : 'Simulate Control Deployment (After)'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">
            {showAfter 
              ? 'Selected controls successfully segment the network, isolating the Critical Asset.' 
              : 'Red paths indicate active high-risk vulnerabilities capable of reaching the DB.'}
          </p>
        </div>
      </div>
    </div>
  );
}
