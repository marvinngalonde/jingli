import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  async getStats(schoolId: string) {
    const [students, staff, classes, recentActivity] = await Promise.all([
      // Count Active Students
      this.prisma.student.count({
        where: { schoolId, user: { status: 'ACTIVE' } },
      }),
      // Count All Staff
      this.prisma.staff.count({
        where: { schoolId },
      }),
      // Count Class Sections
      this.prisma.classSection.count({
        where: { schoolId },
      }),
      // Fetch recent 5 enrolled students as activity
      this.prisma.student.findMany({
        where: { schoolId },
        orderBy: { enrollmentDate: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          enrollmentDate: true,
          section: {
            select: { name: true, classLevel: { select: { name: true } } }
          }
        }
      })
    ]);

    // Format recent activity
    const formattedActivity = recentActivity.map(student => ({
      id: student.id,
      title: 'New Student Registration',
      description: `${student.firstName} ${student.lastName} joined ${student.section.classLevel.name} - ${student.section.name}`,
      time: student.enrollmentDate,
      type: 'registration'
    }));

    return {
      students,
      staff,
      classes,
      revenue: 0, // Mock for now
      attendance: 0, // Mock for now
      recentActivity: formattedActivity
    };
  }
}
