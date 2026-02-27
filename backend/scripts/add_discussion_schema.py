import os

schema_path = r'C:\arvip\jingli\backend\prisma\schema.prisma'

with open(schema_path, 'r', encoding='utf-8') as f:
    schema = f.read()

discussion_models = """
// -----------------------------------------------------------------------------
// 1X. DISCUSSIONS
// -----------------------------------------------------------------------------

model DiscussionThread {
  id           String   @id @default(uuid())
  schoolId     String   @map("school_id")
  subjectId    String?  @map("subject_id")
  sectionId    String?  @map("section_id")
  title        String
  body         String   @db.Text
  authorId     String   @map("author_id")
  authorName   String   @map("author_name")
  authorRole   String   @map("author_role")
  pinned       Boolean  @default(false)
  locked       Boolean  @default(false)
  createdAt    DateTime @default(now()) @map("created_at")

  school       School   @relation(fields: [schoolId], references: [id])
  replies      DiscussionReply[]

  @@map("discussion_threads")
}

model DiscussionReply {
  id           String   @id @default(uuid())
  threadId     String   @map("thread_id")
  authorId     String   @map("author_id")
  authorName   String   @map("author_name")
  authorRole   String   @map("author_role")
  content      String   @db.Text
  createdAt    DateTime @default(now()) @map("created_at")

  thread       DiscussionThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  
  @@map("discussion_replies")
}
"""

if 'model DiscussionThread' not in schema:
    schema += discussion_models
    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(schema)
    print('Added Discussion models')
else:
    print('Already exists')
