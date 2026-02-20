import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
