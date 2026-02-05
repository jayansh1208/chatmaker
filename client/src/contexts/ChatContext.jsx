import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState({});
    const [loading, setLoading] = useState(false);

    // Load rooms
    const loadRooms = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await apiService.getRooms();
            setRooms(data.rooms || []);
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load messages for a room
    const loadMessages = useCallback(async (roomId) => {
        try {
            const data = await apiService.getRoomMessages(roomId);
            setMessages(prev => ({
                ...prev,
                [roomId]: data.messages || []
            }));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, []);

    // Create a new room
    const createRoom = async (name, isGroup, memberIds, avatarUrl) => {
        try {
            const data = await apiService.createRoom(name, isGroup, memberIds, avatarUrl);
            await loadRooms();
            return data.room;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    };

    // Send a message
    const sendMessage = useCallback((roomId, messageText) => {
        socketService.sendMessage(roomId, messageText);
    }, []);

    // Join a room
    const joinRoom = useCallback(async (room) => {
        if (currentRoom?.id === room.id) return;

        // Leave previous room
        if (currentRoom) {
            socketService.leaveRoom(currentRoom.id);
        }

        // Join new room
        setCurrentRoom(room);
        socketService.joinRoom(room.id);

        // Load messages if not already loaded
        if (!messages[room.id]) {
            await loadMessages(room.id);
        }
    }, [currentRoom, messages, loadMessages]);

    // Send typing indicator
    const sendTyping = useCallback((roomId, isTyping) => {
        socketService.sendTyping(roomId, isTyping);
    }, []);

    // Socket event handlers
    useEffect(() => {
        if (!user || !socketService.isConnected()) return;

        // Receive message
        const handleReceiveMessage = ({ roomId, message }) => {
            setMessages(prev => ({
                ...prev,
                [roomId]: [...(prev[roomId] || []), message]
            }));

            // Update room's last message
            setRooms(prev => prev.map(room =>
                room.id === roomId
                    ? { ...room, last_message: message, updated_at: message.created_at }
                    : room
            ));
        };

        // User online
        const handleUserOnline = ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        };

        // User offline
        const handleUserOffline = ({ userId }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        };

        // User typing
        const handleUserTyping = ({ roomId, userId, username }) => {
            setTypingUsers(prev => ({
                ...prev,
                [roomId]: [...(prev[roomId] || []).filter(u => u.userId !== userId), { userId, username }]
            }));
        };

        // User stopped typing
        const handleUserStoppedTyping = ({ roomId, userId }) => {
            setTypingUsers(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).filter(u => u.userId !== userId)
            }));
        };

        // Message read receipt
        const handleMessageRead = ({ messageId, roomId, readBy }) => {
            setMessages(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).map(msg =>
                    msg.id === messageId ? { ...msg, is_read: true } : msg
                )
            }));
        };

        // Register event listeners
        socketService.on('receive_message', handleReceiveMessage);
        socketService.on('user_online', handleUserOnline);
        socketService.on('user_offline', handleUserOffline);
        socketService.on('user_typing', handleUserTyping);
        socketService.on('user_stopped_typing', handleUserStoppedTyping);
        socketService.on('message_read_receipt', handleMessageRead);

        // Cleanup
        return () => {
            socketService.off('receive_message', handleReceiveMessage);
            socketService.off('user_online', handleUserOnline);
            socketService.off('user_offline', handleUserOffline);
            socketService.off('user_typing', handleUserTyping);
            socketService.off('user_stopped_typing', handleUserStoppedTyping);
            socketService.off('message_read_receipt', handleMessageRead);
        };
    }, [user]);

    // Load rooms on mount
    useEffect(() => {
        if (user) {
            loadRooms();
        }
    }, [user, loadRooms]);

    const value = {
        rooms,
        currentRoom,
        messages: messages[currentRoom?.id] || [],
        onlineUsers,
        typingUsers: typingUsers[currentRoom?.id] || [],
        loading,
        loadRooms,
        createRoom,
        joinRoom,
        sendMessage,
        sendTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
