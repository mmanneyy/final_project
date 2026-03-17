import { Room, Message, User } from '@/types';
import { Hash, Lock, Users, Wifi, WifiOff, UserPlus, Check } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  room: Room | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  wsConnected: boolean;
  onAddMembers: (memberIds: string[]) => void;
}

export default function ChatArea({ room, messages, onSendMessage, wsConnected, onAddMembers }: ChatAreaProps) {
  const { user, allUsers } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (selectedMembers.length === 0) return;
    onAddMembers(selectedMembers);
    setSelectedMembers([]);
    setDialogOpen(false);
  };

  // Users not yet in the room
  const nonMembers = room
    ? allUsers.filter(u => !room.members.includes(u._id))
    : [];

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Hash className="w-10 h-10 text-primary/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Select a room</h3>
        <p className="text-muted-foreground max-w-sm">
          Choose a room from the sidebar to start collaborating in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {room.isPrivate ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Hash className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-semibold text-foreground">{room.name}</span>
          {room.description && (
            <>
              <span className="text-border">|</span>
              <span className="text-sm text-muted-foreground truncate max-w-xs">{room.description}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{room.members.length} members</span>
          </div>

          {/* Add Members button – admin only */}
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedMembers([]); }}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add members
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add members to #{room.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  {nonMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All users are already in this room.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {nonMembers.map(u => {
                          const selected = selectedMembers.includes(u._id);
                          return (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => toggleMember(u._id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border ${
                                selected
                                  ? 'bg-primary/10 border-primary/30 text-foreground'
                                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                                {u.username[0].toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-foreground">{u.username}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {u.role ?? 'member'}
                              </span>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                selected ? 'bg-primary border-primary' : 'border-border'
                              }`}>
                                {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {selectedMembers.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {selectedMembers.length} user{selectedMembers.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                      <Button
                        onClick={handleAddMembers}
                        className="w-full gradient-primary shadow-glow"
                        disabled={selectedMembers.length === 0}
                      >
                        Add to room
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <div
            className={`flex items-center gap-1.5 text-xs ${wsConnected ? 'text-[hsl(var(--online))]' : 'text-muted-foreground'}`}
          >
            {wsConnected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span>{wsConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput
        roomName={room.name}
        onSend={onSendMessage}
        disabled={!wsConnected}
      />
    </div>
  );
}
