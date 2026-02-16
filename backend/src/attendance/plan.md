# Attendance Module Implementation

## DTOs
- `CreateAttendanceDto`: `studentId`, `date`, `status`, `remarks`
- `UpdateAttendanceDto`: `status`, `remarks`

## Controller
- `POST /attendance`: Record attendance
- `GET /attendance`: Get attendance (filter by date, class, student)

## Service
- Use `PrismaService` to interact with `Attendance` model.
