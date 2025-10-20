# BookShare (ShareNStudy) - Starter

This project is a Book Sharing platform (ShareNStudy) built with:
- Node.js (CommonJS) + Express
- MongoDB + Mongoose
- EJS server-side templates
- Socket.io for chat
- Multer v2 for image uploads
- Helmet v6, bcryptjs, JWT for auth

Quick start:
1. Copy `.env.example` to `.env` and edit values.
2. Install dependencies:
   npm install
3. Seed admin (optional, after MongoDB is running):
   npm run seed
   (creates admin@bookshare.local / admin123)
4. Start server:
   npm run dev

Notes:
- Serve pages through server (http://...), not file:// — static assets (css/js) are served from /public.
- Multer stores uploads in /uploads (development). Use S3 or other storage in production.
- This starter intentionally uses minimal validation — add express-validator and sanitization in production.