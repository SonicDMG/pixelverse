'use client';

import { MetricCard } from './MetricCard';

interface MetricGridProps {
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon?: string;
  }>;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.label}
          value={metric.value}
          change={metric.change}
          subtitle={metric.icon}
        />
      ))}
    </div>
  );
}

// Made with Bob
