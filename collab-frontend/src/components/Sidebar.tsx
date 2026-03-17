import { Room, User } from '@/types';
import { Hash, Lock, Plus, ChevronDown, Settings, LogOut, MessageSquare, Crown, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  rooms: Room[];
  activeRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onCreateRoom: (name: string, description?: string, memberIds?: string[]) => void;
  wsConnected: boolean;
}

export default function Sidebar({
  rooms,
  activeRoom,
  onSelectRoom,
  onCreateRoom,
  wsConnected,
}: SidebarProps) {
  const { user, logout, allUsers } = useAuth();
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName.trim(), newRoomDesc.trim() || undefined, selectedMembers);
    setNewRoomName('');
    setNewRoomDesc('');
    setSelectedMembers([]);
    setDialogOpen(false);
  };

  // Other users (exclude current user – they're automatically added as creator)
  const otherUsers = allUsers.filter(u => u._id !== user?._id);

  return (
    <TooltipProvider>
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]">
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-[hsl(var(--sidebar-accent-foreground))]">SyncSpace</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[hsl(var(--sidebar-foreground))]" />
        </div>

        {/* WS Status */}
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-[hsl(var(--sidebar-border))]">
          <div
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${wsConnected ? 'bg-[hsl(var(--online))]' : 'bg-muted-foreground'}`}
            style={{ boxShadow: wsConnected ? '0 0 6px hsl(var(--online))' : 'none' }}
          />
          <span className="text-xs text-[hsl(var(--sidebar-foreground))]">
            {wsConnected ? 'WebSocket connected' : 'Connecting...'}
          </span>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-[hsl(var(--sidebar-foreground))] uppercase tracking-wider">
              Rooms
            </span>

            {isAdmin ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 mt-2">
                    {/* Room name */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Room name</label>
                      <Input
                        placeholder="e.g. engineering"
                        value={newRoomName}
                        onChange={e => setNewRoomName(e.target.value)}
                        className="bg-secondary border-border"
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        Description <span className="font-normal">(optional)</span>
                      </label>
                      <Input
                        placeholder="What's this room about?"
                        value={newRoomDesc}
                        onChange={e => setNewRoomDesc(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>

                    {/* Member picker */}
                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" />
                        Add members <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {otherUsers.map(u => {
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
                              {/* Avatar */}
                              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                                {u.username[0].toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-foreground">{u.username}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                              {/* Role badge */}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {u.role ?? 'member'}
                              </span>
                              {/* Check */}
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleCreate}
                      className="w-full gradient-primary shadow-glow"
                      disabled={!newRoomName.trim()}
                    >
                      Create Room
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled
                    className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Only admins can create rooms
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {rooms.map(room => {
            const isActive = activeRoom?._id === room._id;
            return (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`
                  w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left group
                  ${isActive
                    ? 'bg-primary/15 text-[hsl(var(--sidebar-accent-foreground))]'
                    : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
                  }
                `}
              >
                {room.isPrivate ? (
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className={`flex-1 truncate ${isActive ? 'font-medium' : ''}`}>
                  {room.name}
                </span>
                {(room.unreadCount || 0) > 0 && !isActive && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold flex-shrink-0">
                    {room.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[hsl(var(--online))] border-2 border-[hsl(var(--sidebar-background))]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[hsl(var(--sidebar-accent-foreground))] truncate">
                  {user?.username}
                </span>
                {user?.role === 'admin' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Crown className="w-3 h-3 text-primary flex-shrink-0 cursor-default" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">Admin</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="text-xs text-[hsl(var(--sidebar-foreground))] truncate">
                {user?.role ?? 'member'} · {user?.email}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-accent-foreground))] transition-colors">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                className="p-1 rounded hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
