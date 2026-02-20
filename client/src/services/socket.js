import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? undefined : 'http://localhost:5000');

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    /**
     * Connect to Socket.io server
     */
    connect(token) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from Socket.io server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    /**
     * Join a chat room
     */
    joinRoom(roomId) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('join_room', { roomId });
    }

    /**
     * Leave a chat room
     */
    leaveRoom(roomId) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('leave_room', { roomId });
    }

    /**
     * Send a message
     */
    sendMessage(roomId, message_text) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('send_message', { roomId, message_text });
    }

    /**
     * Send typing indicator
     */
    sendTyping(roomId, isTyping) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('typing', { roomId, isTyping });
    }

    /**
     * Mark message as read
     */
    markMessageRead(messageId, roomId) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('message_read', { messageId, roomId });
    }

    /**
     * Listen to an event
     */
    on(event, callback) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from stored listeners
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (!this.socket) return;

        this.socket.removeAllListeners(event);
        this.listeners.delete(event);
    }

    /**
     * Check if socket is connected
     */
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const socketService = new SocketService();
