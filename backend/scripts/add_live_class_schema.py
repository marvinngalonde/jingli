import os

schema_path = 'C:/arvip/jingli/backend/prisma/schema.prisma'

with open(schema_path, 'r', encoding='utf-8') as f:
    schema = f.read()

models_to_add = '''
model LiveClass {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  provider    String   @default("ZOOM") // ZOOM, Google Meet, Microsoft Teams
  meetingUrl  String   @map("meeting_url")
  meetingId   String?  @map("meeting_id")
  scheduledFor DateTime @map("scheduled_for")
  duration    Int      // minutes
  status      String   @default("SCHEDULED") // SCHEDULED, LIVE, COMPLETED
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  subjectId   String?  @map("subject_id")
  subject     Subject? @relation(fields: [subjectId], references: [id])
  sectionId   String?  @map("section_id")
  section     Section? @relation(fields: [sectionId], references: [id])
  teacherId   String   @map("teacher_id")
  teacher     Staff    @relation(fields: [teacherId], references: [id])

  @@map("live_classes")
}
'''

if 'model LiveClass {' not in schema:
    schema = schema + '\n' + models_to_add + '\n'

    # Add reverse relations
    schema = schema.replace('model Subject {\n', 'model Subject {\n  liveClasses   LiveClass[]\n')
    schema = schema.replace('model Section {\n', 'model Section {\n  liveClasses   LiveClass[]\n')
    schema = schema.replace('model Staff {\n', 'model Staff {\n  liveClasses   LiveClass[]\n')

    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(schema)
    print('LiveClass schema added')
else:
    print('LiveClass schema already exists')
