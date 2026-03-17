import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';

export default function MainApp() {
  const { user } = useAuth();
  const { 
    rooms, 
    activeRoom, 
    selectRoom, 
    addMessage, 
    createRoom, 
    addMembersToRoom, 
    activeMessages, 
    sendMessage,
    loading 
  } = useRooms();

  const handleSelectRoom = (room: typeof rooms[0]) => {
    selectRoom(room);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeRoom) return;
    
    try {
      await sendMessage(activeRoom._id, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show toast notification here
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={(name, desc, memberIds) => createRoom(name, desc, memberIds)}
        wsConnected={true} // For now, always show as connected
      />
      <ChatArea
        room={activeRoom}
        messages={activeMessages}
        onSendMessage={handleSendMessage}
        wsConnected={true}
        onAddMembers={(memberIds) => activeRoom && addMembersToRoom(activeRoom._id, memberIds)}
      />
    </div>
  );
}
