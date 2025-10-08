import React, { useState, useEffect, createContext } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { MainLayout } from './components/MainLayout';
import { Theme, ChatTarget, Settings, UserPersona, ChatSession, View } from './types';
import useLocalStorage from './hooks/useLocalStorage';

export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  userPersona: UserPersona;
  setUserPersona: React.Dispatch<React.SetStateAction<UserPersona>>;
  
  sessions: ChatSession[];
  startNewChat: (target: ChatTarget) => void;
  loadChat: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', (() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Dark;
    }
    return Theme.Light;
  })());
  
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    temperature: 0.7,
    maxOutputTokens: undefined,
    allowDebateInterruption: true,
  });

  const [userPersona, setUserPersona] = useLocalStorage<UserPersona>('userPersona', {
    name: '',
    relationship: '',
    backstory: '',
  });

  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chatSessions', []);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.Light ? Theme.Dark : Theme.Light);
    root.classList.add(theme);
  }, [theme]);

  const startNewChat = (target: ChatTarget) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `New Chat with ${target.name}`,
      chatTarget: target,
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };
  
  const loadChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };
  
  const handleGoBack = () => {
    setCurrentSessionId(null);
  };

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
  };
  
  const deleteSession = (sessionId: string) => {
    if(window.confirm('Are you sure you want to delete this conversation?')) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setCurrentView('history');
        }
    }
  };

  const renderContent = () => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      return <ChatScreen session={currentSession} onGoBack={handleGoBack} updateSession={updateSession} />;
    }
    
    switch (currentView) {
      case 'home':
        return <HomeScreen onStartChat={startNewChat} />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onStartChat={startNewChat} />;
    }
  }

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      settings, setSettings, 
      userPersona, setUserPersona,
      sessions, startNewChat, loadChat, updateSession, deleteSession,
      currentView, setCurrentView
    }}>
      <div className="font-sans w-screen h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-900 dark:via-black dark:to-gray-800">
        <MainLayout>
          {renderContent()}
        </MainLayout>
      </div>
    </AppContext.Provider>
  );
}

export default App;
