
import React from 'react';
import { Philosopher, PhilosopherIconCategory } from '../types';

const AncientIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4"></path>
        <path d="M4,12 C4,16.418278 7.581722,20 12,20"></path>
        <path d="M12,4 C7.581722,4 4,7.581722 4,12"></path>
        <path d="M13,8 a0.5,1 0,0,0 -1,-1"></path>
        <path d="M14,12 a0.5,1 0,0,0 -1,-1"></path>
        <path d="M13,16 a0.5,1 0,0,0 -1,-1"></path>
        <path d="M11,6 a0.5,1 0,0,0 -1,1"></path>
        <path d="M10,10 a0.5,1 0,0,0 -1,1"></path>
        <path d="M11,14 a0.5,1 0,0,0 -1,1"></path>
    </svg>
);

const RationalismIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="1.5"></circle>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none"></ellipse>
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"></ellipse>
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"></ellipse>
    </svg>
);

const EmpiricismIcon = () => (
     <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
        <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
    </svg>
);

const ExistentialismIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4 C10 8, 14 6, 18 10"></path>
        <path d="M18 10 C14 14, 10 12, 6 16"></path>
        <path d="M6 16 C10 20, 14 18, 18 20"></path>
    </svg>
);

const StoicismIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 21h14v-2H5v2zm5-18v14h4V3h-4zM6 5h2v10H6V5zm10 0h2v10h-2V5z"></path>
    </svg>
);

const PoliticalIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18"></path>
        <path d="M3 6h18"></path>
        <path d="M5 6l-2 5h4l-2-5z"></path>
        <path d="M19 6l-2 5h4l-2-5z"></path>
    </svg>
);

const EasternIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-10c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"></path>
        <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
    </svg>
);

const CriticalTheoryIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
    </svg>
);

const LiteraryIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
    </svg>
);


const IconMap: React.FC<{ category: PhilosopherIconCategory }> = ({ category }) => {
    switch (category) {
        case 'ancient': return <AncientIcon />;
        case 'rationalism': return <RationalismIcon />;
        case 'empiricism': return <EmpiricismIcon />;
        case 'existentialism': return <ExistentialismIcon />;
        case 'stoicism': return <StoicismIcon />;
        case 'political': return <PoliticalIcon />;
        case 'eastern': return <EasternIcon />;
        case 'critical_theory': return <CriticalTheoryIcon />;
        case 'literary': return <LiteraryIcon />;
        default: return null;
    }
}

interface PhilosopherIconProps {
    philosopher: Philosopher;
    size: string; // e.g., "w-16 h-16"
    withBorder?: boolean;
}

export const PhilosopherIcon: React.FC<PhilosopherIconProps> = ({ philosopher, size, withBorder }) => {
    const iconSizeClass = () => {
        if (size.includes('16')) return 'w-8 h-8';
        if (size.includes('12')) return 'w-7 h-7';
        if (size.includes('10')) return 'w-5 h-5';
        if (size.includes('8')) return 'w-4 h-4';
        return 'w-6 h-6'; // Default
    };
    
    return (
        <div className={`rounded-full flex items-center justify-center shrink-0 ${philosopher.color} ${size} ${withBorder ? 'border-2 border-white/50 dark:border-gray-800' : ''}`}>
            <div className={`text-white/90 ${iconSizeClass()}`}>
                <IconMap category={philosopher.iconCategory} />
            </div>
        </div>
    );
};
