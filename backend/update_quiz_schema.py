import os

schema_path = 'C:/arvip/jingli/backend/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'isPublished Boolean  @default(false) @map("is_published")'
replacement = '''isPublished Boolean  @default(false) @map("is_published")
  randomize   Boolean  @default(true)
  showAnswers Boolean  @default(true) @map("show_answers")
  autoGrade   Boolean  @default(true) @map("auto_grade")
  secureMode  Boolean  @default(false) @map("secure_mode")'''

if 'secureMode  Boolean' not in content:
    content = content.replace(target, replacement)
    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Schema updated successfully.")
else:
    print("Schema already has CBT flags.")
