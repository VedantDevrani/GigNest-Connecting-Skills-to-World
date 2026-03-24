================================================================================
                            GIGNEST — ARCHITECTURE DOCUMENT
================================================================================

Architecture Style:
Client-Server (Monolithic backend)

Frontend:
React / Next.js
Tailwind CSS
Axios

Backend:
Node.js
Express.js
Prisma ORM

Database:
PostgreSQL

Authentication:
JWT
bcrypt

Architecture Flow:
User → Frontend → API → Backend → Database
Database → Backend → Frontend → UI Render

Middleware:
Authentication
Role Authorization
Validation
Error Handling

Deployment:
Frontend → Vercel
Backend → Render/Railway
Database → Neon/Supabase

Security:
Password hashing
Token expiration
Input validation
Role-based route protection

================================================================================
END OF ARCHITECTURE DOCUMENT
================================================================================