
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ChatTarget, Message, Philosopher, Settings, UserPersona, ChatContext } from '../types';
import { PHILOSOPHERS, MESSAGE_SOUND_URL } from '../constants';
import { streamPersonaResponse, streamGroupDebate, regenerateResponse, generateUserPersona, generateContext } from '../services/geminiService';
import { getVoices, getVoiceForPhilosopher } from '../services/voiceService';
import { useSound } from '../hooks/useSound';
import { SendIcon, MenuIcon, CloseIcon, BackIcon, StopIcon, Cog6ToothIcon, SpeakerWaveIcon, ClipboardIcon, CheckIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, UserCircleIcon, InformationCircleIcon, BookOpenIcon, ArrowPathIcon } from './icons';
import { FormattedText } from './FormattedText';
import { AppContext, AppContextType } from '../App';

// Philosopher Info Modal
const PhilosopherInfoModal: React.FC<{ philosopher: Philosopher; onClose: () => void; }> = ({ philosopher, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <InformationCircleIcon className="w-6 h-6 text-indigo-500" />
                        <h2 className="font-serif text-2xl font-bold">About {philosopher.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <img src={philosopher.avatarUrl} alt={philosopher.name} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white/50" />
                        <p className="text-gray-700 dark:text-gray-300 text-center sm:text-left">{philosopher.bio}</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-xl font-semibold mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">Major Works</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                            {philosopher.majorWorks.map((work, index) => (
                                <li key={index}><em>{work}</em></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


// User Persona Modal Component
const UserPersonaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { userPersona, setUserPersona } = useContext(AppContext) as AppContextType;
    const [localPersona, setLocalPersona] = useState<UserPersona>(userPersona);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setLocalPersona(userPersona);
    }, [userPersona, isOpen]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const persona = await generateUserPersona();
            setLocalPersona(persona);
        } catch (error) {
            console.error("Error generating persona", error);
            // Optionally show an error message to the user
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = () => {
        setUserPersona(localPersona);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                    <h2 className="font-serif text-2xl font-bold">Define Your Persona</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
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
                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-2 px-4 border border-indigo-500 text-indigo-500 font-semibold rounded-lg hover:bg-indigo-500/10 transition-colors disabled:opacity-50">
                        {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                </div>
                 <footer className="p-4 border-t border-gray-300 dark:border-gray-700 mt-auto">
                    <button onClick={handleSave} className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all hover:bg-indigo-700">
                        Save Persona
                    </button>
                </footer>
            </div>
        </div>
    );
};


// Settings Panel Component
const SettingsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useContext(AppContext) as AppContextType;

    const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    // Word limit in words, converted to tokens for the API
    const wordLimits = [35, 70, 150, 300, 500];
    const currentWordLimit = settings.maxOutputTokens ? Math.round(settings.maxOutputTokens * 0.7) : 0;

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-4 z-50 w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                <h3 className="font-serif text-lg font-bold">Chat Settings</h3>
            </div>
            <div className="p-4 space-y-6">
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
    );
};

// Message Actions (Copy, Hear, etc.)
const MessageActions: React.FC<{
    message: Message;
    philosopher: Philosopher;
    onHear: (message: Message) => void;
    onCopy: (text: string) => void;
    onRegenerate: (message: Message, mode: 'shorten' | 'lengthen') => void;
    isSpeaking: boolean;
    isCopied: boolean;
    isLoading: boolean;
}> = ({ message, philosopher, onHear, onCopy, onRegenerate, isSpeaking, isCopied, isLoading }) => {
    return (
        <div className="absolute -top-4 right-0 flex items-center space-x-1 px-2 py-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={() => onHear(message)} disabled={isLoading} className={`p-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 ${isSpeaking ? 'text-indigo-500' : ''}`}>
                <SpeakerWaveIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onCopy(message.text)} disabled={isLoading} className="p-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            <button onClick={() => onRegenerate(message, 'shorten')} disabled={isLoading} className="p-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                <ArrowsPointingInIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onRegenerate(message, 'lengthen')} disabled={isLoading} className="p-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

// Context Panel Component
const ContextPanel: React.FC<{
    isLoading: boolean;
    data: ChatContext | null;
    onRefresh: () => void;
}> = ({ isLoading, data, onRefresh }) => {
    return (
        <aside className="w-full bg-white/70 dark:bg-black/50 backdrop-blur-md flex flex-col h-full border-l border-gray-300 dark:border-gray-700 animate-slide-in-from-right">
            <header className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <BookOpenIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <h3 className="font-serif text-xl font-bold">Context</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Refresh Context"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                {/* Summary Section */}
                <div>
                    <h4 className="font-bold text-lg mb-2">Conversation Summary</h4>
                    {isLoading && !data ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                        </div>
                    ) : data?.summary.length ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {data.summary.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 italic">{!isLoading && 'No summary available. Chat a bit more and then refresh.'}</p>
                    )}
                </div>
                {/* Key Concepts Section */}
                <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
                    <h4 className="font-bold text-lg mb-2">Key Concepts</h4>
                    {isLoading && !data ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i}>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5 animate-pulse mt-1"></div>
                                </div>
                            ))}
                        </div>
                    ) : data?.keyConcepts.length ? (
                         <div className="space-y-4">
                            {data.keyConcepts.map((concept) => (
                                <div key={concept.term}>
                                    <h5 className="font-semibold text-indigo-600 dark:text-indigo-400">{concept.term}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{concept.definition}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">{!isLoading && 'No key concepts identified yet.'}</p>
                    )}
                </div>
            </div>
        </aside>
    );
};


// ChatScreen component and its children
interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSelectChat: (target: ChatTarget) => void;
    currentChatId: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle, onSelectChat, currentChatId }) => {
    const handleSelect = (philosopher: Philosopher) => {
        onSelectChat({
            id: philosopher.id,
            type: 'persona',
            name: philosopher.name,
            members: [philosopher],
            avatarUrl: philosopher.avatarUrl
        });
        onToggle();
    }

    return (
        <>
            <div className={`fixed top-0 left-0 h-full z-40 bg-gray-100/80 dark:bg-black/80 backdrop-blur-md w-72 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                    <h2 className="font-serif text-xl font-bold">Conversations</h2>
                    <button onClick={onToggle} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </div>
                <nav className="p-2 overflow-y-auto h-[calc(100vh-65px)]">
                    <ul>
                        {PHILOSOPHERS.map(p => (
                            <li key={p.id}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleSelect(p); }}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${currentChatId === p.id ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full" />
                                    <span className="font-medium">{p.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {isOpen && <div onClick={onToggle} className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"></div>}
        </>
    );
};

interface MessageBubbleProps {
    message: Message;
    philosopher?: Philosopher;
    actions: React.ReactNode;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, philosopher, actions }) => {
    const isUser = message.sender === 'user';
    const showBlinkingCursor = message.text.endsWith('▋');
    const textToShow = showBlinkingCursor ? message.text.slice(0, -1) : message.text;

    return (
        <div className={`flex items-end gap-3 my-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && philosopher && (
                <img src={philosopher.avatarUrl} alt={philosopher.name} className="w-10 h-10 rounded-full self-start object-cover" />
            )}
            <div className={`relative group max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isUser 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`
            }>
                {!isUser && actions}
                {!isUser && philosopher && message.id.startsWith('group-') && (
                     <p className={`font-serif font-bold text-sm mb-1 ${philosopher.textColor}`}>{philosopher.name}</p>
                )}
                <div className={`leading-relaxed ${isUser ? 'font-sans' : 'font-serif'}`}>
                  <FormattedText text={textToShow} />
                  {showBlinkingCursor && <span className="animate-pulse-fast inline-block">▋</span>}
                </div>
            </div>
        </div>
    );
};


interface ChatScreenProps {
  chatTarget: ChatTarget;
  onGoBack: () => void;
  onSelectChat: (target: ChatTarget) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatTarget, onGoBack, onSelectChat }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
    const [infoModalPhilosopher, setInfoModalPhilosopher] = useState<Philosopher | null>(null);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
    const [contextData, setContextData] = useState<ChatContext | null>(null);
    const [isContextLoading, setIsContextLoading] = useState(false);
    
    const { settings, userPersona } = useContext(AppContext) as AppContextType;
    const playSound = useSound(MESSAGE_SOUND_URL);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const philosopherMap = useRef(new Map(PHILOSOPHERS.map(p => [p.id, p])));
    const stopGeneration = useRef(false);

    // Refs for smooth streaming animation
    const animationQueue = useRef<Record<string, { queue: string[], isDone: boolean }>>({});
    const isAnimating = useRef(false);

    useEffect(() => {
        getVoices().then(setVoices);
    }, []);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    },[]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);
    
    const handleRefreshContext = useCallback(async () => {
        if (messages.length === 0) {
            setContextData({ summary: [], keyConcepts: [] });
            return;
        }
        setIsContextLoading(true);
        try {
            const context = await generateContext(messages, chatTarget.members);
            setContextData(context);
        } catch (error) {
            console.error("Error generating context:", error);
            // In a real app, you might set an error state to show in the UI
        } finally {
            setIsContextLoading(false);
        }
    }, [messages, chatTarget.members]);

    useEffect(() => {
        if (isContextPanelOpen && !contextData && messages.length > 1) {
            handleRefreshContext();
        }
    }, [isContextPanelOpen, contextData, messages.length, handleRefreshContext]);


    const processAnimationQueue = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;
    
        const animate = () => {
            if (stopGeneration.current) {
                isAnimating.current = false;
                return;
            }
            const messageId = Object.keys(animationQueue.current).find(
                id => animationQueue.current[id].queue.length > 0
            );
    
            if (messageId) {
                const char = animationQueue.current[messageId].queue.shift();
                setMessages(prev => prev.map(m => 
                    m.id === messageId ? { ...m, text: m.text.replace('▋', '') + char + '▋' } : m
                ));
            } else {
                const finishedId = Object.keys(animationQueue.current).find(
                    id => animationQueue.current[id].isDone && animationQueue.current[id].queue.length === 0
                );
    
                if (finishedId) {
                    setMessages(prev => prev.map(m => m.id === finishedId ? { ...m, text: m.text.replace('▋', '') } : m));
                    delete animationQueue.current[finishedId];
                }
            }
    
            const hasMoreWork = Object.values(animationQueue.current).some(v => v.queue.length > 0 || v.isDone);
    
            if (hasMoreWork) {
                requestAnimationFrame(animate);
            } else {
                isAnimating.current = false;
            }
        };
        animate();
    }, []);

    const runStream = async (stream: AsyncGenerator<any>, onChunk: (chunk: any) => void) => {
        for await (const chunk of stream) {
            if (stopGeneration.current) break;
            onChunk(chunk);
        }
    };

    const handleStopGeneration = () => {
        stopGeneration.current = true;
        setIsLoading(false);
        setMessages(prev => prev.map(m => ({...m, text: m.text.replace('▋','')})))
        Object.keys(animationQueue.current).forEach(id => {
            animationQueue.current[id].isDone = true;
        });
        processAnimationQueue();
    };

    const handleMessageGeneration = async (userMessage: Message) => {
        setIsLoading(true);
        stopGeneration.current = false;

        try {
            if (chatTarget.type === 'persona') {
                const persona = chatTarget.members[0];
                const messageId = `${persona.id}-${Date.now()}`;
                setMessages(prev => [...prev, { id: messageId, text: '', sender: persona.id, timestamp: Date.now() }]);
                animationQueue.current[messageId] = { queue: [], isDone: false };
                
                let firstChunk = true;
                const stream = streamPersonaResponse(persona, messages, userMessage.text, settings, userPersona);

                await runStream(stream, (chunk) => {
                    if (firstChunk) { playSound(); firstChunk = false; }
                    animationQueue.current[messageId].queue.push(...chunk.split(''));
                    processAnimationQueue();
                });
                
                if (animationQueue.current[messageId]) {
                    animationQueue.current[messageId].isDone = true;
                }

            } else { // Group chat
                let firstDebateChunk = true;
                const stream = streamGroupDebate(chatTarget.members, [...messages, userMessage], userMessage.text, settings, userPersona);

                await runStream(stream, ({ philosopherId, chunk }) => {
                    let messageId = Object.keys(animationQueue.current).find(id => id.startsWith(`group-${philosopherId}`) && !animationQueue.current[id].isDone);

                    if (!messageId) {
                         const newId = `group-${philosopherId}-${Date.now()}`;
                         setMessages(prev => [...prev, { id: newId, text: '', sender: philosopherId, timestamp: Date.now() }]);
                         animationQueue.current[newId] = { queue: [], isDone: false };
                         if (firstDebateChunk) { playSound(); firstDebateChunk = false; } else { setTimeout(playSound, 200); }
                         messageId = newId;
                    }
                    animationQueue.current[messageId].queue.push(...chunk.split(''));
                    processAnimationQueue();
                });
                 Object.keys(animationQueue.current).forEach(id => {
                    if(id.startsWith('group-')) {
                        animationQueue.current[id].isDone = true;
                    }
                });
            }
            processAnimationQueue();

        } catch (error) {
            console.error("Error generating content:", error);
            const errorId = `error-${Date.now()}`;
            setMessages(prev => [...prev, { id: errorId, text: 'An error occurred. Please try again.', sender: chatTarget.id, timestamp: Date.now() }]);
        } finally {
            if (!stopGeneration.current) {
                setIsLoading(false);
            }
        }
    };
    
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        if (isLoading && chatTarget.type === 'group' && settings.allowDebateInterruption) {
            handleStopGeneration();
        } else if (isLoading) {
            return;
        }

        const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: 'user', timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        
        // Use a timeout to ensure state update before starting generation, especially after an interruption
        setTimeout(() => handleMessageGeneration(userMessage), 50);
    };

    const handleRegenerate = async (message: Message, mode: 'shorten' | 'lengthen') => {
        if (isLoading) return;
        const philosopher = philosopherMap.current.get(message.sender);
        if (!philosopher) return;

        setIsLoading(true);
        stopGeneration.current = false;
        
        try {
            const messageId = `${philosopher.id}-${Date.now()}`;
            setMessages(prev => [...prev, { id: messageId, text: '', sender: philosopher.id, timestamp: Date.now() }]);
            animationQueue.current[messageId] = { queue: [], isDone: false };

            let firstChunk = true;
            const stream = regenerateResponse(philosopher, message.text, mode, settings);
            await runStream(stream, (chunk) => {
                if (firstChunk) { playSound(); firstChunk = false; }
                animationQueue.current[messageId].queue.push(...chunk.split(''));
                processAnimationQueue();
            });
            if (animationQueue.current[messageId]) {
                animationQueue.current[messageId].isDone = true;
            }
            processAnimationQueue();
        } catch (error) {
            console.error("Error regenerating content:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHearAloud = (message: Message) => {
        speechSynthesis.cancel();
        if (speakingMessageId) {
            setSpeakingMessageId(null);
            if (message.id === speakingMessageId) return;
        }

        const text = message.text.replace(/(\*\*|\*|_|▋)/g, '');
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoiceForPhilosopher(message.sender, voices);
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        setSpeakingMessageId(message.id);
        speechSynthesis.speak(utterance);
    };


    const handleCopy = (text: string) => {
        const messageId = messages.find(m => m.text === text)?.id;
        if (!messageId) return;
        navigator.clipboard.writeText(text.replace('▋', ''));
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    
    useEffect(() => {
        setMessages([]);
        animationQueue.current = {};
        isAnimating.current = false;
        setContextData(null); // Reset context on chat change
        handleStopGeneration();
    }, [chatTarget.id]);

    const canInterrupt = settings.allowDebateInterruption && chatTarget.type === 'group';
    const isInputDisabled = isLoading && !canInterrupt;
    
    return (
        <div className="flex h-screen w-screen bg-gray-200 dark:bg-gray-800 font-sans animate-fade-in">
            {infoModalPhilosopher && <PhilosopherInfoModal philosopher={infoModalPhilosopher} onClose={() => setInfoModalPhilosopher(null)} />}
            <ChatSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} onSelectChat={onSelectChat} currentChatId={chatTarget.id} />
            <UserPersonaModal isOpen={isPersonaModalOpen} onClose={() => setIsPersonaModalOpen(false)} />
            <div className="flex flex-1 min-w-0">
                <div className="flex flex-col flex-1 h-full min-w-0">
                    {/* Header */}
                    <header className="flex items-center p-3 sm:p-4 bg-white/70 dark:bg-black/50 backdrop-blur-md shadow-md z-20">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 lg:hidden">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                         <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 hidden lg:block">
                            <BackIcon className="w-6 h-6"/>
                        </button>
                        {chatTarget.type === 'persona' ? (
                            <button onClick={() => setInfoModalPhilosopher(chatTarget.members[0])} className="transition-transform duration-200 hover:scale-110">
                                <img src={chatTarget.avatarUrl} alt={chatTarget.name} className="w-10 h-10 rounded-full object-cover" />
                            </button>
                        ) : (
                            <div className="relative">
                                 <button onClick={() => setIsMemberListOpen(prev => !prev)} className="flex -space-x-2 transition-transform duration-200 hover:scale-110">
                                     {chatTarget.members.slice(0,3).map(p => (
                                         <img key={p.id} src={p.avatarUrl} alt={p.name} className="w-10 h-10 object-cover rounded-full border-2 border-white dark:border-gray-800" />
                                     ))}
                                 </button>
                                 {isMemberListOpen && (
                                    <div className="absolute top-12 left-0 z-50 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl animate-fade-in py-2">
                                        {chatTarget.members.map(p => (
                                            <div key={p.id} onClick={() => { setInfoModalPhilosopher(p); setIsMemberListOpen(false); }} className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                                                <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                                <span className="font-medium text-sm">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                 )}
                             </div>
                        )}
                        <h2 className="text-xl font-bold ml-4 text-gray-800 dark:text-gray-100">{chatTarget.name}</h2>
                        <div className="ml-auto flex items-center space-x-2">
                            <button onClick={() => setIsContextPanelOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hidden lg:block">
                                <BookOpenIcon className="w-6 h-6"/>
                            </button>
                            <button onClick={() => setIsPersonaModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <UserCircleIcon className="w-6 h-6"/>
                            </button>
                            <div className="relative">
                                <button onClick={() => setIsSettingsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <Cog6ToothIcon className="w-6 h-6"/>
                                </button>
                                <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                            </div>
                        </div>
                    </header>

                    {/* Chat Area */}
                    <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-900 dark:via-black dark:to-gray-800" onClick={() => {if (isSettingsOpen) setIsSettingsOpen(false); if(isMemberListOpen) setIsMemberListOpen(false)}}>
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} philosopher={philosopherMap.current.get(msg.sender)} actions={
                                msg.sender !== 'user' ? (
                                    <MessageActions
                                        message={msg}
                                        philosopher={philosopherMap.current.get(msg.sender)!}
                                        onHear={handleHearAloud}
                                        onCopy={handleCopy}
                                        onRegenerate={handleRegenerate}
                                        isSpeaking={speakingMessageId === msg.id}
                                        isCopied={copiedMessageId === msg.id}
                                        isLoading={isLoading}
                                    />
                                ) : null
                            } />
                        ))}
                        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
                             <div className="flex items-end gap-3 my-4 animate-fade-in justify-start">
                                 <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-5 py-3 rounded-2xl shadow-md rounded-bl-none">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                                 </div>
                             </div>
                        )}
                    </main>

                    {/* Input Form */}
                    <footer className="p-3 sm:p-4 bg-white/70 dark:bg-black/50 backdrop-blur-md">
                        <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 p-3 rounded-full bg-gray-200 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
                                disabled={isInputDisabled}
                            />
                            <button
                                type="button"
                                onClick={isLoading ? handleStopGeneration : () => handleSubmit()}
                                disabled={!isLoading && !input.trim()}
                                className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:scale-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                               {isLoading ? <StopIcon className="w-6 h-6"/> : <SendIcon className="w-6 h-6"/>}
                            </button>
                        </form>
                    </footer>
                </div>
                {/* Context Panel */}
                <div className={`relative transition-all duration-300 ease-in-out hidden lg:block overflow-hidden ${isContextPanelOpen ? 'w-96' : 'w-0'}`}>
                    <div className="absolute top-0 right-0 h-full w-96">
                        <ContextPanel
                            isLoading={isContextLoading}
                            data={contextData}
                            onRefresh={handleRefreshContext}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
