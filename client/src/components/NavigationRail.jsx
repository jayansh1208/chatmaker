import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function NavigationRail({ currentTab, setCurrentTab, darkMode, toggleDarkMode }) {
    const { profile, signOut } = useAuth();

    // Tab options (placeholder for future expansion, 'chats' is main for now)
    const tabs = [
        { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title: 'Profile' },
        { id: 'chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', title: 'Chats' },
        { id: 'contacts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: 'Contacts' },
        { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', title: 'Settings' }
    ];

    return (
        <div className="w-[75px] h-full flex flex-col items-center py-6 bg-white dark:bg-[#262626] border-r border-[#f0f4f8] dark:border-dark-700 flex-shrink-0 z-20 shadow-[0_2px_4px_rgba(15,34,58,0.12)]">
            {/* Logo */}
            <div className="mb-10 text-primary-600 dark:text-primary-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>

            {/* Navigation Icons First Block */}
            <div className="flex-1 w-full flex flex-col items-center space-y-2 mt-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative
                            ${currentTab === tab.id
                                ? 'bg-primary-50 dark:bg-dark-800 text-primary-600 dark:text-primary-400'
                                : 'text-[#878a92] dark:text-[#a6b0cf] hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-primary-500'}`}
                        title={tab.title}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentTab === tab.id ? 2.5 : 2} d={tab.icon} />
                        </svg>
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex flex-col items-center space-y-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-[#878a92] dark:text-[#a6b0cf] hover:text-primary-500 transition-colors"
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                >
                    {darkMode ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Profile/Logout Dropdown Trigger (Simplified to just Avatar + Logout on click for now) */}
                <div className="relative group/avatar cursor-pointer" onClick={signOut} title="Logout">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border-[3px] border-[#f0f4f8] dark:border-dark-700 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full border-[3px] border-[#f0f4f8] dark:border-dark-700 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                            {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all whitespace-nowrap shadow-md">
                        Logout
                    </div>
                </div>
            </div>
        </div>
    );
}
