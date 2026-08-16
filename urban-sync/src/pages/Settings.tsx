import { useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldAlert, Bell, Building2, 
  Save, CheckCircle2, Lock, GitMerge, AlertTriangle 
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'rules' | 'notifications' | 'agency'>('rules');
  const [isSaved, setIsSaved] = useState(false);

  // Form State for Rules Engine
  const [moratoriumYears, setMoratoriumYears] = useState(3);
  const [strictLockout, setStrictLockout] = useState(true);
  const [jointTrenchWindow, setJointTrenchWindow] = useState(6);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-slate-700" size={32} />
          Platform Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure rule engine parameters, agency integrations, and system alerts.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Settings Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'rules' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert size={18} /> Rules & Moratoriums
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'notifications' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bell size={18} /> Notifications & Alerts
            </button>
            <button
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'agency' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 size={18} /> Agency Integration
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto">
          
          {/* TAB: RULES ENGINE */}
          {activeTab === 'rules' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <Lock className="text-amber-500" /> Surface Cut Moratorium
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Configure the lockout period applied to a road segment after L4 (Surface Paving) is completed.
                </p>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700">Lockout Duration (Years)</span>
                      <span className="text-brand-primary font-black text-lg">{moratoriumYears} Years</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" max="7" 
                      value={moratoriumYears}
                      onChange={(e) => setMoratoriumYears(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                      <span>1 Year</span>
                      <span>7 Years</span>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={strictLockout}
                      onChange={(e) => setStrictLockout(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                    />
                    <div>
                      <p className="font-bold text-slate-700">Strict Enforcement Mode</p>
                      <p className="text-sm text-slate-500">If enabled, the system will actively block new project submissions on locked coordinates without an executive override.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <GitMerge className="text-purple-500" /> Joint-Trenching Engine
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Configure the temporal threshold for auto-flagging co-location opportunities.
                </p>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-2">Proximity Window (Months)</label>
                  <select 
                    value={jointTrenchWindow}
                    onChange={(e) => setJointTrenchWindow(Number(e.target.value))}
                    className="w-full md:w-1/2 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months (Recommended)</option>
                    <option value={12}>12 Months</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-2">
                    The clash engine will flag an opportunity if two independent agencies schedule underground work within {jointTrenchWindow} months of each other.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                <Bell className="text-brand-primary" /> Alert Preferences
              </h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Critical Spatial Clashes', desc: 'Immediate alert when a project physically overlaps with a hard predecessor in the same time window.', icon: AlertTriangle, color: 'text-red-500' },
                  { title: 'Moratorium Violations', desc: 'Warn when an agency attempts to schedule a cut during a pavement lockout period.', icon: Lock, color: 'text-amber-500' },
                  { title: 'Co-Permit Approvals', desc: 'Notify when partner agencies accept a joint-trenching proposal.', icon: CheckCircle2, color: 'text-emerald-500' }
                ].map((alert, idx) => (
                  <label key={idx} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="mt-1.5 w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary" />
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        <alert.icon size={16} className={alert.color} /> {alert.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{alert.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                isSaved 
                  ? 'bg-emerald-100 text-emerald-700 pointer-events-none' 
                  : 'bg-brand-primary text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isSaved ? (
                <><CheckCircle2 size={18} /> Settings Applied</>
              ) : (
                <><Save size={18} /> Save Configuration</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}