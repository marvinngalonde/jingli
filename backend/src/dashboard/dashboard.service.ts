import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  async getStats(schoolId: string) {
    const [students, staff, classes, recentActivity, totalRevenueAgg] = await Promise.all([
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
      }),
      // Get Total Revenue
      this.prisma.transaction.aggregate({
        where: { schoolId },
        _sum: { amount: true }
      })
    ]);

    // Format recent activity
    const formattedActivity = recentActivity.map((student: any) => ({
      id: student.id,
      title: 'New Student Registration',
      description: `${student.firstName} ${student.lastName} joined ${student.section?.classLevel?.name || ''} - ${student.section?.name || ''}`,
      time: student.enrollmentDate,
      type: 'registration'
    }));

    // Calculate monthly revenue trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTransactions = await this.prisma.transaction.findMany({
      where: {
        schoolId,
        date: { gte: sixMonthsAgo }
      },
      select: { amount: true, date: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrendData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = monthNames[d.getMonth()];

      const sum = monthlyTransactions
        .filter((t: any) => t.date.getFullYear() === d.getFullYear() && t.date.getMonth() === d.getMonth())
        .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

      revenueTrendData.push({ name, uv: sum });
    }

    // Attendance Average
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentCount = await this.prisma.attendance.count({
      where: { schoolId, date: { gte: today }, status: { in: ['PRESENT', 'LATE'] } }
    });
    // Rough attendance percent
    const attendancePercent = students > 0 ? Math.round((presentCount / students) * 100) : 0;

    return {
      students,
      staff,
      classes,
      revenue: Number(totalRevenueAgg?._sum?.amount || 0),
      attendance: attendancePercent,
      recentActivity: formattedActivity,
      revenueTrend: revenueTrendData
    };
  }
}
