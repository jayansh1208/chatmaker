import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/auth.js';
import { validateSocketRoomMembership } from '../middleware/validateRoom.js';
import { supabaseAdmin } from '../config/supabase.js';

// Store active users and their socket IDs
const activeUsers = new Map(); // userId -> Set of socketIds
const typingUsers = new Map(); // roomId -> Set of userIds

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? (process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL || true)
                : true,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const username = socket.user.email;

        console.log(`User connected: ${username} (${userId})`);

        // Add user to active users
        if (!activeUsers.has(userId)) {
            activeUsers.set(userId, new Set());
        }
        activeUsers.get(userId).add(socket.id);

        // Update user online status
        updateUserOnlineStatus(userId, true);

        // Broadcast user online status to all clients
        socket.broadcast.emit('user_online', { userId });

        /**
         * JOIN_ROOM event
         * User joins a chat room
         */
        socket.on('join_room', async ({ roomId }) => {
            try {
                // Validate room membership
                const isMember = await validateSocketRoomMembership(socket, roomId);

                if (!isMember) {
                    socket.emit('error', {
                        message: 'You are not a member of this room.'
                    });
                    return;
                }

                // Join the room
                socket.join(roomId);
                console.log(`User ${username} joined room ${roomId}`);

                // Notify others in the room
                socket.to(roomId).emit('user_joined_room', {
                    roomId,
                    userId,
                    username
                });

                // Send confirmation to user
                socket.emit('room_joined', { roomId });
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', {
                    message: 'Failed to join room.'
                });
            }
        });

        /**
         * LEAVE_ROOM event
         * User leaves a chat room
         */
        socket.on('leave_room', ({ roomId }) => {
            socket.leave(roomId);
            console.log(`User ${username} left room ${roomId}`);

            // Remove from typing users
            if (typingUsers.has(roomId)) {
                typingUsers.get(roomId).delete(userId);
                socket.to(roomId).emit('user_stopped_typing', { roomId, userId });
            }
        });

        /**
         * SEND_MESSAGE event
         * User sends a message to a room
         */
        socket.on('send_message', async ({ roomId, message_text }) => {
            try {
                // Validate room membership
                const isMember = await validateSocketRoomMembership(socket, roomId);

                if (!isMember) {
                    socket.emit('error', {
                        message: 'You are not a member of this room.'
                    });
                    return;
                }

                // Validate message
                if (!message_text || message_text.trim().length === 0) {
                    socket.emit('error', {
                        message: 'Message cannot be empty.'
                    });
                    return;
                }

                // Save message to database
                const { data: message, error } = await supabaseAdmin
                    .from('messages')
                    .insert([
                        {
                            room_id: roomId,
                            sender_id: userId,
                            message_text: message_text.trim()
                        }
                    ])
                    .select(`
            *,
            users(id, username, avatar_url)
          `)
                    .single();

                if (error) {
                    console.error('Error saving message:', error);
                    socket.emit('error', {
                        message: 'Failed to send message.'
                    });
                    return;
                }

                // Update room's updated_at timestamp
                await supabaseAdmin
                    .from('chat_rooms')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', roomId);

                // Broadcast message to all users in the room
                io.to(roomId).emit('receive_message', {
                    roomId,
                    message
                });

                // Stop typing indicator for this user
                if (typingUsers.has(roomId)) {
                    typingUsers.get(roomId).delete(userId);
                    socket.to(roomId).emit('user_stopped_typing', { roomId, userId });
                }

                console.log(`Message sent in room ${roomId} by ${username}`);
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', {
                    message: 'Failed to send message.'
                });
            }
        });

        /**
         * TYPING event
         * User is typing in a room
         */
        socket.on('typing', async ({ roomId, isTyping }) => {
            try {
                // Validate room membership
                const isMember = await validateSocketRoomMembership(socket, roomId);

                if (!isMember) return;

                if (!typingUsers.has(roomId)) {
                    typingUsers.set(roomId, new Set());
                }

                if (isTyping) {
                    typingUsers.get(roomId).add(userId);
                    socket.to(roomId).emit('user_typing', { roomId, userId, username });
                } else {
                    typingUsers.get(roomId).delete(userId);
                    socket.to(roomId).emit('user_stopped_typing', { roomId, userId });
                }
            } catch (error) {
                console.error('Typing indicator error:', error);
            }
        });

        /**
         * MESSAGE_READ event
         * Mark message as read
         */
        socket.on('message_read', async ({ messageId, roomId }) => {
            try {
                // Validate room membership
                const isMember = await validateSocketRoomMembership(socket, roomId);

                if (!isMember) return;

                // Update message read status
                const { error } = await supabaseAdmin
                    .from('messages')
                    .update({ is_read: true })
                    .eq('id', messageId);

                if (!error) {
                    // Notify sender that message was read
                    socket.to(roomId).emit('message_read_receipt', {
                        messageId,
                        roomId,
                        readBy: userId
                    });
                }
            } catch (error) {
                console.error('Message read error:', error);
            }
        });

        /**
         * DISCONNECT event
         * User disconnects
         */
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${username} (${userId})`);

            // Remove socket from active users
            if (activeUsers.has(userId)) {
                activeUsers.get(userId).delete(socket.id);

                // If user has no more active connections, mark as offline
                if (activeUsers.get(userId).size === 0) {
                    activeUsers.delete(userId);
                    updateUserOnlineStatus(userId, false);

                    // Broadcast user offline status
                    socket.broadcast.emit('user_offline', { userId });
                }
            }

            // Remove from all typing indicators
            typingUsers.forEach((users, roomId) => {
                if (users.has(userId)) {
                    users.delete(userId);
                    socket.to(roomId).emit('user_stopped_typing', { roomId, userId });
                }
            });
        });

        /**
         * ERROR event handler
         */
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    console.log('Socket.io server initialized');
    return io;
};

/**
 * Update user online status in database
 */
const updateUserOnlineStatus = async (userId, isOnline) => {
    try {
        await supabaseAdmin
            .from('users')
            .update({
                is_online: isOnline,
                last_seen: new Date().toISOString()
            })
            .eq('id', userId);
    } catch (error) {
        console.error('Error updating user status:', error);
    }
};

/**
 * Get online users
 */
export const getOnlineUsers = () => {
    return Array.from(activeUsers.keys());
};
