# Jingli School Management System

This project is structured as a split repository:

- **frontend/**: React + Vite application (The User Interface).
- **backend/**: NestJS application (The API & Business Logic).
- **supabase/**: Shared Database Migrations and Configuration.

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
# Create .env file with SUPABASE_URL and SUPABASE_KEY
npm run start:dev
```
