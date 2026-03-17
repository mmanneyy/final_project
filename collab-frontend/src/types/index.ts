export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  status?: 'online' | 'offline' | 'away';
  role?: 'admin' | 'member';
}

export interface Room {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  isPrivate?: boolean;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  room: string;
  createdAt: string;
  updatedAt?: string;
  type?: 'text' | 'system';
  edited?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// WebSocket Event Types
export interface WsEvent<T = unknown> {
  event: string;
  payload: T;
}

export interface WsJoinRoom {
  roomId: string;
  userId: string;
}

export interface WsSendMessage {
  roomId: string;
  content: string;
  senderId: string;
}

export interface WsReceiveMessage {
  message: Message;
}

export interface WsError {
  code: string;
  message: string;
}
