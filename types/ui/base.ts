/**
 * Base UI Component Types
 * Core types and interfaces for all UI components
 */

// Base UI component specification
export interface UIComponentSpec {
  type: string;
  props: Record<string, any>;
  id?: string;
}

// Union type of all possible component specs
export type ComponentSpec =
  | import('./charts').LineChartSpec
  | import('./charts').ComparisonChartSpec
  | import('./data').DataTableSpec
  | import('./data').ComparisonTableSpec
  | import('./data').MetricCardSpec
  | import('./data').MetricGridSpec
  | import('./data').AlertBoxSpec
  | import('./data').TextSpec
  | import('./data').TextBlockSpec
  | import('./space').PlanetCardSpec
  | import('./space').CelestialBodyCardSpec
  | import('./space').ConstellationSpec
  | import('./space').SpaceTimelineSpec
  | import('./space').SolarSystemSpec
  | import('./interactive').ExplainOMaticSpec
  | import('./interactive').StreamingDataLoaderSpec;

// Response from Langflow with UI specifications
export interface UIResponse {
  text: string;
  components?: ComponentSpec[];
}

// Made with Bob