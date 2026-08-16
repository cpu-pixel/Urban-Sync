import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Info, Map as MapIcon, GitMerge, AlertTriangle, 
  Calendar, CheckCircle2, Building2, Wallet, HardHat 
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

type Tab = 'overview' | 'map' | 'timeline' | 'conflicts';

export default function ProjectDetails() {
  const { id } = useParams();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Find current project
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link to="/dashboard" className="text-brand-primary hover:underline mt-2">Return to Dashboard</Link>
      </div>
    );
  }

  // Calculate dependencies based on the store relationships
  const predecessors = projects.filter(p => project.predecessors.includes(p.id));
  const successors = projects.filter(p => p.predecessors.includes(project.id));

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(dateStr + 'T00:00:00'));
  const percentSpent = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      {/* Header Section */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Mission Control
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wide">
                {project.layer} | {project.layerName}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5
                ${project.status === 'Clash Detected' ? 'text-red-700 bg-red-100 border-red-200' : 
                  project.status === 'In Progress' ? 'text-blue-700 bg-blue-100 border-blue-200' : 
                  'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {project.status === 'Clash Detected' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.title}</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Building2 size={16} /> {project.agency}  •  ID: {project.id}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold shadow-sm transition-all">
              Edit Project
            </button>
            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all">
              Request Approval
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: 'overview', icon: Info, label: 'Overview & Scope', badge: 0 },
            { id: 'map', icon: MapIcon, label: 'GIS & Right-of-Way', badge: 0 },
            { id: 'timeline', icon: GitMerge, label: 'Dependencies', badge: 0 },
            { id: 'conflicts', icon: AlertTriangle, label: 'Conflict Log', badge: project.status === 'Clash Detected' ? 1 : 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Wallet size={20} className="text-slate-400" /> Financials
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Total Budget</span>
                    <span className="font-bold text-slate-800">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-500">Spent to Date</span>
                    <span className="font-bold text-slate-800">{formatCurrency(project.spent)} ({percentSpent}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${percentSpent}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-slate-400" /> Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Start Date</p>
                    <p className="font-bold text-slate-800">{formatDate(project.startDate)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">End Date</p>
                    <p className="font-bold text-slate-800">{formatDate(project.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HardHat size={20} className="text-slate-400" /> Scope & Execution
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                This project involves utility enhancements for the designated corridor, adhering to layer {project.layer} specifications. All ground cuts must be backfilled to municipal standard 42-B before surface layer handover.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contractor:</span>
                  <span className="font-medium text-slate-800">Apex Infrastructure LLC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clearance Status:</span>
                  <span className="font-medium text-emerald-600">Environmental Approved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ward/Zone:</span>
                  <span className="font-medium text-slate-800">Downtown West (Zone 4)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP PLACEHOLDER TAB */}
        {activeTab === 'map' && (
          <div className="h-full min-h-[400px] bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <MapIcon size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-700">GIS Engine Not Yet Connected</h3>
            <p className="mt-2 text-sm max-w-md text-center">
              The 4D Mapbox integration will render here, displaying the spatial polygon for {project.id} alongside its required utility right-of-way buffer.
            </p>
          </div>
        )}

        {/* DEPENDENCIES TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Upstream Predecessors (Must complete before)</h3>
              {predecessors.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No prerequisites. This project can start immediately.</p>
              ) : (
                <div className="grid gap-3">
                  {predecessors.map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-brand-primary transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{p.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.id} • {p.layer} • Ends {formatDate(p.endDate)}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">View</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Downstream Successors (Blocked by this project)</h3>
              {successors.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No projects are dependent on this work.</p>
              ) : (
                <div className="grid gap-3">
                  {successors.map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-brand-primary transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{p.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.id} • {p.layer} • Starts {formatDate(p.startDate)}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">View</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONFLICT LOG TAB */}
        {activeTab === 'conflicts' && (
          <div>
            {project.status === 'Clash Detected' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full shrink-0">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">Spatial-Temporal Overlap Detected</h3>
                    <p className="text-red-800 text-sm mb-4">
                      The execution window for this project overlaps with an active prerequisite. Trenching cannot begin until the underlying deep subsurface layer is certified and backfilled.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Automated Resolution Suggestion</h4>
                      <p className="text-sm text-slate-700 mb-3">
                        Shift start date from <strong>{formatDate(project.startDate)}</strong> to <strong>{formatDate(predecessors[0]?.endDate || '2027-03-16')}</strong> to clear the conflict block.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                        Apply Proposed Schedule Shift
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800">No Active Conflicts</h3>
                <p className="text-sm mt-1">This project's schedule and spatial polygon are clear.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}