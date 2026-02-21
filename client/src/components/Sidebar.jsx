import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function Sidebar({ onNewChat }) {
    const { rooms, currentRoom, joinRoom, loading } = useChat();
    const { profile } = useAuth();

    const getRoomName = (room) => {
        if (room.is_group) {
            return room.name || 'Group Chat';
        }

        // For private chats, show the other user's name
        const otherMember = room.room_members?.find(
            (member) => member.user_id !== profile?.id
        );
        return otherMember?.users?.username || 'Private Chat';
    };

    const getRoomAvatar = (room) => {
        if (room.avatar_url) return room.avatar_url;

        if (!room.is_group) {
            const otherMember = room.room_members?.find(
                (member) => member.user_id !== profile?.id
            );
            return otherMember?.users?.avatar_url;
        }

        return null;
    };

    const isUserOnline = (room) => {
        if (room.is_group) return false;

        const otherMember = room.room_members?.find(
            (member) => member.user_id !== profile?.id
        );
        return otherMember?.users?.is_online || false;
    };

    // Get all unique users from rooms to display in "Recent"
    // In a real app, this would be a separate API call or derived differently
    const recentUsers = rooms
        .filter(room => !room.is_group)
        .map(room => room.room_members?.find(member => member.user_id !== profile?.id)?.users)
        .filter(Boolean); // Remove nulls

    return (
        <div className="w-full h-full flex flex-col bg-[#f8f9fa] dark:bg-dark-900 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 flex items-center justify-between">
                <h2 className="text-[22px] font-semibold text-[#495057] dark:text-gray-200">Chats</h2>
                <button
                    onClick={onNewChat}
                    className="p-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-full transition-colors focus:ring-2 focus:ring-primary-500/50"
                    title="New Chat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Search */}
            <div className="px-6 pb-6">
                <div className="relative relative-group bg-[#e6ebf5] dark:bg-dark-800 rounded flex items-center">
                    <div className="pl-4 text-[#878a92] dark:text-gray-400">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search messages or users"
                        className="w-full bg-transparent border-none py-[10px] pl-3 pr-4 focus:ring-0 text-[15px] placeholder-[#878a92] dark:placeholder-gray-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Scrollable Area (Recent Users + Chat List) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* Horizontal Recent Users row */}
                {recentUsers.length > 0 && (
                    <div className="px-6 mb-6">
                        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-thin pb-2 pr-2">
                            {recentUsers.map(user => (
                                <div key={user.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                                    <div className="relative p-[2px] rounded-full bg-gray-200 dark:bg-dark-700">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-9 h-9 rounded-full object-cover border-2 border-[#f8f9fa] dark:border-dark-900" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 border-2 border-[#f8f9fa] dark:border-dark-900 flex items-center justify-center font-bold text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {user.is_online && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#06d6a0] border-2 border-[#f8f9fa] dark:border-dark-900 rounded-full"></span>
                                        )}
                                    </div>
                                    <span className="text-[13px] text-[#495057] dark:text-gray-400 mt-2 font-medium truncate w-14 text-center">
                                        {user.username.split(' ')[0]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat List Title */}
                <h5 className="px-6 mb-4 text-[15px] font-semibold text-[#495057] dark:text-gray-200">Recent</h5>

                {/* Chat List Items */}
                <div className="px-2 space-y-0.5 pb-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            <p className="text-sm">No chats yet.</p>
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const isActive = currentRoom?.id === room.id;
                            // Mocking unread badge and typing indicator for UI demonstration
                            const hasUnread = Math.random() > 0.8;
                            const isTyping = Math.random() > 0.9 && !hasUnread;

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => joinRoom(room)}
                                    className={`w-full flex items-start px-4 py-[14px] rounded transition-colors text-left group
                                        ${isActive
                                            ? 'bg-[#e6ebf5] dark:bg-dark-800'
                                            : 'hover:bg-[#f0f4f8] dark:hover:bg-dark-800/50'
                                        }`}
                                >
                                    <div className="relative mr-4 flex-shrink-0">
                                        {getRoomAvatar(room) ? (
                                            <img
                                                src={getRoomAvatar(room)}
                                                alt={getRoomName(room)}
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                                {getRoomName(room).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {isUserOnline(room) && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-[#06d6a0] border-2 border-[#f8f9fa] dark:border-dark-900 rounded-full group-hover:border-[#f0f4f8] dark:group-hover:border-dark-800 transition-colors"></span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h5 className="font-semibold text-[15px] text-[#495057] dark:text-gray-200 truncate pr-2">
                                                {getRoomName(room)}
                                            </h5>
                                            {room.last_message && (
                                                <div className="text-[11px] text-[#7a7f9a] dark:text-gray-500 whitespace-nowrap">
                                                    {formatDistanceToNow(room.last_message.created_at).replace('about ', '')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between relative">
                                            {isTyping ? (
                                                <div className="text-[13px] text-primary-500 font-medium">typing...</div>
                                            ) : (
                                                <p className="text-[13px] text-[#7a7f9a] dark:text-gray-400 truncate pr-6">
                                                    {room.last_message ? room.last_message.message_text : 'Start the conversation'}
                                                </p>
                                            )}

                                            {hasUnread && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-[10px] font-semibold">
                                                    {Math.floor(Math.random() * 5) + 1}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
