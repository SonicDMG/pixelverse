/**
 * Unit tests for SpacePromptBuilder service
 * Tests prompt generation for celestial objects with scientific accuracy
 */

import { SpacePromptBuilder } from '@/services/space/prompt-builder';
import type { CelestialObjectOptions } from '@/services/space/prompt-builder';

describe('SpacePromptBuilder', () => {
  describe('buildCelestialPrompt()', () => {
    it('should build basic celestial prompt with all components', () => {
      const options: CelestialObjectOptions = {
        type: 'planet',
        name: 'TestPlanet',
        characteristics: ['rocky surface', 'thin atmosphere'],
        colors: ['red', 'orange'],
      };

      const prompt = SpacePromptBuilder.buildCelestialPrompt(options);

      expect(prompt).toContain('32-bit pixel art');
      expect(prompt).toContain('retro space game aesthetic');
      expect(prompt).toContain('SNES/Genesis style');
      expect(prompt).toContain('planet named TestPlanet');
      expect(prompt).toContain('rocky surface');
      expect(prompt).toContain('thin atmosphere');
      expect(prompt).toContain('with red, orange colors');
      expect(prompt).toContain('centered composition');
      expect(prompt).toContain('deep space background');
      expect(prompt).toContain('chunky pixels, dithered shading');
      expect(prompt).toContain('accurate astronomical representation');
    });

    it('should handle prompt without characteristics', () => {
      const options: CelestialObjectOptions = {
        type: 'star',
        name: 'TestStar',
        colors: ['white', 'blue'],
      };

      const prompt = SpacePromptBuilder.buildCelestialPrompt(options);

      expect(prompt).toContain('star named TestStar');
      expect(prompt).toContain('with white, blue colors');
      expect(prompt).not.toContain('undefined');
    });

    it('should handle prompt without colors', () => {
      const options: CelestialObjectOptions = {
        type: 'moon',
        name: 'TestMoon',
        characteristics: ['cratered surface'],
      };

      const prompt = SpacePromptBuilder.buildCelestialPrompt(options);

      expect(prompt).toContain('moon named TestMoon');
      expect(prompt).toContain('cratered surface');
      expect(prompt).toContain('with accurate astronomical colors');
    });

    it('should handle all celestial object types', () => {
      const types: Array<CelestialObjectOptions['type']> = [
        'planet',
        'moon',
        'star',
        'nebula',
        'galaxy',
        'black-hole',
      ];

      types.forEach((type) => {
        const prompt = SpacePromptBuilder.buildCelestialPrompt({
          type,
          name: `Test${type}`,
        });

        expect(prompt).toContain(`${type} named Test${type}`);
        expect(prompt).toContain('32-bit pixel art');
      });
    });

    it('should filter out empty characteristics', () => {
      const options: CelestialObjectOptions = {
        type: 'planet',
        name: 'TestPlanet',
        characteristics: [],
        colors: [],
      };

      const prompt = SpacePromptBuilder.buildCelestialPrompt(options);

      expect(prompt).not.toContain(',,');
      expect(prompt).toContain('with accurate astronomical colors');
    });
  });

  describe('buildAccuratePlanetPrompt()', () => {
    it('should build accurate prompt for Mercury', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Mercury');

      expect(prompt).toContain('planet named Mercury');
      expect(prompt).toContain('heavily cratered surface');
      expect(prompt).toContain('no atmosphere');
      expect(prompt).toContain('gray, dark gray, charcoal');
    });

    it('should build accurate prompt for Venus', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Venus');

      expect(prompt).toContain('planet named Venus');
      expect(prompt).toContain('thick cloud cover');
      expect(prompt).toContain('sulfuric acid atmosphere');
      expect(prompt).toContain('yellowish-white, pale yellow, cream');
    });

    it('should build accurate prompt for Earth', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Earth');

      expect(prompt).toContain('planet named Earth');
      expect(prompt).toContain('71% blue oceans');
      expect(prompt).toContain('white cloud patterns');
      expect(prompt).toContain('only known planet with life');
      expect(prompt).toContain('blue, white, green, brown');
    });

    it('should build accurate prompt for Mars', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Mars');

      expect(prompt).toContain('planet named Mars');
      expect(prompt).toContain('rusty red-orange surface');
      expect(prompt).toContain('Olympus Mons volcano');
      expect(prompt).toContain('rusty red, red-orange, white');
    });

    it('should build accurate prompt for Jupiter', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Jupiter');

      expect(prompt).toContain('planet named Jupiter');
      expect(prompt).toContain('Great Red Spot storm');
      expect(prompt).toContain('gas giant');
      expect(prompt).toContain('tan, brown, white, red-orange');
    });

    it('should build accurate prompt for Saturn', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Saturn');

      expect(prompt).toContain('planet named Saturn');
      expect(prompt).toContain('prominent ring system');
      expect(prompt).toContain('hexagonal storm at north pole');
      expect(prompt).toContain('pale yellow, golden, beige');
    });

    it('should build accurate prompt for Uranus', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Uranus');

      expect(prompt).toContain('planet named Uranus');
      expect(prompt).toContain('pale cyan-blue color');
      expect(prompt).toContain('ice giant');
      expect(prompt).toContain('pale cyan, blue-green, aqua');
    });

    it('should build accurate prompt for Neptune', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Neptune');

      expect(prompt).toContain('planet named Neptune');
      expect(prompt).toContain('deep blue color');
      expect(prompt).toContain('fastest winds in solar system');
      expect(prompt).toContain('deep blue, azure, cobalt');
    });

    it('should be case-insensitive', () => {
      const lowerPrompt = SpacePromptBuilder.buildAccuratePlanetPrompt('mars');
      const upperPrompt = SpacePromptBuilder.buildAccuratePlanetPrompt('MARS');
      const mixedPrompt = SpacePromptBuilder.buildAccuratePlanetPrompt('MaRs');

      expect(lowerPrompt).toContain('rusty red-orange surface');
      expect(upperPrompt).toContain('rusty red-orange surface');
      expect(mixedPrompt).toContain('rusty red-orange surface');
    });

    it('should fallback for unknown planets', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Pluto');

      expect(prompt).toContain('planet named Pluto');
      expect(prompt).toContain('accurate astronomical representation');
      expect(prompt).toContain('32-bit pixel art');
    });
  });

  describe('buildAccurateMoonPrompt()', () => {
    it('should build accurate prompt for Earth\'s Moon', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Moon');

      expect(prompt).toContain('moon Moon');
      expect(prompt).toContain('heavily cratered surface');
      expect(prompt).toContain('maria (dark patches)');
      expect(prompt).toContain('gray, light gray, dark gray');
    });

    it('should build accurate prompt for Io', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Io');

      expect(prompt).toContain('moon Io');
      expect(prompt).toContain('active volcanoes');
      expect(prompt).toContain('most volcanically active body');
      expect(prompt).toContain('yellow, orange, red, black');
    });

    it('should build accurate prompt for Europa', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Europa');

      expect(prompt).toContain('moon Europa');
      expect(prompt).toContain('icy white-blue surface');
      expect(prompt).toContain('subsurface ocean');
      expect(prompt).toContain('white, blue-white, pale blue, brown streaks');
    });

    it('should build accurate prompt for Ganymede', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Ganymede');

      expect(prompt).toContain('moon Ganymede');
      expect(prompt).toContain('largest moon in solar system');
      expect(prompt).toContain('grooved terrain');
      expect(prompt).toContain('gray, brown, white');
    });

    it('should build accurate prompt for Callisto', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Callisto');

      expect(prompt).toContain('moon Callisto');
      expect(prompt).toContain('most cratered object in solar system');
      expect(prompt).toContain('dark gray, brown-gray');
    });

    it('should build accurate prompt for Titan', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Titan');

      expect(prompt).toContain('moon Titan');
      expect(prompt).toContain('orange-brown hazy atmosphere');
      expect(prompt).toContain('methane lakes');
      expect(prompt).toContain('orange, brown, amber');
    });

    it('should build accurate prompt for Enceladus', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Enceladus');

      expect(prompt).toContain('moon Enceladus');
      expect(prompt).toContain('geysers at south pole');
      expect(prompt).toContain('most reflective body in solar system');
      expect(prompt).toContain('bright white, blue-white');
    });

    it('should be case-insensitive', () => {
      const lowerPrompt = SpacePromptBuilder.buildAccurateMoonPrompt('europa');
      const upperPrompt = SpacePromptBuilder.buildAccurateMoonPrompt('EUROPA');

      expect(lowerPrompt).toContain('subsurface ocean');
      expect(upperPrompt).toContain('subsurface ocean');
    });

    it('should fallback for unknown moons', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Phobos');

      expect(prompt).toContain('moon named Phobos');
      expect(prompt).toContain('accurate astronomical representation');
      expect(prompt).toContain('32-bit pixel art');
    });
  });

  describe('buildPlanetPrompt()', () => {
    it('should build prompt for terrestrial planet', () => {
      const prompt = SpacePromptBuilder.buildPlanetPrompt(
        'TestPlanet',
        'terrestrial',
        ['rocky surface', 'thin atmosphere'],
        ['red', 'brown']
      );

      expect(prompt).toContain('planet named TestPlanet');
      expect(prompt).toContain('terrestrial');
      expect(prompt).toContain('rocky surface');
      expect(prompt).toContain('thin atmosphere');
      expect(prompt).toContain('with red, brown colors');
    });

    it('should build prompt for gas giant', () => {
      const prompt = SpacePromptBuilder.buildPlanetPrompt(
        'GasGiant',
        'gas-giant',
        ['massive storms', 'no solid surface'],
        ['tan', 'brown']
      );

      expect(prompt).toContain('planet named GasGiant');
      expect(prompt).toContain('gas-giant');
      expect(prompt).toContain('massive storms');
    });

    it('should build prompt for ice giant', () => {
      const prompt = SpacePromptBuilder.buildPlanetPrompt(
        'IceGiant',
        'ice-giant',
        ['methane atmosphere'],
        ['blue', 'cyan']
      );

      expect(prompt).toContain('planet named IceGiant');
      expect(prompt).toContain('ice-giant');
      expect(prompt).toContain('methane atmosphere');
    });

    it('should build prompt for dwarf planet', () => {
      const prompt = SpacePromptBuilder.buildPlanetPrompt(
        'DwarfPlanet',
        'dwarf',
        ['small size'],
        ['gray']
      );

      expect(prompt).toContain('planet named DwarfPlanet');
      expect(prompt).toContain('dwarf');
      expect(prompt).toContain('small size');
    });

    it('should handle empty characteristics and colors', () => {
      const prompt = SpacePromptBuilder.buildPlanetPrompt(
        'SimplePlanet',
        'terrestrial'
      );

      expect(prompt).toContain('planet named SimplePlanet');
      expect(prompt).toContain('terrestrial');
      expect(prompt).toContain('with accurate astronomical colors');
    });
  });

  describe('buildConstellationPrompt()', () => {
    it('should build constellation prompt with star count', () => {
      const prompt = SpacePromptBuilder.buildConstellationPrompt('Orion', 7);

      expect(prompt).toContain('32-bit pixel art star map');
      expect(prompt).toContain('constellation Orion');
      expect(prompt).toContain('7 stars with accurate pattern');
      expect(prompt).toContain('white connecting lines between stars');
      expect(prompt).toContain('dark space background');
      expect(prompt).toContain('accurate star positions');
      expect(prompt).toContain('no artistic embellishments');
    });

    it('should handle different star counts', () => {
      const prompt1 = SpacePromptBuilder.buildConstellationPrompt('Ursa Major', 7);
      const prompt2 = SpacePromptBuilder.buildConstellationPrompt('Cassiopeia', 5);

      expect(prompt1).toContain('7 stars');
      expect(prompt2).toContain('5 stars');
    });

    it('should handle single star constellation', () => {
      const prompt = SpacePromptBuilder.buildConstellationPrompt('SingleStar', 1);

      expect(prompt).toContain('1 stars with accurate pattern');
    });

    it('should handle large constellations', () => {
      const prompt = SpacePromptBuilder.buildConstellationPrompt('Hydra', 17);

      expect(prompt).toContain('17 stars with accurate pattern');
    });
  });

  describe('buildGenericCelestialPrompt()', () => {
    it('should build prompt for moon without description', () => {
      const prompt = SpacePromptBuilder.buildGenericCelestialPrompt('moon', 'TestMoon');

      expect(prompt).toContain('moon named TestMoon');
      expect(prompt).toContain('32-bit pixel art');
      expect(prompt).toContain('retro space game aesthetic');
    });

    it('should build prompt for star with description', () => {
      const prompt = SpacePromptBuilder.buildGenericCelestialPrompt(
        'star',
        'Betelgeuse',
        'red supergiant, massive size'
      );

      expect(prompt).toContain('star named Betelgeuse');
      expect(prompt).toContain('red supergiant, massive size');
    });

    it('should build prompt for nebula', () => {
      const prompt = SpacePromptBuilder.buildGenericCelestialPrompt(
        'nebula',
        'Orion Nebula',
        'stellar nursery, glowing gas clouds'
      );

      expect(prompt).toContain('nebula named Orion Nebula');
      expect(prompt).toContain('stellar nursery, glowing gas clouds');
    });

    it('should build prompt for galaxy', () => {
      const prompt = SpacePromptBuilder.buildGenericCelestialPrompt(
        'galaxy',
        'Andromeda',
        'spiral galaxy, billions of stars'
      );

      expect(prompt).toContain('galaxy named Andromeda');
      expect(prompt).toContain('spiral galaxy, billions of stars');
    });

    it('should build prompt for black hole', () => {
      const prompt = SpacePromptBuilder.buildGenericCelestialPrompt(
        'black-hole',
        'Sagittarius A*',
        'supermassive black hole, accretion disk'
      );

      expect(prompt).toContain('black-hole named Sagittarius A*');
      expect(prompt).toContain('supermassive black hole, accretion disk');
    });
  });

  describe('getSupportedPlanets()', () => {
    it('should return array of supported planet names', () => {
      const planets = SpacePromptBuilder.getSupportedPlanets();

      expect(Array.isArray(planets)).toBe(true);
      expect(planets.length).toBeGreaterThan(0);
    });

    it('should include all 8 major planets', () => {
      const planets = SpacePromptBuilder.getSupportedPlanets();

      expect(planets).toContain('mercury');
      expect(planets).toContain('venus');
      expect(planets).toContain('earth');
      expect(planets).toContain('mars');
      expect(planets).toContain('jupiter');
      expect(planets).toContain('saturn');
      expect(planets).toContain('uranus');
      expect(planets).toContain('neptune');
    });

    it('should return lowercase planet names', () => {
      const planets = SpacePromptBuilder.getSupportedPlanets();

      planets.forEach((planet) => {
        expect(planet).toBe(planet.toLowerCase());
      });
    });
  });

  describe('getSupportedMoons()', () => {
    it('should return array of supported moon names', () => {
      const moons = SpacePromptBuilder.getSupportedMoons();

      expect(Array.isArray(moons)).toBe(true);
      expect(moons.length).toBeGreaterThan(0);
    });

    it('should include major moons', () => {
      const moons = SpacePromptBuilder.getSupportedMoons();

      expect(moons).toContain('moon');
      expect(moons).toContain('io');
      expect(moons).toContain('europa');
      expect(moons).toContain('ganymede');
      expect(moons).toContain('callisto');
      expect(moons).toContain('titan');
      expect(moons).toContain('enceladus');
    });

    it('should return lowercase moon names', () => {
      const moons = SpacePromptBuilder.getSupportedMoons();

      moons.forEach((moon) => {
        expect(moon).toBe(moon.toLowerCase());
      });
    });
  });

  describe('prompt format consistency', () => {
    it('should always include pixel art style', () => {
      const prompts = [
        SpacePromptBuilder.buildAccuratePlanetPrompt('Earth'),
        SpacePromptBuilder.buildAccurateMoonPrompt('Moon'),
        SpacePromptBuilder.buildConstellationPrompt('Orion', 7),
        SpacePromptBuilder.buildGenericCelestialPrompt('star', 'Sun'),
      ];

      prompts.forEach((prompt) => {
        expect(prompt).toContain('32-bit pixel art');
        expect(prompt).toContain('retro space game aesthetic');
      });
    });

    it('should always include accurate representation for planets and moons', () => {
      const prompts = [
        SpacePromptBuilder.buildAccuratePlanetPrompt('Mars'),
        SpacePromptBuilder.buildAccurateMoonPrompt('Europa'),
      ];

      prompts.forEach((prompt) => {
        expect(prompt).toContain('accurate astronomical representation');
      });
    });

    it('should use comma-separated format', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Jupiter');
      const parts = prompt.split(',');

      expect(parts.length).toBeGreaterThan(5);
      parts.forEach((part) => {
        expect(part.trim()).toBeTruthy();
      });
    });
  });

  describe('scientific accuracy', () => {
    it('should include scientifically accurate features for Earth', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Earth');

      expect(prompt).toContain('71% blue oceans');
      expect(prompt).toContain('polar ice caps');
    });

    it('should include scientifically accurate features for Jupiter', () => {
      const prompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Jupiter');

      expect(prompt).toContain('Great Red Spot');
      expect(prompt).toContain('gas giant');
      expect(prompt).toContain('no solid surface');
    });

    it('should include scientifically accurate features for Io', () => {
      const prompt = SpacePromptBuilder.buildAccurateMoonPrompt('Io');

      expect(prompt).toContain('most volcanically active body');
      expect(prompt).toContain('sulfur deposits');
    });

    it('should include scientifically accurate colors', () => {
      const marsPrompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Mars');
      const neptunePrompt = SpacePromptBuilder.buildAccuratePlanetPrompt('Neptune');

      expect(marsPrompt).toContain('rusty red');
      expect(neptunePrompt).toContain('deep blue');
    });
  });
});

// Made with Bob