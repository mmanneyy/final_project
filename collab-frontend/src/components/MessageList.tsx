import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-foreground font-medium mb-1">This is the beginning of the channel</p>
        <p className="text-muted-foreground text-sm">Send a message to get started!</p>
      </div>
    );
  }

  // Group consecutive messages from same sender
  const grouped = messages.reduce<Array<{ sender: Message['sender']; messages: Message[] }>>(
    (acc, msg) => {
      const last = acc[acc.length - 1];
      if (last && last.sender._id === msg.sender._id) {
        last.messages.push(msg);
      } else {
        acc.push({ sender: msg.sender, messages: [msg] });
      }
      return acc;
    },
    []
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {grouped.map((group, groupIdx) => {
        const isSelf = group.sender._id === user?._id || group.sender._id === 'self';
        const initial = group.sender.username?.[0]?.toUpperCase() || '?';
        const firstMsg = group.messages[0];

        return (
          <div key={`${group.sender._id}-${groupIdx}`} className="flex gap-3 group animate-message-in">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold mt-0.5"
              style={{
                background: isSelf
                  ? 'hsl(var(--primary))'
                  : `hsl(${(group.sender.username.charCodeAt(0) * 40) % 360} 60% 45%)`,
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              {initial}
            </div>

            {/* Messages */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {isSelf ? 'you' : group.sender.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(firstMsg.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.messages.map(msg => (
                  <p
                    key={msg._id}
                    className="text-sm text-foreground/90 leading-relaxed break-words"
                  >
                    {msg.content}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
