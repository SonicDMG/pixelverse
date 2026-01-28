import {
  raToDecimalDegrees,
  decToDecimalDegrees,
  celestialToCanvas,
  calculateConstellationBounds,
  convertStarsToCanvas,
  CelestialCoordinate,
} from '@/utils/celestial-coordinates'

describe('celestial-coordinates', () => {
  describe('raToDecimalDegrees', () => {
    it('should convert RA hours and minutes to decimal degrees', () => {
      expect(raToDecimalDegrees('5h 55m')).toBe(88.75) // 5*15 + 55*0.25
      expect(raToDecimalDegrees('0h 0m')).toBe(0)
      expect(raToDecimalDegrees('12h 0m')).toBe(180)
      expect(raToDecimalDegrees('23h 59m')).toBe(359.75)
    })

    it('should handle RA strings with varying whitespace', () => {
      expect(raToDecimalDegrees('5h55m')).toBe(88.75)
      expect(raToDecimalDegrees('5h  55m')).toBe(88.75)
    })

    it('should throw error for invalid RA format', () => {
      expect(() => raToDecimalDegrees('invalid')).toThrow('Invalid RA format')
      expect(() => raToDecimalDegrees('5h')).toThrow('Invalid RA format')
      expect(() => raToDecimalDegrees('55m')).toThrow('Invalid RA format')
      expect(() => raToDecimalDegrees('')).toThrow('Invalid RA format')
    })
  })

  describe('decToDecimalDegrees', () => {
    it('should convert positive Dec degrees and minutes to decimal degrees', () => {
      expect(decToDecimalDegrees('+7° 24\'')).toBeCloseTo(7.4, 5)
      expect(decToDecimalDegrees('+45° 30\'')).toBeCloseTo(45.5, 5)
      expect(decToDecimalDegrees('+0° 0\'')).toBe(0)
    })

    it('should convert negative Dec degrees and minutes to decimal degrees', () => {
      expect(decToDecimalDegrees('-7° 24\'')).toBeCloseTo(-7.4, 5)
      expect(decToDecimalDegrees('-45° 30\'')).toBeCloseTo(-45.5, 5)
    })

    it('should handle Dec strings without apostrophe', () => {
      expect(decToDecimalDegrees('+7° 24')).toBeCloseTo(7.4, 5)
      expect(decToDecimalDegrees('-7° 24')).toBeCloseTo(-7.4, 5)
    })

    it('should handle Dec strings with varying whitespace', () => {
      expect(decToDecimalDegrees('+7°24\'')).toBeCloseTo(7.4, 5)
      expect(decToDecimalDegrees('+7°  24\'')).toBeCloseTo(7.4, 5)
    })

    it('should handle Dec strings without explicit sign (defaults to positive)', () => {
      expect(decToDecimalDegrees('7° 24\'')).toBeCloseTo(7.4, 5)
    })

    it('should throw error for invalid Dec format', () => {
      expect(() => decToDecimalDegrees('invalid')).toThrow('Invalid Dec format')
      expect(() => decToDecimalDegrees('7°')).toThrow('Invalid Dec format')
      expect(() => decToDecimalDegrees('24\'')).toThrow('Invalid Dec format')
      expect(() => decToDecimalDegrees('')).toThrow('Invalid Dec format')
    })
  })

  describe('celestialToCanvas', () => {
    const bounds = {
      raMin: 80,
      raMax: 100,
      decMin: 0,
      decMax: 20,
    }

    it('should convert celestial coordinates to canvas coordinates', () => {
      // Center of bounds should map to center of canvas
      const result = celestialToCanvas(90, 10, bounds, 400, 50)
      expect(result.x).toBe(200) // Center X
      expect(result.y).toBe(200) // Center Y
    })

    it('should handle minimum bounds correctly', () => {
      const result = celestialToCanvas(80, 0, bounds, 400, 50)
      expect(result.x).toBe(350) // Right edge (inverted X)
      expect(result.y).toBe(350) // Bottom edge (inverted Y)
    })

    it('should handle maximum bounds correctly', () => {
      const result = celestialToCanvas(100, 20, bounds, 400, 50)
      expect(result.x).toBe(50) // Left edge (inverted X)
      expect(result.y).toBe(50) // Top edge (inverted Y)
    })

    it('should respect custom canvas size', () => {
      const result = celestialToCanvas(90, 10, bounds, 800, 50)
      expect(result.x).toBe(400) // Center of 800px canvas
      expect(result.y).toBe(400)
    })

    it('should respect custom padding', () => {
      const result = celestialToCanvas(100, 20, bounds, 400, 100)
      expect(result.x).toBe(100) // Left edge with 100px padding
      expect(result.y).toBe(100) // Top edge with 100px padding
    })
  })

  describe('calculateConstellationBounds', () => {
    it('should calculate correct bounds from star array', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 0m', dec: '+10° 0\'' },
        { ra: '6h 0m', dec: '+20° 0\'' },
        { ra: '7h 0m', dec: '+15° 0\'' },
      ]

      const bounds = calculateConstellationBounds(stars)

      expect(bounds.raMin).toBe(75) // 5h * 15
      expect(bounds.raMax).toBe(105) // 7h * 15
      expect(bounds.decMin).toBe(10)
      expect(bounds.decMax).toBe(20)
    })

    it('should handle negative declinations', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 0m', dec: '-10° 0\'' },
        { ra: '6h 0m', dec: '+10° 0\'' },
      ]

      const bounds = calculateConstellationBounds(stars)

      expect(bounds.decMin).toBe(-10)
      expect(bounds.decMax).toBe(10)
    })

    it('should handle single star', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 30m', dec: '+15° 30\'' },
      ]

      const bounds = calculateConstellationBounds(stars)

      expect(bounds.raMin).toBe(82.5)
      expect(bounds.raMax).toBe(82.5)
      expect(bounds.decMin).toBe(15.5)
      expect(bounds.decMax).toBe(15.5)
    })
  })

  describe('convertStarsToCanvas', () => {
    it('should convert array of stars to canvas coordinates', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 0m', dec: '+10° 0\'' },
        { ra: '6h 0m', dec: '+20° 0\'' },
        { ra: '7h 0m', dec: '+15° 0\'' },
      ]

      const result = convertStarsToCanvas(stars, 400, 50)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('x')
      expect(result[0]).toHaveProperty('y')
      expect(typeof result[0].x).toBe('number')
      expect(typeof result[0].y).toBe('number')
    })

    it('should use default canvas size and padding', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 0m', dec: '+10° 0\'' },
        { ra: '5h 30m', dec: '+10° 30\'' },
      ]

      const result = convertStarsToCanvas(stars)

      expect(result).toHaveLength(2)
      // Verify coordinates are within canvas bounds
      result.forEach(coord => {
        expect(coord.x).toBeGreaterThanOrEqual(50)
        expect(coord.x).toBeLessThanOrEqual(350)
        expect(coord.y).toBeGreaterThanOrEqual(50)
        expect(coord.y).toBeLessThanOrEqual(350)
      })
    })

    it('should maintain relative positions of stars', () => {
      const stars: CelestialCoordinate[] = [
        { ra: '5h 0m', dec: '+10° 0\'' },  // Leftmost (highest RA after inversion)
        { ra: '7h 0m', dec: '+10° 0\'' },  // Rightmost (lowest RA after inversion)
      ]

      const result = convertStarsToCanvas(stars, 400, 50)

      // Due to X-axis inversion, star with higher RA should have lower X coordinate
      expect(result[1].x).toBeLessThan(result[0].x)
      // Same declination should have same Y coordinate
      expect(result[0].y).toBe(result[1].y)
    })
  })

  describe('integration tests', () => {
    it('should correctly process Orion constellation stars', () => {
      const orionStars: CelestialCoordinate[] = [
        { ra: '5h 55m', dec: '+7° 24\'' },   // Betelgeuse
        { ra: '5h 14m', dec: '-8° 12\'' },   // Rigel
        { ra: '5h 36m', dec: '-1° 12\'' },   // Alnilam (Orion's Belt)
      ]

      const result = convertStarsToCanvas(orionStars, 400, 50)

      expect(result).toHaveLength(3)
      
      // All coordinates should be within canvas bounds
      result.forEach(coord => {
        expect(coord.x).toBeGreaterThanOrEqual(50)
        expect(coord.x).toBeLessThanOrEqual(350)
        expect(coord.y).toBeGreaterThanOrEqual(50)
        expect(coord.y).toBeLessThanOrEqual(350)
      })
    })
  })
})

// Made with Bob
