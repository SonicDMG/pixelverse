/**
 * UI Specification Types
 * These define the structure for dynamic UI components that the Langflow agent can return
 */

// Base UI component specification
export interface UIComponentSpec {
  type: string;
  props: Record<string, any>;
  id?: string;
}

// Specific component types

export interface LineChartSpec extends UIComponentSpec {
  type: 'line-chart';
  props: {
    title: string;
    data: Array<{
      date: string;
      value: number;
      label?: string;
    }>;
    symbol?: string;
    color?: string;
    showVolume?: boolean;
  };
}

export interface ComparisonChartSpec extends UIComponentSpec {
  type: 'comparison-chart';
  props: {
    title: string;
    datasets: Array<{
      label: string;
      data: Array<{
        date: string;
        value: number;
      }>;
      color?: string;
    }>;
  };
}

export interface DataTableSpec extends UIComponentSpec {
  type: 'data-table';
  props: {
    title: string;
    headers: string[];
    rows: Array<Array<string | number>>;
    highlightColumn?: number;
  };
}

export interface ComparisonTableSpec extends UIComponentSpec {
  type: 'comparison-table';
  props: {
    title: string;
    items: Array<{
      label: string;
      value1: string | number;
      value2: string | number;
      change?: number;
    }>;
    column1Label: string;
    column2Label: string;
  };
}

export interface MetricCardSpec extends UIComponentSpec {
  type: 'metric-card';
  props: {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    subtitle?: string;
  };
}

export interface MetricGridSpec extends UIComponentSpec {
  type: 'metric-grid';
  props: {
    metrics: Array<{
      label: string;
      value: string | number;
      change?: number;
      icon?: string;
    }>;
  };
}

export interface AlertBoxSpec extends UIComponentSpec {
  type: 'alert-box';
  props: {
    message: string;
    severity: 'info' | 'warning' | 'success' | 'error';
    title?: string;
  };
}

export interface TextBlockSpec extends UIComponentSpec {
  type: 'text-block';
  props: {
    content: string;
    format?: 'plain' | 'markdown';
  };
}

// Space-specific component types

export interface PlanetCardSpec extends UIComponentSpec {
  type: 'planet-card';
  props: {
    name: string;
    description: string;
    diameter: string;
    mass: string;
    distanceFromSun: string;
    orbitalPeriod: string;
    moons?: number;
    imageUrl?: string;
    // Phase 3 enhancement: Dynamic image generation
    planetType?: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf';
    enableImageGeneration?: boolean;
    generatedImageUrl?: string;
  };
}

export interface ConstellationSpec extends UIComponentSpec {
  type: 'constellation';
  props: {
    name: string;
    abbreviation: string;
    description: string;
    brightestStar?: string;
    visibility: string; // e.g., "Northern Hemisphere, Winter"
    stars: Array<{
      name: string;
      magnitude: number;
    }>;
  };
}

export interface SpaceTimelineSpec extends UIComponentSpec {
  type: 'space-timeline';
  props: {
    title: string;
    events: Array<{
      date: string;
      title: string;
      description: string;
      type?: 'mission' | 'discovery' | 'observation';
    }>;
  };
}

export interface SolarSystemSpec extends UIComponentSpec {
  type: 'solar-system';
  props: {
    name?: string;
    description?: string;
    autoPlay?: boolean;
    timeScale?: number;
  };
}

// Helper types for space components

export type CelestialBody = {
  name: string;
  type: 'planet' | 'moon' | 'star' | 'asteroid' | 'comet';
  description?: string;
};

export type SpaceEvent = {
  date: string;
  title: string;
  description: string;
  type: 'mission' | 'discovery' | 'observation';
};

// Union type of all possible component specs
export type ComponentSpec =
  | LineChartSpec
  | ComparisonChartSpec
  | DataTableSpec
  | ComparisonTableSpec
  | MetricCardSpec
  | MetricGridSpec
  | AlertBoxSpec
  | TextBlockSpec
  | PlanetCardSpec
  | ConstellationSpec
  | SpaceTimelineSpec
  | SolarSystemSpec;

// Response from Langflow with UI specifications
export interface UIResponse {
  text: string;
  components?: ComponentSpec[];
}

// Made with Bob
