
export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export type View = 'home' | 'history' | 'profile';

export type PhilosopherIconCategory = 'ancient' | 'rationalism' | 'empiricism' | 'existentialism' | 'stoicism' | 'political' | 'eastern' | 'critical_theory' | 'literary';

export interface Philosopher {
  id: string;
  name: string;
  avatarUrl: string;
  systemInstruction: string;
  color: string;
  textColor: string;
  bio: string;
  majorWorks: string[];
  iconCategory: PhilosopherIconCategory;
}

export interface Message {
  id:string;
  text: string;
  sender: 'user' | string; // 'user' or philosopher.id
  timestamp: number;
}

export interface ChatTarget {
  type: 'persona' | 'group';
  id: string;
  name: string;
  members: Philosopher[];
  avatarUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  chatTarget: ChatTarget;
  messages: Message[];
  createdAt: number;
}

export interface Settings {
  temperature: number;
  maxOutputTokens: number | undefined;
  allowDebateInterruption: boolean;
}

export interface UserPersona {
  name: string;
  relationship: string;
  backstory: string;
}

export interface ChatContext {
  summary: string[];
  keyConcepts: {
    term: string;
    definition: string;
  }[];
}
