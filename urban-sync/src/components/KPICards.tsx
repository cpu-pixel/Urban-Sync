import { Activity, DollarSign, Zap, Combine } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export default function KPICards() {
  const { projects } = useProjectStore();

  // Dynamic Calculations based on project data
  const activeCount = projects.filter(p => p.status === 'In Progress').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const clashCount = projects.filter(p => p.status === 'Clash Detected').length;
  
  // Format budget into millions (e.g., $7.15M)
  const formatMillions = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      notation: "compact",
      compactDisplay: "short"
    }).format(value);
  };

  const kpis = [
    { 
      title: 'Active Projects', 
      value: activeCount.toString(), 
      subtitle: `${projects.length} total across all agencies`,
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      title: 'Total Capital Outlay', 
      value: formatMillions(totalBudget), 
      subtitle: 'For selected Fiscal Year',
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      title: 'Active Conflicts', 
      value: clashCount.toString(), 
      subtitle: clashCount > 0 ? 'Requires immediate action' : 'All clear',
      icon: Zap, 
      color: clashCount > 0 ? 'text-red-600' : 'text-slate-400', 
      bg: clashCount > 0 ? 'bg-red-100' : 'bg-slate-100' 
    },
    { 
      title: 'Est. Co-Dig Savings', 
      value: '$1.2M', // Hardcoded until we build the Opportunities module
      subtitle: 'Via combined trenching',
      icon: Combine, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
              <Icon size={26} strokeWidth={2.5} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider truncate">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{kpi.value}</h3>
              <p className="text-xs text-slate-400 mt-1 truncate">{kpi.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}