# ChatMakere API Documentation

Complete API reference for the ChatMakere real-time chat application.

## Base URL

- **Development:** `http://localhost:5000`
- **Production:** Your deployed backend URL

## Authentication

All API endpoints (except health check) require authentication using JWT tokens from Supabase Auth.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## REST API Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-04T16:30:00.000Z",
  "service": "chatmakere-api"
}
```

---

## Authentication Endpoints

### Create User Profile

Create a user profile after signing up with Supabase Auth.

**Endpoint:** `POST /api/auth/signup`

**Authentication:** Required

**Request Body:**
```json
{
  "username": "johndoe",
  "avatar_url": "https://example.com/avatar.jpg" // optional
}
```

**Response:**
```json
{
  "message": "User profile created successfully.",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_online": true,
    "created_at": "2024-02-04T16:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Username already taken or invalid
- `401` - Not authenticated
- `500` - Server error

---

### Get Current User Profile

Get the profile of the currently authenticated user.

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_online": true,
    "last_seen": "2024-02-04T16:30:00.000Z",
    "created_at": "2024-02-04T16:00:00.000Z"
  }
}
```

---

### Update User Profile

Update the current user's profile.

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "username": "newusername", // optional
  "avatar_url": "https://example.com/new-avatar.jpg" // optional
}
```

**Response:**
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": "uuid",
    "username": "newusername",
    "email": "john@example.com",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "is_online": true,
    "last_seen": "2024-02-04T16:30:00.000Z"
  }
}
```

---

## Room Endpoints

### Create Chat Room

Create a new private or group chat room.

**Endpoint:** `POST /api/rooms`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Group Chat", // required for groups, optional for private
  "is_group": true, // true for group, false for private
  "member_ids": ["user-uuid-1", "user-uuid-2"], // array of user IDs
  "avatar_url": "https://example.com/group-avatar.jpg" // optional
}
```

**Response:**
```json
{
  "message": "Chat room created successfully.",
  "room": {
    "id": "room-uuid",
    "name": "My Group Chat",
    "is_group": true,
    "created_by": "your-user-uuid",
    "avatar_url": "https://example.com/group-avatar.jpg",
    "created_at": "2024-02-04T16:30:00.000Z"
  }
}
```

**Notes:**
- For private chats, if a room already exists between the two users, it will return the existing room
- The creator is automatically added as an admin member

---

### Get All Rooms

Get all chat rooms the current user is a member of.

**Endpoint:** `GET /api/rooms`

**Authentication:** Required

**Response:**
```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "name": "My Group Chat",
      "is_group": true,
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2024-02-04T16:00:00.000Z",
      "updated_at": "2024-02-04T16:30:00.000Z",
      "room_members": [
        {
          "user_id": "user-uuid",
          "users": {
            "id": "user-uuid",
            "username": "johndoe",
            "avatar_url": "https://example.com/avatar.jpg",
            "is_online": true
          }
        }
      ],
      "last_message": {
        "id": "message-uuid",
        "message_text": "Hello!",
        "created_at": "2024-02-04T16:30:00.000Z",
        "users": {
          "id": "user-uuid",
          "username": "johndoe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    }
  ]
}
```

---

### Get Room Details

Get details of a specific room.

**Endpoint:** `GET /api/rooms/:roomId`

**Authentication:** Required

**URL Parameters:**
- `roomId` - UUID of the room

**Response:**
```json
{
  "room": {
    "id": "room-uuid",
    "name": "My Group Chat",
    "is_group": true,
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-02-04T16:00:00.000Z",
    "room_members": [
      {
        "user_id": "user-uuid",
        "is_admin": true,
        "users": {
          "id": "user-uuid",
          "username": "johndoe",
          "avatar_url": "https://example.com/avatar.jpg",
          "is_online": true
        }
      }
    ]
  }
}
```

**Error Responses:**
- `403` - Not a member of this room
- `404` - Room not found

---

### Get Room Messages

Get message history for a room.

**Endpoint:** `GET /api/rooms/:roomId/messages`

**Authentication:** Required

**URL Parameters:**
- `roomId` - UUID of the room

**Query Parameters:**
- `limit` - Number of messages to return (default: 50, max: 100)
- `before` - ISO timestamp to get messages before this time (for pagination)

**Example:**
```
GET /api/rooms/room-uuid/messages?limit=20&before=2024-02-04T16:00:00.000Z
```

**Response:**
```json
{
  "messages": [
    {
      "id": "message-uuid",
      "room_id": "room-uuid",
      "sender_id": "user-uuid",
      "message_text": "Hello, world!",
      "is_read": false,
      "created_at": "2024-02-04T16:30:00.000Z",
      "users": {
        "id": "user-uuid",
        "username": "johndoe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

**Notes:**
- Messages are returned in chronological order (oldest first)
- Use `before` parameter for pagination

---

### Add Room Members

Add members to a group chat (admin only).

**Endpoint:** `POST /api/rooms/:roomId/members`

**Authentication:** Required

**URL Parameters:**
- `roomId` - UUID of the room

**Request Body:**
```json
{
  "user_ids": ["user-uuid-1", "user-uuid-2"]
}
```

**Response:**
```json
{
  "message": "Members added successfully."
}
```

**Error Responses:**
- `403` - Only admins can add members
- `400` - Invalid user IDs

---

## User Endpoints

### Search Users

Search for users by username.

**Endpoint:** `GET /api/users/search`

**Authentication:** Required

**Query Parameters:**
- `q` - Search query (minimum 2 characters)

**Example:**
```
GET /api/users/search?q=john
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_online": true
    }
  ]
}
```

**Error Responses:**
- `400` - Search query too short

---

### Get User Profile

Get a user's profile by ID.

**Endpoint:** `GET /api/users/:userId`

**Authentication:** Required

**URL Parameters:**
- `userId` - UUID of the user

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_online": true,
    "last_seen": "2024-02-04T16:30:00.000Z"
  }
}
```

**Error Responses:**
- `404` - User not found

---

## Socket.io Events

### Connection

Connect to the Socket.io server with authentication.

**Client Code:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

**Server Events:**
- `connect` - Successfully connected
- `disconnect` - Disconnected from server
- `error` - Connection error

---

### Join Room

Join a chat room to receive messages.

**Event:** `join_room`

**Emit:**
```javascript
socket.emit('join_room', {
  roomId: 'room-uuid'
});
```

**Server Response:**
- `room_joined` - Successfully joined
- `error` - Failed to join (not a member)

---

### Leave Room

Leave a chat room.

**Event:** `leave_room`

**Emit:**
```javascript
socket.emit('leave_room', {
  roomId: 'room-uuid'
});
```

---

### Send Message

Send a message to a room.

**Event:** `send_message`

**Emit:**
```javascript
socket.emit('send_message', {
  roomId: 'room-uuid',
  message_text: 'Hello, world!'
});
```

**Server Response:**
- `receive_message` - Message sent successfully (broadcast to all room members)
- `error` - Failed to send message

---

### Receive Message

Receive a new message in a room.

**Event:** `receive_message`

**Listen:**
```javascript
socket.on('receive_message', (data) => {
  console.log(data);
});
```

**Data:**
```json
{
  "roomId": "room-uuid",
  "message": {
    "id": "message-uuid",
    "room_id": "room-uuid",
    "sender_id": "user-uuid",
    "message_text": "Hello, world!",
    "is_read": false,
    "created_at": "2024-02-04T16:30:00.000Z",
    "users": {
      "id": "user-uuid",
      "username": "johndoe",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

---

### Typing Indicator

Send typing status.

**Event:** `typing`

**Emit:**
```javascript
socket.emit('typing', {
  roomId: 'room-uuid',
  isTyping: true // or false
});
```

**Server Events:**
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing

**Listen:**
```javascript
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing...`);
});

socket.on('user_stopped_typing', (data) => {
  console.log(`${data.username} stopped typing`);
});
```

---

### Online/Offline Status

Track user online status.

**Events:**
- `user_online` - User came online
- `user_offline` - User went offline

**Listen:**
```javascript
socket.on('user_online', (data) => {
  console.log(`User ${data.userId} is online`);
});

socket.on('user_offline', (data) => {
  console.log(`User ${data.userId} is offline`);
});
```

---

### Message Read Receipt

Mark a message as read.

**Event:** `message_read`

**Emit:**
```javascript
socket.emit('message_read', {
  messageId: 'message-uuid',
  roomId: 'room-uuid'
});
```

**Server Event:**
- `message_read_receipt` - Message marked as read

**Listen:**
```javascript
socket.on('message_read_receipt', (data) => {
  console.log(`Message ${data.messageId} read by ${data.readBy}`);
});
```

---

## Error Handling

### HTTP Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

### Socket.io Errors

Socket errors are emitted via the `error` event:

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider adding:
- Rate limiting middleware (e.g., express-rate-limit)
- Socket.io connection limits
- Message throttling

---

## Best Practices

1. **Always handle errors** - Check for error responses
2. **Validate input** - Validate data before sending
3. **Use pagination** - For message history
4. **Clean up listeners** - Remove Socket.io listeners when unmounting components
5. **Reconnection** - Handle Socket.io reconnection gracefully
6. **Token refresh** - Refresh JWT tokens before expiry

---

## Example Usage

### Complete Chat Flow

```javascript
import { io } from 'socket.io-client';

// 1. Connect with authentication
const socket = io('http://localhost:5000', {
  auth: { token: userToken }
});

// 2. Join a room
socket.emit('join_room', { roomId: 'room-uuid' });

// 3. Listen for messages
socket.on('receive_message', (data) => {
  displayMessage(data.message);
});

// 4. Send a message
socket.emit('send_message', {
  roomId: 'room-uuid',
  message_text: 'Hello!'
});

// 5. Handle typing
let typingTimeout;
inputField.addEventListener('input', () => {
  socket.emit('typing', { roomId: 'room-uuid', isTyping: true });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { roomId: 'room-uuid', isTyping: false });
  }, 1000);
});

// 6. Clean up on unmount
socket.disconnect();
```

---

**For more information, see the main README.md and SETUP_GUIDE.md**
