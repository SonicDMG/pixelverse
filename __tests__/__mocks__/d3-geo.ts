// Mock d3-geo for testing
// These mocks simulate the basic behavior of d3-geo projections for testing purposes
// They use simplified projection math that produces reasonable coordinates for testing
export const geoAzimuthalEquidistant = () => {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotateParams: [number, number, number] = [0, 0, 0];
  
  const projection = (coords: [number, number]): [number, number] | null => {
    const [lon, lat] = coords;
    // Simplified azimuthal projection: convert degrees to radians and scale appropriately
    // Use a normalized scale factor to keep coordinates reasonable
    const normalizedScale = scale / 100; // Normalize large scale values
    const x = translateX + (lon - rotateParams[0]) * normalizedScale;
    const y = translateY - (lat + rotateParams[1]) * normalizedScale;
    return [x, y];
  };
  
  projection.center = () => projection;
  projection.rotate = (params: [number, number, number]) => {
    rotateParams = params;
    return projection;
  };
  projection.scale = (s: number) => {
    scale = s;
    return projection;
  };
  projection.translate = (t: [number, number]) => {
    [translateX, translateY] = t;
    return projection;
  };
  
  return projection;
};

export const geoStereographic = () => {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let centerLon = 0;
  let centerLat = 0;
  
  const projection = (coords: [number, number]): [number, number] | null => {
    const [lon, lat] = coords;
    // Simplified stereographic projection
    const normalizedScale = scale / 100;
    const x = translateX + (lon - centerLon) * normalizedScale;
    const y = translateY - (lat - centerLat) * normalizedScale;
    return [x, y];
  };
  
  projection.center = (c: [number, number]) => {
    [centerLon, centerLat] = c;
    return projection;
  };
  projection.rotate = () => projection;
  projection.scale = (s: number) => {
    scale = s;
    return projection;
  };
  projection.translate = (t: [number, number]) => {
    [translateX, translateY] = t;
    return projection;
  };
  
  return projection;
};

export const geoEquirectangular = () => {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotateParams: [number, number, number] = [0, 0, 0];
  let reflectXEnabled = false;
  
  const projection = (coords: [number, number]): [number, number] | null => {
    const [lon, lat] = coords;
    // Simplified equirectangular projection with rotation
    const normalizedScale = scale / 100;
    let x = translateX + (lon - rotateParams[0]) * normalizedScale;
    const y = translateY - (lat - rotateParams[1]) * normalizedScale;
    
    // Apply X reflection if enabled (IAU convention)
    if (reflectXEnabled) {
      x = 2 * translateX - x;
    }
    
    return [x, y];
  };
  
  projection.center = () => projection;
  projection.rotate = (params: [number, number, number]) => {
    rotateParams = params;
    return projection;
  };
  projection.scale = (s: number) => {
    scale = s;
    return projection;
  };
  projection.translate = (t: [number, number]) => {
    [translateX, translateY] = t;
    return projection;
  };
  projection.reflectX = (enabled: boolean) => {
    reflectXEnabled = enabled;
    return projection;
  };
  
  return projection;
};

export type GeoProjection = ReturnType<typeof geoAzimuthalEquidistant>;

// Made with Bob
