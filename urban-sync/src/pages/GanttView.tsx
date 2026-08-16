import { useMemo, useState } from 'react';
import { CalendarClock, Filter, AlertTriangle, ArrowRight } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import type { Project } from '../store/useProjectStore';
import { Link } from 'react-router-dom';

export default function GanttView() {
  const { projects } = useProjectStore();
  const [sortBy, setSortBy] = useState<'startDate' | 'layer'>('startDate');

  // --- DATE MATH ENGINE ---
  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    const dates = projects.flatMap(p => [new Date(p.startDate).getTime(), new Date(p.endDate).getTime()]);
    
    // Pad timeline by 1 month on start and end for breathing room
    const min = new Date(Math.min(...dates));
    min.setMonth(min.getMonth() - 1);
    
    const max = new Date(Math.max(...dates));
    max.setMonth(max.getMonth() + 2); // +2 to ensure the last month renders fully

    const total = (max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24);

    // Generate array of month labels
    const monthsArr = [];
    const curr = new Date(min);
    while (curr <= max) {
      monthsArr.push(new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(curr));
      curr.setMonth(curr.getMonth() + 1);
    }

    return { minDate: min, maxDate: max, totalDays: total, months: monthsArr };
  }, [projects]);

  // Helper to calculate CSS left and width percentages
  const getBarStyles = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    
    const leftOffsetDays = (s - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (e - s) / (1000 * 60 * 60 * 24);
    
    return {
      left: `${(leftOffsetDays / totalDays) * 100}%`,
      width: `${(durationDays / totalDays) * 100}%`
    };
  };

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    return a.layer.localeCompare(b.layer);
  });

  // Today's line indicator (Simulated as Aug 15, 2026 based on system time)
  const today = new Date('2026-08-15');
  const todayOffset = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarClock size={24} className="text-brand-primary" />
          <h2 className="text-xl font-bold text-slate-800">Master Schedule & Dependencies</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Filter size={16} />
            <span>Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'startDate' | 'layer')}
              className="bg-transparent font-semibold outline-none cursor-pointer"
            >
              <option value="startDate">Start Date</option>
              <option value="layer">Utility Layer (L1-L5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gantt Container */}
      <div className="flex flex-1 overflow-auto relative">
        
        {/* Left Column: Project Details */}
        <div className="w-80 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col relative z-10 sticky left-0">
          <div className="h-12 border-b border-slate-200 flex items-center px-4 bg-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wide">
            Project Scope & Agency
          </div>
          
          <div className="flex-1 overflow-hidden">
            {sortedProjects.map((project) => (
              <div key={`info-${project.id}`} className="h-20 border-b border-slate-200 px-4 py-3 flex flex-col justify-center bg-white group hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded">
                    {project.layer}
                  </span>
                  {project.status === 'Clash Detected' && <AlertTriangle size={14} className="text-red-500" />}
                </div>
                <Link to={`/projects/${project.id}`} className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-primary">
                  {project.title}
                </Link>
                <p className="text-xs text-slate-500 truncate">{project.agency}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Timeline Grid */}
        <div className="flex-1 min-w-[800px] relative overflow-hidden flex flex-col">
          
          {/* Months Header row */}
          <div className="h-12 border-b border-slate-200 flex relative bg-slate-100">
            {months.map((m, i) => (
              <div 
                key={m} 
                className="flex-1 border-r border-slate-200 border-dashed flex items-center px-2 text-xs font-bold text-slate-500 uppercase"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Timeline Bars Area */}
          <div className="flex-1 relative bg-white">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {months.map((m, i) => (
                <div key={`grid-${i}`} className="flex-1 border-r border-slate-200 border-dashed h-full" />
              ))}
            </div>

            {/* "Today" Vertical Marker */}
            {todayOffset > 0 && todayOffset < 100 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-0 pointer-events-none"
                style={{ left: `${todayOffset}%` }}
              >
                <div className="bg-amber-400 text-white text-[10px] font-bold px-1 py-0.5 rounded absolute -top-5 -translate-x-1/2 whitespace-nowrap">
                  Today
                </div>
              </div>
            )}

            {/* Project Bars */}
            <div className="absolute inset-0 flex flex-col z-10">
              {sortedProjects.map((project) => {
                const styles = getBarStyles(project.startDate, project.endDate);
                
                // Color coding based on status
                let barColor = 'bg-blue-500 border-blue-600';
                if (project.status === 'Clash Detected') barColor = 'bg-red-500 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                if (project.status === 'Locked') barColor = 'bg-slate-400 border-slate-500';
                
                return (
                  <div key={`bar-${project.id}`} className="h-20 border-b border-slate-200 relative w-full group">
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md border ${barColor} flex items-center px-3 cursor-pointer hover:brightness-110 transition-all`}
                      style={{ left: styles.left, width: styles.width }}
                    >
                      {/* Bar Content */}
                      <span className="text-xs font-bold text-white truncate drop-shadow-sm">
                        {project.title}
                      </span>
                      
                      {/* Dependency Arrow Logic (Visual only for preceding projects) */}
                      {project.predecessors.length > 0 && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-400">
                          <ArrowRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}