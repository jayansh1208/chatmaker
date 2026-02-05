# ChatMakere - Step-by-Step Setup Guide

This guide will walk you through setting up the ChatMakere real-time chat application from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **Git** (optional, for version control)
- ✅ **Code Editor** (VS Code recommended)
- ✅ **Supabase Account** (free) - [Sign up](https://supabase.com)

### Verify Installation

Open your terminal and run:

```bash
node --version  # Should show v18 or higher
npm --version   # Should show 8 or higher
```

---

## 2. Supabase Setup

### Step 2.1: Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** ChatMakere (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2.2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `database/schema.sql` from the project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

### Step 2.3: Get API Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy and save these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep this secret!

---

## 3. Backend Setup

### Step 3.1: Install Dependencies

```bash
cd server
npm install
```

This will install:
- express
- socket.io
- @supabase/supabase-js
- cors
- dotenv
- jsonwebtoken

### Step 3.2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor

3. Fill in your Supabase credentials:
   ```env
   PORT=5000
   NODE_ENV=development

   # From Supabase Settings → API
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

   # Generate a random string for JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this

   # Frontend URL (default for Vite)
   CLIENT_URL=http://localhost:5173
   SOCKET_CORS_ORIGIN=http://localhost:5173
   ```

4. **Generate JWT Secret:**
   ```bash
   # On Mac/Linux
   openssl rand -base64 32

   # On Windows (PowerShell)
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

### Step 3.3: Verify Backend Setup

```bash
npm run dev
```

You should see:
```
==================================================
🚀 Server running on port 5000
📡 Environment: development
🌐 API: http://localhost:5000
🔌 Socket.io: Ready for connections
==================================================
```

Press `Ctrl+C` to stop the server.

---

## 4. Frontend Setup

### Step 4.1: Install Dependencies

```bash
cd client
npm install
```

This will install:
- react
- react-dom
- socket.io-client
- @supabase/supabase-js
- react-router-dom
- tailwindcss
- And other dependencies

### Step 4.2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor

3. Fill in your configuration:
   ```env
   # From Supabase Settings → API
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

   # Backend URLs (default for local development)
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Step 4.3: Verify Frontend Setup

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 5. Running the Application

### Step 5.1: Start Backend

Open a terminal and run:

```bash
cd server
npm run dev
```

Keep this terminal open.

### Step 5.2: Start Frontend

Open a **NEW** terminal and run:

```bash
cd client
npm run dev
```

Keep this terminal open too.

### Step 5.3: Open in Browser

1. Open your browser
2. Go to `http://localhost:5173`
3. You should see the ChatMakere login page

---

## 6. Testing the Application

### Test 6.1: Create First User

1. Click **"Sign Up"**
2. Enter:
   - **Username:** testuser1
   - **Email:** test1@example.com
   - **Password:** password123
3. Click **"Sign Up"**
4. You should be logged in and see the chat interface

### Test 6.2: Create Second User

1. Open a **new incognito/private browser window**
2. Go to `http://localhost:5173`
3. Click **"Sign Up"**
4. Enter:
   - **Username:** testuser2
   - **Email:** test2@example.com
   - **Password:** password123
5. Click **"Sign Up"**

### Test 6.3: Start a Chat

**In testuser2's window:**
1. Click the **"+"** button (New Chat)
2. Search for "testuser1"
3. Click on testuser1
4. Click **"Create Chat"**
5. Type a message: "Hello!"
6. Press Enter

**In testuser1's window:**
1. You should see the new chat appear in the sidebar
2. Click on it
3. You should see the message "Hello!"
4. Reply with "Hi there!"

**In testuser2's window:**
1. You should instantly see the reply!

### Test 6.4: Test Features

Try these features:
- ✅ **Typing Indicator:** Start typing and watch the other window
- ✅ **Online Status:** Close one browser - the other should show offline
- ✅ **Dark Mode:** Click the moon icon in the top bar
- ✅ **Group Chat:** Create a chat with multiple users

---

## 7. Deployment

### 7.1: Deploy Backend (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** chatmakere-api
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as your local `.env`)
6. Click **"Create Web Service"**
7. Copy the deployed URL (e.g., `https://chatmakere-api.onrender.com`)

### 7.2: Deploy Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` → Your Render backend URL
   - `VITE_SOCKET_URL` → Your Render backend URL
6. Click **"Deploy"**

### 7.3: Update Backend CORS

After deploying frontend:
1. Go to your Render dashboard
2. Update environment variables:
   - `CLIENT_URL` → Your Vercel URL
   - `SOCKET_CORS_ORIGIN` → Your Vercel URL
3. Save and redeploy

---

## 8. Troubleshooting

### Problem: Backend won't start

**Error:** `Missing required environment variable`

**Solution:**
- Check your `.env` file exists in the `server` folder
- Verify all variables are set (no empty values)
- Make sure there are no extra spaces

---

### Problem: Frontend shows "Failed to fetch"

**Error:** Network errors in browser console

**Solution:**
- Verify backend is running (`http://localhost:5000/health` should work)
- Check `VITE_API_URL` in frontend `.env`
- Ensure CORS is configured correctly in backend

---

### Problem: Socket.io won't connect

**Error:** "WebSocket connection failed"

**Solution:**
- Check backend is running
- Verify `SOCKET_CORS_ORIGIN` matches frontend URL
- Check browser console for specific errors
- Try refreshing the page

---

### Problem: Can't sign up

**Error:** "Failed to create user profile"

**Solution:**
- Verify database schema was run successfully
- Check Supabase credentials are correct
- Look at backend logs for specific errors
- Ensure RLS policies are enabled

---

### Problem: Messages not appearing

**Solution:**
- Check both users are in the same room
- Verify Socket.io connection (check browser console)
- Refresh both browser windows
- Check backend logs for errors

---

### Problem: "Username already taken"

**Solution:**
- Choose a different username
- Or delete the user from Supabase:
  1. Go to Supabase → Authentication → Users
  2. Find and delete the user
  3. Go to Table Editor → users table
  4. Delete the user record

---

## 🎉 Success!

If you've made it this far, congratulations! You now have a fully functional real-time chat application.

### Next Steps

- Customize the UI colors in `tailwind.config.js`
- Add more features (file uploads, emojis, etc.)
- Deploy to production
- Share with friends!

### Need Help?

- Check the main `README.md` for more details
- Review the code comments
- Check browser console for errors
- Check backend terminal for errors

---

**Happy Coding! 💻**
