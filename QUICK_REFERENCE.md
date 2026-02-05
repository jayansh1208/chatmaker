# ChatMakere - Quick Reference Card

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials

# Frontend
cd client
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Development
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Production Build
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
npm run preview
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` - Create profile
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List rooms
- `GET /api/rooms/:id` - Get room
- `GET /api/rooms/:id/messages` - Get messages
- `POST /api/rooms/:id/members` - Add members

### Users
- `GET /api/users/search?q=` - Search users
- `GET /api/users/:id` - Get user

---

## 🔌 Socket.io Events

### Emit (Client → Server)
```javascript
socket.emit('join_room', { roomId })
socket.emit('leave_room', { roomId })
socket.emit('send_message', { roomId, message_text })
socket.emit('typing', { roomId, isTyping })
socket.emit('message_read', { messageId, roomId })
```

### Listen (Server → Client)
```javascript
socket.on('receive_message', (data) => {})
socket.on('user_online', (data) => {})
socket.on('user_offline', (data) => {})
socket.on('user_typing', (data) => {})
socket.on('user_stopped_typing', (data) => {})
socket.on('message_read_receipt', (data) => {})
```

---

## 🗄️ Database Tables

### users
```sql
id, username, email, avatar_url, is_online, last_seen, created_at
```

### chat_rooms
```sql
id, name, is_group, created_by, avatar_url, created_at
```

### room_members
```sql
id, room_id, user_id, joined_at, is_admin
```

### messages
```sql
id, room_id, sender_id, message_text, is_read, created_at
```

### typing_indicators
```sql
id, room_id, user_id, is_typing, updated_at
```

---

## 🎨 Component Structure

```
App
├── AuthProvider
│   └── ChatProvider
│       ├── Sidebar
│       │   └── RoomList
│       ├── ChatWindow
│       │   ├── MessageList
│       │   └── MessageInput
│       └── NewChatModal
│           └── UserSearch
```

---

## 🔐 Authentication Flow

1. User signs up with Supabase Auth
2. Backend creates user profile
3. Frontend receives JWT token
4. Token stored in Supabase session
5. Token sent with all API requests
6. Socket.io connects with token

---

## 💬 Message Flow

1. User types message
2. Frontend emits `send_message`
3. Backend validates & saves to DB
4. Backend emits `receive_message` to room
5. All clients in room receive message
6. Frontend displays message

---

## 🎯 Common Tasks

### Create Private Chat
```javascript
await createRoom(null, false, [otherUserId], null)
```

### Create Group Chat
```javascript
await createRoom('Group Name', true, [user1, user2], null)
```

### Send Message
```javascript
sendMessage(roomId, 'Hello!')
```

### Search Users
```javascript
const { users } = await apiService.searchUsers('john')
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check .env file exists
- Verify Supabase credentials
- Check port 5000 is available

### Socket.io won't connect
- Verify backend is running
- Check CORS settings
- Verify token is valid

### Messages not appearing
- Check both users in same room
- Verify Socket.io connected
- Check browser console

---

## 📚 File Locations

### Configuration
- Backend env: `server/.env`
- Frontend env: `client/.env`
- Database: `database/schema.sql`

### Key Files
- Backend entry: `server/src/index.js`
- Frontend entry: `client/src/main.jsx`
- Socket handler: `server/src/socket/index.js`

### Documentation
- Setup: `SETUP_GUIDE.md`
- API: `API_DOCUMENTATION.md`
- Summary: `PROJECT_SUMMARY.md`

---

## 🚀 Deployment URLs

### Vercel (Frontend)
```bash
vercel --prod
```

### Render (Backend)
```bash
# Push to GitHub, Render auto-deploys
```

### Supabase (Database)
```bash
# Already hosted, just run schema.sql
```

---

## 📞 Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com

---

## ⚡ Keyboard Shortcuts

### Development
- `Ctrl+C` - Stop server
- `Ctrl+Shift+R` - Hard refresh browser
- `F12` - Open DevTools

### VS Code
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search in files
- `Ctrl+`` - Toggle terminal

---

## 📊 Port Reference

- **Frontend:** 5173 (Vite default)
- **Backend:** 5000 (configurable)
- **Database:** Hosted on Supabase

---

## 🎨 Color Palette

### Primary Colors
- `primary-500`: #0ea5e9 (Sky Blue)
- `primary-600`: #0284c7 (Darker Blue)

### Dark Mode
- `dark-800`: #1e293b (Background)
- `dark-700`: #334155 (Cards)
- `dark-600`: #475569 (Borders)

---

## ✅ Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] CORS configured correctly
- [ ] Production URLs updated
- [ ] Error handling tested
- [ ] Security reviewed

---

**Keep this card handy for quick reference! 📌**
