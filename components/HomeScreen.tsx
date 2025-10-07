import React, { useState } from 'react';
import { ChatTarget, Philosopher } from '../types';
import { PHILOSOPHERS } from '../constants';
import { ThemeToggle } from './ThemeToggle';
import { PlusIcon, UserGroupIcon, CloseIcon, CheckIcon } from './icons';

interface HomeScreenProps {
  onSelectChat: (target: ChatTarget) => void;
}

const CreateDebateModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStartDebate: (philosophers: Philosopher[]) => void;
}> = ({ isOpen, onClose, onStartDebate }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const togglePhilosopher = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleStart = () => {
        const selectedPhilosophers = PHILOSOPHERS.filter(p => selected.includes(p.id));
        onStartDebate(selectedPhilosophers);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-6 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                    <h2 className="font-serif text-3xl font-bold">Create a Debate</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <p className="mb-6 text-gray-700 dark:text-gray-300">Select two or more philosophers to join the debate circle.</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {PHILOSOPHERS.map(p => {
                            const isSelected = selected.includes(p.id);
                            return (
                                <div key={p.id} onClick={() => togglePhilosopher(p.id)} className={`relative cursor-pointer p-3 rounded-lg text-center transition-all duration-200 ${isSelected ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                                    <img src={p.avatarUrl} alt={p.name} className={`w-20 h-20 rounded-full mx-auto mb-2 border-4 transition-all ${isSelected ? 'border-indigo-500' : 'border-transparent'}`} />
                                    <h3 className="font-semibold text-sm">{p.name}</h3>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                     </div>
                </div>
                <footer className="p-6 border-t border-gray-300 dark:border-gray-700 mt-auto">
                    <button
                        onClick={handleStart}
                        disabled={selected.length < 2}
                        className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Start Debate ({selected.length} selected)
                    </button>
                </footer>
            </div>
        </div>
    );
};


const PersonaCard: React.FC<{ philosopher: Philosopher; onClick: () => void; }> = ({ philosopher, onClick }) => (
    <div
        onClick={onClick}
        className="group relative cursor-pointer p-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
    >
        <div className={`absolute -bottom-10 -right-10 w-28 h-28 ${philosopher.color} rounded-full opacity-30 group-hover:opacity-60 transition-all duration-500 blur-lg`}></div>
        <div className="relative z-10 flex items-center space-x-4">
            <img src={philosopher.avatarUrl} alt={philosopher.name} className="w-16 h-16 rounded-full border-2 border-white/50" />
            <div>
                <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-white">{philosopher.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Chat one-on-one</p>
            </div>
        </div>
    </div>
);

const GroupCard: React.FC<{ group: ChatTarget; onClick: () => void; }> = ({ group, onClick }) => (
     <div
        onClick={onClick}
        className="group relative cursor-pointer p-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
    >
        <div className={`absolute -bottom-10 -right-10 w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-30 group-hover:opacity-60 transition-all duration-500 blur-lg`}></div>
        <div className="relative z-10">
            <div className="flex -space-x-4">
                {group.members.slice(0, 4).map(p => (
                    <img key={p.id} src={p.avatarUrl} alt={p.name} className="w-12 h-12 rounded-full border-2 border-white/50" />
                ))}
            </div>
             <div className="mt-4">
                <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-white">{group.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Debate with the masters</p>
            </div>
        </div>
    </div>
);

const CreateDebateCard: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
     <div
        onClick={onClick}
        className="group relative cursor-pointer p-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center"
    >
        <div className={`absolute -bottom-10 -right-10 w-28 h-28 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-30 group-hover:opacity-60 transition-all duration-500 blur-lg`}></div>
        <div className="relative z-10 p-4 rounded-full bg-white/30 dark:bg-black/30 mb-4">
            <UserGroupIcon className="w-12 h-12 text-gray-800 dark:text-white"/>
        </div>
        <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-white">Create a Custom Debate</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Choose your own panel</p>
    </div>
);


export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectChat }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const debateGroup: ChatTarget = {
        id: 'debate_club',
        type: 'group',
        name: 'The Debate Club',
        members: PHILOSOPHERS.filter(p => ['plato', 'nietzsche', 'camus', 'sartre', 'socrates'].includes(p.id))
    };

    const handleSelectPersona = (philosopher: Philosopher) => {
        onSelectChat({
            id: philosopher.id,
            type: 'persona',
            name: philosopher.name,
            members: [philosopher],
            avatarUrl: philosopher.avatarUrl
        });
    };

    const handleSelectGroup = (group: ChatTarget) => {
        onSelectChat(group);
    };
    
    const handleStartCustomDebate = (philosophers: Philosopher[]) => {
        onSelectChat({
            id: `custom-${Date.now()}`,
            type: 'group',
            name: 'Custom Debate',
            members: philosophers,
        })
    }

  return (
    <>
    <CreateDebateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStartDebate={handleStartCustomDebate} />
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-900 dark:via-black dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4 sm:p-8 animate-fade-in">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl mx-auto">
        <header className="text-center my-12">
            <h1 className="font-serif text-5xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400 pb-2">
                Philosopher's Circle
            </h1>
            <p className="font-sans text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                Step into the agora. Converse with the giants of thought, one-on-one or in a grand debate.
            </p>
        </header>

        <main>
             <h2 className="font-serif text-3xl font-semibold mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-2">Join a Debate</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <GroupCard group={debateGroup} onClick={() => handleSelectGroup(debateGroup)} />
                <CreateDebateCard onClick={() => setIsModalOpen(true)} />
             </div>


            <h2 className="font-serif text-3xl font-semibold mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-2">Chat with a Philosopher</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PHILOSOPHERS.map(p => (
                    <PersonaCard key={p.id} philosopher={p} onClick={() => handleSelectPersona(p)} />
                ))}
            </div>
        </main>
      </div>
    </div>
    </>
  );
};
