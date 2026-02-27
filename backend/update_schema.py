import sys
import os

schema_path = 'C:/arvip/jingli/backend/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to School
if 'quizzes         Quiz[]' not in content:
    content = content.replace('  alertLogs       AlertLog[]', '  alertLogs       AlertLog[]\n  quizzes         Quiz[]\n  liveClasses     LiveClass[]')

# Add to Staff
if 'quizzes            Quiz[]' not in content:
    content = content.replace('  disciplineRecords  DisciplineRecord[]', '  disciplineRecords  DisciplineRecord[]\n  quizzes            Quiz[]\n  liveClasses        LiveClass[]')

# Add to Subject
if 'quizzes     Quiz[]' not in content:
    content = content.replace('  calaRecords CalaRecord[]', '  calaRecords CalaRecord[]\n  quizzes     Quiz[]\n  liveClasses LiveClass[]')

# Add to ClassSection
if 'quizzes            Quiz[]' not in content:
    content = content.replace('  attendance         Attendance[]', '  attendance         Attendance[]\n  quizzes            Quiz[]\n  liveClasses        LiveClass[]')

# Add to Student
if 'quizAttempts    QuizAttempt[]' not in content:
    content = content.replace('  medicalProfile  MedicalProfile?', '  medicalProfile  MedicalProfile?\n  quizAttempts    QuizAttempt[]')

# Append models at the end
new_models = '''
// -----------------------------------------------------------------------------
// 17. COMPUTER BASED TESTING (CBT)
// -----------------------------------------------------------------------------

model Quiz {
  id          String   @id @default(uuid())
  schoolId    String   @map("school_id")
  teacherId   String   @map("teacher_id")
  subjectId   String   @map("subject_id")
  sectionId   String   @map("section_id")
  title       String
  description String?
  duration    Int      // minutes
  maxAttempts Int      @default(1) @map("max_attempts")
  startTime   DateTime? @map("start_time")
  endTime     DateTime? @map("end_time")
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")

  school      School   @relation(fields: [schoolId], references: [id])
  teacher     Staff    @relation(fields: [teacherId], references: [id])
  subject     Subject  @relation(fields: [subjectId], references: [id])
  section     ClassSection @relation(fields: [sectionId], references: [id])

  questions   QuizQuestion[]
  attempts    QuizAttempt[]

  @@map("quizzes")
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}

model QuizQuestion {
  id          String   @id @default(uuid())
  quizId      String   @map("quiz_id")
  type        QuestionType @default(MULTIPLE_CHOICE)
  question    String   @db.Text
  options     Json?    // Array of strings or objects { text, isCorrect }
  correctAnswer String? @map("correct_answer")
  marks       Float    @default(1)
  order       Int      @default(0)

  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@map("quiz_questions")
}

enum AttemptStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

model QuizAttempt {
  id          String   @id @default(uuid())
  quizId      String   @map("quiz_id")
  studentId   String   @map("student_id")
  startTime   DateTime @default(now()) @map("start_time")
  endTime     DateTime? @map("end_time")
  score       Float?
  status      AttemptStatus @default(IN_PROGRESS)
  answers     Json?    
  
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  student     Student  @relation(fields: [studentId], references: [id])

  @@map("quiz_attempts")
}

// -----------------------------------------------------------------------------
// 18. VIRTUAL CLASSROOM (Zoom/Meet Integration)
// -----------------------------------------------------------------------------

model LiveClass {
  id          String   @id @default(uuid())
  schoolId    String   @map("school_id")
  teacherId   String   @map("teacher_id")
  subjectId   String   @map("subject_id")
  sectionId   String   @map("section_id")
  title       String
  description String?
  provider    String   @default("ZOOM")
  meetingUrl  String   @map("meeting_url")
  meetingId   String?  @map("meeting_id")
  passcode    String?
  scheduledFor DateTime @map("scheduled_for")
  duration    Int      // minutes
  status      String   @default("SCHEDULED")
  createdAt   DateTime @default(now()) @map("created_at")

  school      School   @relation(fields: [schoolId], references: [id])
  teacher     Staff    @relation(fields: [teacherId], references: [id])
  subject     Subject  @relation(fields: [subjectId], references: [id])
  section     ClassSection @relation(fields: [sectionId], references: [id])

  @@map("live_classes")
}
'''

if 'model Quiz {' not in content:
    content += new_models

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Schema updated successfully.')
