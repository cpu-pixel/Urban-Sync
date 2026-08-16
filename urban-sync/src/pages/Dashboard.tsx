import KPICards from '../components/KPICards';
import { Link } from 'react-router-dom';
import AlertBanner from '../components/AlertBanner';
import ProjectGrid from '../components/ProjectGrid'; // <-- Import added

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mission Control</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor right-of-way utilization, financial outlays, and spatio-temporal conflicts.
        </p>
      </div>

      <AlertBanner />
      <KPICards />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Project Portfolio</h2>
          <Link to="/projects/new" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
          + New Project
        </Link>
      </div>

      {/* Render the Grid here */}
      <ProjectGrid />
    </div>
  );
}


// import KPICards from '../components/KPICards';
// import AlertBanner from '../components/AlertBanner';

// export default function Dashboard() {
//   return (
//     <div className="flex flex-col h-full max-w-7xl mx-auto">
//       {/* Page Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mission Control</h1>
//         <p className="text-slate-500 text-sm mt-1">
//           Monitor right-of-way utilization, financial outlays, and spatio-temporal conflicts.
//         </p>
//       </div>

//       {/* Real-time Alerts */}
//       <AlertBanner />

//       {/* Executive KPI Summaries */}
//       <KPICards />

//       {/* Section Header for the Grid we will build next */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-bold text-slate-800">Project Portfolio</h2>
//         <div className="flex gap-2">
//           {/* Placeholder for filter buttons */}
//           <button className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">Filter</button>
//           <button className="px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-blue-700">New Project</button>
//         </div>
//       </div>

//       {/* Placeholder Grid Area */}
//       <div className="flex-1 bg-white border border-slate-200 rounded-xl border-dashed flex items-center justify-center min-h-[300px]">
//         <p className="text-slate-400 font-medium">Project Tile Grid will be rendered here...</p>
//       </div>
//     </div>
//   );
// }