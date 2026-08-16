import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, Download, Eye, Edit, MoreVertical, 
  AlertTriangle, CheckCircle2, Clock, Lock, Building2
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import type { ProjectStatus, LayerLevel } from '../store/useProjectStore';


export default function Projects() {
  const { projects } = useProjectStore();
  
  // Local state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [layerFilter, setLayerFilter] = useState<LayerLevel | 'All'>('All');

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));

  // Filter Logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesLayer = layerFilter === 'All' || project.layer === layerFilter;
    
    return matchesSearch && matchesStatus && matchesLayer;
  });

  // Status Badge Component
  const StatusBadge = ({ status }: { status: ProjectStatus }) => {
    const config = {
      'In Progress': { color: 'text-blue-700 bg-blue-100 border-blue-200', icon: Clock },
      'Planned': { color: 'text-slate-700 bg-slate-100 border-slate-200', icon: CheckCircle2 },
      'Clash Detected': { color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle },
      'Locked': { color: 'text-amber-700 bg-amber-100 border-amber-200', icon: Lock },
    };
    const Icon = config[status].icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config[status].color}`}>
        <Icon size={12} strokeWidth={3} />
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Master Directory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage, search, and export all infrastructure projects across municipal agencies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/projects/new" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      {/* Action Bar (Search & Filters) */}
      <div className="bg-white p-4 rounded-t-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border-b-0">
        
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, title, or agency..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 shrink-0">
            <Filter size={16} />
            <span className="text-sm font-semibold hidden sm:inline">Filters</span>
          </div>
          
          <select 
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value as LayerLevel | 'All')}
            className="w-full md:w-auto text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
          >
            <option value="All">All Layers</option>
            <option value="L1">L1 - Deep Sewer/Storm</option>
            <option value="L2">L2 - Water/Gas</option>
            <option value="L3">L3 - Power/Fiber</option>
            <option value="L4">L4 - Surface Paving</option>
            <option value="L5">L5 - Above Ground</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
            className="w-full md:w-auto text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Clash Detected">Clash Detected</option>
            <option value="Locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Project ID & Title</th>
                <th className="px-6 py-4 font-bold">Agency</th>
                <th className="px-6 py-4 font-bold">Utility Layer</th>
                <th className="px-6 py-4 font-bold">Timeline</th>
                <th className="px-6 py-4 font-bold text-right">Budget</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-lg font-semibold text-slate-700">No projects found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{project.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{project.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 size={16} className="text-slate-400" />
                        {project.agency}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold bg-slate-800 text-white">
                        {project.layer}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      <p>{formatDate(project.startDate)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">to {formatDate(project.endDate)}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Edit Project"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-700">{filteredProjects.length}</span> of <span className="font-bold text-slate-700">{projects.length}</span> total projects
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 bg-white text-slate-400 rounded-md text-sm cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-md text-sm transition-colors">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}