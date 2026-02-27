import os

schema_path = 'C:/arvip/jingli/backend/prisma/schema.prisma'

with open(schema_path, 'r', encoding='utf-8') as f:
    schema = f.read()

models_to_add = '''
model Quiz {
  id          String   @id @default(uuid())
  title       String
  duration    Int      // minutes
  isPublished Boolean  @default(false) @map("is_published")
  randomize   Boolean  @default(true)
  showAnswers Boolean  @default(true) @map("show_answers")
  autoGrade   Boolean  @default(true) @map("auto_grade")
  secureMode  Boolean  @default(false) @map("secure_mode")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  subjectId   String   @map("subject_id")
  subject     Subject  @relation(fields: [subjectId], references: [id])
  sectionId   String   @map("section_id")
  section     Section  @relation(fields: [sectionId], references: [id])
  teacherId   String   @map("teacher_id")
  teacher     Staff    @relation(fields: [teacherId], references: [id])

  questions   QuizQuestion[]
  attempts    QuizAttempt[]

  @@map("quizzes")
}

model QuizQuestion {
  id            String   @id @default(uuid())
  quizId        String   @map("quiz_id")
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  text          String   @db.Text
  options       String[]
  correctAnswer Int      @map("correct_answer")
  explanation   String?  @db.Text
  points        Int      @default(1)
  order         Int      @default(0)

  @@map("quiz_questions")
}

model QuizAttempt {
  id          String   @id @default(uuid())
  quizId      String   @map("quiz_id")
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  studentId   String   @map("student_id")
  student     Student  @relation(fields: [studentId], references: [id])
  score       Int?
  maxScore    Int?     @map("max_score")
  startedAt   DateTime @default(now()) @map("started_at")
  completedAt DateTime? @map("completed_at")
  answers     Json?

  @@map("quiz_attempts")
}
'''

if 'model Quiz {' not in schema:
    schema = schema + '\n' + models_to_add + '\n'

    # Add reverse relations
    schema = schema.replace('model Subject {\n', 'model Subject {\n  quizzes       Quiz[]\n')
    schema = schema.replace('model Section {\n', 'model Section {\n  quizzes       Quiz[]\n')
    schema = schema.replace('model Staff {\n', 'model Staff {\n  quizzes       Quiz[]\n')
    schema = schema.replace('model Student {\n', 'model Student {\n  quizAttempts  QuizAttempt[]\n')

    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(schema)
    print('CBT schema added')
else:
    print('CBT schema already exists')
