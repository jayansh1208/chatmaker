# ChatMakere - Real-Time Chat Application

A production-ready real-time chat application built with React, Node.js, Socket.io, and Supabase PostgreSQL.

![ChatMakere](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

- **User Authentication** - Sign up/Login/Logout using Supabase Auth (JWT-based)
- **Real-Time Messaging** - Instant bidirectional messaging with Socket.io
- **Private & Group Chats** - One-to-one and group chat rooms
- **Online/Offline Status** - Real-time user presence tracking
- **Typing Indicators** - See when someone is typing
- **Message Timestamps & Read Receipts** - Track when messages are read
- **Dark Mode & Responsive Design** - Works beautifully on desktop and mobile

## 📋 Prerequisites

Before you begin, ensure you have a **Supabase Account**.
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to **SQL Editor** in Supabase dashboard.
3. Copy the contents of `database/schema.sql`.
4. Paste and run the SQL in the SQL Editor.
5. Go to **Settings** → **API** to get your: Project URL, Anon/Public Key, and Service Role Key.

## 🚀 Getting Started Locally

This project is set up as a monolithic deployment. Both client and server run from the root directory.

1. Install all dependencies:
```bash
npm install
```

2. Create environment files:
- Create `server/.env` based on `server/.env.example` and fill in your Supabase keys.
- Create `client/.env` based on `client/.env.example` and fill in your Supabase keys. You don't need to specify `VITE_API_URL` or `VITE_SOCKET_URL` locally as they default to `http://localhost:5000`.

3. Run both client and server concurrently:
```bash
npm run dev
```

The frontend will start on your local Vite port (usually 5173), and the backend will start on 5000.

## 🚀 Automatic Deployment (Render / Railway)

You only need **ONE** single deployment for both the backend and frontend. The server automatically serves the frontend bundle in production!

1. Create a new **Web Service** on [Railway](https://railway.app) / [Render](https://render.com).
2. Connect this GitHub repository.
3. The platform will automatically use settings in `railway.toml` and root `package.json`:
   - Build Command: `npm run build` (This installs everything and builds the React app)
   - Start Command: `npm start` (This starts the Node server which serves the API and the React frontend)
4. Add these environment variables in your deployment dashboard:
   - `NODE_ENV=production`
   - `SUPABASE_URL=your_supabase_project_url`
   - `SUPABASE_ANON_KEY=your_supabase_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`
   - `JWT_SECRET=your_jwt_secret_key_here`
   - `CLIENT_URL=your_deployment_url` (Example: https://your-app.up.railway.app)
   - `SOCKET_CORS_ORIGIN=your_deployment_url`

That's it! Your entire app will be live and accessible at your deployment URL. No separate frontend hosting (like Vercel) is required.

## 📄 License
MIT License