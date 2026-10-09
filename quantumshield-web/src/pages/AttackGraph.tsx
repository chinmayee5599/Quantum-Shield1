import { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState, 
  MarkerType
} from 'reactflow';
import type { Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import AttackNode from '../components/AttackNode';
import { Shield, Target, Zap, AlertTriangle } from 'lucide-react';

const initialNodes: Node[] = [
  { id: '1', type: 'attackNode', position: { x: 250, y: 0 }, data: { label: 'Public IP Range', type: 'Internet', riskScore: 0, criticality: 'Low' } },
  { id: '2', type: 'attackNode', position: { x: 250, y: 150 }, data: { label: 'VPN Gateway', type: 'External Access', riskScore: 7.5, criticality: 'High', technique: 'T1133', vulnCount: 2 } },
  { id: '3', type: 'attackNode', position: { x: 250, y: 300 }, data: { label: 'Legacy Web Server', type: 'Vulnerable Host', riskScore: 9.2, criticality: 'Critical', technique: 'T1190', vulnCount: 5 } },
  { id: '4', type: 'attackNode', position: { x: 100, y: 450 }, data: { label: 'Service Account', type: 'Compromised Account', riskScore: 6.8, criticality: 'Medium', technique: 'T1078', vulnCount: 0 } },
  { id: '5', type: 'attackNode', position: { x: 400, y: 450 }, data: { label: 'Admin Creds Dump', type: 'Compromised Account', riskScore: 8.5, criticality: 'High', technique: 'T1003', vulnCount: 0 } },
  { id: '6', type: 'attackNode', position: { x: 250, y: 600 }, data: { label: 'SMB Share Enum', type: 'Lateral Movement', riskScore: 7.0, criticality: 'High', technique: 'T1021', vulnCount: 1 } },
  { id: '7', type: 'attackNode', position: { x: 250, y: 750 }, data: { label: 'Domain Admin', type: 'Privileged Account', riskScore: 9.9, criticality: 'Critical', technique: 'T1078.002', vulnCount: 0 } },
  { id: '8', type: 'attackNode', position: { x: 250, y: 900 }, data: { label: 'Customer DB Cluster', type: 'Critical Asset', riskScore: 10.0, criticality: 'Critical', technique: 'T1040', vulnCount: 3 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Scan', animated: true, style: { stroke: '#4b5563' } },
  { id: 'e2-3', source: '2', target: '3', label: 'Exploit Public-Facing App', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, data: { isHighRisk: true } },
  { id: 'e3-4', source: '3', target: '4', label: 'Valid Accounts', animated: true, style: { stroke: '#4b5563' } },
  { id: 'e3-5', source: '3', target: '5', label: 'OS Credential Dumping', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, data: { isHighRisk: true } },
  { id: 'e4-6', source: '4', target: '6', label: 'Remote Services', animated: true, style: { stroke: '#4b5563' } },
  { id: 'e5-6', source: '5', target: '6', label: 'Pass the Hash', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, data: { isHighRisk: true } },
  { id: 'e6-7', source: '6', target: '7', label: 'Privilege Escalation', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, data: { isHighRisk: true } },
  { id: 'e7-8', source: '7', target: '8', label: 'Data Exfiltration', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, data: { isHighRisk: true } },
];

export default function AttackGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const nodeTypes = useMemo(() => ({ attackNode: AttackNode }), []);

  const onNodeClick = useCallback((_event: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="flex h-full w-full rounded-xl overflow-hidden border border-gray-800 bg-[#02050a] relative shadow-2xl">
      {/* Graph Area */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="dark"
        >
          <Background color="#1f2937" gap={16} />
          <Controls className="bg-quantum-panel border border-gray-700 fill-white text-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.data?.criticality === 'Critical') return '#ef4444';
              if (n.data?.criticality === 'High') return '#f97316';
              return '#00f0ff';
            }}
            className="bg-quantum-panel border border-gray-700"
            maskColor="rgba(0, 0, 0, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* Right Side Panel - Displays when a node is selected */}
      <div className={`w-96 bg-quantum-panel/95 backdrop-blur-xl border-l border-gray-800 p-6 flex flex-col transition-transform duration-300 absolute right-0 h-full z-10 ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNode && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-quantum-accent" size={28} />
              <h2 className="text-xl font-bold text-white tracking-wide">Path Analytics</h2>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Asset Info */}
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <h3 className="text-xs uppercase text-gray-500 font-bold mb-1">Target Asset</h3>
                <p className="text-lg font-semibold text-white">{selectedNode.data.label}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">{selectedNode.data.type}</span>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs text-gray-400">Total Risk</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{selectedNode.data.riskScore}/10</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-quantum-accent" />
                    <span className="text-xs text-gray-400">Vulns</span>
                  </div>
                  <p className="text-2xl font-bold text-quantum-accent">{selectedNode.data.vulnCount ?? 0}</p>
                </div>
              </div>

              {/* Attack Techniques */}
              {selectedNode.data.technique && (
                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Attack Techniques</h3>
                  <div className="bg-black/40 p-3 rounded-lg border border-gray-800 flex items-start gap-3">
                    <Target size={16} className="text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">{selectedNode.data.technique}</p>
                      <p className="text-xs text-gray-400 mt-1">Identified in active exploit chains via CISA KEV dataset.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Controls */}
              <div>
                <h3 className="text-xs uppercase text-gray-500 font-bold mb-2">QAOA Recommended Controls</h3>
                <div className="space-y-2">
                  <div className="bg-quantum-accent/10 p-3 rounded-lg border border-quantum-accent/30">
                    <p className="text-sm text-quantum-accent font-semibold">C1: Zero Trust Network Access</p>
                    <p className="text-xs text-gray-400 mt-1">Disrupts T1078, T1021</p>
                  </div>
                  <div className="bg-quantum-purple/10 p-3 rounded-lg border border-quantum-purple/30">
                    <p className="text-sm text-quantum-purple font-semibold">C4: Enhanced EDR Profiling</p>
                    <p className="text-xs text-gray-400 mt-1">Disrupts T1003, T1040</p>
                  </div>
                </div>
              </div>
              
            </div>
            
            <button className="mt-6 w-full py-3 bg-quantum-accent text-black font-bold rounded-lg hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              Isolate Node
            </button>
          </>
        )}
      </div>
    </div>
  );
}
