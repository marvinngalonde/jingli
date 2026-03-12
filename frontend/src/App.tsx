import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import Staff from './pages/admin/Staff';
import StaffDetail from './pages/admin/StaffDetail';
import Finance from './pages/finance/Finance';
import Academics from './pages/admin/Academics';
import Classes from './pages/admin/Classes';
import ClassDetail from './pages/admin/ClassDetail';
import Subjects from './pages/admin/Subjects';
import SubjectDetail from './pages/admin/SubjectDetail';
import Timetable from './pages/admin/Timetable';
import Marks from './pages/admin/Marks';
import Library from './pages/admin/Library';
import AttendancePage from './pages/admin/Attendance';
import CalendarPage from './pages/Calendar';

// E-Learning Portal (Staff)
import { TeacherLayout } from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/admin/TeacherAdminDashboard';
import { TeacherPortalDashboard } from './pages/teacher/portal/TeacherPortalDashboard';
import { TeacherClasses } from './pages/teacher/portal/TeacherClasses';
import AdminPortalLayout from './layouts/AdminPortalLayout';
import { AdminPortalDashboard } from './pages/admin/portal/AdminPortalDashboard';
import { Exams } from './pages/admin/Exams';
import TeacherClassStudents from './pages/teacher/TeacherClassStudents';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';
import { TeacherCourseMaterials } from './pages/teacher/portal/TeacherCourseMaterials';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherGrading from './pages/teacher/TeacherGrading';
import TeacherCBT from './pages/teacher/portal/TeacherCBT';
import TeacherLiveClass from './pages/teacher/portal/TeacherLiveClass';
import TeacherDiscussions from './pages/teacher/portal/TeacherDiscussions';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherLeaderboard from './pages/teacher/portal/TeacherLeaderboard';
import TeacherLibrary from './pages/teacher/portal/TeacherLibrary';

// Teacher Admin Pages (distinct from portal)
import TeacherMyClasses from './pages/teacher/admin/TeacherMyClasses';
import TeacherMyStudents from './pages/teacher/admin/TeacherMyStudents';
import TeacherAttendanceAdmin from './pages/teacher/admin/TeacherAttendance';
import TeacherMarks from './pages/teacher/admin/TeacherMarks';
import TeacherExamSchedule from './pages/teacher/admin/TeacherExamSchedule';

// Student Portal
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/admin/StudentDashboard';
import StudentMySubjects from './pages/student/admin/StudentMySubjects';
import StudentCourseMaterials from './pages/student/portal/StudentCourseMaterials';
import StudentAssignments from './pages/student/portal/StudentAssignments';
import StudentGrades from './pages/student/admin/StudentGrades';
import StudentTimetable from './pages/student/admin/StudentTimetable';
import StudentFees from './pages/student/admin/StudentFees';
import StudentAllAssignments from './pages/student/admin/StudentAllAssignments';
import StudentPortalMaterials from './pages/student/portal/StudentPortalMaterials';
import StudentPortalClasses from './pages/student/portal/StudentPortalClasses';
import StudentPortalAssignments from './pages/student/portal/StudentPortalAssignments';
import StudentCBT from './pages/student/portal/StudentCBT';
import StudentDiscussions from './pages/student/portal/StudentDiscussions';
import StudentLiveClasses from './pages/student/portal/StudentLiveClasses';
import StudentLeaderboard from './pages/student/portal/StudentLeaderboard';
import StudentProfile from './pages/student/admin/StudentProfile';
import StudentPortalLayout from './layouts/StudentPortalLayout';
import StudentPortalDashboard from './pages/student/portal/StudentPortalDashboard';
import StudentExams from './pages/student/portal/StudentExams';

// Parent Portal
import ParentLayout from './layouts/ParentLayout';
import ParentPortalLayout from './layouts/ParentPortalLayout';
import ParentPortalDashboard from './pages/parent/portal/ParentPortalDashboard';
import ParentDashboard from './pages/parent/admin/ParentDashboard';
import ParentPerformance from './pages/parent/portal/ParentPerformance';
import ParentFinancials from './pages/parent/admin/ParentFinancials';
import ParentFees from './pages/parent/admin/ParentFees';
import ParentPortalSubjects from './pages/parent/portal/ParentPortalSubjects';
import ParentPortalAssignments from './pages/parent/portal/ParentPortalAssignments';
import ParentPortalLiveClasses from './pages/parent/portal/ParentPortalLiveClasses';
import ParentExams from './pages/parent/portal/ParentExams';

// Admin Pages
import Users from './pages/admin/Users';
import AcademicYears from './pages/admin/AcademicYears';
import Settings from './pages/admin/Settings';
import Reports from './pages/Reports';

import { Signup } from './pages/Signup';
import Admissions from './pages/reception/Admissions';
import Visitors from './pages/reception/Visitors';
import Communication from './pages/Communication';
import { Installation } from './pages/Installation';
import Transport from './pages/reception/Transport';
import Facilities from './pages/reception/Facilities';
import Health from './pages/reception/Health';
import Discipline from './pages/reception/Discipline';
import Hostel from './pages/reception/Hostel';
import Events from './pages/reception/Events';
import Salaries from './pages/finance/Salaries';
import Expenses from './pages/finance/Expenses';
import { ReceptionLayout } from './layouts/ReceptionLayout';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import FeeCollection from './pages/reception/FeeCollection';
import { SystemAdminLayout } from './layouts/SystemAdminLayout';
import GlobalDashboard from './pages/system-admin/GlobalDashboard';
import SchoolManager from './pages/system-admin/SchoolManager';
import GlobalUsers from './pages/system-admin/GlobalUsers';
import PlatformSettings from './pages/system-admin/PlatformSettings';

// Specialist Dashboards & Missing Modules
import { SecurityDashboard } from './pages/admin/specialist/SecurityDashboard';
import { LibrarianDashboard } from './pages/admin/specialist/LibrarianDashboard';
import { NurseDashboard } from './pages/admin/specialist/NurseDashboard';
import { HostelWardenDashboard } from './pages/admin/specialist/HostelWardenDashboard';
import { LabManagement } from './pages/admin/academics/LabManagement';
import { SenManagement } from './pages/admin/academics/SenManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useMantineColorScheme } from '@mantine/core';
import { useEffect } from 'react';

function AppContent() {
  const { user } = useAuth();
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (user?.school?.config?.darkMode !== undefined) {
      setColorScheme(user.school.config.darkMode ? 'dark' : 'light');
    }
  }, [user, setColorScheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/install" element={<Installation />} />

        {/* Protected Routes - Core Admins, Operational Staff, AND Teachers (for their admin area) */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'SENIOR_CLERK', 'BURSAR', 'FINANCE', 'RECEPTION', 'SECURITY_GUARD', 'LIBRARIAN', 'TEACHER', 'SUBJECT_TEACHER', 'SENIOR_TEACHER', 'CLASS_TEACHER', 'SEN_COORDINATOR', 'HOD']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/fees" element={<FeeCollection />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/:id" element={<StaffDetail />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/academics/lab" element={<LabManagement />} />
          <Route path="/academics/sen" element={<SenManagement />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetail />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/library" element={<Library />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/health" element={<Health />} />
          <Route path="/discipline" element={<Discipline />} />
          <Route path="/hostel" element={<Hostel />} />

          {/* Specialist Dashboards */}
          <Route path="/dashboard/security" element={<SecurityDashboard />} />
          <Route path="/dashboard/library" element={<LibrarianDashboard />} />
          <Route path="/dashboard/clinic" element={<NurseDashboard />} />
          <Route path="/dashboard/hostel" element={<HostelWardenDashboard />} />



          {/* Communication Route */}
          <Route path="/communication" element={<Communication />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/academic-years" element={<AcademicYears />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />


          {/* Finance Sub-Routes */}
          <Route path="/finance/dashboard" element={<Finance />} />
          <Route path="/finance/salaries" element={<Salaries />} />
          <Route path="/finance/expenses" element={<Expenses />} />

          {/* Teacher Admin Routes — dedicated admin pages, NOT portal reuse */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<TeacherMyClasses />} />
          <Route path="/teacher/classes/:sectionId/students" element={<TeacherMyStudents />} />
          <Route path="/teacher/students" element={<TeacherMyStudents />} />
          <Route path="/teacher/timetable" element={<TeacherTimetable />} />
          <Route path="/teacher/attendance" element={<TeacherAttendanceAdmin />} />
          <Route path="/teacher/marks" element={<TeacherMarks />} />
          <Route path="/teacher/communication" element={<Communication />} />

          {/* Placeholders for routes to be implemented */}
        </Route>

        {/* E-Learning Portal Routes (Teachers & Academics) */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'SUBJECT_TEACHER', 'SENIOR_TEACHER', 'CLASS_TEACHER', 'SEN_COORDINATOR', 'ADMIN', 'SUPER_ADMIN', 'HOD']}><TeacherLayout /></ProtectedRoute>}>
          <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="/portal/dashboard" element={<TeacherPortalDashboard />} />
          <Route path="/portal/classes" element={<TeacherClasses />} />
          <Route path="/portal/timetable" element={<TeacherTimetable />} />
          <Route path="/portal/classes/:sectionId/students" element={<TeacherClassStudents />} />
          <Route path="/portal/classes/:sectionId/materials" element={<TeacherCourseMaterials />} />
          <Route path="/portal/classes/:sectionId/assignments" element={<TeacherAssignments />} />
          <Route path="/portal/materials" element={<TeacherCourseMaterials />} />
          <Route path="/portal/assignments" element={<TeacherAssignments />} />
          <Route path="/portal/grading" element={<TeacherGrading />} />
          <Route path="/portal/cbt" element={<TeacherCBT />} />
          <Route path="/portal/live-classes" element={<TeacherLiveClass />} />
          <Route path="/portal/discussions" element={<TeacherDiscussions />} />
          <Route path="/portal/analytics" element={<TeacherAnalytics />} />
          <Route path="/portal/leaderboard" element={<TeacherLeaderboard />} />
          <Route path="/portal/inbox" element={<Communication />} />
          <Route path="/portal/library" element={<TeacherLibrary />} />
          <Route path="/portal/calendar" element={<CalendarPage />} />
          <Route path="/portal/exams" element={<TeacherExamSchedule />} />
        </Route>

        {/* E-Learning Portal Routes (Admins) */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'SCHOOL_HEAD', 'DEPUTY_HEAD']}><AdminPortalLayout /></ProtectedRoute>}>
          <Route path="/admin-portal" element={<Navigate to="/admin-portal/dashboard" replace />} />
          <Route path="/admin-portal/dashboard" element={<AdminPortalDashboard />} />
          <Route path="/admin-portal/exams" element={<Exams />} />
          <Route path="/admin-portal/classes" element={<TeacherClasses />} />
          <Route path="/admin-portal/materials" element={<TeacherCourseMaterials />} />
          <Route path="/admin-portal/assignments" element={<TeacherAssignments />} />
          <Route path="/admin-portal/cbt" element={<TeacherCBT />} />
          <Route path="/admin-portal/live-classes" element={<TeacherLiveClass />} />
          <Route path="/admin-portal/discussions" element={<TeacherDiscussions />} />
          <Route path="/admin-portal/analytics" element={<TeacherAnalytics />} />
          <Route path="/admin-portal/leaderboard" element={<TeacherLeaderboard />} />
          <Route path="/admin-portal/library" element={<TeacherLibrary />} />
          <Route path="/admin-portal/calendar" element={<CalendarPage />} />
          <Route path="/admin-portal/inbox" element={<Communication />} />
        </Route>

        {/* Student Admin Routes — academic & finance, NO e-learning */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentLayout /></ProtectedRoute>}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/classes" element={<StudentMySubjects />} />
          <Route path="/student/grades" element={<StudentGrades />} />
          <Route path="/student/timetable" element={<StudentTimetable />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/assignments" element={<StudentAllAssignments />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/communication" element={<Communication />} />
        </Route>

        {/* Student E-Learning Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentPortalLayout /></ProtectedRoute>}>
          <Route path="/student-portal" element={<Navigate to="/student-portal/dashboard" replace />} />
          <Route path="/student-portal/dashboard" element={<StudentPortalDashboard />} />
          <Route path="/student-portal/classes" element={<StudentPortalClasses />} />
          <Route path="/student-portal/classes/:subjectId/materials" element={<StudentCourseMaterials />} />
          <Route path="/student-portal/classes/:subjectId/assignments" element={<StudentAssignments />} />
          <Route path="/student-portal/materials" element={<StudentPortalMaterials />} />
          <Route path="/student-portal/assignments" element={<StudentPortalAssignments />} />
          <Route path="/student-portal/cbt" element={<StudentCBT />} />
          <Route path="/student-portal/live-classes" element={<StudentLiveClasses />} />
          <Route path="/student-portal/discussions" element={<StudentDiscussions />} />
          <Route path="/student-portal/leaderboard" element={<StudentLeaderboard />} />
          <Route path="/student-portal/library" element={<TeacherLibrary />} />
          <Route path="/student-portal/calendar" element={<CalendarPage />} />
          <Route path="/student-portal/inbox" element={<Communication />} />
          <Route path="/student-portal/exams" element={<StudentExams />} />
        </Route>

        {/* Parent Admin Routes — overview, fees, communication */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT', 'GUARDIAN']}><ParentLayout /></ProtectedRoute>}>
          <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/performance" element={<ParentPerformance />} />
          <Route path="/parent/financials" element={<ParentFinancials />} />
          <Route path="/parent/fees" element={<ParentFees />} />
          <Route path="/parent/communication" element={<Communication />} />
        </Route>

        {/* Parent Portal Routes — children's learning detail */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT', 'GUARDIAN']}><ParentPortalLayout /></ProtectedRoute>}>
          <Route path="/parent-portal" element={<Navigate to="/parent-portal/dashboard" replace />} />
          <Route path="/parent-portal/dashboard" element={<ParentPortalDashboard />} />
          <Route path="/parent-portal/performance" element={<ParentPerformance />} />
          <Route path="/parent-portal/subjects" element={<ParentPortalSubjects />} />
          <Route path="/parent-portal/assignments" element={<ParentPortalAssignments />} />
          <Route path="/parent-portal/live-classes" element={<ParentPortalLiveClasses />} />
          <Route path="/parent-portal/reports" element={<ParentPerformance />} />
          <Route path="/parent-portal/fees" element={<ParentFees />} />
          <Route path="/parent-portal/communication" element={<Communication />} />
          <Route path="/parent-portal/calendar" element={<CalendarPage />} />
          <Route path="/parent-portal/exams" element={<ParentExams />} />
        </Route>

        {/* Receptionist Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['RECEPTION', 'SENIOR_CLERK', 'ADMIN', 'SUPER_ADMIN']}><ReceptionLayout /></ProtectedRoute>}>
          <Route path="/reception" element={<Navigate to="/reception/dashboard" replace />} />
          <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/reception/visitors" element={<Visitors />} />
          <Route path="/reception/admissions" element={<Admissions />} />
          <Route path="/reception/fees" element={<FeeCollection />} />
          <Route path="/reception/students" element={<Students />} />
          <Route path="/reception/attendance" element={<AttendancePage />} />
          <Route path="/reception/calendar" element={<CalendarPage />} />
          <Route path="/reception/communication" element={<Communication />} />
          <Route path="/reception/transport" element={<Transport />} />
          <Route path="/reception/health" element={<Health />} />
          <Route path="/reception/discipline" element={<Discipline />} />
          <Route path="/reception/hostel" element={<Hostel />} />
          <Route path="/reception/events" element={<Events />} />
          <Route path="/reception/facilities" element={<Facilities />} />
        </Route>

        {/* Global System Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}><SystemAdminLayout /></ProtectedRoute>}>
          <Route path="/system-admin" element={<GlobalDashboard />} />
          <Route path="/system-admin/schools" element={<SchoolManager />} />
          <Route path="/system-admin/users" element={<GlobalUsers />} />
          <Route path="/system-admin/settings" element={<PlatformSettings />} />
        </Route>

        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter >
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
