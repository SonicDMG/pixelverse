'use client';

import { ComponentSpec } from '@/types/ui-spec';
import { StockChart } from './StockChart';
import { ComparisonChart } from './dynamic/ComparisonChart';
import { DataTable } from './dynamic/DataTable';
import { ComparisonTable } from './dynamic/ComparisonTable';
import { MetricCard } from './dynamic/MetricCard';
import { MetricGrid } from './dynamic/MetricGrid';
import { CelestialBodyCard } from './dynamic/CelestialBodyCard';
import { Constellation } from './dynamic/Constellation';
import { SpaceTimeline } from './dynamic/SpaceTimeline';
import { SolarSystem } from './dynamic/SolarSystem';
import { TextBlock } from './dynamic/TextBlock';
import { ExplainOMatic } from './dynamic/ExplainOMatic';

interface DynamicUIRendererProps {
  components: ComponentSpec[];
  onSetQuestion?: (question: string) => void;
}

/**
 * DynamicUIRenderer - Safe component registry for rendering agent-generated UI
 *
 * This component acts as a whitelist registry, only rendering pre-approved components
 * with validated props. This prevents arbitrary code execution while allowing the
 * Langflow agent to dynamically compose UIs from safe building blocks.
 */
export function DynamicUIRenderer({ components, onSetQuestion }: DynamicUIRendererProps) {
  console.log('[DynamicUIRenderer] Rendering components:', {
    count: components.length,
    types: components.map(c => c.type),
  });

  const renderComponent = (spec: ComponentSpec, index: number) => {
    // DEFENSIVE FIX: Handle malformed agent responses where bodyType exists but type is missing
    // Agent should return: { type: "celestial-body-card", props: { bodyType: "star", ... } }
    // But sometimes returns: { bodyType: "star", name: "Sun", ... } (missing type wrapper)
    let normalizedSpec = spec;
    const specAny = spec as any;
    if (!spec.type && specAny.bodyType) {
      console.warn('[DynamicUIRenderer] Detected malformed component with bodyType but no type field. Auto-normalizing to celestial-body-card.');
      normalizedSpec = {
        type: 'celestial-body-card',
        props: specAny,
        id: specAny.id,
      } as ComponentSpec;
    }
    
    const key = normalizedSpec.id || `${normalizedSpec.type}-${index}`;
    console.log('[DynamicUIRenderer] Rendering component:', {
      type: normalizedSpec.type,
      index,
      hasProps: !!normalizedSpec.props,
      propsKeys: normalizedSpec.props ? Object.keys(normalizedSpec.props) : [],
    });

    try {
      // Normalize component type aliases before type checking
      // Cast to any to handle unknown component types from the agent
      const rawType = (normalizedSpec as any).type;
      
      // Map "key-metrics" to "metric-grid" for backward compatibility
      // The agent may interpret "key financial metrics" as a component type
      if (rawType === 'key-metrics') {
        console.log('[DynamicUIRenderer] Normalizing "key-metrics" to "metric-grid"');
        (normalizedSpec as any).type = 'metric-grid';
      }
      
      switch (normalizedSpec.type) {
        case 'line-chart':
          return (
            <StockChart
              key={key}
              data={normalizedSpec.props.data.map((d: any) => ({
                date: d.date,
                price: d.value,
                volume: d.volume,
              }))}
              symbol={normalizedSpec.props.symbol}
            />
          );

        case 'comparison-chart':
          return (
            <ComparisonChart
              key={key}
              title={normalizedSpec.props.title}
              datasets={normalizedSpec.props.datasets}
            />
          );

        case 'data-table':
          return (
            <DataTable
              key={key}
              title={normalizedSpec.props.title}
              headers={normalizedSpec.props.headers}
              rows={normalizedSpec.props.rows}
              highlightColumn={normalizedSpec.props.highlightColumn}
            />
          );

        case 'comparison-table':
          return (
            <ComparisonTable
              key={key}
              title={normalizedSpec.props.title}
              items={normalizedSpec.props.items}
              column1Label={normalizedSpec.props.column1Label}
              column2Label={normalizedSpec.props.column2Label}
            />
          );

        case 'metric-card':
          return (
            <MetricCard
              key={key}
              title={normalizedSpec.props.title}
              value={normalizedSpec.props.value}
              change={normalizedSpec.props.change}
              changeLabel={normalizedSpec.props.changeLabel}
              subtitle={normalizedSpec.props.subtitle}
            />
          );

        case 'metric-grid':
          return (
            <MetricGrid
              key={key}
              metrics={normalizedSpec.props.metrics}
            />
          );

        case 'alert-box':
          const severityColors = {
            info: 'border-[var(--color-info)] text-[var(--color-info)]',
            warning: 'border-[var(--color-warning)] text-[var(--color-warning)]',
            success: 'border-[var(--color-success)] text-[var(--color-success)]',
            error: 'border-[var(--color-error)] text-[var(--color-error)]',
          };
          return (
            <div
              key={key}
              className={`p-4 border-4 pixel-border ${severityColors[normalizedSpec.props.severity]} bg-[var(--color-bg-dark)]`}
            >
              {normalizedSpec.props.title && (
                <h4 className="font-pixel text-sm mb-2">{normalizedSpec.props.title}</h4>
              )}
              <p className="font-pixel text-xs">{normalizedSpec.props.message}</p>
            </div>
          );

        case 'text-block':
          return (
            <TextBlock
              key={key}
              content={normalizedSpec.props.content}
              format={normalizedSpec.props.format}
            />
          );

        case 'celestial-body-card':
          return (
            <CelestialBodyCard
              key={key}
              {...normalizedSpec.props}
            />
          );

        case 'constellation':
          return (
            <Constellation
              key={key}
              name={normalizedSpec.props.name}
              abbreviation={normalizedSpec.props.abbreviation}
              description={normalizedSpec.props.description}
              brightestStar={normalizedSpec.props.brightestStar}
              visibility={normalizedSpec.props.visibility}
              stars={normalizedSpec.props.stars}
              lines={normalizedSpec.props.lines}
              onStarClick={onSetQuestion ? (star) => {
                // Extract star name, removing designation in parentheses if present
                const starName = star.name.split('(')[0].trim();
                onSetQuestion(`Tell me about ${starName}`);
              } : undefined}
            />
          );

        case 'space-timeline':
          return (
            <SpaceTimeline
              key={key}
              title={normalizedSpec.props.title}
              events={normalizedSpec.props.events}
              onEventClick={onSetQuestion ? (event) => {
                // Generate a question about the clicked event
                onSetQuestion(`Tell me about ${event.title}`);
              } : undefined}
            />
          );

        case 'solar-system':
          return (
            <SolarSystem
              key={key}
              {...normalizedSpec.props}
              onBodyClick={onSetQuestion ? (body) => {
                // Generate a question about the clicked celestial body
                onSetQuestion(`Tell me about ${body.name}`);
              } : undefined}
            />
          );

        case 'explain-o-matic':
          console.log('[DynamicUIRenderer] explain-o-matic case hit');
          console.log('[DynamicUIRenderer] Props being passed:', {
            topic: normalizedSpec.props.topic,
            knowledgeLevel: normalizedSpec.props.knowledgeLevel,
            explanation: normalizedSpec.props.explanation,
            relatedTopics: normalizedSpec.props.relatedTopics,
            citations: normalizedSpec.props.citations,
            followUpQuestions: normalizedSpec.props.followUpQuestions,
            levels: normalizedSpec.props.levels
          });
          return (
            <ExplainOMatic
              key={key}
              topic={normalizedSpec.props.topic}
              knowledgeLevel={normalizedSpec.props.knowledgeLevel}
              explanation={normalizedSpec.props.explanation}
              relatedTopics={normalizedSpec.props.relatedTopics}
              citations={normalizedSpec.props.citations}
              followUpQuestions={normalizedSpec.props.followUpQuestions}
              levels={normalizedSpec.props.levels}
              onRelatedTopicClick={onSetQuestion ? (topic) => {
                onSetQuestion(`Explain ${topic}`);
              } : undefined}
              onFollowUpClick={onSetQuestion ? (question) => {
                onSetQuestion(question);
              } : undefined}
            />
          );

        default:
          console.warn(`Unknown component type: ${(normalizedSpec as any).type}`);
          return (
            <div
              key={key}
              className="p-4 border-2 border-[var(--color-error)] bg-[var(--color-bg-dark)] pixel-border"
            >
              <p className="font-pixel text-xs text-[var(--color-error)]">
                Unknown component type: {(normalizedSpec as any).type}
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error(`Error rendering component ${normalizedSpec.type}:`, error);
      return (
        <div
          key={key}
          className="p-4 border-2 border-[var(--color-error)] bg-[var(--color-bg-dark)] pixel-border"
        >
          <p className="font-pixel text-xs text-[var(--color-error)]">
            Error rendering {normalizedSpec.type}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {components.map((component, index) => renderComponent(component, index))}
    </div>
  );
}

// Made with Bob
