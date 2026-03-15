import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class TeacherService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) {
            throw new NotFoundException('Teacher profile not found for this user.');
        }

        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const todayStr = days[new Date().getDay()] as DayOfWeek;

        const classesToday = await this.prisma.timetable.count({
            where: isAdmin ? { day: todayStr } : { teacherId: teacher!.id, day: todayStr },
        });

        let totalStudents = 0;
        if (isAdmin) {
            totalStudents = await this.prisma.student.count();
        } else {
            const allocations = await this.prisma.subjectAllocation.findMany({
                where: { staffId: teacher!.id },
                select: { sectionId: true },
            });
            const sectionIds = [...new Set(allocations.map(a => a.sectionId))];
            totalStudents = await this.prisma.student.count({
                where: { sectionId: { in: sectionIds } },
            });
        }

        const activeAssignments = await this.prisma.assignment.count({
            where: isAdmin ? { dueDate: { gt: new Date() } } : {
                teacherId: teacher!.id,
                dueDate: { gt: new Date() },
            },
        });

        const ungraded = await this.prisma.submission.count({
            where: isAdmin ? { marks: null } : {
                assignment: { teacherId: teacher!.id },
                marks: null,
            },
        });

        return { classesToday, totalStudents, activeAssignments, ungraded };
    }

    async getTodaySchedule(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) return [];

        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const todayStr = days[new Date().getDay()] as DayOfWeek;

        return this.prisma.timetable.findMany({
            where: isAdmin ? { day: todayStr } : { teacherId: teacher!.id, day: todayStr },
            include: { subject: true, section: { include: { classLevel: true } } },
            orderBy: { startTime: 'asc' }
        });
    }

    async getTeacherClasses(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        if (isAdmin) {
            const allSections = await this.prisma.classSection.findMany({
                include: { classLevel: true, _count: { select: { students: true } } }
            });
            return allSections.map(s => ({ section: s, isClassTeacher: false, subjects: [] }));
        }

        const allocations = await this.prisma.subjectAllocation.findMany({
            where: { staffId: teacher!.id },
            include: { section: { include: { classLevel: true, _count: { select: { students: true } } } }, subject: true }
        });

        const classTeacherSections = await this.prisma.classSection.findMany({
            where: { classTeacherId: teacher!.id },
            include: { classLevel: true, _count: { select: { students: true } } }
        });

        const sectionMap = new Map();

        classTeacherSections.forEach(section => {
            sectionMap.set(section.id, { section, isClassTeacher: true, subjects: [] });
        });

        allocations.forEach(alloc => {
            const sectionId = alloc.sectionId;
            if (!sectionMap.has(sectionId)) {
                sectionMap.set(sectionId, { section: alloc.section, isClassTeacher: false, subjects: [] });
            }
            const existingSubjects = sectionMap.get(sectionId).subjects;
            if (!existingSubjects.find((s: any) => s.id === alloc.subject.id)) {
                existingSubjects.push(alloc.subject);
            }
        });

        return Array.from(sectionMap.values());
    }

    async getClassStudents(user: any, sectionId: string, page = 1, limit = 7) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        if (!isAdmin) {
            const allocation = await this.prisma.subjectAllocation.findFirst({
                where: { staffId: teacher!.id, sectionId: sectionId }
            });

            const classTeacherSection = await this.prisma.classSection.findFirst({
                where: { id: sectionId, classTeacherId: teacher!.id }
            });

            if (!allocation && !classTeacherSection) {
                throw new NotFoundException('You do not have access to this class.');
            }
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.student.findMany({
                where: { sectionId },
                skip,
                take: limit,
                include: {
                    user: { select: { email: true } },
                    _count: { select: { attendance: { where: { status: 'ABSENT' } } } }
                },
                orderBy: [
                    { firstName: 'asc' },
                    { lastName: 'asc' }
                ]
            }),
            this.prisma.student.count({ where: { sectionId } })
        ]);

        return {
            data,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getSectionMaterials(user: any, sectionId: string) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.courseMaterial.findMany({
            where: isAdmin ? { sectionId } : { sectionId, teacherId: teacher!.id },
            include: { subject: { select: { name: true, code: true } } },
            orderBy: { uploadedAt: 'desc' }
        });
    }

    async getAllMaterials(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.courseMaterial.findMany({
            where: isAdmin ? {} : { teacherId: teacher!.id },
            include: {
                subject: { select: { name: true, code: true } },
                section: { select: { name: true } }
            },
            orderBy: { uploadedAt: 'desc' }
        });
    }

    async uploadMaterial(user: any, sectionId: string, data: any) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        // Normally you'd validate subjectId is actually taught by this teacher for this section
        return this.prisma.courseMaterial.create({
            data: {
                title: data.title,
                description: data.description,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                sectionId: sectionId,
                subjectId: data.subjectId,
                teacherId: teacher.id
            }
        });
    }

    async deleteMaterial(user: any, materialId: string) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        // Ensure teacher owns this material
        const material = await this.prisma.courseMaterial.findFirst({
            where: { id: materialId, teacherId: teacher.id }
        });

        if (!material) throw new NotFoundException('Material not found or access denied.');

        return this.prisma.courseMaterial.delete({
            where: { id: materialId }
        });
    }

    // --- ASSIGNMENTS ---

    async getSectionAssignments(user: any, sectionId: string) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.assignment.findMany({
            where: isAdmin ? { sectionId } : { sectionId, teacherId: teacher!.id },
            include: { subject: { select: { name: true, code: true } }, _count: { select: { submissions: true } } },
            orderBy: { dueDate: 'asc' }
        });
    }

    async getAllAssignments(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.assignment.findMany({
            where: isAdmin ? {} : { teacherId: teacher!.id },
            include: { subject: { select: { name: true, code: true } }, section: { select: { name: true } }, _count: { select: { submissions: true } } },
            orderBy: { dueDate: 'desc' }
        });
    }

    async createAssignment(user: any, sectionId: string, data: any) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: new Date(data.dueDate),
                maxMarks: parseInt(data.maxMarks, 10),
                type: data.type || 'HOMEWORK',
                sectionId: sectionId,
                subjectId: data.subjectId,
                teacherId: teacher.id
            }
        });
    }

    async deleteAssignment(user: any, assignmentId: string) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        const assignment = await this.prisma.assignment.findFirst({
            where: { id: assignmentId, teacherId: teacher.id }
        });

        if (!assignment) throw new NotFoundException('Assignment not found or access denied.');

        return this.prisma.assignment.delete({
            where: { id: assignmentId }
        });
    }

    // --- GRADING ---

    async getDashboardSubmissions(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.submission.findMany({
            where: isAdmin ? {} : { assignment: { teacherId: teacher!.id } },
            include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true, user: { select: { email: true } } } },
                assignment: { include: { subject: { select: { name: true, code: true } }, section: { select: { name: true } } } }
            },
            orderBy: { submittedAt: 'asc' }
        });
    }

    async getAssignmentSubmissions(user: any, assignmentId: string) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        if (!isAdmin) {
            const assignment = await this.prisma.assignment.findFirst({
                where: { id: assignmentId, teacherId: teacher!.id }
            });

            if (!assignment) throw new NotFoundException('Assignment not found.');
        }

        return this.prisma.submission.findMany({
            where: { assignmentId },
            include: { student: { select: { firstName: true, lastName: true, admissionNo: true, user: { select: { email: true } } } } },
            orderBy: { submittedAt: 'desc' }
        });
    }

    async gradeSubmission(user: any, submissionId: string, data: any) {
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        const submission = await this.prisma.submission.findFirst({
            where: {
                id: submissionId,
                assignment: { teacherId: teacher.id }
            }
        });

        if (!submission) throw new NotFoundException('Submission not found or access denied.');

        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                marks: parseInt(data.marks, 10),
                feedback: data.feedback
            }
        });
    }
    async getAnalytics(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        // Get class sections taught
        const allocations = await this.prisma.subjectAllocation.findMany({
            where: isAdmin ? undefined : { staffId: teacher!.id },
            include: {
                section: { select: { id: true, name: true, classLevel: { select: { name: true } } } },
                subject: { select: { id: true, name: true } }
            }
        });

        const sectionIds = [...new Set(allocations.map(a => a.sectionId))];

        const totalStudents = await this.prisma.student.count({
            where: isAdmin ? undefined : { sectionId: { in: sectionIds } }
        });

        // Get assignment stats
        const assignments = await this.prisma.assignment.findMany({
            where: isAdmin ? undefined : { teacherId: teacher!.id },
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

        // Calculate real engagement: submission rate
        const totalAssignments = assignments.length;
        const totalSubmissions = assignments.reduce((sum, a) => sum + a._count.submissions, 0);
        const avgEngagement = totalStudents > 0 && totalAssignments > 0
            ? Math.round((totalSubmissions / (totalStudents * totalAssignments)) * 100)
            : 0;

        // Calculate syllabus from materials uploaded per allocation
        const materialsCount = await this.prisma.courseMaterial.count({
            where: isAdmin ? undefined : { teacherId: teacher!.id }
        });
        const syllabusCompletion = allocations.length > 0
            ? Math.min(100, Math.round((materialsCount / (allocations.length * 10)) * 100))
            : (isAdmin && materialsCount > 0 ? 100 : 0);

        // At-risk students: students with avg score < 40% across graded submissions
        const studentsInSections = await this.prisma.student.findMany({
            where: isAdmin ? undefined : { sectionId: { in: sectionIds } },
            select: {
                id: true, firstName: true, lastName: true,
                section: { select: { name: true, classLevel: { select: { name: true } } } },
                submissions: { select: { marks: true, assignment: { select: { maxMarks: true } } } }
            }
        });

        const atRiskStudents = studentsInSections
            .map(s => {
                const graded = s.submissions.filter(sub => sub.marks !== null);
                const avgScore = graded.length > 0
                    ? Math.round(graded.reduce((sum, sub) => sum + ((sub.marks || 0) / sub.assignment.maxMarks) * 100, 0) / graded.length)
                    : -1;
                return {
                    name: `${s.firstName} ${s.lastName}`,
                    class: `${s.section?.classLevel?.name || ''} ${s.section?.name || ''}`.trim(),
                    avgScore,
                    attendance: 0,
                    lastActive: graded.length > 0 ? 'Has submissions' : 'No submissions',
                    issues: [
                        ...(avgScore >= 0 && avgScore < 40 ? ['Low average score'] : []),
                        ...(graded.length === 0 ? ['No graded work'] : []),
                    ]
                };
            })
            .filter(s => s.avgScore < 40 || s.avgScore === -1)
            .slice(0, 10);

        // Weekly activity from real submissions this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const recentSubmissions = await this.prisma.submission.findMany({
            where: isAdmin ? { submittedAt: { gte: weekStart } } : {
                assignment: { teacherId: teacher!.id },
                submittedAt: { gte: weekStart }
            },
            select: { submittedAt: true }
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivity = dayNames.map(day => {
            const dayIndex = dayNames.indexOf(day);
            const count = recentSubmissions.filter(s => new Date(s.submittedAt).getDay() === dayIndex).length;
            return { day, logins: 0, submissions: count, quizzes: 0 };
        });

        // Real syllabus coverage per class
        const classSyllabus = allocations.map(a => {
            const classAssignments = assignments.filter(
                asg => asg.subject.name === a.subject.name && asg.section?.name === a.section.name
            );
            const totalTopics = 20;
            const completedTopics = Math.min(totalTopics, classAssignments.length);
            return {
                name: `${a.section.classLevel.name} ${a.section.name} - ${a.subject.name}`,
                teacher: 'You',
                progress: Math.round((completedTopics / totalTopics) * 100),
                totalTopics,
                completedTopics,
            };
        });

        // Real subject performance (avg marks per subject)
        const subjectPerformance = allocations.map(a => {
            const subjectAssignments = assignments.filter(asg => asg.subject.name === a.subject.name);
            const allSubs = subjectAssignments.flatMap(asg => asg.submissions.filter(s => s.marks !== null));
            const avgScore = allSubs.length > 0
                ? Math.round(allSubs.reduce((sum, s) => sum + (s.marks || 0), 0) / allSubs.length)
                : 0;
            return {
                subject: a.subject.name,
                avgScore,
                topStudent: '',
                weakArea: '',
                trend: 'same'
            };
        });

        return {
            overallStats: {
                totalStudents,
                avgEngagement: Math.min(100, avgEngagement),
                syllabusCompletion,
                atRiskCount: atRiskStudents.length,
            },
            classSyllabus,
            assignmentStats,
            atRiskStudents,
            weeklyActivity,
            subjectPerformance,
        };
    }

    async getLeaderboard(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
        });

        if (!teacher && !isAdmin) throw new NotFoundException('Teacher profile not found.');

        let sectionIds: string[] = [];
        if (!isAdmin) {
            const allocations = await this.prisma.subjectAllocation.findMany({
                where: { staffId: teacher!.id },
                select: { sectionId: true }
            });
            sectionIds = [...new Set(allocations.map(a => a.sectionId))];
        }

        const students = await this.prisma.student.findMany({
            where: isAdmin ? undefined : { sectionId: { in: sectionIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNo: true,
                section: { select: { name: true, classLevel: { select: { name: true } } } },
                submissions: {
                    select: {
                        marks: true,
                        assignment: { select: { maxMarks: true, type: true } }
                    }
                },
            }
        });

        const leaderboard = students.map(s => {
            const graded = s.submissions.filter(sub => sub.marks !== null);
            const totalScore = graded.reduce((sum, sub) => sum + (sub.marks || 0), 0);
            const maxPossible = graded.reduce((sum, sub) => sum + sub.assignment.maxMarks, 0);
            const avgScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

            return {
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                admissionNo: s.admissionNo,
                class: `${s.section?.classLevel?.name || ''} ${s.section?.name || ''}`.trim(),
                points: totalScore,
                assignments: s.submissions.length,
                quizScore: avgScore,
                calaScore: 0,
                attendance: 0,
                badges: [],
            };
        })
            .sort((a, b) => b.points - a.points)
            .map((s, i) => ({ ...s, rank: i + 1, change: 'same' }));

        return leaderboard;
    }

    async getExams(user: any) {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

        if (isAdmin) {
            return this.prisma.exam.findMany({
                include: {
                    subject: { select: { name: true, code: true } },
                    classLevel: { select: { name: true, level: true } },
                    term: { select: { name: true } },
                },
                orderBy: { date: 'asc' },
            });
        }

        const teacher = await this.prisma.staff.findFirst({
            where: { userId: user.id },
            select: { schoolId: true }
        });

        if (!teacher) throw new NotFoundException('Teacher profile not found.');

        return this.prisma.exam.findMany({
            where: { schoolId: teacher.schoolId },
            include: {
                subject: { select: { name: true, code: true } },
                classLevel: { select: { name: true, level: true } },
                term: { select: { name: true } },
            },
            orderBy: { date: 'asc' },
        });
    }

}
