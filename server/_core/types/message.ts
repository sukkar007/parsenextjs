// types/message.ts
export interface Message {
  id: string;
  text: string;
  messageType: 'text' | 'picture' | 'audio' | 'video';
  pictureUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  call?: {
    type: 'audio' | 'video';
    duration?: number;
    status: 'missed' | 'answered' | 'rejected';
  };
  read: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  receiver: {
    id: string;
    name: string;
    username: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageStats {
  total: number;
  today: number;
  unread: number;
  withImages: number;
  withoutImages: number;
}

export interface MessageFilters {
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  withCall?: boolean;
  readStatus?: 'all' | 'read' | 'unread';
  messageType?: 'all' | 'text' | 'picture' | 'audio' | 'video';
}