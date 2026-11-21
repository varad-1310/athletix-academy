import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Batches from './pages/Batches';
import Coaches from './pages/Coaches';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
          Loading Athletix Academy...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/students/')) return 'Athlete Profile';
    if (pathname.startsWith('/students')) return 'Athlete Directory';
    if (pathname.startsWith('/batches')) return 'Batches & Schedules';
    if (pathname.startsWith('/coaches')) return 'Coaching Staff';
    if (pathname.startsWith('/attendance')) return 'Daily Attendance';
    if (pathname.startsWith('/payments')) return 'Fees & Payments';
    if (pathname.startsWith('/reports')) return 'Analytics & Reports';
    if (pathname.startsWith('/settings')) return 'Academy Settings';
    return 'Executive Dashboard';
  };

  return (
    <div className="app-container">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />
      <div className="main-content">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/coaches" element={<Coaches />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
