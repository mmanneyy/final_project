import { useState, KeyboardEvent, useRef } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  roomName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ roomName, onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-4 py-4 border-t border-border">
      <div
        className={`
          flex items-end gap-3 rounded-xl border px-4 py-3 transition-colors
          ${disabled
            ? 'bg-muted border-border opacity-50'
            : 'bg-secondary border-border focus-within:border-primary/50 focus-within:shadow-glow'
          }
        `}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`Message #${roomName}`}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed max-h-[120px] min-h-[20px]"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
            ${value.trim() && !disabled
              ? 'gradient-primary text-primary-foreground shadow-glow hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-1">
        <span className="font-medium">Enter</span> to send · <span className="font-medium">Shift+Enter</span> for new line
      </p>
    </div>
  );
}
