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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">New Chat</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Group Chat Toggle */}
                    <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isGroup}
                            onChange={(e) => setIsGroup(e.target.checked)}
                            className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="font-medium">Create Group Chat</span>
                    </label>

                    {/* Group Name Input */}
                    {isGroup && (
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name"
                            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700"
                        />
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full"
                                >
                                    <span className="text-sm font-medium">{user.username}</span>
                                    <button
                                        onClick={() => toggleUserSelection(user)}
                                        className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {searching ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {searchQuery.trim().length >= 2 ? 'No users found' : 'Search for users to start a chat'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-dark-700">
                            {searchResults.map(user => {
                                const isSelected = selectedUsers.find(u => u.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user)}
                                        className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-left ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {user.is_online && (
                                                    <span className="absolute bottom-0 right-0 online-indicator"></span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{user.username}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                            {isSelected && (
                                                <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-dark-700">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateChat}
                            disabled={selectedUsers.length === 0 || loading || (isGroup && !groupName.trim())}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create Chat'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
