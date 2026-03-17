import { api } from '@/lib/api';

export interface Room {
  _id: string;
  type: 'dm' | 'group';
  name?: string;
  members: RoomMember[];
  dmKey?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  joinedAt: string;
  leftAt?: string;
}

export interface Message {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  edited?: boolean;
}

export interface CreateRoomData {
  name?: string;
  type?: 'dm' | 'group';
  memberIds: string[];
}

// Room API functions
export const roomService = {
  // Get all rooms for the current user
  async getRooms(): Promise<Room[]> {
    return api.get<Room[]>('/rooms');
  },

  // Get a specific room by ID
  async getRoom(roomId: string): Promise<Room> {
    return api.get<Room>(`/rooms/${roomId}`);
  },

  // Create a new room
  async createRoom(roomData: CreateRoomData): Promise<Room> {
    return api.post<Room>('/rooms', roomData);
  },

  // Add a member to a room
  async addMember(roomId: string, userId: string): Promise<Room> {
    return api.post<Room>(`/rooms/${roomId}/members`, { userId });
  },

  // Get room members
  async getMembers(roomId: string): Promise<RoomMember[]> {
    return api.get<RoomMember[]>(`/rooms/${roomId}/members`);
  },

  // Join a room
  async joinRoom(roomId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/rooms/${roomId}/join`);
  },

  // Leave a room
  async leaveRoom(roomId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/rooms/${roomId}/leave`);
  }
};

// Message API functions
export const messageService = {
  // Get messages for a room
  async getMessages(roomId: string, before?: string, limit?: number): Promise<Message[]> {
    const params = new URLSearchParams();
    if (before) params.append('before', before);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString();
    return api.get<Message[]>(`/rooms/${roomId}/messages${query ? `?${query}` : ''}`);
  },

  // Send a message
  async sendMessage(roomId: string, content: string): Promise<Message> {
    return api.post<Message>(`/rooms/${roomId}/messages`, { content });
  },

  // Update a message
  async updateMessage(roomId: string, messageId: string, content: string): Promise<Message> {
    return api.patch<Message>(`/rooms/${roomId}/messages/${messageId}`, { content });
  },

  // Delete a message
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    return api.delete<void>(`/rooms/${roomId}/messages/${messageId}`);
  }
};
