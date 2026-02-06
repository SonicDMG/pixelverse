'use client';

import { formatValue } from '@/utils/formatting/formatters';
import { ChangeIndicator } from '@/components/shared';
import { CARD_STYLES, TEXT_STYLES } from '@/constants/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  subtitle,
}: MetricCardProps) {
  return (
    <div className={CARD_STYLES.glow}>
      <div className="space-y-3">
        <h4 className={TEXT_STYLES.label}>{title}</h4>
        <div className={TEXT_STYLES.value}>
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-2 text-xs font-pixel">
            <ChangeIndicator value={change} label={changeLabel} />
          </div>
        )}
        {subtitle && (
          <p className={TEXT_STYLES.subtitle}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Made with Bob
