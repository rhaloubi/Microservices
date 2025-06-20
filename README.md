# CCang API Documentation

## Microservices Architecture

- **User Service** (BE1): Handles user authentication and management
- **Course Service** (BE2): Manages courses and enrollment
- Communication via Kafka events

## Core Endpoints

### User Service (PORT 8081)

```http
POST /api/users/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "teacher"
}

POST /api/users/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "secret123"
}

GET /api/users/teacher/name/{name}
Authorization: Bearer <token>

POST /api/courses
Content-Type: application/json
Authorization: Bearer <token>
{
  "title": "Advanced Mathematics",
  "description": "University-level math course",
  "teacherName": "John Doe"
}

GET /api/courses
GET /api/courses/teacher/{teacher_id}
```
