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

export interface CelestialBodyCardSpec extends UIComponentSpec {
  type: 'celestial-body-card';
  props: {
    // Universal properties (all celestial bodies)
    name: string;
    description: string;
    /** Visual characteristics only (colors, size, appearance) - used for image generation */
    visualDescription?: string;
    bodyType: 'planet' | 'moon' | 'star' | 'galaxy' | 'black-hole' | 'nebula';
    
    // Physical properties (conditional based on bodyType)
    diameter?: string;
    mass?: string;
    
    // Orbital properties (planets & moons)
    distanceFrom?: string;        // Replaces distanceFromSun - more generic
    distanceFromLabel?: string;   // e.g., "Distance from Sun", "Distance from Earth"
    orbitalPeriod?: string;
    parentBody?: string;          // e.g., "Earth" for Moon, "Jupiter" for Io
    
    // Satellite properties (planets & stars)
    satellites?: number;          // Replaces moons - more generic
    satelliteLabel?: string;      // e.g., "Moons", "Planets", "Star Systems"
    
    // Star-specific properties
    spectralClass?: string;       // e.g., "G2V" for Sun
    luminosity?: string;          // e.g., "1 L☉"
    temperature?: string;         // e.g., "5,778 K"
    
    // Galaxy-specific properties
    galaxyType?: string;          // e.g., "Spiral", "Elliptical", "Irregular"
    starCount?: string;           // e.g., "200-400 billion stars"
    distanceFromEarth?: string;   // For extragalactic objects
    
    // Black hole-specific properties
    blackHoleType?: string;       // e.g., "Stellar", "Supermassive", "Intermediate"
    eventHorizonRadius?: string;  // Schwarzschild radius
    
    // Nebula-specific properties
    nebulaType?: string;          // e.g., "Emission", "Reflection", "Planetary", "Supernova Remnant"
    
    // Image generation (existing)
    imageUrl?: string;
    enableImageGeneration?: boolean;
    generatedImageUrl?: string;
    
    // Type-specific generation hints
    planetType?: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf';
    starType?: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron-star';
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
      ra?: string; // Right Ascension in "HHh MMm" format (e.g., "5h 55m") - auto-converts to x
      dec?: string; // Declination in "±DD° MM'" format (e.g., "+7° 24'") - auto-converts to y
      x?: number; // X coordinate for 2D visualization (0-400) - calculated from RA if not provided
      y?: number; // Y coordinate for 2D visualization (0-400) - calculated from Dec if not provided
      color?: string; // Hex color (e.g., "#FFD700") or spectral class (O, B, A, F, G, K, M)
      size?: number; // Relative size multiplier (0.5-3.0), applied to base magnitude size
    }>;
    lines?: Array<{
      from: number; // Index of star in stars array
      to: number;   // Index of star in stars array
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
  | CelestialBodyCardSpec
  | ConstellationSpec
  | SpaceTimelineSpec
  | SolarSystemSpec;

// Response from Langflow with UI specifications
export interface UIResponse {
  text: string;
  components?: ComponentSpec[];
}

// Made with Bob
