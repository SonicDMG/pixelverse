/**
 * Interactive UI Component Types
 * Types for interactive and dynamic components like Explain-O-Matic and streaming loaders
 */

import { UIComponentSpec } from './base';

// Explain-O-Matic types

export type KnowledgeLevel = 'kid' | 'layperson';

export interface ExplainOMaticLevelData {
  explanation: string;
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
}

export interface ExplainOMaticSpec extends UIComponentSpec {
  type: 'explain-o-matic';
  props: {
    topic: string;
    // Support both single level (for simple use) and multi-level (for test page)
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
    // Multi-level support
    levels?: Partial<Record<KnowledgeLevel, ExplainOMaticLevelData>>;
  };
}

export interface StreamingDataLoaderSpec extends UIComponentSpec {
  type: 'streaming-data-loader';
  props: {
    message?: string;
    chunksReceived?: number;
    totalChunks?: number;
    status?: 'connecting' | 'streaming' | 'processing' | 'complete';
  };
}

// Made with Bob