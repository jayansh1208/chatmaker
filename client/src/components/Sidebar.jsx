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

    return (
        <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <button
                        onClick={onNewChat}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                        title="New Chat"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-8 px-4 text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No chats yet</p>
                        <p className="text-xs mt-1">Start a new conversation!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-dark-700">
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => joinRoom(room)}
                                className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-left ${currentRoom?.id === room.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {getRoomAvatar(room) ? (
                                            <img
                                                src={getRoomAvatar(room)}
                                                alt={getRoomName(room)}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                                                {getRoomName(room).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {isUserOnline(room) && (
                                            <span className="absolute bottom-0 right-0 online-indicator"></span>
                                        )}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold truncate">{getRoomName(room)}</h3>
                                            {room.last_message && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(room.last_message.created_at)}
                                                </span>
                                            )}
                                        </div>
                                        {room.last_message && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {room.last_message.users?.username}: {room.last_message.message_text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
