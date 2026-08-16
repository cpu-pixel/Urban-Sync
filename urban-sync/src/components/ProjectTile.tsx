import type React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, Lock, Clock } from 'lucide-react';
import type { Project } from '../store/useProjectStore';

export default function ProjectTile({ project }: { project: Project }) {
  const percentSpent = Math.round((project.spent / project.budget) * 100);

  // Status visual mappings
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    'In Progress': { color: 'text-blue-700 bg-blue-100 border-blue-200', icon: Clock },
    'Planned': { color: 'text-slate-700 bg-slate-100 border-slate-200', icon: Calendar },
    'Clash Detected': { color: 'text-red-700 bg-red-100 border-red-200', icon: AlertCircle },
    'Locked': { color: 'text-amber-700 bg-amber-100 border-amber-200', icon: Lock },
    'Draft': { color: 'text-purple-700 bg-purple-100 border-purple-200', icon: Calendar },
    'Completed': { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  };
  
  const config = statusConfig[project.status] ?? statusConfig['Planned'];
  const StatusIcon = config.icon;

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(dateStr + 'T00:00:00'));

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Header Area */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-white tracking-wide">
            {project.layer} <span className="font-normal text-slate-300">|</span> {project.layerName}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            <StatusIcon size={12} strokeWidth={3} />
            {project.status}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-brand-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{project.id} • {project.agency}</p>
      </div>

      {/* Body Area: Stats & Schedule */}
      <div className="p-4 bg-slate-50 flex-1 grid gap-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">Budget: {formatCurrency(project.budget)}</span>
            <span className="text-slate-500">{percentSpent}% spent</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${percentSpent}%` }}></div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={16} className="text-slate-400" />
          <span>{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
        </div>
      </div>

      {/* Footer Area: Conflict Status & Action */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          {project.status === 'Clash Detected' ? (
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> Critical Overlap
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={14} /> Clear / Approved
            </span>
          )}
        </div>
        <Link 
          to={`/projects/${project.id}`} 
          className="text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}