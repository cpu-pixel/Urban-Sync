import { useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import { useAuthStore } from './store/useAuthStore';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalLayout from './layout/GlobalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectWizard from './pages/ProjectWizard';
import MapView from './pages/MapView';
import GanttView from './pages/GanttView';
import Opportunities from './pages/Opportunities';
import Settings from './pages/Settings';

function App() {
  const { fetchProjects } = useProjectStore();
  const { restoreSession, token } = useAuthStore();

  // On mount: restore session from localStorage token, then fetch projects
  useEffect(() => {
    restoreSession().then(() => {
      if (token) fetchProjects();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch projects whenever the token changes (login / logout)
  useEffect(() => {
    if (token) fetchProjects();
  }, [token, fetchProjects]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — no layout */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — wrapped in sidebar + topbar layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GlobalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<ProjectWizard />} />
          <Route path="projects/:id" element={<ProjectDetails />} />

          <Route path="map-view" element={<MapView />} />
          <Route path="gantt-view" element={<GanttView />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
