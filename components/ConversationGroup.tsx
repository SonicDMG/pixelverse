'use client';

import { Message } from '@/types';
import { ComponentSpec } from '@/types/ui-spec';
import DynamicUIRenderer from './DynamicUIRenderer';
import StockChart from './StockChart';

interface ConversationGroupProps {
  userMessage: Message;
  assistantMessage: Message;
  components?: ComponentSpec[];
  stockData?: any[];
  symbol?: string;
}

/**
 * ConversationGroup - Groups a user question, assistant response, and any related visualizations
 * This creates clear visual separation between different conversation exchanges
 */
export default function ConversationGroup({
  userMessage,
  assistantMessage,
  components,
  stockData,
  symbol,
}: ConversationGroupProps) {
  return (
    <div className="conversation-group">
      {/* User Question */}
      <div className="p-4 border-4 pixel-border bg-[#1a1f3a] border-[#00ff9f] ml-8 mb-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-pixel text-[#00ff9f]">
            {'>'} USER
          </span>
          <span className="text-xs text-gray-500 font-pixel">
            {new Date(userMessage.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
          {userMessage.content}
        </p>
      </div>

      {/* Assistant Response */}
      <div className="p-4 border-4 pixel-border bg-[#0a0e27] border-[#ff00ff] mr-8 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-pixel text-[#ff00ff]">
            {'>'} PIXELTICKER
          </span>
          <span className="text-xs text-gray-500 font-pixel">
            {new Date(assistantMessage.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
          {assistantMessage.content}
        </p>
      </div>

      {/* UI Components or Charts */}
      {components && components.length > 0 && (
        <div className="animate-fade-in mt-6">
          <DynamicUIRenderer components={components} />
        </div>
      )}

      {/* Legacy Stock Chart (if no components but has stock data) */}
      {!components && stockData && stockData.length > 0 && (
        <div className="animate-fade-in mt-6">
          <StockChart data={stockData} symbol={symbol} />
        </div>
      )}
    </div>
  );
}

// Made with Bob