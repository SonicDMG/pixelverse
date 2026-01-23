'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  subtitle,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (change?: number) => {
    if (change === undefined) return '';
    return change >= 0 ? 'text-[#00CED1]' : 'text-[#ff0000]';
  };

  const getChangeIcon = (change?: number) => {
    if (change === undefined) return '';
    return change >= 0 ? '▲' : '▼';
  };

  return (
    <div className="p-6 bg-[#0a0e27] border-4 border-[#4169E1] rounded-lg pixel-border hover:border-[#00CED1] transition-colors glitch-hover">
      <div className="space-y-3">
        <h4 className="text-xs font-pixel text-[#4169E1] uppercase">{title}</h4>
        <div className="text-2xl font-pixel text-white glow-text glitch-hover">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-2 text-xs font-pixel ${getChangeColor(change)}`}>
            <span>{getChangeIcon(change)}</span>
            <span>{Math.abs(change).toFixed(2)}%</span>
            {changeLabel && <span className="text-gray-400">({changeLabel})</span>}
          </div>
        )}
        {subtitle && (
          <p className="text-xs font-pixel text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Made with Bob
