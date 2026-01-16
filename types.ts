
export type UserRole = 'student' | 'guest';
export type StudyMode = 'Notes' | 'Assignment' | 'Project' | 'Research' | 'Study' | 'General';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
