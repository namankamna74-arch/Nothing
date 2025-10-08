import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../App';
import { ChatSession } from '../types';
import { PhilosopherIcon } from './PhilosopherIcon';
import { PencilIcon, TrashIcon, CloseIcon, CheckIcon } from './icons';

const HistoryItem: React.FC<{ session: ChatSession }> = ({ session }) => {
    const { loadChat, deleteSession, updateSession } = useContext(AppContext) as AppContextType;
    const [isRenaming, setIsRenaming] = useState(false);
    const [title, setTitle] = useState(session.title);

    const handleRename = () => {
        if (title.trim()) {
            updateSession(session.id, { title: title.trim() });
        } else {
            setTitle(session.title);
        }
        setIsRenaming(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setTitle(session.title);
            setIsRenaming(false);
        }
    }

    const { chatTarget } = session;
    const lastMessage = session.messages[session.messages.length - 1];

    return (
        <div className="group relative bg-white/20 dark:bg-black/20 p-4 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => loadChat(session.id)}>
                    {chatTarget.type === 'persona' ? (
                        <PhilosopherIcon philosopher={chatTarget.members[0]} size="w-12 h-12" />
                    ) : (
                        <div className="flex -space-x-3">
                             {chatTarget.members.slice(0, 3).map(p => (
                                <PhilosopherIcon key={p.id} philosopher={p} size="w-8 h-8" withBorder={true}/>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {isRenaming ? (
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleRename}
                                className="w-full bg-gray-200 dark:bg-gray-700 text-lg font-bold p-1 rounded-md"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <h3 className="font-serif text-lg font-bold truncate cursor-pointer" onClick={() => loadChat(session.id)}>
                            {session.title}
                        </h3>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {lastMessage ? `${lastMessage.sender === 'user' ? 'You: ' : ''}${lastMessage.text}` : 'No messages yet...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(session.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsRenaming(true)} className="p-2 rounded-full bg-gray-300/50 dark:bg-gray-700/50 hover:bg-gray-400/50 dark:hover:bg-gray-600/50">
                    <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => deleteSession(session.id)} className="p-2 rounded-full bg-gray-300/50 dark:bg-gray-700/50 hover:bg-red-500/80 text-gray-800 dark:text-gray-200 hover:text-white">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export const HistoryScreen: React.FC = () => {
  const { sessions } = useContext(AppContext) as AppContextType;

  return (
    <div className="p-4 sm:p-8 w-full h-full overflow-y-auto animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="font-serif text-5xl font-bold mb-2">Chat History</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Review your past conversations and debates.</p>
            </header>

            {sessions.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map(session => (
                        <HistoryItem key={session.id} session={session} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white/20 dark:bg-black/20 rounded-2xl shadow-lg backdrop-blur-md">
                    <h2 className="font-serif text-2xl font-semibold mb-2">No conversations yet</h2>
                    <p className="text-gray-600 dark:text-gray-400">Start a new chat to see it appear here.</p>
                </div>
            )}
        </div>
    </div>
  );
};