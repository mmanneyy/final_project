import { useEffect, useRef, useCallback, useState } from 'react';
import { Message, WsEvent } from '@/types';

interface UseWebSocketOptions {
  accessToken: string | null;
  onMessage?: (message: Message) => void;
  onUserJoined?: (data: { userId: string; username: string; roomId: string }) => void;
  onUserLeft?: (data: { userId: string; username: string; roomId: string }) => void;
  onError?: (error: { code: string; message: string }) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // In demo mode, we simulate WS connection
  const [demoConnected, setDemoConnected] = useState(false);

  useEffect(() => {
    if (!options.accessToken) return;

    // Simulate WebSocket connection handshake
    // Real: ws://your-server/ws?token={accessToken}
    const timer = setTimeout(() => {
      setDemoConnected(true);
    }, 600);

    return () => {
      clearTimeout(timer);
      setDemoConnected(false);
    };
  }, [options.accessToken]);

  const joinRoom = useCallback((roomId: string) => {
    if (!demoConnected) return;
    // Real WS: wsRef.current?.send(JSON.stringify({ event: 'room:join', payload: { roomId } }))
    console.log('[WS] Emit: room:join', { roomId });
  }, [demoConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!demoConnected) return;
    console.log('[WS] Emit: room:leave', { roomId });
  }, [demoConnected]);

  const sendMessage = useCallback((roomId: string, content: string): Message | null => {
    if (!demoConnected) return null;
    console.log('[WS] Emit: message:send', { roomId, content });

    // Simulate echo from server
    const msg: Message = {
      _id: `msg_${Date.now()}`,
      content,
      room: roomId,
      sender: { _id: 'self', username: 'you', email: '', createdAt: '', status: 'online' },
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    return msg;
  }, [demoConnected]);

  return { connected: demoConnected, joinRoom, leaveRoom, sendMessage };
}
