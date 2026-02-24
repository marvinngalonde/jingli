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
import CalendarPage from './pages/Calendar';

// Teacher Portal
import { TeacherLayout } from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import TeacherClassStudents from './pages/teacher/TeacherClassStudents';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';
import { TeacherCourseMaterials } from './pages/teacher/TeacherCourseMaterials';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherGrading from './pages/teacher/TeacherGrading';

// import Fees from './pages/finance/Fees';
// import { FeeStructures } from './pages/Finance/FeeStructures';
// import Expenses from './pages/finance/Expenses';
// import Salaries from './pages/finance/Salaries';

// Student Portal
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentCourseMaterials from './pages/student/StudentCourseMaterials';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentGrades from './pages/student/StudentGrades';

// Parent Portal
import ParentLayout from './layouts/ParentLayout';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentPerformance from './pages/parent/ParentPerformance';
import ParentFinancials from './pages/parent/ParentFinancials';

// Admin Pages
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Reports from './pages/Reports';

import { Signup } from './pages/Signup';
import Admissions from './pages/Admissions';
import Visitors from './pages/reception/Visitors';
import Communication from './pages/Communication';
import { Installation } from './pages/Installation';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/install" element={<Installation />} />

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
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Reception Routes */}
            <Route path="/reception/visitors" element={<Visitors />} />

            {/* Communication Route */}
            <Route path="/communication" element={<Communication />} />

            {/* Admin Routes */}
            <Route path="/admin/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />

            {/* Placeholders for routes to be implemented */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Route>

          {/* Teacher Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route path="/teacher/timetable" element={<TeacherTimetable />} />
            <Route path="/teacher/classes/:sectionId/students" element={<TeacherClassStudents />} />
            <Route path="/teacher/classes/:sectionId/materials" element={<TeacherCourseMaterials />} />
            <Route path="/teacher/materials" element={<TeacherCourseMaterials />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
            <Route path="/teacher/grading" element={<TeacherGrading />} />
            <Route path="/teacher/inbox" element={<Communication />} />
            <Route path="/teacher/library" element={<Library />} />
            <Route path="/teacher/calendar" element={<CalendarPage />} />
          </Route>

          {/* Student Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/classes" element={<StudentClasses />} />
            <Route path="/student/classes/:subjectId/materials" element={<StudentCourseMaterials />} />
            <Route path="/student/classes/:subjectId/assignments" element={<StudentAssignments />} />
            <Route path="/student/grades" element={<StudentGrades />} />
            {/* Additional student routes will go here */}
          </Route>

          {/* Parent Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout /></ProtectedRoute>}>
            <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/parent/performance" element={<ParentPerformance />} />
            <Route path="/parent/financials" element={<ParentFinancials />} />
            {/* Additional parent routes will go here */}
          </Route>
        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
