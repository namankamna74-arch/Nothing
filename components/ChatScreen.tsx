
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ChatTarget, Message, Philosopher, Settings, UserPersona, ChatContext, ChatSession } from '../types';
import { PHILOSOPHERS, MESSAGE_SOUND_URL } from '../constants';
import { streamPersonaResponse, streamGroupDebate, regenerateResponse, generateUserPersona, generateContext, generateChatTitle } from '../services/geminiService';
import { getVoices, getVoiceForPhilosopher } from '../services/voiceService';
import { useSound } from '../hooks/useSound';
import { SendIcon, BackIcon, StopIcon, SpeakerWaveIcon, ClipboardIcon, CheckIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, InformationCircleIcon, BookOpenIcon, ArrowPathIcon, CloseIcon } from './icons';
import { FormattedText } from './FormattedText';
import { AppContext, AppContextType } from '../App';
import { PhilosopherIcon } from './PhilosopherIcon';

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
                        <div className="flex-shrink-0">
                           <PhilosopherIcon philosopher={philosopher} size="w-32 h-32" withBorder={true} />
                        </div>
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

// Message Actions (Copy, Hear, etc.)
const MessageActions: React.FC<{
    message: Message;
    onHear: (message: Message) => void;
    onCopy: (text: string) => void;
    onRegenerate: (message: Message, mode: 'shorten' | 'lengthen') => void;
    isSpeaking: boolean;
    isCopied: boolean;
    isLoading: boolean;
}> = ({ message, onHear, onCopy, onRegenerate, isSpeaking, isCopied, isLoading }) => {
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
                <PhilosopherIcon philosopher={philosopher} size="w-10 h-10" />
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
  session: ChatSession;
  onGoBack: () => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ session, onGoBack, updateSession }) => {
    const [messages, setMessages] = useState<Message[]>(session.messages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
    const isTitleGenerated = useRef(session.title !== `New Chat with ${session.chatTarget.name}`);


    // Refs for smooth streaming animation
    const animationQueue = useRef<Record<string, { queue: string[], isDone: boolean }>>({});
    const isAnimating = useRef(false);

    useEffect(() => {
        getVoices().then(setVoices);
    }, []);
    
    // Sync messages from session prop
    useEffect(() => {
      setMessages(session.messages);
    }, [session.messages]);
    
    // Persist messages whenever they change
    useEffect(() => {
        if(messages.length > session.messages.length) {
          updateSession(session.id, { messages });
        }
    }, [messages, session.id, session.messages.length, updateSession]);

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
            const context = await generateContext(messages, session.chatTarget.members);
            setContextData(context);
        } catch (error) {
            console.error("Error generating context:", error);
        } finally {
            setIsContextLoading(false);
        }
    }, [messages, session.chatTarget.members]);

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
                  let finalMessageText = '';
                    setMessages(prev => prev.map(m => {
                      if (m.id === finishedId) {
                        finalMessageText = m.text.replace('▋', '');
                        return { ...m, text: finalMessageText };
                      }
                      return m;
                    }));
                    delete animationQueue.current[finishedId];

                    // Auto-generate title after first AI response
                    if (!isTitleGenerated.current && messages.length >= 2) {
                        isTitleGenerated.current = true;
                        generateChatTitle(messages).then(title => {
                           if (title) updateSession(session.id, { title });
                        });
                    }
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
    }, [messages, session.id, updateSession]);

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
            if (session.chatTarget.type === 'persona') {
                const persona = session.chatTarget.members[0];
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
                const stream = streamGroupDebate(session.chatTarget.members, [...messages, userMessage], userMessage.text, settings, userPersona);

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
            setMessages(prev => [...prev, { id: errorId, text: 'An error occurred. Please try again.', sender: session.chatTarget.id, timestamp: Date.now() }]);
        } finally {
            if (!stopGeneration.current) {
                setIsLoading(false);
            }
        }
    };
    
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        if (isLoading && session.chatTarget.type === 'group' && settings.allowDebateInterruption) {
            handleStopGeneration();
        } else if (isLoading) {
            return;
        }

        const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: 'user', timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        
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
    
    const canInterrupt = settings.allowDebateInterruption && session.chatTarget.type === 'group';
    const isInputDisabled = isLoading && !canInterrupt;
    
    return (
        <div className="flex h-full w-full bg-gray-200 dark:bg-gray-800 font-sans animate-fade-in">
            {infoModalPhilosopher && <PhilosopherInfoModal philosopher={infoModalPhilosopher} onClose={() => setInfoModalPhilosopher(null)} />}
            <div className="flex flex-1 min-w-0">
                <div className="flex flex-col flex-1 h-full min-w-0">
                    {/* Header */}
                    <header className="flex items-center p-3 sm:p-4 bg-white/70 dark:bg-black/50 backdrop-blur-md shadow-md z-20 flex-shrink-0">
                         <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                            <BackIcon className="w-6 h-6"/>
                        </button>
                        {session.chatTarget.type === 'persona' ? (
                            <button onClick={() => setInfoModalPhilosopher(session.chatTarget.members[0])} className="transition-transform duration-200 hover:scale-110">
                                <PhilosopherIcon philosopher={session.chatTarget.members[0]} size="w-10 h-10" />
                            </button>
                        ) : (
                            <div className="relative">
                                 <button onClick={() => setIsMemberListOpen(prev => !prev)} className="flex -space-x-2 transition-transform duration-200 hover:scale-110">
                                     {session.chatTarget.members.slice(0,3).map(p => (
                                         <PhilosopherIcon key={p.id} philosopher={p} size="w-10 h-10" withBorder={true} />
                                     ))}
                                 </button>
                                 {isMemberListOpen && (
                                    <div className="absolute top-12 left-0 z-50 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl animate-fade-in py-2">
                                        {session.chatTarget.members.map(p => (
                                            <div key={p.id} onClick={() => { setInfoModalPhilosopher(p); setIsMemberListOpen(false); }} className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                                                <PhilosopherIcon philosopher={p} size="w-8 h-8" />
                                                <span className="font-medium text-sm">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                 )}
                             </div>
                        )}
                        <h2 className="text-xl font-bold ml-4 text-gray-800 dark:text-gray-100 truncate">{session.title}</h2>
                        <div className="ml-auto flex items-center space-x-2">
                            <button onClick={() => setIsContextPanelOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hidden lg:block">
                                <BookOpenIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </header>

                    {/* Chat Area */}
                    <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-900 dark:via-black dark:to-gray-800" onClick={() => {if(isMemberListOpen) setIsMemberListOpen(false)}}>
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} philosopher={philosopherMap.current.get(msg.sender)} actions={
                                msg.sender !== 'user' ? (
                                    <MessageActions
                                        message={msg}
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
                    <footer className="p-3 sm:p-4 bg-white/70 dark:bg-black/50 backdrop-blur-md flex-shrink-0">
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