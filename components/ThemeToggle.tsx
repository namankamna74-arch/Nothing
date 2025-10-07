
import React, { useContext } from 'react';
import { Theme } from '../types';
import { AppContext, AppContextType } from '../App';
import { SunIcon, MoonIcon } from './icons';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useContext(AppContext) as AppContextType;

    const toggleTheme = () => {
        setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light);
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-8 rounded-full p-1 bg-gray-300 dark:bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle theme"
        >
            <div
                className="absolute inset-0 w-full h-full flex items-center justify-between px-2"
            >
                <SunIcon className="w-5 h-5 text-yellow-500"/>
                <MoonIcon className="w-5 h-5 text-slate-300"/>
            </div>
            <div
                className={`absolute bg-white dark:bg-gray-800 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                    theme === Theme.Dark ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
        </button>
    );
};
