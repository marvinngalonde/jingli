const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sql = `
-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read_status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create events table
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "events_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
`;

async function main() {
    console.log('Connecting to database via Prisma...');
    try {
        await prisma.$connect();
        console.log('Successfully connected. Executing Raw SQL...');

        // Split SQL into individual commands because some drivers/adapters don't like multiple commands in one executeRaw
        const commands = sql.split(';').map(c => c.trim()).filter(c => c.length > 0 && !c.startsWith('--'));

        for (const command of commands) {
            console.log(`Executing: ${command.substring(0, 50)}...`);
            await prisma.$executeRawUnsafe(command);
        }

        console.log('Tables created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
