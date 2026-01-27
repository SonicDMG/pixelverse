'use client';

import { ComponentSpec } from '@/types/ui-spec';
import StockChart from './StockChart';
import ComparisonChart from './dynamic/ComparisonChart';
import DataTable from './dynamic/DataTable';
import ComparisonTable from './dynamic/ComparisonTable';
import MetricCard from './dynamic/MetricCard';
import MetricGrid from './dynamic/MetricGrid';
import PlanetCard from './dynamic/PlanetCard';
import Constellation from './dynamic/Constellation';
import SpaceTimeline from './dynamic/SpaceTimeline';
import SolarSystem from './dynamic/SolarSystem';
import TextBlock from './dynamic/TextBlock';

interface DynamicUIRendererProps {
  components: ComponentSpec[];
}

/**
 * DynamicUIRenderer - Safe component registry for rendering agent-generated UI
 * 
 * This component acts as a whitelist registry, only rendering pre-approved components
 * with validated props. This prevents arbitrary code execution while allowing the
 * Langflow agent to dynamically compose UIs from safe building blocks.
 */
export default function DynamicUIRenderer({ components }: DynamicUIRendererProps) {
  console.log('[DynamicUIRenderer] Rendering components:', {
    count: components.length,
    types: components.map(c => c.type),
  });

  const renderComponent = (spec: ComponentSpec, index: number) => {
    const key = spec.id || `${spec.type}-${index}`;
    console.log('[DynamicUIRenderer] Rendering component:', {
      type: spec.type,
      index,
      hasProps: !!spec.props,
      propsKeys: spec.props ? Object.keys(spec.props) : [],
    });

    try {
      switch (spec.type) {
        case 'line-chart':
          return (
            <StockChart
              key={key}
              data={spec.props.data.map((d: any) => ({
                date: d.date,
                price: d.value,
                volume: d.volume,
              }))}
              symbol={spec.props.symbol}
            />
          );

        case 'comparison-chart':
          return (
            <ComparisonChart
              key={key}
              title={spec.props.title}
              datasets={spec.props.datasets}
            />
          );

        case 'data-table':
          return (
            <DataTable
              key={key}
              title={spec.props.title}
              headers={spec.props.headers}
              rows={spec.props.rows}
              highlightColumn={spec.props.highlightColumn}
            />
          );

        case 'comparison-table':
          return (
            <ComparisonTable
              key={key}
              title={spec.props.title}
              items={spec.props.items}
              column1Label={spec.props.column1Label}
              column2Label={spec.props.column2Label}
            />
          );

        case 'metric-card':
          return (
            <MetricCard
              key={key}
              title={spec.props.title}
              value={spec.props.value}
              change={spec.props.change}
              changeLabel={spec.props.changeLabel}
              subtitle={spec.props.subtitle}
            />
          );

        case 'metric-grid':
          return (
            <MetricGrid
              key={key}
              metrics={spec.props.metrics}
            />
          );

        case 'alert-box':
          const severityColors = {
            info: 'border-[#4169E1] text-[#4169E1]',
            warning: 'border-[#FFD700] text-[#FFD700]',
            success: 'border-[#00CED1] text-[#00CED1]',
            error: 'border-[#ff0000] text-[#ff0000]',
          };
          return (
            <div
              key={key}
              className={`p-4 border-4 pixel-border ${severityColors[spec.props.severity]} bg-[#0a0e27]`}
            >
              {spec.props.title && (
                <h4 className="font-pixel text-sm mb-2">{spec.props.title}</h4>
              )}
              <p className="font-pixel text-xs">{spec.props.message}</p>
            </div>
          );

        case 'text-block':
          return (
            <TextBlock
              key={key}
              content={spec.props.content}
              format={spec.props.format}
            />
          );

        case 'planet-card':
          return (
            <PlanetCard
              key={key}
              name={spec.props.name}
              description={spec.props.description}
              diameter={spec.props.diameter}
              mass={spec.props.mass}
              distanceFromSun={spec.props.distanceFromSun}
              orbitalPeriod={spec.props.orbitalPeriod}
              moons={spec.props.moons}
              imageUrl={spec.props.imageUrl}
              // Phase 3 enhancement: Dynamic image generation props
              planetType={spec.props.planetType}
              enableImageGeneration={spec.props.enableImageGeneration}
              generatedImageUrl={spec.props.generatedImageUrl}
            />
          );

        case 'constellation':
          return (
            <Constellation
              key={key}
              name={spec.props.name}
              abbreviation={spec.props.abbreviation}
              description={spec.props.description}
              brightestStar={spec.props.brightestStar}
              visibility={spec.props.visibility}
              stars={spec.props.stars}
              lines={spec.props.lines}
            />
          );

        case 'space-timeline':
          return (
            <SpaceTimeline
              key={key}
              title={spec.props.title}
              events={spec.props.events}
            />
          );

        case 'solar-system':
          return (
            <SolarSystem
              key={key}
              name={spec.props.name}
              description={spec.props.description}
              autoPlay={spec.props.autoPlay}
              timeScale={spec.props.timeScale}
            />
          );

        default:
          console.warn(`Unknown component type: ${(spec as any).type}`);
          return (
            <div
              key={key}
              className="p-4 border-2 border-[#ff0000] bg-[#0a0e27] pixel-border"
            >
              <p className="font-pixel text-xs text-[#ff0000]">
                Unknown component type: {(spec as any).type}
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error(`Error rendering component ${spec.type}:`, error);
      return (
        <div
          key={key}
          className="p-4 border-2 border-[#ff0000] bg-[#0a0e27] pixel-border"
        >
          <p className="font-pixel text-xs text-[#ff0000]">
            Error rendering {spec.type}
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
