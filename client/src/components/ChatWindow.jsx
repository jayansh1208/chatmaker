import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { formatMessageTime } from '../utils/dateUtils';

export default function ChatWindow() {
    const { currentRoom, messages, sendMessage, sendTyping, typingUsers } = useChat();
    const { profile } = useAuth();
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator
    const handleTyping = (e) => {
        setMessageText(e.target.value);

        if (!isTyping && currentRoom) {
            setIsTyping(true);
            sendTyping(currentRoom.id, true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (currentRoom) {
                sendTyping(currentRoom.id, false);
            }
        }, 1000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!messageText.trim() || !currentRoom) return;

        sendMessage(currentRoom.id, messageText.trim());
        setMessageText('');
        setIsTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (currentRoom) {
            sendTyping(currentRoom.id, false);
        }
    };

    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-900">
                <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Select a chat to start messaging
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                        Choose a conversation from the sidebar
                    </p>
                </div>
            </div>
        );
    }

    const getRoomName = () => {
        if (currentRoom.is_group) {
            return currentRoom.name || 'Group Chat';
        }

        const otherMember = currentRoom.room_members?.find(
            (member) => member.user_id !== profile?.id
        );
        return otherMember?.users?.username || 'Private Chat';
    };

    const isUserOnline = () => {
        if (currentRoom.is_group) return false;

        const otherMember = currentRoom.room_members?.find(
            (member) => member.user_id !== profile?.id
        );
        return otherMember?.users?.is_online || false;
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900 h-full">
            {/* Chat Header */}
            <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                                {getRoomName().charAt(0).toUpperCase()}
                            </div>
                            {isUserOnline() && (
                                <span className="absolute bottom-0 right-0 online-indicator"></span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">{getRoomName()}</h2>
                            {isUserOnline() && (
                                <p className="text-sm text-green-500">Online</p>
                            )}
                        </div>
                    </div>

                    {/* Room actions */}
                    <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isSent = message.sender_id === profile?.id;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                        return (
                            <div
                                key={message.id}
                                className={`flex items-end space-x-2 ${isSent ? 'flex-row-reverse space-x-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className="w-8 h-8 flex-shrink-0">
                                    {showAvatar && !isSent && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {message.users?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-xs`}>
                                    {showAvatar && !isSent && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
                                            {message.users?.username}
                                        </span>
                                    )}
                                    <div className={`message-bubble ${isSent ? 'message-bubble-sent' : 'message-bubble-received'}`}>
                                        <p className="text-sm">{message.message_text}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">
                                        {formatMessageTime(message.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8"></div>
                        <div className="bg-gray-200 dark:bg-dark-700 px-4 py-2 rounded-2xl rounded-bl-md">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 px-6 py-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        value={messageText}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="chat-input flex-1"
                    />

                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white rounded-full transition-all disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
