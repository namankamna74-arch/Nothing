import React, { useState, useEffect, createContext } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { Theme, ChatTarget, Settings, UserPersona } from './types';

export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  userPersona: UserPersona;
  setUserPersona: React.Dispatch<React.SetStateAction<UserPersona>>;
}

export const AppContext = createContext<AppContextType | null>(null);

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme && Object.values(Theme).includes(storedTheme)) {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Dark;
      }
    }
    return Theme.Light;
  });
  
  const [currentChat, setCurrentChat] = useState<ChatTarget | null>(null);
  const [settings, setSettings] = useState<Settings>({
    temperature: 0.7,
    maxOutputTokens: undefined, // undefined means use model default
    allowDebateInterruption: true,
  });
  const [userPersona, setUserPersona] = useState<UserPersona>({
    name: '',
    relationship: '',
    backstory: '',
  });


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.Light ? Theme.Dark : Theme.Light);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSelectChat = (target: ChatTarget) => {
    setCurrentChat(target);
  };
  
  const handleGoBack = () => {
    setCurrentChat(null);
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, settings, setSettings, userPersona, setUserPersona }}>
      <div className="font-sans">
        {currentChat ? (
          <ChatScreen chatTarget={currentChat} onGoBack={handleGoBack} onSelectChat={handleSelectChat} />
        ) : (
          <HomeScreen onSelectChat={handleSelectChat} />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
