import { Handle, Position } from 'reactflow';
import { ShieldAlert, Cpu, Network, UserX, Database, Lock } from 'lucide-react';

const iconMap: Record<string, any> = {
  'Internet': Network,
  'External Access': Network,
  'Vulnerable Host': Cpu,
  'Compromised Account': UserX,
  'Lateral Movement': Network,
  'Privileged Account': Lock,
  'Critical Asset': Database,
};

export default function AttackNode({ data, selected }: any) {
  const Icon = iconMap[data.type] || ShieldAlert;

  return (
    <div className={`px-4 py-3 rounded-lg border backdrop-blur-md transition-all duration-300 min-w-[220px] ${
      selected 
        ? 'border-quantum-accent shadow-[0_0_20px_rgba(0,240,255,0.4)] bg-quantum-panel/95' 
        : 'border-gray-700 bg-quantum-panel/80'
    }`}>
      {/* Target handle for incoming edges */}
      {data.type !== 'Internet' && (
        <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-quantum-accent border-none" />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className={selected ? 'text-quantum-accent' : 'text-gray-400'} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{data.type}</span>
        </div>
        {data.riskScore > 0 && (
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            data.criticality === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
            data.criticality === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            Risk: {data.riskScore}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-white mb-2">{data.label}</h3>

      <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-gray-700/50">
        {data.technique && (
          <div className="text-[11px] text-quantum-accent flex items-center gap-1">
            <span className="opacity-70 text-gray-400">MITRE:</span> {data.technique}
          </div>
        )}
        {data.vulnCount !== undefined && (
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>Vulnerabilities:</span> 
            <span className="text-white">{data.vulnCount}</span>
          </div>
        )}
      </div>

      {/* Source handle for outgoing edges */}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-quantum-accent border-none" />
    </div>
  );
}
