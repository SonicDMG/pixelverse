import { Message } from '@/types';

interface MessageHistoryProps {
  messages: Message[];
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 border-4 pixel-border ${
            message.role === 'user'
              ? 'bg-[#1a1f3a] border-[#00ff9f] ml-8'
              : 'bg-[#0a0e27] border-[#ff00ff] mr-8'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-pixel ${
                message.role === 'user' ? 'text-[#00ff9f]' : 'text-[#ff00ff]'
              }`}
            >
              {message.role === 'user' ? '> USER' : '> PIXELTICKER'}
            </span>
            <span className="text-xs text-gray-500 font-pixel">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      ))}
    </div>
  );
}

// Made with Bob
