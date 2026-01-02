import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Finance from './pages/Finance';
import Academics from './pages/Academics';
import Marks from './pages/Marks';
import DashboardContent from './components/DashboardContent';
import Staff from './pages/Staff';
import Library from './pages/Library';
import Transport from './pages/Transport';
import VisitorLog from './pages/VisitorLog';
import Communication from './pages/Communication';
import Settings from './pages/Settings';
import Admissions from './pages/Admissions';
import Attendance from './pages/Attendance';
import Facilities from './pages/Facilities';
import Reports from './pages/Reports';
import ParentPortal from './pages/ParentPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/parent-portal" element={<ParentPortal />} />

        {/* Dashboard routes with shared layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/library" element={<Library />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/visitor-log" element={<VisitorLog />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
