'use client';

import React from 'react';
import { KnowledgeLevel } from '@/types';

interface KnowledgeLevelSelectorProps {
  currentLevel: KnowledgeLevel;
  onLevelChange: (level: KnowledgeLevel) => void;
}

const KNOWLEDGE_LEVELS: Array<{
  id: KnowledgeLevel;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'kid',
    label: 'Kid Mode',
    icon: '🧒',
    description: 'Fun and easy to understand!'
  },
  {
    id: 'layperson',
    label: 'Layperson',
    icon: '📚',
    description: 'Detailed explanation for adults'
  }
];

export function KnowledgeLevelSelector({
  currentLevel,
  onLevelChange
}: KnowledgeLevelSelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-pixel text-[var(--color-primary)] uppercase tracking-wide">
          Knowledge Level:
        </span>
        <span className="text-xs font-pixel text-gray-400">
          Choose your preferred explanation depth
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {KNOWLEDGE_LEVELS.map((level) => {
          const isActive = currentLevel === level.id;
          
          return (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              className={`
                group relative px-4 py-2 rounded-lg pixel-border transition-all duration-300
                ${isActive
                  ? 'bg-[var(--color-primary)] border-2 border-[var(--color-primary)] text-white scale-105'
                  : 'bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)]/30 text-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }
              `}
              style={{
                boxShadow: isActive
                  ? '0 0 20px rgba(65, 105, 225, 0.5)'
                  : 'none'
              }}
              title={level.description}
              aria-label={`Select ${level.label} knowledge level`}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{level.icon}</span>
                <span className="font-pixel text-xs uppercase tracking-wide">
                  {level.label}
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-bg-dark)] border-2 border-[var(--color-primary)] rounded-lg pixel-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <p className="text-xs font-pixel text-gray-300">
                  {level.description}
                </p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--color-primary)]"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob