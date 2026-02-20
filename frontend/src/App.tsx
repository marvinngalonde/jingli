import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Staff from './pages/Staff';
import StaffDetail from './pages/StaffDetail';
import Finance from './pages/Finance';
import Academics from './pages/Academics';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Timetable from './pages/Timetable';
import { Exams } from './pages/Exams';
import Marks from './pages/Marks';
import Library from './pages/Library';
import AttendancePage from './pages/Attendance';

// Finance Pages
// import Fees from './pages/finance/Fees';
// import { FeeStructures } from './pages/Finance/FeeStructures';
// import Expenses from './pages/finance/Expenses';
// import Salaries from './pages/finance/Salaries';

// Admin Pages
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Reports from './pages/Reports';

import { Signup } from './pages/Signup';
import Admissions from './pages/Admissions';
import Visitors from './pages/reception/Visitors';
import StudentLogistics from './pages/reception/StudentLogistics';
import Communication from './pages/Communication';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/:id" element={<StaffDetail />} />
            <Route path="/staff/:id" element={<StaffDetail />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/library" element={<Library />} />

            {/* Reception Routes */}
            <Route path="/reception/visitors" element={<Visitors />} />
            <Route path="/reception/logistics" element={<StudentLogistics />} />

            {/* Communication Route */}
            <Route path="/communication" element={<Communication />} />

            {/* Admin Routes */}
            <Route path="/admin/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />

            {/* Placeholders for routes to be implemented */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
