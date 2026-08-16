import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Map, 
  Calendar, Layers, Building2, Wallet, HardHat, MousePointer
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import type { LayerLevel, Project } from '../store/useProjectStore';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Utility Class', icon: Layers },
  { id: 3, title: 'Schedule', icon: Calendar },
  { id: 4, title: 'Right-of-Way', icon: Map },
  { id: 5, title: 'Review', icon: CheckCircle2 },
];

export default function ProjectWizard() {
  const navigate = useNavigate();
  const { addProject } = useProjectStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    agency: 'Water Supply Board',
    budget: '',
    layer: 'L1' as LayerLevel,
    layerName: 'Deep Sewer',
    startDate: '',
    endDate: '',
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    // Generate a mock ID and build the final project object
    const newId = `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const newProject: Project = {
      id: newId,
      title: formData.title,
      agency: formData.agency,
      budget: Number(formData.budget),
      spent: 0,
      layer: formData.layer,
      layerName: formData.layerName,
      status: 'Planned', // Defaults to planned
      startDate: formData.startDate,
      endDate: formData.endDate,
      predecessors: [],
      // Mock polygon for the demo
      geometry: {
        type: 'Polygon',
        coordinates: [[[-122.415, 37.776], [-122.413, 37.776], [-122.413, 37.779], [-122.415, 37.779], [-122.415, 37.776]]]
      }
    };

    addProject(newProject);
    navigate(`/projects/${newId}`); // Redirect to the newly created project's detail page
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full py-6">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Infrastructure Project</h1>
        <p className="text-slate-500 mt-2">Complete the ingestion wizard to register a new right-of-way cut.</p>
      </div>

      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full">
          <div 
            className="h-full bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                ${isActive ? 'border-brand-primary bg-brand-primary text-white shadow-md' : 
                  isCompleted ? 'border-brand-primary bg-white text-brand-primary' : 
                  'border-slate-300 bg-white text-slate-400'}`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs font-bold ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-8 overflow-y-auto">
        
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <HardHat className="text-brand-primary" /> Project Charter
            </h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Project Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Downtown Fiber Backbone" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Executing Agency</label>
                <select 
                  value={formData.agency}
                  onChange={e => setFormData({...formData, agency: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option>Water Supply Board</option>
                  <option>Telecom Infra</option>
                  <option>Public Works Dept</option>
                  <option>Municipal Council</option>
                  <option>Power Corp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Approved Budget (USD)</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    placeholder="2500000" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Utility Layer */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Layers className="text-brand-primary" /> Subsurface Hierarchy
            </h2>
            <p className="text-sm text-slate-500 mb-4">Select the depth tier for this project. The engine uses this to calculate precedence (L1 must finish before L3).</p>
            
            <div className="grid gap-3">
              {[
                { level: 'L1', name: 'Deep Sewer & Stormwater', desc: 'Lowest depth. Requires maximum excavation.' },
                { level: 'L2', name: 'Potable Water & Gas', desc: 'Shallow subsurface utilities.' },
                { level: 'L3', name: 'Dry Utilities (Power/Fiber)', desc: 'Trenches and conduit networks.' },
                { level: 'L4', name: 'Surface Paving', desc: 'Roadbase, asphalt, and sidewalks.' },
                { level: 'L5', name: 'Above Ground', desc: 'Streetlights, signage, and tree planting.' },
              ].map((tier) => (
                <button
                  key={tier.level}
                  onClick={() => setFormData({...formData, layer: tier.level as LayerLevel, layerName: tier.name})}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.layer === tier.level 
                      ? 'border-brand-primary bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${formData.layer === tier.level ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {tier.level}
                    </span>
                    <div>
                      <h4 className={`font-bold ${formData.layer === tier.level ? 'text-brand-primary' : 'text-slate-800'}`}>{tier.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tier.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Schedule */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Calendar className="text-brand-primary" /> Execution Window
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <strong>Note:</strong> If these dates overlap spatially with a higher-priority layer, the clash engine will automatically flag this project upon submission.
            </div>
          </div>
        )}

        {/* STEP 4: Right-of-Way GIS Map Placeholder */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Map className="text-brand-primary" /> Define Spatial Polygon
            </h2>
            <div className="flex-1 min-h-[300px] bg-slate-100 rounded-lg border-2 border-slate-300 relative overflow-hidden flex flex-col items-center justify-center">
              {/* Simulated Map UI */}
              <div className="absolute top-4 left-4 bg-white shadow-md rounded-md p-1 flex flex-col gap-1 z-10">
                <button className="p-2 bg-slate-100 text-brand-primary rounded hover:bg-slate-200"><MousePointer size={18} /></button>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded"><Layers size={18} /></button>
              </div>
              
              <Map size={48} className="text-slate-300 mb-4" />
              <p className="font-bold text-slate-500">Interactive Drawing Tool Active</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm text-center">
                (Click and drag to draw the project's bounding polygon. For this demo, a preset geo-coordinate will be applied automatically.)
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <CheckCircle2 className="text-brand-primary" /> Final Review
            </h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid gap-4">
              <div className="grid grid-cols-3 border-b border-slate-200 pb-4">
                <div className="col-span-1 text-sm font-bold text-slate-500">Project Title</div>
                <div className="col-span-2 font-bold text-slate-900">{formData.title || 'Untitled Project'}</div>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-4">
                <div className="col-span-1 text-sm font-bold text-slate-500">Agency & Budget</div>
                <div className="col-span-2 text-slate-800">{formData.agency} • ${Number(formData.budget).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-4">
                <div className="col-span-1 text-sm font-bold text-slate-500">Utility Layer</div>
                <div className="col-span-2 text-slate-800">
                  <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold mr-2">{formData.layer}</span>
                  {formData.layerName}
                </div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-1 text-sm font-bold text-slate-500">Timeline</div>
                <div className="col-span-2 text-slate-800">{formData.startDate || 'N/A'} to {formData.endDate || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
            currentStep === 1 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <ChevronLeft size={18} /> Back
        </button>

        {currentStep < STEPS.length ? (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition-all animate-pulse"
          >
            <CheckCircle2 size={18} /> Submit to Clash Engine
          </button>
        )}
      </div>

    </div>
  );
}