'use client';

import React, { useState, useEffect } from 'react';
import { KnowledgeLevel, ExplainOMaticLevelData } from '@/types/ui-spec';
import { KnowledgeLevelSelector } from './KnowledgeLevelSelector';
import { PixelCard } from '@/components/shared/PixelCard';

interface ExplainOMaticProps {
  topic: string;
  // Single-level mode (for production use with Langflow)
  knowledgeLevel?: KnowledgeLevel;
  explanation?: string;
  relatedTopics?: Array<{
    title: string;
    description: string;
  }>;
  citations?: Array<{
    source: string;
    url?: string;
    excerpt?: string;
  }>;
  followUpQuestions?: string[];
  // Multi-level mode (for testing)
  levels?: Partial<Record<KnowledgeLevel, ExplainOMaticLevelData>>;
  onRelatedTopicClick?: (topic: string) => void;
  onFollowUpClick?: (question: string) => void;
}

const STORAGE_KEY = 'pixelticker_knowledge_level';

export function ExplainOMatic({
  topic,
  knowledgeLevel,
  explanation,
  relatedTopics,
  citations,
  followUpQuestions,
  levels,
  onRelatedTopicClick,
  onFollowUpClick
}: ExplainOMaticProps) {
  console.log('[ExplainOMatic] Component called');
  console.log('[ExplainOMatic] Props received:', {
    topic,
    knowledgeLevel,
    explanation,
    relatedTopics,
    citations,
    followUpQuestions,
    levels
  });
  
  // Determine initial level
  const defaultLevel: KnowledgeLevel = knowledgeLevel || 'layperson';
  
  // Start with default level to avoid hydration mismatch
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel>(defaultLevel);
  const [isClient, setIsClient] = useState(false);

  // Load saved knowledge level from localStorage after mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['kid', 'layperson'].includes(saved)) {
      setSelectedLevel(saved as KnowledgeLevel);
    }
  }, []);

  // Save to localStorage whenever level changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, selectedLevel);
    }
  }, [selectedLevel, isClient]);

  const handleLevelChange = (level: KnowledgeLevel) => {
    setSelectedLevel(level);
  };

  const handleRelatedTopicClick = (topicTitle: string) => {
    if (onRelatedTopicClick) {
      onRelatedTopicClick(topicTitle);
    }
  };

  const handleFollowUpClick = (question: string) => {
    if (onFollowUpClick) {
      onFollowUpClick(question);
    }
  };

  // Get current level data (either from levels object or from direct props)
  const currentLevelData = levels?.[selectedLevel] || {
    explanation: explanation || '',
    relatedTopics: relatedTopics || [],
    citations: citations || [],
    followUpQuestions: followUpQuestions || []
  };
  
  console.log('[ExplainOMatic] currentLevelData computed:', {
    selectedLevel,
    currentLevelData,
    hasLevels: !!levels,
    levelKeys: levels ? Object.keys(levels) : []
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <PixelCard variant="gradient" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <h2 className="text-2xl font-pixel text-[var(--color-primary)] glow-text-subtle uppercase tracking-wider">
            Explain-O-Matic
          </h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-pixel text-white mb-2">
            {topic}
          </h3>
          <div className="h-1 w-32 bg-gradient-to-r from-[var(--color-primary)] to-transparent"></div>
        </div>

        {/* Knowledge Level Selector */}
        <KnowledgeLevelSelector
          currentLevel={selectedLevel}
          onLevelChange={handleLevelChange}
        />
      </PixelCard>

      {/* Explanation Section */}
      <PixelCard variant="scanline" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-pixel text-[var(--color-secondary)] uppercase tracking-wide">
            Explanation
          </h3>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="font-pixel text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
            {currentLevelData.explanation}
          </p>
        </div>
      </PixelCard>

      {/* Related Topics Section */}
      {currentLevelData.relatedTopics && currentLevelData.relatedTopics.length > 0 && (
        <PixelCard variant="glow" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔗</span>
            <h3 className="text-lg font-pixel text-[var(--color-accent)] uppercase tracking-wide">
              Related Topics
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentLevelData.relatedTopics!.map((relatedTopic, index) => (
              <button
                key={index}
                onClick={() => handleRelatedTopicClick(relatedTopic.title)}
                className="text-left p-4 bg-[var(--color-bg-dark)] border-2 border-[var(--color-accent)]/30 rounded-lg pixel-border hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all duration-300 group"
              >
                <h4 className="font-pixel text-sm text-[var(--color-accent)] mb-2 group-hover:glow-text-subtle">
                  {relatedTopic.title}
                </h4>
                <p className="font-pixel text-xs text-gray-400 leading-relaxed">
                  {relatedTopic.description}
                </p>
              </button>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Follow-Up Questions Section */}
      {currentLevelData.followUpQuestions && currentLevelData.followUpQuestions.length > 0 && (
        <PixelCard variant="base" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">❓</span>
            <h3 className="text-lg font-pixel text-[var(--color-purple)] uppercase tracking-wide">
              Follow-Up Questions
            </h3>
          </div>
          
          <div className="space-y-2">
            {currentLevelData.followUpQuestions!.map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpClick(question)}
                className="w-full text-left p-3 bg-[var(--color-bg-dark)] border-2 border-[var(--color-purple)]/30 rounded-lg pixel-border hover:border-[var(--color-purple)] hover:bg-[var(--color-purple)]/10 transition-all duration-300 group"
              >
                <p className="font-pixel text-xs text-gray-300 group-hover:text-[var(--color-purple)]">
                  {question}
                </p>
              </button>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Citations Section */}
      {currentLevelData.citations && currentLevelData.citations.length > 0 && (
        <PixelCard variant="base" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <h3 className="text-lg font-pixel text-[var(--color-secondary)] uppercase tracking-wide">
              Sources & Citations
            </h3>
          </div>
          
          <div className="space-y-3">
            {currentLevelData.citations!.map((citation, index) => (
              <div
                key={index}
                className="p-4 bg-[var(--color-bg-dark)] border-2 border-[var(--color-secondary)]/30 rounded-lg pixel-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-pixel text-sm text-[var(--color-secondary)] mb-2">
                      {citation.source}
                    </h4>
                    {citation.excerpt && (
                      <p className="font-pixel text-xs text-gray-400 italic leading-relaxed">
                        "{citation.excerpt}"
                      </p>
                    )}
                  </div>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-2 bg-[var(--color-secondary)] text-white font-pixel text-xs rounded pixel-border hover:bg-[var(--color-secondary)]/80 transition-colors"
                      aria-label={`View source: ${citation.source}`}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}

// Made with Bob