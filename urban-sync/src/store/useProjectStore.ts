import { create } from 'zustand';
import { authHeaders, useAuthStore } from './useAuthStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

type LayerLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
type ProjectStatus = 'Draft' | 'Planned' | 'In Progress' | 'Locked' | 'Clash Detected' | 'Completed';

export interface Project {
  id: string;
  title: string;
  agency: string;
  layer: LayerLevel;
  layerName: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  predecessors: string[];
  geometry: {
    type: 'Polygon' | 'LineString' | 'Point';
    coordinates: any;
  } | null;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
}

interface ProjectStore {
  projects: Project[];
  alerts: Alert[];
  fiscalYear: string;
  setFiscalYear: (year: string) => void;
  addLiveAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  fetchProjects: () => Promise<void>; // <-- NEW API Call
  addProject: (project: Project) => Promise<void>; // <-- Update to async API call
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [], // Start empty!
  alerts: [],
  fiscalYear: 'FY 2026-27',
  
  setFiscalYear: (year) => set({ fiscalYear: year }),
  addLiveAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 3) })),
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  
  // Fetch from backend — token-scoped to user's org
  fetchProjects: async () => {
    try {
      const response = await fetch(`${API}/api/projects`, {
        headers: { ...authHeaders() },
      });
      if (response.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      set({ projects: data });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },

  // Post to backend — org is derived from the JWT server-side
  addProject: async (project) => {
    try {
      const response = await fetch(`${API}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(project),
      });

      if (response.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }

      // Refetch to get updated status (clash trigger may have fired)
      await useProjectStore.getState().fetchProjects();
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  },
}));










// import { create } from 'zustand';

// export type LayerLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
// export type ProjectStatus = 'Planned' | 'In Progress' | 'Locked' | 'Clash Detected';

// export interface Project {
//   id: string;
//   title: string;
//   agency: string;
//   layer: LayerLevel;
//   layerName: string;
//   budget: number;
//   spent: number;
//   status: ProjectStatus;
//   startDate: string;
//   endDate: string;
//   predecessors: string[];
//   // NEW: Spatial property using GeoJSON standards
//   geometry: {
//     type: 'Polygon' | 'LineString' | 'Point';
//     coordinates: any;
//   };
// }

// export interface Alert {
//   id: string;
//   type: 'warning' | 'critical' | 'info';
//   message: string;
//   timestamp: Date;
// }

// interface ProjectStore {
//   projects: Project[];
//   alerts: Alert[];
//   fiscalYear: string;
//   setFiscalYear: (year: string) => void;
//   addLiveAlert: (alert: Alert) => void;
//   removeAlert: (id: string) => void;
//   addProject: (project: Project) => void; // <-- NEW
// }

// // We will center our map around a generic downtown coordinate (e.g., San Francisco for demo)
// export const useProjectStore = create<ProjectStore>((set) => ({
//   projects: [
//     { 
//       id: 'PRJ-2026-089', title: 'North Corridor Trunk Main Upgrade', agency: 'Water Supply Board', 
//       layer: 'L1', layerName: 'Deep Sewer', budget: 4200000, spent: 1344000, 
//       status: 'In Progress', startDate: '2026-10-01', endDate: '2027-03-15', predecessors: [],
//       geometry: { type: 'LineString', coordinates: [[-122.414, 37.776], [-122.414, 37.780]] }
//     },
//     { 
//       // OVERLAPS SPATIALLY with the Sewer project above!
//       id: 'PRJ-2026-104', title: 'Downtown Fiber Lay', agency: 'Telecom Infra', 
//       layer: 'L3', layerName: 'Dry Utilities', budget: 850000, spent: 0, 
//       status: 'Clash Detected', startDate: '2026-11-01', endDate: '2027-01-15', predecessors: ['PRJ-2026-089'],
//       geometry: { type: 'LineString', coordinates: [[-122.415, 37.778], [-122.412, 37.778]] } 
//     },
//     { 
//       id: 'PRJ-2026-112', title: 'Main Ave Resurfacing', agency: 'Public Works Dept', 
//       layer: 'L4', layerName: 'Surface Paving', budget: 2100000, spent: 0, 
//       status: 'Planned', startDate: '2027-04-01', endDate: '2027-06-30', predecessors: ['PRJ-2026-104'],
//       geometry: { type: 'Polygon', coordinates: [[[-122.416, 37.775], [-122.412, 37.775], [-122.412, 37.781], [-122.416, 37.781], [-122.416, 37.775]]] }
//     },
//     { 
//       id: 'PRJ-2026-045', title: 'Eastside Streetlights', agency: 'Municipal Council', 
//       layer: 'L5', layerName: 'Above Ground', budget: 350000, spent: 350000, 
//       status: 'Locked', startDate: '2025-05-01', endDate: '2025-08-01', predecessors: [],
//       geometry: { type: 'Point', coordinates: [-122.410, 37.779] }
//     },
//   ],
//   alerts: [],
//   fiscalYear: 'FY 2026-27',
//   setFiscalYear: (year) => set({ fiscalYear: year }),
//   addLiveAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 3) })),
//   removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
//   addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
// }));




// import { create } from 'zustand';

// export type LayerLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
// export type ProjectStatus = 'Planned' | 'In Progress' | 'Locked' | 'Clash Detected';

// export interface Project {
//   id: string;
//   title: string;
//   agency: string;
//   layer: LayerLevel;
//   layerName: string;
//   budget: number;
//   spent: number;
//   status: ProjectStatus;
//   startDate: string;
//   endDate: string;
//   predecessors: string[];
// }

// export interface Alert {
//   id: string;
//   type: 'warning' | 'critical' | 'info';
//   message: string;
//   timestamp: Date;
// }

// interface ProjectStore {
//   projects: Project[];
//   alerts: Alert[];
//   fiscalYear: string;
//   setFiscalYear: (year: string) => void;
//   addLiveAlert: (alert: Alert) => void;
//   removeAlert: (id: string) => void;
// }

// export const useProjectStore = create<ProjectStore>((set) => ({
//   projects: [
//     { 
//       id: 'PRJ-2026-089', title: 'North Corridor Trunk Main Upgrade', agency: 'Water Supply Board', 
//       layer: 'L1', layerName: 'Deep Sewer', budget: 4200000, spent: 1344000, 
//       status: 'In Progress', startDate: '2026-10-01', endDate: '2027-03-15', predecessors: [] 
//     },
//     { 
//       id: 'PRJ-2026-104', title: 'Downtown Fiber Lay', agency: 'Telecom Infra', 
//       layer: 'L3', layerName: 'Dry Utilities', budget: 850000, spent: 0, 
//       status: 'Clash Detected', startDate: '2026-11-01', endDate: '2027-01-15', predecessors: ['PRJ-2026-089'] 
//     },
//     { 
//       id: 'PRJ-2026-112', title: 'Main Ave Resurfacing', agency: 'Public Works Dept', 
//       layer: 'L4', layerName: 'Surface Paving', budget: 2100000, spent: 0, 
//       status: 'Planned', startDate: '2027-04-01', endDate: '2027-06-30', predecessors: ['PRJ-2026-104'] 
//     },
//     { 
//       id: 'PRJ-2026-045', title: 'Eastside Streetlights', agency: 'Municipal Council', 
//       layer: 'L5', layerName: 'Above Ground', budget: 350000, spent: 350000, 
//       status: 'Locked', startDate: '2025-05-01', endDate: '2025-08-01', predecessors: [] 
//     },
//   ],
//   alerts: [
//     { id: 'initial-1', type: 'critical', message: 'Conflict Detected: Fiber Optics Line (Telecom) scheduled on Main Arterial Ave overlaps with Active Sewer work.', timestamp: new Date() }
//   ],
//   fiscalYear: 'FY 2026-27',
//   setFiscalYear: (year) => set({ fiscalYear: year }),
//   addLiveAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 3) })),
//   removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
// }));




// import { create } from 'zustand';

// export interface Project {
//   id: string;
//   title: string;
//   agency: string;
//   layer: string;
//   budget: number;
//   status: 'Planned' | 'In Progress' | 'Locked' | 'Clash Detected';
// }

// export interface Alert {
//   id: string;
//   type: 'warning' | 'critical' | 'info';
//   message: string;
//   timestamp: Date;
// }

// interface ProjectStore {
//   projects: Project[];
//   alerts: Alert[];
//   fiscalYear: string;
//   setFiscalYear: (year: string) => void;
//   addLiveAlert: (alert: Alert) => void;
//   removeAlert: (id: string) => void;
// }

// export const useProjectStore = create<ProjectStore>((set) => ({
//   projects: [
//     { id: 'PRJ-001', title: 'North Corridor Sewer', agency: 'Water Board', layer: 'L1', budget: 4200000, status: 'In Progress' },
//     { id: 'PRJ-002', title: 'Downtown Fiber Lay', agency: 'Telecom', layer: 'L3', budget: 850000, status: 'Clash Detected' },
//     { id: 'PRJ-003', title: 'Main Ave Resurfacing', agency: 'Public Works', layer: 'L4', budget: 2100000, status: 'Planned' },
//   ],
//   alerts: [
//     { 
//       id: 'initial-1', 
//       type: 'critical', 
//       message: 'Conflict Detected: Fiber Optics Line (Telecom) scheduled on Main Arterial Ave 2 weeks after Road Resurfacing (PWD).', 
//       timestamp: new Date() 
//     }
//   ],
//   fiscalYear: 'FY 2026-27',
//   setFiscalYear: (year) => set({ fiscalYear: year }),
//   addLiveAlert: (alert) => set((state) => ({ 
//     // Add new alert to the top, keep only the latest 3
//     alerts: [alert, ...state.alerts].slice(0, 3) 
//   })),
//   removeAlert: (id) => set((state) => ({ 
//     alerts: state.alerts.filter((a) => a.id !== id) 
//   })),
// }));



// import { create } from 'zustand';

// interface Project {
//   id: string;
//   title: string;
//   agency: string;
//   layer: string;
//   budget: number;
//   status: 'Planned' | 'In Progress' | 'Locked' | 'Clash Detected';
// }

// interface ProjectStore {
//   projects: Project[];
//   fiscalYear: string;
//   setFiscalYear: (year: string) => void;
// }

// export const useProjectStore = create<ProjectStore>((set) => ({
//   projects: [
//     { id: 'PRJ-001', title: 'North Corridor Sewer', agency: 'Water Board', layer: 'L1', budget: 4200000, status: 'In Progress' },
//     { id: 'PRJ-002', title: 'Downtown Fiber Lay', agency: 'Telecom', layer: 'L3', budget: 850000, status: 'Clash Detected' },
//     { id: 'PRJ-003', title: 'Main Ave Resurfacing', agency: 'Public Works', layer: 'L4', budget: 2100000, status: 'Planned' },
//   ],
//   fiscalYear: 'FY 2026-27',
//   setFiscalYear: (year) => set({ fiscalYear: year }),
// }));