import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FeeStructuresModule } from './fee-structures/fee-structures.module';
import { InvoicesModule } from './invoices/invoices.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { ClassesModule } from './classes/classes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SubjectsModule,
    AcademicYearsModule,
    SupabaseModule,
    FeeStructuresModule,
    InvoicesModule,
    StudentsModule,
    StaffModule,
    ClassesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
