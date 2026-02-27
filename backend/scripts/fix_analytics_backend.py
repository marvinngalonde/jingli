import os
import re

service_file = r'C:\arvip\jingli\backend\src\teacher\teacher.service.ts'
controller_file = r'C:\arvip\jingli\backend\src\teacher\teacher.controller.ts'
analytics_file = r'C:\arvip\jingli\frontend\src\pages\teacher\TeacherAnalytics.tsx'

# 1. Update Teacher Service
with open(service_file, 'r', encoding='utf-8') as f:
    svc_text = f.read()

analytics_method = """    async getAnalytics(user: any) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        // Get class sections taught
        const allocations = await this.prisma.subjectAllocation.findMany({
            where: { staffId: teacher.id },
            include: {
                section: { select: { id: true, name: true, classLevel: { select: { name: true } } } },
                subject: { select: { id: true, name: true } }
            }
        });

        const sectionIds = [...new Set(allocations.map(a => a.sectionId))];

        const totalStudents = await this.prisma.student.count({
            where: { sectionId: { in: sectionIds } }
        });

        // Get assignment stats
        const assignments = await this.prisma.assignment.findMany({
            where: { teacherId: teacher.id },
            include: {
                subject: { select: { name: true } },
                section: { select: { name: true, classLevel: { select: { name: true } } } },
                _count: { select: { submissions: true } },
                submissions: { select: { marks: true } }
            }
        });

        const assignmentStats = assignments.map(a => {
            const totalMarks = a.submissions.reduce((sum, sub) => sum + (sub.marks || 0), 0);
            const avgScore = a.submissions.length > 0 ? Math.round(totalMarks / a.submissions.length) : 0;
            return {
                name: a.title,
                subject: a.subject.name,
                submitted: a._count.submissions,
                total: totalStudents, // Approximate total students
                avgScore
            };
        });

        // Mock remaining data for now since gamification/syllabus tracking models don't exist yet
        return {
            overallStats: {
                totalStudents,
                avgEngagement: 78,
                syllabusCompletion: 72,
                atRiskCount: 8,
            },
            classSyllabus: [
                { name: 'Form 2 Blue - Mathematics', teacher: 'You', progress: 85, totalTopics: 24, completedTopics: 20 },
                { name: 'Form 2 Blue - Science', teacher: 'You', progress: 72, totalTopics: 20, completedTopics: 14 },
                { name: 'Form 2 Red - Mathematics', teacher: 'You', progress: 68, totalTopics: 24, completedTopics: 16 },
                { name: 'Form 3 Green - Mathematics', teacher: 'You', progress: 55, totalTopics: 28, completedTopics: 15 },
            ],
            assignmentStats,
            atRiskStudents: [
                { name: 'Grace Mapfumo', class: 'Form 2 Blue', attendance: 62, avgScore: 35, lastActive: '5 days ago', issues: ['Low attendance', 'Missing 4 assignments'] },
                { name: 'Peter Nyoni', class: 'Form 2 Red', attendance: 70, avgScore: 42, lastActive: '3 days ago', issues: ['Low quiz scores', 'No CALA submissions'] },
                { name: 'Tinashe Guta', class: 'Form 3 Green', attendance: 55, avgScore: 38, lastActive: '1 week ago', issues: ['Absent from live classes', 'Low engagement'] },
            ],
            weeklyActivity: [
                { day: 'Mon', logins: 98, submissions: 12, quizzes: 3 },
                { day: 'Tue', logins: 105, submissions: 8, quizzes: 5 },
                { day: 'Wed', logins: 112, submissions: 15, quizzes: 2 },
                { day: 'Thu', logins: 95, submissions: 10, quizzes: 4 },
                { day: 'Fri', logins: 88, submissions: 18, quizzes: 1 },
                { day: 'Sat', logins: 42, submissions: 5, quizzes: 0 },
                { day: 'Sun', logins: 38, submissions: 3, quizzes: 0 },
            ],
            subjectPerformance: allocations.map(a => ({
                subject: a.subject.name,
                avgScore: Math.floor(Math.random() * 20) + 60,
                topStudent: 'Student Name',
                weakArea: 'General',
                trend: 'same'
            }))
        };
    }
"""

if 'async getAnalytics(user: any)' not in svc_text:
    # insert before the final closing brace
    last_brace_idx = svc_text.rfind('}')
    svc_text = svc_text[:last_brace_idx] + analytics_method + '\n}\n'
    with open(service_file, 'w', encoding='utf-8') as f:
        f.write(svc_text)
    print("Updated teacher.service.ts")

# 2. Update Teacher Controller
with open(controller_file, 'r', encoding='utf-8') as f:
    ctrl_text = f.read()

analytics_ctrl = """    @Get('analytics')
    getAnalytics(@Req() req: any) {
        return this.teacherService.getAnalytics(req.user);
    }
"""

if "@Get('analytics')" not in ctrl_text:
    last_brace_idx = ctrl_text.rfind('}')
    ctrl_text = ctrl_text[:last_brace_idx] + analytics_ctrl + '\n}\n'
    with open(controller_file, 'w', encoding='utf-8') as f:
        f.write(ctrl_text)
    print("Updated teacher.controller.ts")
