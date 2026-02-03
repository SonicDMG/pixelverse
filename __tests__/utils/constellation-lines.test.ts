import {
  getConstellationLines,
  hasPredefinedPattern,
  getPredefinedConstellations,
} from '@/utils/constellation-lines';

describe('constellation-lines', () => {
  describe('getPredefinedConstellations', () => {
    it('should return list of predefined constellations', () => {
      const constellations = getPredefinedConstellations();
      
      expect(constellations).toContain('Orion');
      expect(constellations).toContain('Ursa Major');
      expect(constellations).toContain('Cassiopeia');
      expect(constellations.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('hasPredefinedPattern', () => {
    it('should return true for major constellations', () => {
      expect(hasPredefinedPattern('Orion')).toBe(true);
      expect(hasPredefinedPattern('Ursa Major')).toBe(true);
      expect(hasPredefinedPattern('Cassiopeia')).toBe(true);
    });

    it('should return false for unknown constellations', () => {
      expect(hasPredefinedPattern('Unknown Constellation')).toBe(false);
      expect(hasPredefinedPattern('Test')).toBe(false);
    });
  });

  describe('getConstellationLines', () => {
    const mockStars = [
      { name: 'Star 1', x: 100, y: 100 },
      { name: 'Star 2', x: 200, y: 100 },
      { name: 'Star 3', x: 150, y: 200 },
      { name: 'Star 4', x: 100, y: 300 },
      { name: 'Star 5', x: 200, y: 300 },
    ];

    it('should return empty array for less than 2 stars', () => {
      expect(getConstellationLines('Test', [])).toEqual([]);
      expect(getConstellationLines('Test', [mockStars[0]])).toEqual([]);
    });

    it('should return empty array if stars missing coordinates', () => {
      const starsWithoutCoords = [
        { name: 'Star 1' },
        { name: 'Star 2' },
      ];
      
      expect(getConstellationLines('Test', starsWithoutCoords)).toEqual([]);
    });

    it('should use predefined pattern for Orion', () => {
      const orionStars = [
        { name: 'Betelgeuse', x: 50, y: 89 },
        { name: 'Rigel', x: 350, y: 328 },
        { name: 'Bellatrix', x: 270, y: 105 },
        { name: 'Alnitak', x: 152, y: 232 },
        { name: 'Alnilam', x: 189, y: 220 },
        { name: 'Mintaka', x: 218, y: 207 },
        { name: 'Saiph', x: 101, y: 350 },
      ];

      const lines = getConstellationLines('Orion', orionStars);
      
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.every(line =>
        line.from >= 0 &&
        line.from < orionStars.length &&
        line.to >= 0 &&
        line.to < orionStars.length
      )).toBe(true);
    });

    it('should return empty array for unknown constellation (no predefined pattern)', () => {
      const lines = getConstellationLines('Unknown', mockStars);
      
      // Should return empty array when no predefined pattern exists
      expect(lines.length).toBe(0);
    });

    it('should return empty array for constellation without predefined pattern', () => {
      // Create a simple square of stars
      const squareStars = [
        { name: 'TL', x: 100, y: 100 }, // Top-left
        { name: 'TR', x: 300, y: 100 }, // Top-right
        { name: 'BR', x: 300, y: 300 }, // Bottom-right
        { name: 'BL', x: 100, y: 300 }, // Bottom-left
      ];

      const lines = getConstellationLines('TestSquare', squareStars);
      
      // Should return empty array for unknown constellation
      expect(lines.length).toBe(0);
    });
  });
});

// Made with Bob