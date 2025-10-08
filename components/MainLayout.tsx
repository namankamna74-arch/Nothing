import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../App';
import { PlusIcon, ChatBubbleLeftRightIcon, UserCircleIcon, MenuIcon, CloseIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const Sidebar: React.FC<{ closeSidebar: () => void }> = ({ closeSidebar }) => {
    const { currentView, setCurrentView } = useContext(AppContext) as AppContextType;

    const handleNav = (view: 'home' | 'history' | 'profile') => {
        setCurrentView(view);
        closeSidebar();
    };

    return (
        <div className="h-full w-64 bg-gray-100/70 dark:bg-black/50 backdrop-blur-lg flex flex-col flex-shrink-0">
            <header className="p-4 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700/50">
                <h1 className="font-serif text-2xl font-bold">The Circle</h1>
                 <button onClick={closeSidebar} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden">
                    <CloseIcon className="w-6 h-6"/>
                </button>
            </header>
            <nav className="flex-1 p-4 space-y-2">
                <NavLink
                    icon={<PlusIcon className="w-6 h-6" />}
                    label="New Chat"
                    isActive={currentView === 'home'}
                    onClick={() => handleNav('home')}
                />
                <NavLink
                    icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
                    label="History"
                    isActive={currentView === 'history'}
                    onClick={() => handleNav('history')}
                />
                 <NavLink
                    icon={<UserCircleIcon className="w-6 h-6" />}
                    label="Profile & Settings"
                    isActive={currentView === 'profile'}
                    onClick={() => handleNav('profile')}
                />
            </nav>
            <footer className="p-4 border-t border-gray-300/50 dark:border-gray-700/50">
                <ThemeToggle />
            </footer>
        </div>
    );
};


export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen">
            {/* Mobile Sidebar */}
            <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>}
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full">
                <Sidebar closeSidebar={() => {}} />
            </div>

            <main className="flex-1 min-w-0 h-full relative">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md lg:hidden"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                {children}
            </main>
        </div>
    );
};
