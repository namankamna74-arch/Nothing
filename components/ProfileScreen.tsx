import React, { useState, useEffect, useContext } from 'react';
import { AppContext, AppContextType } from '../App';
import { UserPersona, Settings } from '../types';
import { generateUserPersona } from '../services/geminiService';
import { SparklesIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

export const ProfileScreen: React.FC = () => {
  const { userPersona, setUserPersona, settings, setSettings } = useContext(AppContext) as AppContextType;
  const [localPersona, setLocalPersona] = useState<UserPersona>(userPersona);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalPersona(userPersona);
  }, [userPersona]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const persona = await generateUserPersona();
      setLocalPersona(persona);
    } catch (error) {
      console.error("Error generating persona", error);
    } finally {
      setIsGenerating(false);
    }
  };
    
  const handleSave = () => {
    setUserPersona(localPersona);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
    
  const wordLimits = [35, 70, 150, 300, 500];
  const currentWordLimit = settings.maxOutputTokens ? Math.round(settings.maxOutputTokens * 0.7) : 0;

  return (
    <div className="p-4 sm:p-8 w-full h-full overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
            <h1 className="font-serif text-5xl font-bold mb-2">Profile & Settings</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Customize your identity and the application's behavior.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Persona Section */}
            <div className="bg-white/20 dark:bg-black/20 p-6 rounded-2xl shadow-lg backdrop-blur-md">
                <h2 className="font-serif text-3xl font-semibold mb-4">Your Persona</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1 text-sm">Your Name / Role</label>
                        <input type="text" value={localPersona.name} onChange={e => setLocalPersona(p => ({...p, name: e.target.value}))} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., A curious student" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-sm">Relationship to Philosopher(s)</label>
                        <input type="text" value={localPersona.relationship} onChange={e => setLocalPersona(p => ({...p, relationship: e.target.value}))} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., I am your challenger" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-sm">Your Backstory</label>
                        <textarea value={localPersona.backstory} onChange={e => setLocalPersona(p => ({...p, backstory: e.target.value}))} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" placeholder="e.g., I come from a future where..." />
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex items-center justify-center py-2 px-4 border border-indigo-500 text-indigo-500 font-semibold rounded-lg hover:bg-indigo-500/10 transition-colors disabled:opacity-50">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                    <button onClick={handleSave} className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all hover:bg-indigo-700">
                        {isSaved ? 'Persona Saved!' : 'Save Persona'}
                    </button>
                </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white/20 dark:bg-black/20 p-6 rounded-2xl shadow-lg backdrop-blur-md">
                <h2 className="font-serif text-3xl font-semibold mb-4">Application Settings</h2>
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center justify-between font-medium">
                            <span>Theme</span>
                            <ThemeToggle />
                        </label>
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Creativity (Temperature)</label>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Precise</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.temperature}
                                onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <span>Creative</span>
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Response Length (~{currentWordLimit || 'Default'} words)</label>
                        <select
                            value={settings.maxOutputTokens || ''}
                            onChange={(e) => handleSettingChange('maxOutputTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Default</option>
                            {wordLimits.map(words => {
                                const tokens = Math.round(words / 0.7);
                                return <option key={tokens} value={tokens}>~{words} words</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center justify-between font-medium cursor-pointer">
                            <span>Allow Debate Interruption</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only peer" checked={settings.allowDebateInterruption} onChange={(e) => handleSettingChange('allowDebateInterruption', e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};