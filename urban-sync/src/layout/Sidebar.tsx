import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map, CalendarClock, Settings, 
  GitMerge, HardHat, LogOut 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

// Map org type to a short label + color
const ORG_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  MUNICIPAL: { label: 'Municipal', color: 'bg-amber-500/20 text-amber-400' },
  PUBLIC_UTILITY: { label: 'Public Utility', color: 'bg-blue-500/20 text-blue-400' },
  PRIVATE_TELECOM: { label: 'Private Telecom', color: 'bg-violet-500/20 text-violet-400' },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'GIS 4D Map', path: '/map-view', icon: Map },
    { name: 'Master Gantt', path: '/gantt-view', icon: CalendarClock },
    { name: 'Opportunities', path: '/opportunities', icon: GitMerge },
    { name: 'Projects', path: '/projects', icon: HardHat },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const orgConfig = user?.organization
    ? (ORG_TYPE_CONFIG[user.organization.type] ?? { label: user.organization.type, color: 'bg-slate-500/20 text-slate-400' })
    : null;

  return (
    <aside className="w-64 bg-brand-dark text-slate-300 flex flex-col h-full shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">US</span>
          </div>
          Urban Sync
        </div>
      </div>

      {/* Agency Context Banner */}
      {user && (
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Sandbox</p>
          <p className="text-white text-sm font-bold truncate leading-tight">{user.organization.name}</p>
          {orgConfig && (
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${orgConfig.color}`}>
              {orgConfig.label}
            </span>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-accent' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Card + Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Loading…'}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.toLowerCase() ?? ''}</p>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}