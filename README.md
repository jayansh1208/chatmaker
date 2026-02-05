# ChatMakere - Real-Time Chat Application

A production-ready real-time chat application built with React, Node.js, Socket.io, and Supabase PostgreSQL.

![ChatMakere](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Sign up/Login/Logout using Supabase Auth (JWT-based)
- ✅ **Real-Time Messaging** - Instant bidirectional messaging with Socket.io
- ✅ **Private & Group Chats** - One-to-one and group chat rooms
- ✅ **Online/Offline Status** - Real-time user presence tracking
- ✅ **Typing Indicators** - See when someone is typing
- ✅ **Message Timestamps** - All messages include sender, room, text, and timestamp
- ✅ **Message Read Receipts** - Track when messages are read
- ✅ **Dark Mode** - Beautiful dark theme support
- ✅ **Responsive Design** - Works on desktop and mobile

### Technical Features
- 🔐 JWT-based authentication with Supabase
- 🔄 Real-time updates with Socket.io
- 📦 PostgreSQL database with Row Level Security (RLS)
- 🎨 Modern UI with Tailwind CSS
- 🚀 Production-ready deployment configuration
- 🔒 Secure API with authentication middleware
- 📱 Mobile-responsive design

## 📁 Project Structure

```
chatmakere/
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth, Chat)
│   │   ├── services/      # API and Socket services
│   │   ├── lib/           # Supabase client
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                # Node.js backend (Express + Socket.io)
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── socket/       # Socket.io handlers
│   │   └── index.js      # Server entry point
│   ├── package.json
│   └── .env.example
│
├── database/             # PostgreSQL schema
│   └── schema.sql       # Database schema with RLS policies
│
└── README.md            # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Supabase JS** - Authentication and database client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **Supabase** - PostgreSQL database and authentication
- **JWT** - Token-based authentication

### Database
- **PostgreSQL** (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (free tier works)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chatmakere
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** in Supabase dashboard
4. Copy the contents of `database/schema.sql`
5. Paste and run the SQL in the SQL Editor
6. Go to **Settings** → **API** to get your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Run the Application

**Start the backend server:**

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

**Start the frontend (in a new terminal):**

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

### 6. Create Your First Account

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up"
3. Enter your email, password, and username
4. You're ready to chat!

## 🗄️ Database Schema

### Tables

#### `users`
- Extends Supabase Auth users with profile information
- Fields: id, username, email, avatar_url, is_online, last_seen

#### `chat_rooms`
- Stores chat room information
- Fields: id, name, is_group, created_by, avatar_url

#### `room_members`
- Links users to chat rooms
- Fields: id, room_id, user_id, joined_at, is_admin

#### `messages`
- Stores all chat messages
- Fields: id, room_id, sender_id, message_text, is_read, created_at

#### `typing_indicators`
- Tracks real-time typing status
- Fields: id, room_id, user_id, is_typing

### Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only see rooms they're members of
- Users can only send messages to rooms they're in
- Users can only view messages from their rooms

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user profile after signup
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Rooms
- `POST /api/rooms` - Create a new chat room
- `GET /api/rooms` - Get all user's chat rooms
- `GET /api/rooms/:roomId` - Get specific room details
- `GET /api/rooms/:roomId/messages` - Get chat history
- `POST /api/rooms/:roomId/members` - Add members to group

### Users
- `GET /api/users/search?q=query` - Search for users
- `GET /api/users/:userId` - Get user profile

## 🔌 Socket.io Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `message_read` - Mark message as read

### Server → Client
- `receive_message` - Receive a new message
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `message_read_receipt` - Message was read

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. **Create a new Web Service** on Render or Railway
2. **Connect your repository**
3. **Set build command:** `cd server && npm install`
4. **Set start command:** `cd server && npm start`
5. **Add environment variables:**
   - `PORT` (auto-set by platform)
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `CLIENT_URL` (your frontend URL)
   - `SOCKET_CORS_ORIGIN` (your frontend URL)

### Frontend Deployment (Vercel)

1. **Import your repository** to Vercel
2. **Set root directory:** `client`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL)
   - `VITE_SOCKET_URL` (your backend URL)

## 🎨 UI Features

- **Modern Design** - Clean and intuitive interface
- **Dark Mode** - Toggle between light and dark themes
- **Smooth Animations** - Polished user experience
- **Responsive Layout** - Works on all screen sizes
- **Online Indicators** - Green dots for online users
- **Typing Indicators** - Animated dots when users are typing
- **Message Bubbles** - Different styles for sent/received messages
- **Auto-scroll** - Automatically scrolls to newest messages

## 🔒 Security Features

- JWT-based authentication
- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- CORS protection
- Environment variable protection
- Secure WebSocket connections

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Backend won't start
- Check if all environment variables are set
- Ensure Supabase credentials are correct
- Check if port 5000 is available

### Frontend won't connect
- Verify backend is running
- Check CORS settings in backend
- Ensure environment variables are set correctly

### Socket.io connection fails
- Check if backend is running
- Verify SOCKET_CORS_ORIGIN matches frontend URL
- Check browser console for errors

### Database errors
- Ensure schema.sql was run successfully
- Check RLS policies are enabled
- Verify Supabase service role key is correct

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Socket.io Documentation](https://socket.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express Documentation](https://expressjs.com/)

## 📄 License

MIT License - feel free to use this project for learning or production!

## 👨‍💻 Author

Built with ❤️ by a senior full-stack JavaScript engineer

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Chatting! 💬**
Project deployed on Vercel