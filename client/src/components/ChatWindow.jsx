import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { formatMessageTime } from '../utils/dateUtils';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWindow() {
    const { currentRoom, messages, sendMessage, sendTyping, typingUsers } = useChat();
    const { profile } = useAuth();
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        setShowEmojiPicker(false); // Close picker on send

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

    const getRoomAvatar = () => {
        if (currentRoom.avatar_url) return currentRoom.avatar_url;

        if (!currentRoom.is_group) {
            const otherMember = currentRoom.room_members?.find(
                (member) => member.user_id !== profile?.id
            );
            return otherMember?.users?.avatar_url;
        }

        return null;
    };

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
        <div className="flex-1 flex flex-col h-full bg-[#f4f4f9] dark:bg-dark-950 overflow-hidden relative border-l border-[#f0f4f8] dark:border-dark-700">
            {/* Chat Header */}
            <div className="bg-white dark:bg-dark-900 border-b border-[#f0f4f8] dark:border-dark-700 px-6 py-[14px] w-full z-10 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {getRoomAvatar() ? (
                                <img src={getRoomAvatar()} alt="avatar" className="w-[38px] h-[38px] rounded-full object-cover" />
                            ) : (
                                <div className="w-[38px] h-[38px] rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                                    {getRoomName().charAt(0).toUpperCase()}
                                </div>
                            )}
                            {isUserOnline() && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#06d6a0] border-2 border-white dark:border-dark-900 rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-[15px] text-[#495057] dark:text-gray-200">{getRoomName()}</h2>
                            {isUserOnline() && (
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-[#06d6a0] rounded-full"></span>
                                    <span className="text-[13px] text-[#7a7f9a] dark:text-gray-500">Active now</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Room actions (Chatvia-style icons) */}
                    <div className="flex items-center space-x-1">
                        <button className="p-2 text-[#878a92] dark:text-gray-400 hover:text-primary-500 transition-colors" title="Search">
                            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="p-2 text-[#878a92] dark:text-gray-400 hover:text-primary-500 transition-colors hidden sm:block" title="Voice Call">
                            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                        <button className="p-2 text-[#878a92] dark:text-gray-400 hover:text-primary-500 transition-colors hidden sm:block" title="Video Call">
                            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="p-2 text-[#878a92] dark:text-gray-400 hover:text-primary-500 transition-colors" title="More">
                            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                        <button className="p-2 text-[#878a92] dark:text-gray-400 hover:text-primary-500 transition-colors" title="Settings">
                            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 pt-6 pb-6 space-y-7 relative">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 font-medium dark:text-slate-400">No messages yet. Start the conversation!</p>
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

                                {/* Message Content Group */}
                                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                                    {showAvatar && !isSent && (
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1 tracking-wide">
                                            {message.users?.username}
                                        </span>
                                    )}
                                    <div className={`message-bubble ${isSent ? 'message-bubble-sent' : 'message-bubble-received'}`}>
                                        <p className="text-[15px] leading-relaxed">{message.message_text}</p>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 px-1 opactiy-70">
                                        {formatMessageTime(message.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center space-x-2 animate-fade-in pl-10">
                        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-soft">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Message Input - Fixed Bottom Bar */}
            <div className="bg-white dark:bg-dark-900 border-t border-[#f0f4f8] dark:border-dark-700 px-6 py-[18px] w-full flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 w-full">
                    {/* Attachments / Extras */}
                    <div className="flex space-x-1 shrink-0">
                        <button type="button" className="p-2.5 text-[#878a92] hover:text-primary-500 dark:text-gray-400 transition-colors" title="More">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                        <button type="button" className="p-2.5 text-[#878a92] hover:text-primary-500 dark:text-gray-400 transition-colors" title="Attach file">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <button type="button" className="p-2.5 text-[#878a92] hover:text-[#f1b44c] dark:text-gray-400 transition-colors" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Emoji Picker Popup */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-[75px] left-6 z-50">
                            <EmojiPicker
                                onEmojiClick={(emojiData) => setMessageText(prev => prev + emojiData.emoji)}
                                theme="auto"
                                searchDisabled={false}
                                skinTonesDisabled={true}
                                height={350}
                            />
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={handleTyping}
                        placeholder="Enter Message..."
                        className="flex-1 bg-[#e6ebf5] dark:bg-dark-800 border-none px-4 py-[11px] rounded text-[15px] focus:ring-0 placeholder-[#878a92] dark:placeholder-gray-500 dark:text-white"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-[11px] bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/60 dark:disabled:bg-primary-600/40 text-white rounded transition-colors disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center min-w-[46px]"
                    >
                        <svg className="w-[18px] h-[18px] -ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
