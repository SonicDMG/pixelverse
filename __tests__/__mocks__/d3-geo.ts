// Mock d3-geo for testing
export const geoAzimuthalEquidistant = () => {
  const projection = (coords: [number, number]): [number, number] | null => {
    // Simple mock projection - just return scaled coordinates
    const [lon, lat] = coords;
    const x = 200 + lon * 2;
    const y = 200 - lat * 2;
    return [x, y];
  };
  
  projection.center = () => projection;
  projection.rotate = () => projection;
  projection.scale = () => projection;
  projection.translate = () => projection;
  
  return projection;
};

export const geoStereographic = () => {
  const projection = (coords: [number, number]): [number, number] | null => {
    // Simple mock projection - just return scaled coordinates
    const [lon, lat] = coords;
    const x = 200 + lon * 2;
    const y = 200 - lat * 2;
    return [x, y];
  };
  
  projection.center = () => projection;
  projection.rotate = () => projection;
  projection.scale = () => projection;
  projection.translate = () => projection;
  
  return projection;
};

export type GeoProjection = ReturnType<typeof geoAzimuthalEquidistant>;

// Made with Bob
