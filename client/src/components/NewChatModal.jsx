import { useState } from 'react';
import { apiService } from '../services/api';
import { useChat } from '../contexts/ChatContext';

export default function NewChatModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const { createRoom, loadRooms } = useChat();

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const data = await apiService.searchUsers(query);
            setSearchResults(data.users || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u.id === user.id);
            if (exists) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleCreateChat = async () => {
        if (selectedUsers.length === 0) return;

        if (isGroup && !groupName.trim()) {
            alert('Please enter a group name');
            return;
        }

        try {
            setLoading(true);
            const memberIds = selectedUsers.map(u => u.id);
            await createRoom(
                isGroup ? groupName : null,
                isGroup,
                memberIds,
                null
            );
            await loadRooms();
            handleClose();
        } catch (error) {
            console.error('Create chat error:', error);
            alert('Failed to create chat');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setIsGroup(false);
        setGroupName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border border-white/40 dark:border-dark-700/50 rounded-3xl shadow-glass dark:shadow-glass-dark max-w-md w-full max-h-[85vh] flex flex-col animate-pop-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-100/50 dark:border-dark-700/50">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-violet-600 dark:from-primary-400 dark:to-violet-400">New Chat</h2>
                        <button
                            onClick={handleClose}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-dark-700/50 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Group Chat Toggle */}
                    <label className="flex items-center space-x-3 mb-5 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                                className="w-5 h-5 text-primary-500 border-gray-300 rounded cursor-pointer transition-colors focus:ring-primary-500/20"
                            />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Create Group Chat</span>
                    </label>

                    {/* Group Name Input */}
                    {isGroup && (
                        <div className="mb-5 animate-slide-up">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group Name"
                                className="w-full px-4 py-3 bg-white/50 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 dark:text-white transition-all shadow-sm placeholder-slate-400 font-medium"
                            />
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 dark:text-white transition-all shadow-sm placeholder-slate-400 font-medium"
                        />
                        <svg className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-dark-900/50 border-b border-gray-100/50 dark:border-dark-700/50">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-violet-50 dark:from-primary-900/30 dark:to-violet-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-3 py-1.5 rounded-full shadow-sm animate-pop-in"
                                >
                                    <span className="text-sm font-semibold">{user.username}</span>
                                    <button
                                        onClick={() => toggleUserSelection(user)}
                                        className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
                    {searching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-dark-800/30 m-4 rounded-xl border border-dashed border-slate-200 dark:border-dark-700">
                            {searchQuery.trim().length >= 2 ? 'No users found matching that name' : 'Search for users to start a chat'}
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {searchResults.map(user => {
                                const isSelected = selectedUsers.find(u => u.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user)}
                                        className={`w-full p-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-all rounded-xl text-left border border-transparent ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800/50 shadow-sm' : ''
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.username}
                                                        className="w-12 h-12 rounded-xl object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {user.is_online && (
                                                    <span className="absolute -bottom-1 -right-1 online-indicator border-2 border-white dark:border-dark-800 w-4 h-4"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.username}</h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="bg-primary-500 text-white rounded-full p-1 shadow-md animate-pop-in">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100/50 dark:border-dark-700/50 bg-white/50 dark:bg-dark-900/50 backdrop-blur-sm rounded-b-3xl">
                    <div className="flex space-x-4">
                        <button
                            onClick={handleClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateChat}
                            disabled={selectedUsers.length === 0 || loading || (isGroup && !groupName.trim())}
                            className="flex-1 btn-primary text-[15px] font-bold"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating
                                </span>
                            ) : 'Create Chat'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
