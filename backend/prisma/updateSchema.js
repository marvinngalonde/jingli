const fs = require('fs');

let schema = fs.readFileSync('schema.prisma', 'utf8');

// Replace @relation(...) where it has references: [id] but NO onDelete
schema = schema.replace(/(@relation\([^)]*references:\s*\[[^\]]+\])(?!,\s*onDelete)/g, '$1, onDelete: Cascade');

fs.writeFileSync('schema.prisma', schema);
console.log('Schema updated successfully.');
