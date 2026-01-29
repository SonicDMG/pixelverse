import { Message } from '@/types';
import { ComponentSpec } from '@/types/ui-spec';
import { DynamicUIRenderer } from './DynamicUIRenderer';
import { StockChart } from './StockChart';
import { useTheme } from '@/contexts/ThemeContext';

interface ConversationGroupProps {
  userMessage: Message;
  assistantMessage: Message;
  components?: ComponentSpec[];
  stockData?: any[];
  symbol?: string;
  durationSeconds?: number;
  onSetQuestion?: (question: string) => void;
}

/**
 * ConversationGroup - Groups a user question, assistant response, and any related visualizations
 * This creates clear visual separation between different conversation exchanges
 */
export function ConversationGroup({
  userMessage,
  assistantMessage,
  components,
  stockData,
  symbol,
  durationSeconds,
  onSetQuestion,
}: ConversationGroupProps) {
  const { theme } = useTheme();
  
  console.log('[ConversationGroup] Rendering with:', {
    hasComponents: !!components,
    componentCount: components?.length,
    componentTypes: components?.map(c => c.type),
    hasStockData: !!stockData,
    stockDataLength: stockData?.length,
    symbol,
  });
  
  return (
    <div className="conversation-group">
      {/* User Question */}
      <div className="p-4 border-4 pixel-border bg-[var(--color-bg-card)] border-[var(--color-primary)] ml-8 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel text-[var(--color-primary)]">
              {'>'} USER
            </span>
            <span className="text-xs text-gray-500 font-pixel">
              {new Date(userMessage.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {durationSeconds !== undefined && (
            <span className="text-xs font-pixel text-cyan-400">
              {durationSeconds.toFixed(1)}s
            </span>
          )}
        </div>
        <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
          {userMessage.content}
        </p>
      </div>

      {/* Assistant Response */}
      <div className="p-4 border-4 pixel-border bg-[var(--color-bg-dark)] mr-8 mb-6 animate-fade-in" style={{ borderColor: theme.colors.secondary }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-pixel" style={{ color: theme.colors.secondary }}>
            {'>'} {theme.name.toUpperCase()}
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
          <DynamicUIRenderer components={components} onSetQuestion={onSetQuestion} />
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