import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AlertCircle, Lock, Mail, ArrowRight, Loader2, User, Building2, Briefcase } from 'lucide-react';

const DEMO_CREDENTIALS = [
  {
    label: 'Water Supply & Sewerage Board',
    email: 'ops@waterboard.gov',
    password: 'password123',
    tag: 'ADMIN',
    color: 'from-blue-500 to-cyan-500',
    icon: '💧',
  },
  {
    label: 'Telecom Infrastructure Corp',
    email: 'build@telecominfra.com',
    password: 'password123',
    tag: 'PLANNER',
    color: 'from-violet-500 to-purple-600',
    icon: '📡',
  },
  {
    label: 'Public Works Department',
    email: 'roads@pwd.gov',
    password: 'password123',
    tag: 'PLANNER',
    color: 'from-amber-500 to-orange-500',
    icon: '🛣️',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register, token, isLoading, error, clearError } = useAuthStore();

  const [isLoginView, setIsLoginView] = useState(true);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyType, setAgencyType] = useState('MUNICIPAL');

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      await login(email, password);
    } else {
      await register({ email, password, name, agencyName, agencyType });
    }
  };

  const handleDemoLogin = async (cred: typeof DEMO_CREDENTIALS[0]) => {
    clearError();
    setIsLoginView(true);
    await login(cred.email, cred.password);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      
      {/* Background grid decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-stretch">

        {/* Left panel — Branding */}
        <div className="lg:w-1/2 flex flex-col justify-between p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-sm">US</span>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">Urban Sync</p>
                <p className="text-blue-400 text-xs font-medium">Right-of-Way Intelligence</p>
              </div>
            </div>

            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Coordinate the city beneath the city.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Multi-agency infrastructure planning with 4D spatial clash detection,
              fiscal tracking, and dependency orchestration.
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '4D', label: 'Clash Engine' },
              { value: '3', label: 'Live Agencies' },
              { value: 'PostGIS', label: 'Spatial DB' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-2xl font-black text-blue-400">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — Login form */}
        <div className="lg:w-1/2 flex flex-col gap-6">

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  {isLoginView ? 'Agency Sign In' : 'Register Agency'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isLoginView 
                    ? "Your session is scoped to your agency's project sandbox."
                    : "Create a new sandbox for your organization."}
                </p>
              </div>
              <button 
                onClick={toggleView}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isLoginView ? 'Create Account' : 'Sign In instead'}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLoginView && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); clearError(); }}
                        placeholder="Jane Doe"
                        required={!isLoginView}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Agency / Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="agencyName"
                        type="text"
                        value={agencyName}
                        onChange={e => { setAgencyName(e.target.value); clearError(); }}
                        placeholder="City Department of Transport"
                        required={!isLoginView}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Agency Type
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        id="agencyType"
                        value={agencyType}
                        onChange={e => { setAgencyType(e.target.value); clearError(); }}
                        required={!isLoginView}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="MUNICIPAL">Municipal / Government</option>
                        <option value="PUBLIC_UTILITY">Public Utility (Water/Power)</option>
                        <option value="PRIVATE_TELECOM">Private Telecom / Fiber</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder={isLoginView ? "ops@waterboard.gov" : "you@agency.gov"}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> {isLoginView ? 'Authenticating…' : 'Creating Account…'}</>
                ) : (
                  <>{isLoginView ? 'Sign In' : 'Create Sandbox'} <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          {isLoginView && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                🔑 Demo Agencies — click to sign in instantly
              </p>
              <div className="space-y-3">
                {DEMO_CREDENTIALS.map(cred => (
                  <button
                    key={cred.email}
                    id={`demo-${cred.email}`}
                    onClick={() => handleDemoLogin(cred)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center text-lg shrink-0 shadow-md`}>
                      {cred.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{cred.label}</p>
                      <p className="text-slate-400 text-xs truncate">{cred.email}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                      {cred.tag}
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
