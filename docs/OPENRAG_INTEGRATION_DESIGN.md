# PIXELTICKER OpenRAG Integration - Technical Design Document

## Executive Summary

This document outlines a comprehensive strategy for integrating OpenRAG (IBM's open-source RAG distribution) into the PIXELTICKER application. OpenRAG, powered by OpenSearch, Langflow, and Docling, provides enterprise-ready RAG capabilities that will enhance PIXELTICKER's financial analysis capabilities with document-grounded responses, multi-source analysis, and citation support.

**Key Benefits:**
- Document-grounded financial analysis with source citations
- Multi-source information synthesis (SEC filings, earnings reports, news)
- Historical context retrieval for better market insights
- Reduced hallucination through grounded responses
- Seamless integration with existing Langflow infrastructure

---

## 1. Current Architecture Analysis

### 1.1 Existing PIXELTICKER Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    PIXELTICKER Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ QuestionInput│  │ DynamicUI    │  │ Audio/Visual │      │
│  │              │  │ Renderer     │  │ Feedback     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                    Next.js API Layer                         │
│                  /api/ask-stock/route.ts                     │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Langflow Service    │
                │  (langflow.ts)        │
                │                       │
                │  - Session tracking   │
                │  - Response parsing   │
                │  - UI spec generation │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Langflow Server     │
                │   (Port 7861)         │
                │                       │
                │  Flow ID: 97cc8b65... │
                └───────────────────────┘
```

### 1.2 Key Integration Points

1. **API Layer** ([`/api/ask-stock/route.ts`](pixelticker/app/api/ask-stock/route.ts:1))
   - Input validation and sanitization
   - Error handling
   - Response formatting

2. **Langflow Service** ([`services/langflow.ts`](pixelticker/services/langflow.ts:1))
   - Query orchestration
   - Response parsing
   - Stock data extraction
   - UI specification handling

3. **Dynamic UI System** ([`components/DynamicUIRenderer.tsx`](pixelticker/components/DynamicUIRenderer.tsx:1))
   - 8 component types (charts, tables, metrics, alerts)
   - Type-safe rendering
   - Security-conscious component registry

4. **Type System** ([`types/ui-spec.ts`](pixelticker/types/ui-spec.ts:1), [`types/index.ts`](pixelticker/types/index.ts:1))
   - Strongly typed UI specifications
   - Conversation tracking
   - Stock data structures

---

## 2. OpenRAG Architecture Design

### 2.1 OpenRAG Overview

Based on research from https://www.openr.ag/ and https://github.com/langflow-ai/openrag:

**OpenRAG Components:**
- **Docling**: Document parsing and chunking (PDF, DOCX, HTML)
- **OpenSearch**: Vector database for embeddings and hybrid search
- **Langflow**: Orchestration layer (already in use!)
- **IBM Granite Models**: Embedding and generation models

**Key Advantages for PIXELTICKER:**
1. **Langflow Native**: OpenRAG is built by the Langflow team, ensuring seamless integration
2. **Enterprise Ready**: IBM-backed with production-grade components
3. **Developer First**: Simple CLI setup (`uv run openrag`)
4. **Hybrid Search**: Combines vector similarity with keyword matching
5. **Document Intelligence**: Advanced parsing for financial documents

### 2.2 Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PIXELTICKER Frontend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ QuestionInput│  │ DynamicUI    │  │ Audio/Visual │              │
│  │              │  │ Renderer     │  │ Feedback     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                           │                                          │
│                    Next.js API Layer                                 │
│         ┌─────────────────┴─────────────────┐                       │
│         │                                    │                       │
│  /api/ask-stock          /api/rag-query     │                       │
│  (legacy support)        (new RAG endpoint) │                       │
└─────────┼────────────────────────┼───────────┼───────────────────────┘
          │                        │           │
          ▼                        ▼           │
┌─────────────────────┐  ┌─────────────────────────────────┐
│  Langflow Service   │  │    OpenRAG Service              │
│  (langflow.ts)      │  │    (openrag.ts - NEW)           │
│                     │  │                                 │
│  - Agent routing    │  │  - Document retrieval           │
│  - UI generation    │  │  - Context augmentation         │
│  - Stock queries    │  │  - Citation extraction          │
└─────────────────────┘  │  - Hybrid search                │
          │              └─────────────────────────────────┘
          │                        │           │
          ▼                        ▼           ▼
┌─────────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Langflow Server    │  │  OpenSearch  │  │   Docling    │
│  (Port 7861)        │  │  (Vector DB) │  │  (Parser)    │
│                     │  │              │  │              │
│  - Flow execution   │  │  - Embeddings│  │  - PDF parse │
│  - Agent selection  │  │  - Hybrid    │  │  - Chunking  │
│  - Response format  │  │    search    │  │  - Metadata  │
└─────────────────────┘  └──────────────┘  └──────────────┘
          │                        │                │
          └────────────────────────┴────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐        ┌─────────▼─────────┐
          │  Financial Data   │        │  Document Store   │
          │  APIs             │        │                   │
          │  - Stock prices   │        │  - SEC filings    │
          │  - Market data    │        │  - Earnings calls │
          │  - Real-time feed │        │  - News articles  │
          └───────────────────┘        │  - Analyst reports│
                                       └───────────────────┘
```

### 2.3 Hybrid Approach: Langflow + OpenRAG

**Strategy: Complementary Integration**

Rather than replacing Langflow, OpenRAG will work alongside it:

1. **Langflow**: Continues to handle agent routing, real-time data queries, and UI generation
2. **OpenRAG**: Provides document-grounded context and historical analysis
3. **Integration Point**: Langflow flows can call OpenRAG for document retrieval when needed

**Benefits:**
- Preserve existing agent-based architecture
- Add RAG capabilities incrementally
- Maintain dynamic UI generation
- Leverage both real-time and historical data

---

## 3. Data Ingestion Pipeline

### 3.1 Document Types for Financial RAG

```
Financial Document Hierarchy:
├── SEC Filings (High Priority)
│   ├── 10-K (Annual Reports)
│   ├── 10-Q (Quarterly Reports)
│   ├── 8-K (Current Reports)
│   ├── S-1 (IPO Filings)
│   └── Proxy Statements (DEF 14A)
│
├── Earnings & Transcripts (High Priority)
│   ├── Earnings Call Transcripts
│   ├── Earnings Presentations
│   └── Shareholder Letters
│
├── News & Analysis (Medium Priority)
│   ├── Financial News Articles
│   ├── Analyst Reports
│   ├── Market Commentary
│   └── Press Releases
│
├── Market Data Context (Medium Priority)
│   ├── Historical Price Data
│   ├── Trading Volume Analysis
│   ├── Market Indices Context
│   └── Sector Performance
│
└── Reference Materials (Low Priority)
    ├── Company Websites
    ├── Industry Reports
    ├── Regulatory Filings
    └── Economic Indicators
```

### 3.2 Ingestion Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Document Ingestion Pipeline               │
└─────────────────────────────────────────────────────────────┘

Step 1: Document Collection
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SEC EDGAR   │  │  News APIs   │  │  Earnings    │
│  API         │  │  (NewsAPI,   │  │  Transcript  │
│              │  │   Alpha      │  │  Services    │
│              │  │   Vantage)   │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
Step 2: Document Processing (Docling)
┌─────────────────────────────────────────────┐
│  Docling Document Parser                    │
│  ┌─────────────────────────────────────┐   │
│  │  - PDF/HTML/DOCX parsing            │   │
│  │  - Table extraction                 │   │
│  │  - Figure/chart detection           │   │
│  │  - Metadata extraction              │   │
│  │  - Structure preservation           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                         │
                         ▼
Step 3: Intelligent Chunking
┌─────────────────────────────────────────────┐
│  Chunking Strategy                          │
│  ┌─────────────────────────────────────┐   │
│  │  Financial Document Chunking:       │   │
│  │  - Semantic sections (MD&A, Risk)   │   │
│  │  - Table preservation               │   │
│  │  - 512-1024 token chunks            │   │
│  │  - 128 token overlap                │   │
│  │  - Metadata enrichment              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                         │
                         ▼
Step 4: Embedding Generation
┌─────────────────────────────────────────────┐
│  Embedding Model                            │
│  ┌─────────────────────────────────────┐   │
│  │  IBM Granite Embedding Model        │   │
│  │  - Financial domain tuning          │   │
│  │  - 768-dimensional vectors          │   │
│  │  - Batch processing                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                         │
                         ▼
Step 5: Vector Storage
┌─────────────────────────────────────────────┐
│  OpenSearch Vector Database                 │
│  ┌─────────────────────────────────────┐   │
│  │  Index Structure:                   │   │
│  │  - Vector embeddings                │   │
│  │  - Full text (for hybrid search)    │   │
│  │  - Metadata (symbol, date, type)    │   │
│  │  - Source references                │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 3.3 Metadata Schema

```typescript
interface DocumentMetadata {
  // Core identification
  id: string;
  source_type: 'sec_filing' | 'earnings_call' | 'news' | 'analyst_report' | 'market_data';
  
  // Financial context
  symbol: string;
  company_name: string;
  sector?: string;
  industry?: string;
  
  // Temporal context
  filing_date: string;
  period_end_date?: string;
  fiscal_year?: number;
  fiscal_quarter?: number;
  
  // Document specifics
  document_type: string; // '10-K', '10-Q', '8-K', etc.
  section?: string; // 'MD&A', 'Risk Factors', etc.
  page_number?: number;
  
  // Content metadata
  chunk_index: number;
  total_chunks: number;
  word_count: number;
  
  // Source tracking
  source_url: string;
  ingestion_timestamp: string;
  
  // Quality metrics
  confidence_score?: number;
  data_quality?: 'high' | 'medium' | 'low';
}
```

### 3.4 Update Strategy

```typescript
// Ingestion frequency by document type
const INGESTION_SCHEDULE = {
  sec_filings: {
    frequency: 'daily',
    check_time: '18:00 EST', // After market close
    lookback_days: 1,
  },
  earnings_calls: {
    frequency: 'daily',
    check_time: '20:00 EST', // After earnings season
    lookback_days: 1,
  },
  news_articles: {
    frequency: 'hourly',
    batch_size: 100,
    deduplication: true,
  },
  market_data: {
    frequency: 'real-time',
    aggregation_window: '5min',
    storage: 'time-series',
  },
};
```

---

## 4. API Layer Design

### 4.1 New API Endpoints

```typescript
// File: app/api/rag-query/route.ts
/**
 * RAG-enhanced query endpoint
 * Combines document retrieval with real-time data
 */
export async function POST(request: NextRequest) {
  const { question, symbol, context_window } = await request.json();
  
  // 1. Retrieve relevant documents from OpenRAG
  const documents = await retrieveDocuments(question, symbol);
  
  // 2. Augment query with retrieved context
  const augmentedQuery = buildAugmentedQuery(question, documents);
  
  // 3. Send to Langflow with context
  const result = await queryLangflowWithContext(augmentedQuery, documents);
  
  // 4. Return response with citations
  return NextResponse.json({
    answer: result.answer,
    components: result.components,
    citations: extractCitations(documents),
    sources: documents.map(d => d.metadata),
  });
}

// File: app/api/ingest-document/route.ts
/**
 * Document ingestion endpoint
 * For manual document uploads or webhook triggers
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const metadata = JSON.parse(formData.get('metadata') as string);
  
  // Process and ingest document
  const result = await ingestDocument(file, metadata);
  
  return NextResponse.json(result);
}

// File: app/api/search-documents/route.ts
/**
 * Direct document search endpoint
 * For exploring available documents
 */
export async function POST(request: NextRequest) {
  const { query, filters, limit } = await request.json();
  
  const results = await searchDocuments(query, filters, limit);
  
  return NextResponse.json(results);
}
```

### 4.2 OpenRAG Service Implementation

```typescript
// File: services/openrag.ts

import { OpenSearchClient } from '@opensearch-project/opensearch';
import axios from 'axios';

interface RAGDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  score: number;
  embedding?: number[];
}

interface RAGQueryOptions {
  symbol?: string;
  date_range?: { start: string; end: string };
  document_types?: string[];
  top_k?: number;
  hybrid_search?: boolean;
}

/**
 * OpenRAG Service for document retrieval and context augmentation
 */
export class OpenRAGService {
  private openSearchClient: OpenSearchClient;
  private embeddingEndpoint: string;
  
  constructor() {
    this.openSearchClient = new OpenSearchClient({
      node: process.env.OPENSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.OPENSEARCH_USER || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin',
      },
    });
    
    this.embeddingEndpoint = process.env.EMBEDDING_API_URL || 'http://localhost:8080/embed';
  }
  
  /**
   * Retrieve relevant documents for a query
   */
  async retrieveDocuments(
    query: string,
    options: RAGQueryOptions = {}
  ): Promise<RAGDocument[]> {
    const {
      symbol,
      date_range,
      document_types,
      top_k = 5,
      hybrid_search = true,
    } = options;
    
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Build OpenSearch query
    const searchQuery = this.buildSearchQuery(
      query,
      queryEmbedding,
      { symbol, date_range, document_types },
      hybrid_search
    );
    
    // Execute search
    const response = await this.openSearchClient.search({
      index: 'financial_documents',
      body: searchQuery,
      size: top_k,
    });
    
    // Parse and return results
    return response.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      content: hit._source.content,
      metadata: hit._source.metadata,
      score: hit._score,
    }));
  }
  
  /**
   * Generate embedding for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(this.embeddingEndpoint, {
      text,
      model: 'granite-embedding-125m',
    });
    
    return response.data.embedding;
  }
  
  /**
   * Build hybrid search query (vector + keyword)
   */
  private buildSearchQuery(
    query: string,
    embedding: number[],
    filters: any,
    hybrid: boolean
  ): any {
    const must: any[] = [];
    const should: any[] = [];
    
    // Vector similarity search
    should.push({
      knn: {
        embedding: {
          vector: embedding,
          k: 10,
        },
      },
    });
    
    // Keyword search (if hybrid)
    if (hybrid) {
      should.push({
        multi_match: {
          query,
          fields: ['content^2', 'metadata.section', 'metadata.document_type'],
          type: 'best_fields',
          boost: 0.3,
        },
      });
    }
    
    // Apply filters
    if (filters.symbol) {
      must.push({ term: { 'metadata.symbol': filters.symbol } });
    }
    
    if (filters.date_range) {
      must.push({
        range: {
          'metadata.filing_date': {
            gte: filters.date_range.start,
            lte: filters.date_range.end,
          },
        },
      });
    }
    
    if (filters.document_types) {
      must.push({
        terms: { 'metadata.document_type': filters.document_types },
      });
    }
    
    return {
      query: {
        bool: {
          must,
          should,
          minimum_should_match: 1,
        },
      },
    };
  }
  
  /**
   * Augment query with retrieved context
   */
  buildAugmentedPrompt(
    originalQuery: string,
    documents: RAGDocument[]
  ): string {
    const context = documents
      .map((doc, idx) => {
        const meta = doc.metadata;
        return `
[Source ${idx + 1}: ${meta.document_type} - ${meta.symbol} - ${meta.filing_date}]
${doc.content}
`;
      })
      .join('\n\n');
    
    return `
Context from financial documents:
${context}

User Question: ${originalQuery}

Please answer the question based on the provided context. If the context doesn't contain relevant information, say so. Always cite your sources using [Source N] notation.
`;
  }
}

// Singleton instance
export const openRAGService = new OpenRAGService();
```

---

## 5. UI Component Enhancements

### 5.1 New Component Types for RAG

```typescript
// File: types/ui-spec.ts (additions)

/**
 * Citation component - shows source documents
 */
export interface CitationSpec extends UIComponentSpec {
  type: 'citation';
  props: {
    sources: Array<{
      id: string;
      title: string;
      document_type: string;
      date: string;
      url?: string;
      excerpt: string;
      relevance_score: number;
    }>;
    inline?: boolean;
  };
}

/**
 * Document preview component
 */
export interface DocumentPreviewSpec extends UIComponentSpec {
  type: 'document-preview';
  props: {
    title: string;
    document_type: string;
    symbol: string;
    date: string;
    sections: Array<{
      heading: string;
      content: string;
      page?: number;
    }>;
    download_url?: string;
  };
}

/**
 * Timeline component - shows historical context
 */
export interface TimelineSpec extends UIComponentSpec {
  type: 'timeline';
  props: {
    title: string;
    events: Array<{
      date: string;
      event_type: 'filing' | 'earnings' | 'news' | 'price_movement';
      description: string;
      source?: string;
      impact?: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

/**
 * Multi-source comparison
 */
export interface SourceComparisonSpec extends UIComponentSpec {
  type: 'source-comparison';
  props: {
    title: string;
    topic: string;
    sources: Array<{
      source_name: string;
      date: string;
      perspective: string;
      key_points: string[];
    }>;
  };
}
```

### 5.2 Enhanced DynamicUIRenderer

```typescript
// File: components/DynamicUIRenderer.tsx (additions)

import Citation from './dynamic/Citation';
import DocumentPreview from './dynamic/DocumentPreview';
import Timeline from './dynamic/Timeline';
import SourceComparison from './dynamic/SourceComparison';

export default function DynamicUIRenderer({ components }: DynamicUIRendererProps) {
  const renderComponent = (spec: ComponentSpec, index: number) => {
    // ... existing cases ...
    
    switch (spec.type) {
      // ... existing cases ...
      
      case 'citation':
        return (
          <Citation
            key={key}
            sources={spec.props.sources}
            inline={spec.props.inline}
          />
        );
      
      case 'document-preview':
        return (
          <DocumentPreview
            key={key}
            title={spec.props.title}
            documentType={spec.props.document_type}
            symbol={spec.props.symbol}
            date={spec.props.date}
            sections={spec.props.sections}
            downloadUrl={spec.props.download_url}
          />
        );
      
      case 'timeline':
        return (
          <Timeline
            key={key}
            title={spec.props.title}
            events={spec.props.events}
          />
        );
      
      case 'source-comparison':
        return (
          <SourceComparison
            key={key}
            title={spec.props.title}
            topic={spec.props.topic}
            sources={spec.props.sources}
          />
        );
      
      // ... rest of cases ...
    }
  };
  
  // ... rest of component ...
}
```

### 5.3 Citation Component Example

```typescript
// File: components/dynamic/Citation.tsx

'use client';

import { useState } from 'react';

interface CitationProps {
  sources: Array<{
    id: string;
    title: string;
    document_type: string;
    date: string;
    url?: string;
    excerpt: string;
    relevance_score: number;
  }>;
  inline?: boolean;
}

export default function Citation({ sources, inline = false }: CitationProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  if (inline) {
    return (
      <div className="inline-flex gap-1 text-[#00ff9f]">
        {sources.map((source, idx) => (
          <button
            key={source.id}
            className="text-xs font-pixel hover:text-[#00d4ff] transition-colors"
            onClick={() => setExpandedId(expandedId === source.id ? null : source.id)}
          >
            [{idx + 1}]
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-3 p-4 bg-[#0a0e27] border-2 border-[#00ff9f]/30 pixel-border">
      <h4 className="font-pixel text-sm text-[#00ff9f] mb-3">
        📚 SOURCES ({sources.length})
      </h4>
      
      {sources.map((source, idx) => (
        <div
          key={source.id}
          className="border-l-4 border-[#00ff9f]/50 pl-3 py-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-pixel text-xs text-[#00ff9f]">
                  [{idx + 1}]
                </span>
                <span className="font-pixel text-xs text-white">
                  {source.document_type}
                </span>
                <span className="font-pixel text-xs text-[#00d4ff]">
                  {source.date}
                </span>
              </div>
              
              <p className="font-pixel text-xs text-white/80 mb-2">
                {source.title}
              </p>
              
              {expandedId === source.id && (
                <div className="mt-2 p-2 bg-black/30 rounded">
                  <p className="font-pixel text-xs text-white/70 leading-relaxed">
                    {source.excerpt}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setExpandedId(expandedId === source.id ? null : source.id)}
              className="font-pixel text-xs text-[#00ff9f] hover:text-[#00d4ff] ml-2"
            >
              {expandedId === source.id ? '▼' : '▶'}
            </button>
          </div>
          
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-xs text-[#00d4ff] hover:underline"
            >
              View Source →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Migration Strategy

### 6.1 Phased Rollout Plan

```
Phase 1: Infrastructure Setup (Week 1-2)
├── Install OpenRAG components
│   ├── OpenSearch cluster setup
│   ├── Docling service deployment
│   └── Embedding model configuration
├── Create document ingestion pipeline
│   ├── SEC EDGAR connector
│   ├── News API integration
│   └── Batch processing scripts
└── Initial document indexing
    └── Load historical data (1 year)

Phase 2: API Development (Week 3-4)
├── Implement OpenRAG service layer
│   ├── Document retrieval functions
│   ├── Hybrid search implementation
│   └── Context augmentation logic
├── Create new API endpoints
│   ├── /api/rag-query
│   ├── /api/search-documents
│   └── /api/ingest-document
└── Integration testing
    └── Unit and integration tests

Phase 3: UI Enhancement (Week 5-6)
├── Develop new UI components
│   ├── Citation component
│   ├── DocumentPreview component
│   ├── Timeline component
│   └── SourceComparison component
├── Update DynamicUIRenderer
│   └── Add new component cases
└── Styling and animations
    └── Cyberpunk theme consistency

Phase 4: Langflow Integration (Week 7-8)
├── Create RAG-aware Langflow flows
│   ├── Document-grounded agent
│   ├── Hybrid query agent
│   └── Citation extraction agent
├── Update existing flows
│   └── Add RAG context when beneficial
└── A/B testing framework
    └── Compare RAG vs non-RAG responses

Phase 5: Production Rollout (Week 9-10)
├── Feature flag implementation
│   └── Gradual rollout to users
├── Performance monitoring
│   ├── Latency tracking
│   ├── Accuracy metrics
│   └── User feedback collection
└── Documentation and training
    └── User guides and API docs
```

### 6.2 Backward Compatibility

```typescript
// File: services/query-router.ts

/**
 * Intelligent query router
 * Decides whether to use RAG, traditional Langflow, or hybrid
 */
export async function routeQuery(question: string, options: QueryOptions) {
  const queryType = classifyQuery(question);
  
  switch (queryType) {
    case 'real-time-data':
      // Use traditional Langflow for real-time stock data
      return await queryLangflow(question);
    
    case 'historical-analysis':
      // Use OpenRAG for document-grounded analysis
      return await queryWithRAG(question, options);
    
    case 'hybrid':
      // Combine both approaches
      const [ragResults, liveData] = await Promise.all([
        queryWithRAG(question, options),
        queryLangflow(question),
      ]);
      return mergeResults(ragResults, liveData);
    
    default:
      // Default to Langflow
      return await queryLangflow(question);
  }
}

/**
 * Classify query to determine routing
 */
function classifyQuery(question: string): 'real-time-data' | 'historical-analysis' | 'hybrid' {
  const lowerQuestion = question.toLowerCase();
  
  // Real-time indicators
  const realTimeKeywords = ['current', 'now', 'today', 'latest', 'price'];
  const hasRealTime = realTimeKeywords.some(kw => lowerQuestion.includes(kw));
  
  // Historical indicators
  const historicalKeywords = ['why', 'explain', 'compare', 'history', 'trend', 'analysis'];
  const hasHistorical = historicalKeywords.some(kw => lowerQuestion.includes(kw));
  
  if (hasRealTime && hasHistorical) return 'hybrid';
  if (hasHistorical) return 'historical-analysis';
  return 'real-time-data';
}
```

### 6.3 Feature Flags

```typescript
// File: lib/feature-flags.ts

export const FEATURE_FLAGS = {
  ENABLE_RAG: process.env.NEXT_PUBLIC_ENABLE_RAG === 'true',
  ENABLE_CITATIONS: process.env.NEXT_PUBLIC_ENABLE_CITATIONS === 'true',
  ENABLE_DOCUMENT_PREVIEW: process.env.NEXT_PUBLIC_ENABLE_DOCUMENT_PREVIEW === 'true',
  RAG_ROLLOUT_PERCENTAGE: parseInt(process.env.RAG_ROLLOUT_PERCENTAGE || '0', 10),
};

/**
 * Check if user should get RAG features
 */
export function shouldEnableRAG(userId?: string): boolean {
  if (!FEATURE_FLAGS.ENABLE_RAG) return false;
  
  // Gradual rollout based on user ID hash
  if (userId && FEATURE_FLAGS.RAG_ROLLOUT_PERCENTAGE > 0) {
    const hash = simpleHash(userId);
    return (hash % 100) < FEATURE_FLAGS.RAG_ROLLOUT_PERCENTAGE;
  }
  
  return FEATURE_FLAGS.RAG_ROLLOUT_PERCENTAGE === 100;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

---

## 7. Performance & Security Considerations

### 7.1 Performance Optimization

```typescript
// Caching Strategy
interface CacheConfig {
  // Document cache (Redis)
  documentCache: {
    ttl: 3600, // 1 hour
    maxSize: 1000,
    strategy: 'LRU',
  },
  
  // Embedding cache
  embeddingCache: {
    ttl: 86400, // 24 hours
    maxSize: 10000,
    strategy: 'LRU',
  },
  
  // Query result cache
  queryCache: {
    ttl: 300, // 5 minutes
    maxSize: 500,
    strategy: 'LRU',
  },
}

// Latency targets
const LATENCY_TARGETS = {
  document_retrieval: 200, // ms
  embedding_generation: 100, // ms
  total_query_time: 2000, // ms
};

// Performance monitoring
class PerformanceMonitor {
  async trackQuery(queryFn: () => Promise<any>, queryType: string) {
    const start = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      
      // Log metrics
      this.logMetric({
        type: queryType,
        duration,
        success: true,
        timestamp: new Date().toISOString(),
      });
      
      // Alert if exceeds target
      if (duration > LATENCY_TARGETS.total_query_time) {
        this.alertSlowQuery(queryType, duration);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logMetric({
        type: queryType,
        duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
```

### 7.2 Security Measures

```typescript
// File: lib/security.ts

/**
 * Security measures for RAG system
 */

// 1. Input Sanitization
export function sanitizeQuery(query: string): string {
  // Remove potential injection attempts
  return query
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 500); // Max length
}

// 2. Document Access Control
export async function checkDocumentAccess(
  userId: string,
  documentId: string
): Promise<boolean> {
  // Implement access control logic
  // For PIXELTICKER: all public financial documents are accessible
  // But could restrict based on subscription tier
  return true;
}

// 3. Rate Limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(userId: string, limit: number = 100, window: number = 60000): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside window
    const recentRequests = userRequests.filter(time => now - time < window);
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}

// 4. Data Privacy
export function anonymizeFinancialData(data: any): any {
  // Remove PII if present in documents
  // For financial documents, this is typically not needed
  // but good practice for user-uploaded documents
  return data;
}

// 5. Secure Document Storage
export const DOCUMENT_SECURITY = {
  encryption_at_rest: true,
  encryption_in_transit: true,
  access_logging: true,
  retention_policy: '7_years', // SEC requirement
  backup_frequency: 'daily',
};
```

### 7.3 Cost Optimization

```typescript
// Cost management for OpenRAG
export const COST_OPTIMIZATION = {
  // Embedding model selection
  embedding: {
    model: 'granite-embedding-125m', // Smaller, faster, cheaper
    batch_size: 32, // Batch requests
    cache_embeddings: true,
  },
  
  // Vector database
  opensearch: {
    index_refresh_interval: '30s', // Reduce refresh frequency
    number_of_replicas: 1, // Balance availability and cost
    compression: true,
  },
  
  // Document storage
  storage: {
    hot_tier_days: 90, // Recent documents in fast storage
    warm_tier_days: 365, // Older documents in slower storage
    cold_tier_days: 2555, // 7 years in archive storage
  },
  
  // Query optimization
  retrieval: {
    default_top_k: 5, // Limit retrieved documents
    max_top_k: 20,
    use_approximate_search: true, // Faster, slightly less accurate
  },
};
```

---

## 8. Comparison: Current vs. Proposed

### 8.1 Feature Comparison Table

| Feature | Current (Langflow Only) | Proposed (Langflow + OpenRAG) |
|---------|------------------------|-------------------------------|
| **Real-time Data** | ✅ Excellent | ✅ Excellent (unchanged) |
| **Historical Context** | ⚠️ Limited | ✅ Comprehensive |
| **Source Citations** | ❌ None | ✅ Full citations with links |
| **Document Analysis** | ❌ Not supported | ✅ SEC filings, earnings, news |
| **Multi-source Synthesis** | ❌ Single source | ✅ Multiple sources compared |
| **Hallucination Risk** | ⚠️ Moderate | ✅ Low (grounded in docs) |
| **Query Latency** | ✅ Fast (1-2s) | ⚠️ Moderate (2-4s) |
| **Setup Complexity** | ✅ Simple | ⚠️ Moderate |
| **Infrastructure Cost** | ✅ Low | ⚠️ Moderate |
| **Accuracy** | ⚠️ Good | ✅ Excellent |
| **Explainability** | ⚠️ Limited | ✅ Full transparency |

### 8.2 Query Type Comparison

```
Query: "What is AAPL's current stock price?"
├── Current: Langflow agent → Real-time API → Price
└── Proposed: Same (no change needed)

Query: "Why did AAPL stock drop last quarter?"
├── Current: Langflow → Generic explanation (may hallucinate)
└── Proposed: OpenRAG → Retrieve 10-Q, news, analyst reports
              → Grounded explanation with citations

Query: "Compare AAPL and MSFT revenue growth"
├── Current: Langflow → Basic comparison from API data
└── Proposed: OpenRAG → Retrieve both companies' 10-K filings
              → Detailed comparison with source citations
              → Timeline of revenue changes

Query: "Show me AAPL's risk factors"
├── Current: Langflow → Generic risks (may be outdated)
└── Proposed: OpenRAG → Extract from latest 10-K filing
              → Show exact text from Risk Factors section
              → Link to source document
```

### 8.3 Architecture Comparison

```
CURRENT ARCHITECTURE:
User → Next.js → Langflow → External APIs → Response
                    ↓
              Agent Selection
                    ↓
              UI Generation

PROPOSED ARCHITECTURE:
User → Next.js → Query Router
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    Langflow              OpenRAG
    (Real-time)        (Historical)
         ↓                     ↓
    External APIs      OpenSearch
         ↓                     ↓
         └──────────┬──────────┘
                    ↓
            Response Merger
                    ↓
            UI Generation
                    ↓
         Response with Citations
```

---

## 9. Implementation Checklist

### 9.1 Infrastructure Setup

```markdown
- [ ] OpenSearch Cluster
  - [ ] Install OpenSearch 2.x
  - [ ] Configure vector search plugin
  - [ ] Set up index templates
  - [ ] Configure security (SSL, auth)
  - [ ] Set up monitoring

- [ ] Docling Service
  - [ ] Deploy Docling container
  - [ ] Configure document parsers
  - [ ] Set up chunking strategies
  - [ ] Test with sample documents

- [ ] Embedding Service
  - [ ] Deploy IBM Granite embedding model
  - [ ] Configure API endpoint
  - [ ] Set up batch processing
  - [ ] Implement caching layer

- [ ] Document Storage
  - [ ] Set up S3/object storage
  - [ ] Configure lifecycle policies
  - [ ] Implement backup strategy
  - [ ] Set up CDN for document delivery
```

### 9.2 Development Tasks

```markdown
- [ ] Backend Services
  - [ ] Implement OpenRAGService class
  - [ ] Create document ingestion pipeline
  - [ ] Build query router
  - [ ] Implement caching layer
  - [ ] Add monitoring and logging

- [ ] API Endpoints
  - [ ] /api/rag-query endpoint
  - [ ] /api/search-documents endpoint
  - [ ] /api/ingest-document endpoint
  - [ ] Update /api/ask-stock for hybrid queries

- [ ] Frontend Components
  - [ ] Citation component
  - [ ] DocumentPreview component
  - [ ] Timeline component
  - [ ] SourceComparison component
  - [ ] Update DynamicUIRenderer

- [ ] Integration
  - [ ] Connect OpenRAG to Langflow
  - [ ] Implement feature flags
  - [ ] Add A/B testing framework
  - [ ] Create migration scripts
```

### 9.3 Testing & Validation

```markdown
- [ ] Unit Tests
  - [ ] OpenRAGService methods
  - [ ] Document parsing
  - [ ] Embedding generation
  - [ ] Query routing logic

- [ ] Integration Tests
  - [ ] End-to-end query flow
  - [ ] Langflow + OpenRAG integration
  - [ ] API endpoint testing
  - [ ] UI component rendering

- [ ] Performance Tests
  - [ ] Query latency benchmarks
  - [ ] Concurrent user load testing
  - [ ] Cache effectiveness
  - [ ] Database query optimization

- [ ] Accuracy Tests
  - [ ] RAG response quality
  - [ ] Citation accuracy
  - [ ] Hallucination detection
  - [ ] User acceptance testing
```

---

## 10. Example Use Cases

### 10.1 Use Case 1: Earnings Analysis

**User Query:** "Why did NVDA beat earnings expectations last quarter?"

**OpenRAG Flow:**
1. Retrieve NVDA's latest 10-Q filing
2. Retrieve earnings call transcript
3. Retrieve analyst reports from that period
4. Retrieve news articles about the earnings

**Response with Citations:**
```
NVDA exceeded earnings expectations in Q3 2024 due to several factors:

1. **Data Center Revenue Growth** [1]
   - Data center revenue reached $14.5B, up 279% YoY
   - Driven by strong demand for H100 GPUs for AI training

2. **Gross Margin Expansion** [1]
   - Gross margin improved to 75%, up from 70% previous quarter
   - Higher-margin data center products mix

3. **Management Commentary** [2]
   - CEO Jensen Huang noted "unprecedented demand for AI infrastructure"
   - Guidance raised for next quarter

4. **Analyst Perspective** [3]
   - Morgan Stanley analyst cited "AI supercycle" as key driver
