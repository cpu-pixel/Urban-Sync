import { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Settings2, Play, Pause } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export default function MapView() {
  const { projects } = useProjectStore();
  const [activeLayers, setActiveLayers] = useState<string[]>(['L1', 'L3', 'L4', 'L5']);
  
  // --- 4D TIME ENGINE LOGIC ---
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Calculate the absolute bounds of our timeline based on project data
  const timeBounds = useMemo(() => {
    if (projects.length === 0) return { min: Date.now(), max: Date.now() };
    const allDates = projects.flatMap(p => [
      new Date(p.startDate + 'T00:00:00').getTime(),
      new Date(p.endDate + 'T00:00:00').getTime()
    ]);
    return {
      min: Math.min(...allDates),
      max: Math.max(...allDates)
    };
  }, [projects]);

  const [currentTime, setCurrentTime] = useState<number>(timeBounds.min);

  // 2. Auto-play effect: Increments time by 3 days per frame when playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (86400000 * 3); // +3 Days in milliseconds
          if (next >= timeBounds.max) {
            setIsPlaying(false);
            return timeBounds.max;
          }
          return next;
        });
      }, 50); // 50ms refresh rate for smooth animation
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeBounds.max]);

  // 3. Filter projects: Must match active layers AND be actively under construction at currentTime
  const activeFeatures = useMemo(() => {
    return projects.filter(p => {
      const pStart = new Date(p.startDate + 'T00:00:00').getTime();
      const pEnd = new Date(p.endDate + 'T00:00:00').getTime();
      const isSpatiallyActive = activeLayers.includes(p.layer);
      const isTemporallyActive = currentTime >= pStart && currentTime <= pEnd;
      
      return isSpatiallyActive && isTemporallyActive;
    });
  }, [projects, activeLayers, currentTime]);

  // Convert to GeoJSON — skip projects without spatial data
  const geojsonData = {
    type: 'FeatureCollection',
    features: activeFeatures
      .filter(p => p.geometry != null)
      .map(p => ({
        type: 'Feature',
        properties: { id: p.id, title: p.title, status: p.status },
        geometry: p.geometry
      }))
  };

  // Formatting helper for the UI
  const formatScrubberDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', day: 'numeric' }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Top Action Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-brand-primary" />
          <h2 className="font-bold text-slate-800">4D Right-of-Way GIS Map</h2>
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
          <Settings2 size={20} />
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Left Sidebar: Layer Toggles */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4 z-10 shadow-lg">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Utility Layers</h3>
          {['L1', 'L2', 'L3', 'L4', 'L5'].map(layer => (
            <label key={layer} className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={activeLayers.includes(layer)}
                onChange={(e) => {
                  if (e.target.checked) setActiveLayers([...activeLayers, layer]);
                  else setActiveLayers(activeLayers.filter(l => l !== layer));
                }}
                className="w-4 h-4 rounded text-brand-primary border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Level {layer} Infrastructure</span>
            </label>
          ))}
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="text-xs font-bold text-blue-800 mb-1">Current Active Projects</h4>
            <p className="text-2xl font-black text-blue-600">{activeFeatures.length}</p>
          </div>
        </div>

        {/* The Map Engine */}
        <div className="flex-1 relative">
          <Map
            initialViewState={{ longitude: -122.414, latitude: 37.777, zoom: 15, pitch: 45 }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            interactive={true}
          >
            <Source id="projects" type="geojson" data={geojsonData as any}>
              <Layer 
                id="project-polygons" type="fill" filter={['==', '$type', 'Polygon']}
                paint={{ 'fill-color': '#38bdf8', 'fill-opacity': 0.3, 'fill-outline-color': '#0284c7' }} 
              />
              <Layer 
                id="project-lines" type="line" filter={['==', '$type', 'LineString']}
                paint={{
                  'line-color': ['match', ['get', 'status'], 'Clash Detected', '#ef4444', 'In Progress', '#2563eb', '#64748b'],
                  'line-width': 5
                }} 
              />
              <Layer 
                id="project-points" type="circle" filter={['==', '$type', 'Point']}
                paint={{ 'circle-radius': 6, 'circle-color': '#f59e0b', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }} 
              />
            </Source>
          </Map>

          {/* TIME SCRUBBER COMPONENT */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-20 transition-all">
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-brand-primary text-white hover:bg-blue-700'}`}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-400">{formatScrubberDate(timeBounds.min)}</span>
                  <span className="text-lg font-black text-brand-primary px-4 py-1 bg-blue-50 rounded-md border border-blue-100">
                    {formatScrubberDate(currentTime)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{formatScrubberDate(timeBounds.max)}</span>
                </div>
                
                <input 
                  type="range" 
                  min={timeBounds.min} 
                  max={timeBounds.max} 
                  value={currentTime}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentTime(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}







// import { useState } from 'react';
// import Map, { Source, Layer } from 'react-map-gl/maplibre';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import { Layers, Clock, Settings2 } from 'lucide-react';
// import { useProjectStore } from '../store/useProjectStore';

// export default function MapView() {
//   const { projects } = useProjectStore();
//   const [activeLayers, setActiveLayers] = useState<string[]>(['L1', 'L3', 'L4', 'L5']);

//   // Convert our store projects into a valid GeoJSON FeatureCollection
//   const geojsonData = {
//     type: 'FeatureCollection',
//     features: projects
//       .filter(p => activeLayers.includes(p.layer))
//       .map(p => ({
//         type: 'Feature',
//         properties: {
//           id: p.id,
//           title: p.title,
//           layer: p.layer,
//           status: p.status
//         },
//         geometry: p.geometry
//       }))
//   };

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
//       {/* Top Action Bar */}
//       <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
//         <div className="flex items-center gap-2">
//           <Layers size={20} className="text-brand-primary" />
//           <h2 className="font-bold text-slate-800">4D Right-of-Way GIS Map</h2>
//         </div>
//         <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
//           <Settings2 size={20} />
//         </button>
//       </div>

//       <div className="flex flex-1 relative">
//         {/* Left Sidebar: Layer Toggles */}
//         <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
//           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Utility Layers</h3>
//           {['L1', 'L2', 'L3', 'L4', 'L5'].map(layer => (
//             <label key={layer} className="flex items-center gap-3 cursor-pointer">
//               <input 
//                 type="checkbox" 
//                 checked={activeLayers.includes(layer)}
//                 onChange={(e) => {
//                   if (e.target.checked) setActiveLayers([...activeLayers, layer]);
//                   else setActiveLayers(activeLayers.filter(l => l !== layer));
//                 }}
//                 className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
//               />
//               <span className="text-sm font-medium text-slate-700">Level {layer} Infrastructure</span>
//             </label>
//           ))}
//         </div>

//         {/* The Map Engine */}
//         <div className="flex-1 relative">
//           <Map
//             initialViewState={{
//               longitude: -122.414,
//               latitude: 37.777,
//               zoom: 15,
//               pitch: 45 // Slight tilt for a 3D feel
//             }}
//             mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
//             interactive={true}
//           >
//             {/* Inject the GeoJSON source */}
//             <Source id="projects" type="geojson" data={geojsonData as any}>
              
//               {/* Layer 1: Render Polygons (e.g., Surface Paving) */}
//               <Layer 
//                 id="project-polygons" 
//                 type="fill" 
//                 filter={['==', '$type', 'Polygon']}
//                 paint={{
//                   'fill-color': '#38bdf8',
//                   'fill-opacity': 0.2,
//                   'fill-outline-color': '#0284c7'
//                 }} 
//               />

//               {/* Layer 2: Render Lines (e.g., Pipes, Fiber) */}
//               <Layer 
//                 id="project-lines" 
//                 type="line" 
//                 filter={['==', '$type', 'LineString']}
//                 paint={{
//                   'line-color': [
//                     'match', ['get', 'status'],
//                     'Clash Detected', '#ef4444', // Red for clashing lines
//                     'In Progress', '#2563eb',    // Blue for normal
//                     '#64748b'                    // Default slate
//                   ],
//                   'line-width': 4,
//                   'line-dasharray': [
//                     'match', ['get', 'status'],
//                     'Planned', ['literal', [2, 2]],
//                     ['literal', [1]]
//                   ]
//                 }} 
//               />
              
//               {/* Layer 3: Render Points (e.g., Streetlights) */}
//               <Layer 
//                 id="project-points" 
//                 type="circle" 
//                 filter={['==', '$type', 'Point']}
//                 paint={{
//                   'circle-radius': 6,
//                   'circle-color': '#f59e0b',
//                   'circle-stroke-width': 2,
//                   'circle-stroke-color': '#ffffff'
//                 }} 
//               />
//             </Source>
//           </Map>

//           {/* Time Scrubber (Overlay at the bottom) */}
//           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-20">
//             <div className="flex items-center gap-4">
//               <div className="bg-brand-primary/10 p-2 rounded-lg">
//                 <Clock size={20} className="text-brand-primary" />
//               </div>
//               <div className="flex-1">
//                 <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
//                   <span>Jan 2026</span>
//                   <span>Currently Showing: All Projects</span>
//                   <span>Dec 2027</span>
//                 </div>
//                 {/* Visual placeholder for the interactive range slider we will build next */}
//                 <div className="h-2 bg-slate-200 rounded-full w-full">
//                   <div className="h-full bg-brand-primary rounded-full w-full opacity-50"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }