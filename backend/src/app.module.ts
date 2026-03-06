import { CbtModule } from './cbt/cbt.module';
import { Module } from '@nestjs/common';
import { DiscussionsModule } from './discussions/discussions.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FeeStructuresModule } from './fee-structures/fee-structures.module';
import { FeeHeadsModule } from './fee-heads/fee-heads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { ClassesModule } from './classes/classes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TimetableModule } from './timetable/timetable.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { NoticesModule } from './notices/notices.module';
import { MessagesModule } from './messages/messages.module';
import { VisitorsModule } from './visitors/visitors.module';
import { GuardiansModule } from './guardians/guardians.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExamsModule } from './exams/exams.module';
import { ExamResultsModule } from './exam-results/exam-results.module';
import { SystemModule } from './system/system.module';
import { AiModule } from './ai/ai.module';
import { LogisticsModule } from './reception/logistics.module';
import { LibraryModule } from './library/library.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SalariesModule } from './salaries/salaries.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { TransportModule } from './transport/transport.module';
import { AssetsModule } from './assets/assets.module';
import { CalaModule } from './cala/cala.module';
import { GradeScalesModule } from './grade-scales/grade-scales.module';
import { HealthModule } from './health/health.module';
import { DisciplineModule } from './discipline/discipline.module';
import { HostelModule } from './hostel/hostel.module';
import { AlertsModule } from './alerts/alerts.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { LiveClassesModule } from './live-classes/live-classes.module';
import { InquiriesModule } from './inquiries/inquiries.module';

@Module({
  imports: [
    CbtModule,
    DiscussionsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    AcademicYearsModule,
    SupabaseModule,
    FeeStructuresModule,
    FeeHeadsModule,
    InvoicesModule,
    StudentsModule,
    StaffModule,
    ClassesModule,
    AttendanceModule,
    TimetableModule,
    AssignmentsModule,
    NoticesModule,
    MessagesModule,
    VisitorsModule,
    GuardiansModule,
    DashboardModule,
    ExamsModule,
    ExamResultsModule,
    SystemModule,
    AiModule,
    LogisticsModule,
    LibraryModule,
    ReportsModule,
    NotificationsModule,
    EventsModule,
    TeacherModule,
    StudentModule,
    ParentModule,
    ExpensesModule,
    SalariesModule,
    ExchangeRatesModule,
    TransportModule,
    AssetsModule,
    CalaModule,
    GradeScalesModule,
    HealthModule,
    DisciplineModule,
    HostelModule,
    AlertsModule,
    QuizzesModule,
    LiveClassesModule,
    InquiriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
