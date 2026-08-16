import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import type { LayerLevel, ProjectStatus } from '../store/useProjectStore';
import ProjectTile from './ProjectTile';

export default function ProjectGrid() {
  const { projects } = useProjectStore();
  const [filterLayer, setFilterLayer] = useState<LayerLevel | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'All'>('All');

  // Filter logic
  const filteredProjects = projects.filter(project => {
    const matchesLayer = filterLayer === 'All' || project.layer === filterLayer;
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    return matchesLayer && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Utility Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          
          <select 
            value={filterLayer}
            onChange={(e) => setFilterLayer(e.target.value as LayerLevel | 'All')}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
          >
            <option value="All">All Utility Layers</option>
            <option value="L1">L1 - Deep Subsurface</option>
            <option value="L2">L2 - Shallow Subsurface</option>
            <option value="L3">L3 - Dry Utilities</option>
            <option value="L4">L4 - Surface Paving</option>
            <option value="L5">L5 - Above Ground</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'All')}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Clash Detected">Clash Detected</option>
            <option value="Locked">Locked (Moratorium)</option>
          </select>
        </div>

        <button className="flex items-center gap-2 text-sm text-brand-primary font-medium px-4 py-1.5 hover:bg-blue-50 rounded-md transition-colors">
          <SlidersHorizontal size={16} />
          Advanced Sort
        </button>
      </div>

      {/* Responsive Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
          <SlidersHorizontal size={40} className="mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-slate-700">No projects found</h3>
          <p className="text-sm mt-1">Adjust your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectTile key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}