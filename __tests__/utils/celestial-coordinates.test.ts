import {
  raToDecimalDegrees,
  decToDecimalDegrees,
  celestialToCanvas,
  calculateConstellationBounds,
  convertStarsToCanvas,
  selectProjectionType,
  getProjectionType,
  CelestialCoordinate,
  ConstellationBounds,
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
      // With spherical correction, coordinates will be slightly offset due to centering
      expect(result.x).toBeGreaterThanOrEqual(345)
      expect(result.x).toBeLessThanOrEqual(355)
      expect(result.y).toBeGreaterThanOrEqual(345)
      expect(result.y).toBeLessThanOrEqual(355)
    })

    it('should handle maximum bounds correctly', () => {
      const result = celestialToCanvas(100, 20, bounds, 400, 50)
      // With spherical correction, coordinates will be slightly offset due to centering
      expect(result.x).toBeGreaterThanOrEqual(45)
      expect(result.x).toBeLessThanOrEqual(55)
      expect(result.y).toBeGreaterThanOrEqual(45)
      expect(result.y).toBeLessThanOrEqual(55)
    })

    it('should respect custom canvas size', () => {
      const result = celestialToCanvas(90, 10, bounds, 800, 50)
      expect(result.x).toBe(400) // Center of 800px canvas
      expect(result.y).toBe(400)
    })

    it('should respect custom padding', () => {
      const result = celestialToCanvas(100, 20, bounds, 400, 100)
      // With spherical correction, coordinates will be slightly offset due to centering
      expect(result.x).toBeGreaterThanOrEqual(95)
      expect(result.x).toBeLessThanOrEqual(105)
      expect(result.y).toBeGreaterThanOrEqual(95)
      expect(result.y).toBeLessThanOrEqual(105)
    })

    it('should use different projections based on declination', () => {
      // High declination (60-80°) uses stereographic projection
      const highDecBounds = {
        raMin: 80,
        raMax: 100,
        decMin: 60,
        decMax: 80,
      }
      
      const result1 = celestialToCanvas(90, 70, highDecBounds, 400, 50)
      
      // Low declination (0-60°) uses equirectangular projection
      const lowDecBounds = {
        raMin: 80,
        raMax: 100,
        decMin: 0,
        decMax: 20,
      }
      
      const result2 = celestialToCanvas(90, 10, lowDecBounds, 400, 50)
      
      // Both should produce valid coordinates within canvas bounds
      expect(result1.x).toBeGreaterThanOrEqual(50)
      expect(result1.x).toBeLessThanOrEqual(350)
      expect(result1.y).toBeGreaterThanOrEqual(50)
      expect(result1.y).toBeLessThanOrEqual(350)
      
      expect(result2.x).toBe(200)
      expect(result2.y).toBe(200)
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

    it('should maintain proper aspect ratio for Cygnus constellation', () => {
      // Cygnus has a wide declination range (27° to 45°, 18° span)
      const cygnusStars: CelestialCoordinate[] = [
        { ra: '20h 41m', dec: '+45° 16\'' },  // Deneb (α Cyg)
        { ra: '20h 31m', dec: '+45° 53\'' },  // Delta Cygni (δ Cyg)
        { ra: '20h 22m', dec: '+40° 15\'' },  // Sadr (γ Cyg)
        { ra: '20h 08m', dec: '+33° 32\'' },  // Gienah (ε Cyg)
        { ra: '19h 31m', dec: '+27° 58\'' },  // Albireo (β Cyg)
      ]

      const result = convertStarsToCanvas(cygnusStars, 400, 50)
      const bounds = calculateConstellationBounds(cygnusStars)

      // Calculate actual angular ranges with spherical correction
      const meanDec = (bounds.decMin + bounds.decMax) / 2
      const meanDecRadians = (meanDec * Math.PI) / 180
      const raAngularRange = (bounds.raMax - bounds.raMin) * Math.cos(meanDecRadians)
      const decRange = bounds.decMax - bounds.decMin

      // Verify the constellation is not vertically compressed
      // The Y-axis span should be proportional to the Dec range
      const ySpan = Math.max(...result.map(c => c.y)) - Math.min(...result.map(c => c.y))
      const xSpan = Math.max(...result.map(c => c.x)) - Math.min(...result.map(c => c.x))

      // The ratio of spans should match the ratio of angular ranges (with spherical correction)
      const spanRatio = ySpan / xSpan
      const rangeRatio = decRange / raAngularRange

      // Allow for small rounding differences
      expect(spanRatio).toBeCloseTo(rangeRatio, 1)

      // All coordinates should be within canvas bounds
      result.forEach(coord => {
        expect(coord.x).toBeGreaterThanOrEqual(50)
        expect(coord.x).toBeLessThanOrEqual(350)
        expect(coord.y).toBeGreaterThanOrEqual(50)
        expect(coord.y).toBeLessThanOrEqual(350)
      })
    })

    it('should maintain proper aspect ratio for Ursa Major (Big Dipper)', () => {
      // Ursa Major has a narrow declination range (49° to 61°, 12° span)
      const ursaMajorStars: CelestialCoordinate[] = [
        { ra: '11h 04m', dec: '+61° 45\'' },  // Dubhe (α UMa)
        { ra: '11h 02m', dec: '+56° 23\'' },  // Merak (β UMa)
        { ra: '11h 54m', dec: '+53° 42\'' },  // Phecda (γ UMa)
        { ra: '12h 15m', dec: '+57° 02\'' },  // Megrez (δ UMa)
        { ra: '12h 54m', dec: '+55° 58\'' },  // Alioth (ε UMa)
        { ra: '13h 24m', dec: '+54° 56\'' },  // Mizar (ζ UMa)
        { ra: '13h 48m', dec: '+49° 19\'' },  // Alkaid (η UMa)
      ]

      const result = convertStarsToCanvas(ursaMajorStars, 400, 50)
      const bounds = calculateConstellationBounds(ursaMajorStars)

      // Calculate actual angular ranges with spherical correction
      const meanDec = (bounds.decMin + bounds.decMax) / 2
      const meanDecRadians = (meanDec * Math.PI) / 180
      const raAngularRange = (bounds.raMax - bounds.raMin) * Math.cos(meanDecRadians)
      const decRange = bounds.decMax - bounds.decMin

      // Verify the constellation maintains proper proportions
      const ySpan = Math.max(...result.map(c => c.y)) - Math.min(...result.map(c => c.y))
      const xSpan = Math.max(...result.map(c => c.x)) - Math.min(...result.map(c => c.x))

      // The ratio of spans should match the ratio of angular ranges (with spherical correction)
      const spanRatio = ySpan / xSpan
      const rangeRatio = decRange / raAngularRange

      // Allow for small rounding differences
      expect(spanRatio).toBeCloseTo(rangeRatio, 1)

      // All coordinates should be within canvas bounds
      result.forEach(coord => {
        expect(coord.x).toBeGreaterThanOrEqual(50)
        expect(coord.x).toBeLessThanOrEqual(350)
        expect(coord.y).toBeGreaterThanOrEqual(50)
        expect(coord.y).toBeLessThanOrEqual(350)
      })
    })

    it('should center constellations with different aspect ratios', () => {
      // Test a constellation with a very wide RA range but narrow Dec range
      const wideConstellation: CelestialCoordinate[] = [
        { ra: '0h 0m', dec: '+10° 0\'' },
        { ra: '6h 0m', dec: '+12° 0\'' },  // 90 degrees RA span, 2 degrees Dec span
      ]

      const result = convertStarsToCanvas(wideConstellation, 400, 50)

      // The constellation should be centered vertically since Dec range is small
      const yCenter = (result[0].y + result[1].y) / 2
      expect(yCenter).toBeCloseTo(200, 0) // Should be near canvas center (200)

      // X span should use most of the drawable area

  describe('projection selection', () => {
    describe('circumpolar constellations (azimuthal-equidistant)', () => {
      it('should detect Draco as circumpolar (high dec + wide RA range)', () => {
        // Draco: RA 9h-23h (135°-345°, range 210°), Dec 48°-86° (mean ~67°)
        const dracoBounds: ConstellationBounds = {
          raMin: 135,
          raMax: 345,
          decMin: 48,
          decMax: 86,
        }
        expect(selectProjectionType(dracoBounds)).toBe('azimuthal-equidistant')
        expect(getProjectionType(dracoBounds)).toBe('azimuthal-equidistant')
      })

      it('should detect Ursa Minor as circumpolar (very high dec)', () => {
        // Ursa Minor: RA 0h-24h (wraps around pole), Dec 66°-90° (mean ~78°)
        const ursaMinorBounds: ConstellationBounds = {
          raMin: 0,
          raMax: 360,
          decMin: 66,
          decMax: 90,
        }
        expect(selectProjectionType(ursaMinorBounds)).toBe('azimuthal-equidistant')
      })

      it('should detect Cassiopeia as circumpolar (high dec + wide RA range)', () => {
        // Cassiopeia: RA 0h-3h (0°-45°, but wraps), Dec 47°-77° (mean ~62°)
        // Simplified to show wide RA range at high dec
        const cassiopeiaBounds: ConstellationBounds = {
          raMin: 0,
          raMax: 200,
          decMin: 47,
          decMax: 77,
        }
        expect(selectProjectionType(cassiopeiaBounds)).toBe('azimuthal-equidistant')
      })

      it('should detect Octans as circumpolar (southern pole)', () => {
        // Octans: Southern circumpolar, Dec -75° to -90°
        const octansBounds: ConstellationBounds = {
          raMin: 0,
          raMax: 360,
          decMin: -90,
          decMax: -75,
        }
        expect(selectProjectionType(octansBounds)).toBe('azimuthal-equidistant')
      })
    })

    describe('high-latitude non-circumpolar constellations', () => {
      it('should use equirectangular for Ursa Major (wide RA range)', () => {
        // Ursa Major: RA 8h-15h (120°-225°, range 105°), Dec 49°-62° (mean ~56°)
        // Wide RA range but not circumpolar
        const ursaMajorBounds: ConstellationBounds = {
          raMin: 120,
          raMax: 225,
          decMin: 49,
          decMax: 62,
        }
        expect(selectProjectionType(ursaMajorBounds)).toBe('equirectangular')
      })

      it('should use stereographic for compact high-latitude constellations', () => {
        // Compact constellation at 65° dec with narrow RA range
        const compactBounds: ConstellationBounds = {
          raMin: 180,
          raMax: 210, // 30° RA range
          decMin: 60,
          decMax: 70,
        }
        expect(selectProjectionType(compactBounds)).toBe('stereographic')
      })

      it('should use equirectangular for wide high-latitude constellations', () => {
        // Wide constellation at 65° dec with wide RA range
        const wideBounds: ConstellationBounds = {
          raMin: 100,
          raMax: 170, // 70° RA range (>60° threshold)
          decMin: 60,
          decMax: 70,
        }
        expect(selectProjectionType(wideBounds)).toBe('equirectangular')
      })

      it('should use equirectangular for high RA:Dec ratio constellations', () => {
        // High RA:Dec ratio (>3:1) at high latitude
        const highRatioBounds: ConstellationBounds = {
          raMin: 100,
          raMax: 145, // 45° RA range
          decMin: 62,
          decMax: 72, // 10° Dec range, ratio 4.5:1
        }
        expect(selectProjectionType(highRatioBounds)).toBe('equirectangular')
      })
    })

    describe('mid-latitude constellations (equirectangular)', () => {
      it('should use equirectangular for Orion', () => {
        // Orion: RA 4h-6h (60°-90°), Dec -11° to +23° (mean ~6°)
        const orionBounds: ConstellationBounds = {
          raMin: 60,
          raMax: 90,
          decMin: -11,
          decMax: 23,
        }
        expect(selectProjectionType(orionBounds)).toBe('equirectangular')
      })

      it('should use equirectangular for Leo', () => {
        // Leo: RA 9h-12h (135°-180°), Dec 0° to +33° (mean ~17°)
        const leoBounds: ConstellationBounds = {
          raMin: 135,
          raMax: 180,
          decMin: 0,
          decMax: 33,
        }
        expect(selectProjectionType(leoBounds)).toBe('equirectangular')
      })

      it('should use equirectangular for Virgo', () => {
        // Virgo: RA 11h-15h (165°-225°), Dec -22° to +14° (mean ~-4°)
        const virgoBounds: ConstellationBounds = {
          raMin: 165,
          raMax: 225,
          decMin: -22,
          decMax: 14,
        }
        expect(selectProjectionType(virgoBounds)).toBe('equirectangular')
      })

      it('should use equirectangular for Cygnus', () => {
        // Cygnus: RA 19h-22h (285°-330°), Dec 28° to 61° (mean ~45°)
        const cygnusBounds: ConstellationBounds = {
          raMin: 285,
          raMax: 330,
          decMin: 28,
          decMax: 61,
        }
        expect(selectProjectionType(cygnusBounds)).toBe('equirectangular')
      })
    })

    describe('southern constellations', () => {
      it('should use equirectangular for Crux (Southern Cross)', () => {
        // Crux: RA 12h-13h (180°-195°), Dec -64° to -55° (mean ~-60°)
        const cruxBounds: ConstellationBounds = {
          raMin: 180,
          raMax: 195,
          decMin: -64,
          decMax: -55,
        }
        expect(selectProjectionType(cruxBounds)).toBe('equirectangular')
      })

      it('should use azimuthal for southern circumpolar with wide RA', () => {
        // Southern circumpolar with wide RA range
        const southCircumpolarBounds: ConstellationBounds = {
          raMin: 0,
          raMax: 200,
          decMin: -80,
          decMax: -65,
        }
        expect(selectProjectionType(southCircumpolarBounds)).toBe('azimuthal-equidistant')
      })
    })

    describe('edge cases', () => {
      it('should handle constellation exactly at 60° threshold', () => {
        const bounds: ConstellationBounds = {
          raMin: 100,
          raMax: 120,
          decMin: 59,
          decMax: 61, // Mean exactly 60°
        }
        // Should use stereographic (compact, high-lat)
        expect(selectProjectionType(bounds)).toBe('stereographic')
      })

      it('should handle constellation exactly at 70° threshold', () => {
        const bounds: ConstellationBounds = {
          raMin: 100,
          raMax: 120,
          decMin: 69,
          decMax: 71, // Mean exactly 70°
        }
        // Should use azimuthal (>70° threshold)
        expect(selectProjectionType(bounds)).toBe('azimuthal-equidistant')
      })

      it('should handle constellation exactly at 180° RA threshold', () => {
        const bounds: ConstellationBounds = {
          raMin: 90,
          raMax: 270, // Exactly 180° range
          decMin: 60,
          decMax: 65,
        }
        // Should use azimuthal (>180° RA range at high dec)
        expect(selectProjectionType(bounds)).toBe('azimuthal-equidistant')
      })

      it('should handle very small constellations', () => {
        const bounds: ConstellationBounds = {
          raMin: 100,
          raMax: 101,
          decMin: 10,
          decMax: 11,
        }
        expect(selectProjectionType(bounds)).toBe('equirectangular')
      })

      it('should handle equatorial constellations (dec ~0°)', () => {
        const bounds: ConstellationBounds = {
          raMin: 100,
          raMax: 150,
          decMin: -5,
          decMax: 5,
        }
        expect(selectProjectionType(bounds)).toBe('equirectangular')
      })
    })
  })
      const xSpan = Math.abs(result[0].x - result[1].x)
      expect(xSpan).toBeGreaterThan(250) // Should be close to full drawable width (300)
    })
  })
})

// Made with Bob
