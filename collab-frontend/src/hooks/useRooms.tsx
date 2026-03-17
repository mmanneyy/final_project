import { useState, useCallback, useEffect } from 'react';
import { Room, Message } from '@/types';
import { roomService, messageService, type Room as ApiRoom, type Message as ApiMessage } from '@/services/roomService';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert API room to frontend room format
  const convertApiRoom = (apiRoom: ApiRoom): Room => ({
    _id: apiRoom._id,
    name: apiRoom.name || 'Untitled Room',
    description: apiRoom.type === 'dm' ? 'Direct Message' : 'Group Chat',
    members: apiRoom.members.map(m => m.userId._id),
    createdBy: apiRoom.members[0]?.userId._id || '',
    createdAt: apiRoom.createdAt,
    isPrivate: apiRoom.type === 'dm',
    unreadCount: 0, // TODO: Calculate from unread messages
  });

  // Convert API message to frontend message format
  const convertApiMessage = (apiMessage: ApiMessage): Message => ({
    _id: apiMessage._id,
    content: apiMessage.content,
    sender: {
      _id: apiMessage.senderId._id,
      username: apiMessage.senderId.username,
      email: apiMessage.senderId.email,
      status: 'online',
      createdAt: apiMessage.createdAt,
    },
    room: apiMessage.roomId,
    createdAt: apiMessage.createdAt,
    type: 'text',
    edited: apiMessage.edited,
  });

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const apiRooms = await roomService.getRooms();
        const convertedRooms = apiRooms.map(convertApiRoom);
        setRooms(convertedRooms);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  // Load messages when room is selected
  useEffect(() => {
    if (!activeRoom) return;

    const loadMessages = async () => {
      try {
        const apiMessages = await messageService.getMessages(activeRoom._id);
        const convertedMessages = apiMessages.map(convertApiMessage);
        setMessages(prev => ({
          ...prev,
          [activeRoom._id]: convertedMessages,
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [activeRoom]);

  const selectRoom = useCallback((room: Room) => {
    setActiveRoom(room);
    // Mark as read
    setRooms(prev =>
      prev.map(r => (r._id === room._id ? { ...r, unreadCount: 0 } : r))
    );
  }, []);

  const addMessage = useCallback((roomId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message],
    }));
  }, []);

  const addMembersToRoom = useCallback(async (roomId: string, memberIds: string[]) => {
    try {
      for (const userId of memberIds) {
        await roomService.addMember(roomId, userId);
      }
      
      // Refresh room data
      const updatedRoom = await roomService.getRoom(roomId);
      const convertedRoom = convertApiRoom(updatedRoom);
      
      setRooms(prev =>
        prev.map(r => r._id === roomId ? convertedRoom : r)
      );
    } catch (error) {
      console.error('Failed to add members:', error);
      throw error;
    }
  }, []);

  const createRoom = useCallback(async (name: string, description?: string, memberIds?: string[]) => {
    try {
      const roomData = {
        name,
        type: 'group' as const,
        memberIds: memberIds || [],
      };
      
      const apiRoom = await roomService.createRoom(roomData);
      const convertedRoom = convertApiRoom(apiRoom);
      
      setRooms(prev => [...prev, convertedRoom]);
      setMessages(prev => ({ ...prev, [convertedRoom._id]: [] }));
      
      return convertedRoom;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (roomId: string, content: string) => {
    try {
      const apiMessage = await messageService.sendMessage(roomId, content);
      const convertedMessage = convertApiMessage(apiMessage);
      
      addMessage(roomId, convertedMessage);
      
      // Update room's lastMessageAt by refreshing rooms
      const apiRooms = await roomService.getRooms();
      const convertedRooms = apiRooms.map(convertApiRoom);
      setRooms(convertedRooms);
      
      return convertedMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [addMessage]);

  const activeMessages = activeRoom ? (messages[activeRoom._id] || []) : [];

  return { 
    rooms, 
    activeRoom, 
    selectRoom, 
    addMessage, 
    createRoom, 
    addMembersToRoom, 
    activeMessages, 
    sendMessage,
    loading 
  };
}
