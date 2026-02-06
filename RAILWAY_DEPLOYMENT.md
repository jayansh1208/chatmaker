# Railway Backend Deployment Guide

This guide will help you deploy the ChatMakere backend to Railway for free.

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app with GitHub)
- Your Supabase credentials

## Step 1: Prepare Your Repository

1. Make sure all your latest changes are committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `chatmakere` repository
6. Railway will detect it's a Node.js project

### Option B: Deploy with Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Step 3: Configure Environment Variables

1. In Railway dashboard, click on your deployed service
2. Go to **"Variables"** tab
3. Add the following environment variables:

```
NODE_ENV=production
SUPABASE_URL=https://shblqnnjtbzkihebmhgp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYmxxbm5qdGJ6a2loZWJtaGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTQyMTIsImV4cCI6MjA4NTc5MDIxMn0.VWO7LyQtIGMwq5UBdrzzP7vLWh4rbrARv6Dz4pQlkuw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYmxxbm5qdGJ6a2loZWJtaGdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIxNDIxMiwiZXhwIjoyMDg1NzkwMjEyfQ.BAEZSPVYGWFsQinQMVUQRPZdrSvrcomlue0OfIPZ0TA
JWT_SECRET=chatmakere_production_secret_key_2026
CLIENT_URL=https://chat-app-jayansh.vercel.app
SOCKET_CORS_ORIGIN=https://chat-app-jayansh.vercel.app
```

4. Click **"Add"** for each variable

## Step 4: Configure Build Settings

Railway should auto-detect the settings from `railway.toml`, but verify:

1. Go to **"Settings"** tab
2. Check **"Start Command"**: Should be `cd server && npm start`
3. Check **"Health Check Path"**: Should be `/health`

## Step 5: Get Your Backend URL

1. In Railway dashboard, go to **"Settings"** tab
2. Under **"Domains"**, click **"Generate Domain"**
3. Railway will give you a URL like: `https://chatmakere-production.up.railway.app`
4. **Copy this URL** - you'll need it for the next step

## Step 6: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your `chatmakere` project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables for **Production**:

   ```
   VITE_SUPABASE_URL=https://shblqnnjtbzkihebmhgp.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYmxxbm5qdGJ6a2loZWJtaGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTQyMTIsImV4cCI6MjA4NTc5MDIxMn0.VWO7LyQtIGMwq5UBdrzzP7vLWh4rbrARv6Dz4pQlkuw
   VITE_API_URL=<YOUR_RAILWAY_URL>
   VITE_SOCKET_URL=<YOUR_RAILWAY_URL>
   ```

   Replace `<YOUR_RAILWAY_URL>` with the URL from Step 5

5. Click **"Save"**

## Step 7: Redeploy Frontend

1. In Vercel dashboard, go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## Step 8: Verify Deployment

### Test Backend Health

1. Open your Railway URL in browser: `https://your-app.up.railway.app/health`
2. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-02-06T...",
     "service": "chatmakere-api"
   }
   ```

### Test Frontend Connection

1. Open https://chat-app-jayansh.vercel.app
2. Open browser DevTools (F12) → **Network** tab
3. Try to sign up with a new account
4. Check the Network tab - API calls should go to your Railway URL
5. You should be able to successfully create an account and login

## Troubleshooting

### Backend not starting?

1. Check Railway logs:
   - Go to Railway dashboard
   - Click on your service
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Check the logs for errors

### CORS errors?

1. Make sure `CLIENT_URL` and `SOCKET_CORS_ORIGIN` in Railway match your Vercel URL exactly
2. Redeploy the backend after changing environment variables

### "Unable to fetch" errors?

1. Verify Vercel environment variables are set correctly
2. Make sure you redeployed the frontend after updating variables
3. Check browser DevTools → Network tab to see where requests are going

## Railway Free Tier Limits

- 500 hours/month (enough for a small app)
- $5 credit/month
- Auto-sleeps after 10 minutes of inactivity
- First request after sleep may be slow (cold start)

## Next Steps

Once deployed successfully:
- ✅ Test signup/login
- ✅ Test creating chat rooms
- ✅ Test sending messages
- ✅ Test real-time features
- ✅ Share your app with friends!

---

**Need Help?** Check Railway logs or Vercel deployment logs for error messages.
