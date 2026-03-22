# ByteNIELIT 🚀

A full-stack campus platform — real-time chat + ERP + attendance for NIELIT students.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS variables
- **Backend**: Node.js + Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB + Mongoose
- **Storage**: Cloudinary
- **Auth**: JWT + bcrypt

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, Cloudinary keys
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

## Features
- 📅 Timetable (per branch + semester, teacher can edit)
- 📚 Notes & Assignments (Cloudinary file upload)
- 🎉 Events & Holidays (upcoming/past calendar)
- 🛠️ Complaint system (submit, track, respond)
- 💬 Real-time group chat (Socket.io, multi-room)
- 📊 Attendance + bar chart analytics
- 🔐 JWT auth with Student/Teacher/Admin roles

## Deploy
- Backend: Render.com or Railway
- Frontend: Vercel or Netlify
- DB: MongoDB Atlas (free tier)
- Files: Cloudinary (free tier)
