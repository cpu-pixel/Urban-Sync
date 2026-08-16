import { Search, Bell, Calendar, Building2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Topbar() {
  const { fiscalYear } = useProjectStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Left side: Search */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
          <input 
            type="text" 
            placeholder="Search projects, agencies, or coordinates (Cmd+K)" 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right side: Tools & Alerts */}
      <div className="flex items-center gap-4">
        {/* Org pill — shows which sandbox is active */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
            <Building2 size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700 truncate max-w-[180px]">
              {user.organization.name}
            </span>
          </div>
        )}

        {/* Fiscal Year Pill */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <Calendar size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{fiscalYear}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={20} />
          {/* Unread badge */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}