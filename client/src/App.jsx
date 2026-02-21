import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import NewChatModal from './components/NewChatModal';
import NavigationRail from './components/NavigationRail';

function ChatApp() {
  const { user, profile, loading, signOut } = useAuth();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <ChatProvider>
      {/* 3-Column Layout Base */}
      <div className="flex w-full h-screen bg-[#f8f9fa] dark:bg-dark-900 overflow-hidden font-sans">

        {/* Column 1: Navigation Rail */}
        <NavigationRail
          currentTab="chats"
          setCurrentTab={() => { }}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Column 2: Sidebar (Chats List) */}
        <div className="w-[380px] flex-shrink-0 bg-[#f8f9fa] dark:bg-dark-900 border-r border-[#f0f4f8] dark:border-dark-700 flex flex-col z-10 transition-colors duration-200">
          <Sidebar onNewChat={() => setShowNewChatModal(true)} />
        </div>

        {/* Column 3: Main Chat Window */}
        <div className="flex-1 min-w-0 bg-white dark:bg-dark-950 flex flex-col transition-colors duration-200">
          <ChatWindow />
        </div>

        {/* Modals */}
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
        />
      </div>
    </ChatProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}

export default App;
