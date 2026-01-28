import { NextRequest, NextResponse } from 'next/server';
import { queryLangflow } from '@/services/langflow';

/**
 * ============================================================================
 * SPACE API ROUTE - DYNAMIC COMPONENT EXAMPLES
 * ============================================================================
 *
 * This API route handles space/astronomy queries and can return dynamic UI
 * components along with text responses. Below are comprehensive examples for
 * each available component type.
 *
 * AVAILABLE COMPONENT TYPES:
 *
 * 1. celestial-body-card - Display detailed information about planets, moons, stars, or galaxies
 * 2. constellation - Show constellation information with star data
 * 3. space-timeline - Display chronological space events (missions, discoveries, observations)
 * 4. text-block - Display formatted text content (plain or markdown)
 * 5. Plain text response - Simple factual answers without visual components
 *
 * ============================================================================
 * EXAMPLE 1: CELESTIAL-BODY-CARD COMPONENT
 * ============================================================================
 *
 * USE CASE: Queries about specific celestial bodies (planets, moons, stars, galaxies)
 * EXAMPLE QUERIES:
 *   - "Tell me about Jupiter" (planet)
 *   - "What is the Moon like?" (moon)
 *   - "Show me information about the Sun" (star)
 *   - "Describe the Andromeda Galaxy" (galaxy)
 *
 * RESPONSE FORMAT (Planet Example):
 * {
 *   answer: "Jupiter is the largest planet in our Solar System...",
 *   components: [
 *     {
 *       type: "celestial-body-card",
 *       props: {
 *         name: "Jupiter",
 *         bodyType: "planet",
 *         description: "The gas giant with the Great Red Spot, a massive storm larger than Earth.",
 *         diameter: "139,820 km",
 *         mass: "1.898 × 10²⁷ kg",
 *         distanceFrom: "778.5 million km",
 *         distanceFromLabel: "Distance from Sun",
 *         orbitalPeriod: "11.9 Earth years",
 *         satellites: 95,
 *         satelliteLabel: "Moons",
 *         planetType: "gas-giant",
 *         enableImageGeneration: true
 *       }
 *     }
 *   ]
 * }
 *
 * RESPONSE FORMAT (Moon Example):
 * {
 *   answer: "The Moon is Earth's only natural satellite...",
 *   components: [
 *     {
 *       type: "celestial-body-card",
 *       props: {
 *         name: "The Moon",
 *         bodyType: "moon",
 *         description: "Earth's only natural satellite and the fifth largest moon in the solar system.",
 *         diameter: "3,474 km",
 *         mass: "7.34 × 10²² kg",
 *         distanceFrom: "384,400 km",
 *         distanceFromLabel: "Distance from Earth",
 *         orbitalPeriod: "27.3 Earth days",
 *         parentBody: "Earth",
 *         enableImageGeneration: true
 *       }
 *     }
 *   ]
 * }
 *
 * RESPONSE FORMAT (Star Example):
 * {
 *   answer: "The Sun is the star at the center of our Solar System...",
 *   components: [
 *     {
 *       type: "celestial-body-card",
 *       props: {
 *         name: "The Sun",
 *         bodyType: "star",
 *         description: "A G-type main-sequence star that contains 99.86% of the Solar System's mass.",
 *         diameter: "1.39 million km",
 *         mass: "1.989 × 10³⁰ kg",
 *         spectralClass: "G2V",
 *         temperature: "5,778 K",
 *         luminosity: "1 L☉",
 *         satellites: 8,
 *         satelliteLabel: "Planets",
 *         starType: "main-sequence",
 *         enableImageGeneration: true
 *       }
 *     }
 *   ]
 * }
 *
 * RESPONSE FORMAT (Galaxy Example):
 * {
 *   answer: "The Andromeda Galaxy is the nearest major galaxy to the Milky Way...",
 *   components: [
 *     {
 *       type: "celestial-body-card",
 *       props: {
 *         name: "Andromeda Galaxy",
 *         bodyType: "galaxy",
 *         description: "The nearest major galaxy to the Milky Way, on a collision course with our galaxy.",
 *         galaxyType: "Spiral",
 *         diameter: "220,000 light-years",
 *         starCount: "1 trillion stars",
 *         distanceFromEarth: "2.537 million light-years",
 *         enableImageGeneration: true
 *       }
 *     }
 *   ]
 * }
 *
 * PROPS INTERFACE (from types/ui-spec.ts):
 * UNIVERSAL (all body types):
 * - name: string (required) - Name of the celestial body
 * - bodyType: 'planet' | 'moon' | 'star' | 'galaxy' (required) - Type of celestial body
 * - description: string (required) - Detailed description
 * - enableImageGeneration: boolean (optional) - Auto-generate AI image
 *
 * PHYSICAL PROPERTIES (planets, moons, stars):
 * - diameter: string (optional) - Size measurement
 * - mass: string (optional) - Mass measurement
 *
 * ORBITAL PROPERTIES (planets, moons):
 * - distanceFrom: string (optional) - Distance from parent body
 * - distanceFromLabel: string (optional) - Label for distance (e.g., "Distance from Sun")
 * - orbitalPeriod: string (optional) - Time to complete one orbit
 * - parentBody: string (optional) - Parent body name (for moons)
 *
 * SATELLITE PROPERTIES (planets, stars):
 * - satellites: number (optional) - Number of satellites
 * - satelliteLabel: string (optional) - Label for satellites (e.g., "Moons", "Planets")
 *
 * STAR-SPECIFIC PROPERTIES:
 * - spectralClass: string (optional) - Spectral classification (e.g., "G2V")
 * - temperature: string (optional) - Surface temperature
 * - luminosity: string (optional) - Luminosity relative to Sun
 * - starType: string (optional) - Type hint for image generation
 *
 * GALAXY-SPECIFIC PROPERTIES:
 * - galaxyType: string (optional) - Galaxy classification (e.g., "Spiral", "Elliptical")
 * - starCount: string (optional) - Estimated number of stars
 * - distanceFromEarth: string (optional) - Distance from Earth
 *
 * TYPE-SPECIFIC HINTS:
 * - planetType: string (optional) - For planets: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf'
 *
 * ============================================================================
 * EXAMPLE 2: CONSTELLATION COMPONENT
 * ============================================================================
 *
 * USE CASE: Queries about constellations and star patterns
 * EXAMPLE QUERIES:
 *   - "Show me the Orion constellation"
 *   - "Tell me about Ursa Major"
 *   - "What stars are in Cassiopeia?"
 *
 * RESPONSE FORMAT:
 * {
 *   answer: "Orion is one of the most recognizable constellations...",
 *   components: [
 *     {
 *       type: "constellation",
 *       props: {
 *         name: "Orion",
 *         abbreviation: "Ori",
 *         description: "The Hunter constellation, featuring the famous Orion's Belt asterism.",
 *         brightestStar: "Rigel (β Orionis)",
 *         visibility: "Visible worldwide, best seen December-March",
 *         stars: [
 *           { name: "Rigel", magnitude: 0.13 },
 *           { name: "Betelgeuse", magnitude: 0.50 },
 *           { name: "Bellatrix", magnitude: 1.64 },
 *           { name: "Alnilam", magnitude: 1.69 }
 *         ]
 *       }
 *     }
 *   ]
 * }
 *
 * PROPS INTERFACE (from types/ui-spec.ts):
 * - name: string (required) - Constellation name
 * - abbreviation: string (required) - Standard 3-letter abbreviation
 * - description: string (required) - Detailed description
 * - brightestStar: string (optional) - Name of the brightest star
 * - visibility: string (required) - When/where it can be seen
 * - stars: Array<{name: string, magnitude: number}> (required) - List of notable stars
 *
 * ============================================================================
 * EXAMPLE 3: SPACE-TIMELINE COMPONENT
 * ============================================================================
 *
 * USE CASE: Queries about space exploration history, mission timelines, or chronological events
 * EXAMPLE QUERIES:
 *   - "History of Mars exploration"
 *   - "Timeline of Apollo missions"
 *   - "When was the Hubble telescope launched?"
 *
 * RESPONSE FORMAT:
 * {
 *   answer: "Mars exploration has a rich history spanning decades...",
 *   components: [
 *     {
 *       type: "space-timeline",
 *       props: {
 *         title: "Mars Exploration Timeline",
 *         events: [
 *           {
 *             date: "1965",
 *             title: "Mariner 4",
 *             description: "First successful flyby of Mars, returning the first close-up images",
 *             type: "mission"
 *           },
 *           {
 *             date: "1976",
 *             title: "Viking 1 & 2",
 *             description: "First successful Mars landers, conducted experiments searching for life",
 *             type: "mission"
 *           },
 *           {
 *             date: "2012",
 *             title: "Curiosity Rover Landing",
 *             description: "Car-sized rover landed in Gale Crater to study Mars habitability",
 *             type: "mission"
 *           },
 *           {
 *             date: "2021",
 *             title: "Perseverance & Ingenuity",
 *             description: "Rover and first Mars helicopter began operations in Jezero Crater",
 *             type: "mission"
 *           }
 *         ]
 *       }
 *     }
 *   ]
 * }
 *
 * PROPS INTERFACE (from types/ui-spec.ts):
 * - title: string (required) - Timeline title
 * - events: Array (required) - List of chronological events
 *   - date: string (required) - Date or time period
 *   - title: string (required) - Event name
 *   - description: string (required) - Event details
 *   - type: 'mission' | 'discovery' | 'observation' (optional) - Event category
 *
 * ============================================================================
 * EXAMPLE 4: TEXT-BLOCK COMPONENT
 * ============================================================================
 *
 * USE CASE: Display formatted text content with optional markdown support
 * EXAMPLE QUERIES:
 *   - "What is the distance between Earth and Moon?"
 *   - "Explain black holes"
 *   - "Tell me about the Big Bang theory"
 *
 * RESPONSE FORMAT:
 * {
 *   text: "Moon-Earth distance",
 *   components: [
 *     {
 *       type: "text-block",
 *       props: {
 *         content: "Distance (center-to-center): average ~384,400 km (238,855 miles).\n\nThis varies due to the Moon's elliptical orbit:\n- Perigee (closest): ~356,500 km\n- Apogee (farthest): ~406,700 km",
 *         format: "plain"
 *       }
 *     }
 *   ]
 * }
 *
 * MARKDOWN FORMAT EXAMPLE:
 * {
 *   text: "Black holes explained",
 *   components: [
 *     {
 *       type: "text-block",
 *       props: {
 *         content: "## What is a Black Hole?\n\nA **black hole** is a region of spacetime where gravity is so strong that nothing can escape.\n\n### Key Properties:\n- *Event Horizon*: The point of no return\n- *Singularity*: Infinite density at the center\n- *Hawking Radiation*: Theoretical radiation emission",
 *         format: "markdown"
 *       }
 *     }
 *   ]
 * }
 *
 * PROPS INTERFACE (from types/ui-spec.ts):
 * - content: string (required) - The text content to display
 * - format: 'plain' | 'markdown' (optional, default: 'plain') - Text formatting type
 *
 * MARKDOWN SUPPORT:
 * - Headers: ## Header, ### Subheader
 * - Bold: **text**
 * - Italic: *text*
 * - Code: `code`
 * - Links: [text](url)
 * - Line breaks: Double newline for paragraphs
 *
 * ============================================================================
 * EXAMPLE 5: PLAIN TEXT RESPONSE (NO COMPONENT)
 * ============================================================================
 *
 * USE CASE: Simple factual queries that don't benefit from visual components
 * EXAMPLE QUERIES:
 *   - "How far is the Moon from Earth?"
 *   - "What is a light year?"
 *   - "How hot is the Sun's core?"
 *
 * RESPONSE FORMAT:
 * {
 *   answer: "The Moon orbits Earth at an average distance of 384,400 kilometers (238,855 miles). This distance varies slightly due to the Moon's elliptical orbit, ranging from about 356,500 km at perigee (closest) to 406,700 km at apogee (farthest)."
 * }
 *
 * NOTE: When components array is omitted or empty, only the text answer is displayed.
 *
 * ============================================================================
 * MULTIPLE COMPONENTS EXAMPLE
 * ============================================================================
 *
 * You can return multiple components in a single response. For example, when
 * asked "What are all the planets in our solar system?", you could return
 * multiple planet-card components:
 *
 * {
 *   answer: "Our Solar System has 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.",
 *   components: [
 *     { type: "planet-card", props: { name: "Mercury", ... } },
 *     { type: "planet-card", props: { name: "Venus", ... } },
 *     { type: "planet-card", props: { name: "Earth", ... } },
 *     // ... etc
 *   ]
 * }
 *
 * ============================================================================
 * IMPLEMENTATION NOTES
 * ============================================================================
 *
 * 1. Always include a text 'answer' field - this is the primary response
 * 2. Components are optional enhancements to visualize the data
 * 3. Match component props exactly to the interfaces in types/ui-spec.ts
 * 4. Use appropriate component types based on the query context
 * 5. For complex queries, consider combining multiple components
 * 6. Ensure all required props are provided for each component type
 * 7. Follow OWASP security standards - validate and sanitize all data
 *
 * ============================================================================
 */

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Space query result interface
 * Matches the StockQueryResult interface expected by the frontend
 */
interface SpaceQueryResult {
  answer: string;
  components?: Array<{
    type: string;
    props: Record<string, any>;
    id?: string;
  }>;
  error?: string;
}

/**
 * Validate and sanitize question input
 * Following OWASP security standards for input validation
 */
function validateQuestion(question: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Question is required and must be a string' };
  }

  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Question cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Question too long (max 500 characters)' };
  }

  // Basic sanitization - remove control characters to prevent injection attacks
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  return { valid: true, sanitized };
}

/**
 * Mock space query responses for development
 * TODO: Replace with actual Langflow integration when space flow is configured
 */
function getMockSpaceResponse(question: string): SpaceQueryResult {
  const lowerQuestion = question.toLowerCase();
  
  console.log('[Space API] Mock response - Processing question:', question);
  console.log('[Space API] Mock response - Lowercase question:', lowerQuestion);
  
  // Check for "show me the solar system" - interactive visualization
  if ((lowerQuestion.includes('show') && lowerQuestion.includes('solar system')) ||
      lowerQuestion.includes('visualize') && lowerQuestion.includes('solar system') ||
      lowerQuestion.includes('display') && lowerQuestion.includes('solar system')) {
    console.log('[Space API] Mock response - Matched: Solar System Visualization');
    return {
      answer: 'Here\'s an interactive visualization of our solar system! You can see all 8 planets orbiting the Sun. Click on any planet to learn more about it, and use the controls at the bottom to adjust the animation speed or pause the simulation.',
      components: [
        {
          type: 'solar-system',
          props: {
            name: 'Solar System',
            description: 'Our home planetary system with 8 planets',
            autoPlay: true,
            timeScale: 10
          }
        }
      ]
    };
  }
  
  // Detect space-related topics with flexible matching
  // Check for "planets in solar system" questions first (before "sun" check)
  if ((lowerQuestion.includes('planets') && lowerQuestion.includes('solar system')) ||
      lowerQuestion.includes('all planets') ||
      lowerQuestion.includes('8 planets')) {
    console.log('[Space API] Mock response - Matched: Solar System Planets');
    return {
      answer: 'Our Solar System has 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. They are divided into terrestrial planets (rocky) and gas giants.',
      components: [
        {
          type: 'planet-card',
          props: {
            name: 'Mercury',
            description: 'The smallest and innermost planet, with extreme temperature variations.',
            diameter: '4,879 km',
            mass: '3.30 × 10²³ kg',
            distanceFromSun: '57.9 million km',
            orbitalPeriod: '88 Earth days',
            moons: 0
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Venus',
            description: 'The hottest planet with a thick, toxic atmosphere of carbon dioxide.',
            diameter: '12,104 km',
            mass: '4.87 × 10²⁴ kg',
            distanceFromSun: '108.2 million km',
            orbitalPeriod: '225 Earth days',
            moons: 0
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Earth',
            description: 'Our home planet, the only known world with life.',
            diameter: '12,742 km',
            mass: '5.97 × 10²⁴ kg',
            distanceFromSun: '149.6 million km',
            orbitalPeriod: '365.25 Earth days',
            moons: 1
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Mars',
            description: 'The Red Planet, known for its rusty color caused by iron oxide.',
            diameter: '6,779 km',
            mass: '6.39 × 10²³ kg',
            distanceFromSun: '227.9 million km',
            orbitalPeriod: '687 Earth days',
            moons: 2
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Jupiter',
            description: 'The largest planet, a gas giant with the Great Red Spot storm.',
            diameter: '139,820 km',
            mass: '1.898 × 10²⁷ kg',
            distanceFromSun: '778.5 million km',
            orbitalPeriod: '11.9 Earth years',
            moons: 95
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Saturn',
            description: 'Famous for its spectacular ring system made of ice and rock.',
            diameter: '116,460 km',
            mass: '5.68 × 10²⁶ kg',
            distanceFromSun: '1.43 billion km',
            orbitalPeriod: '29.5 Earth years',
            moons: 146
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Uranus',
            description: 'An ice giant that rotates on its side, giving it extreme seasons.',
            diameter: '50,724 km',
            mass: '8.68 × 10²⁵ kg',
            distanceFromSun: '2.87 billion km',
            orbitalPeriod: '84 Earth years',
            moons: 27
          }
        },
        {
          type: 'planet-card',
          props: {
            name: 'Neptune',
            description: 'The windiest planet with supersonic winds and a deep blue color.',
            diameter: '49,244 km',
            mass: '1.02 × 10²⁶ kg',
            distanceFromSun: '4.50 billion km',
            orbitalPeriod: '165 Earth years',
            moons: 14
          }
        }
      ]
    };
  }
  
  if (lowerQuestion.includes('mars') || lowerQuestion.includes('red planet')) {
    console.log('[Space API] Mock response - Matched: Mars');
    return {
      answer: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Known as the "Red Planet" due to iron oxide on its surface, Mars has a thin atmosphere and features the largest volcano in the solar system, Olympus Mons.',
      components: [
        {
          type: 'planet-card',
          props: {
            name: 'Mars',
            description: 'The Red Planet, known for its rusty color caused by iron oxide on its surface. Home to Olympus Mons, the largest volcano in the solar system.',
            diameter: '6,779 km',
            mass: '6.39 × 10²³ kg',
            distanceFromSun: '227.9 million km',
            orbitalPeriod: '687 Earth days',
            moons: 2
          }
        }
      ]
    };
  }
  
  if (lowerQuestion.includes('moon') || lowerQuestion.includes('lunar')) {
    console.log('[Space API] Mock response - Matched: Moon');
    return {
      answer: 'The Moon is Earth\'s only natural satellite. It orbits Earth at an average distance of 384,400 km and has a significant influence on Earth\'s tides and climate.',
      components: [
        {
          type: 'planet-card',
          props: {
            name: 'The Moon',
            description: 'Earth\'s only natural satellite and the fifth largest moon in the solar system. Its gravitational influence produces ocean tides and stabilizes Earth\'s axial tilt.',
            diameter: '3,474 km',
            mass: '7.34 × 10²² kg',
            distanceFromSun: '384,400 km from Earth',
            orbitalPeriod: '27.3 Earth days',
            moons: 0
          }
        }
      ]
    };
  }
  
  if (lowerQuestion.includes('jupiter') || lowerQuestion.includes('gas giant')) {
    console.log('[Space API] Mock response - Matched: Jupiter');
    return {
      answer: 'Jupiter is the largest planet in our Solar System, a gas giant with a mass more than twice that of all other planets combined. It features the famous Great Red Spot, a giant storm that has raged for centuries.',
      components: [
        {
          type: 'planet-card',
          props: {
            name: 'Jupiter',
            description: 'The gas giant with the Great Red Spot, a massive storm larger than Earth. Jupiter has the strongest magnetic field of any planet and acts as a cosmic vacuum cleaner, protecting inner planets.',
            diameter: '139,820 km',
            mass: '1.898 × 10²⁷ kg',
            distanceFromSun: '778.5 million km',
            orbitalPeriod: '11.9 Earth years',
            moons: 95
          }
        }
      ]
    };
  }
  
  if (lowerQuestion.includes('sun') || lowerQuestion.includes('solar') || lowerQuestion.includes('star')) {
    console.log('[Space API] Mock response - Matched: Sun');
    return {
      answer: 'The Sun is the star at the center of our Solar System. It\'s a nearly perfect sphere of hot plasma, containing 99.86% of the total mass of the Solar System.',
      components: [
        {
          type: 'space-timeline',
          props: {
            title: 'Solar Activity Timeline',
            events: [
              {
                date: '4.6 billion years ago',
                title: 'Sun Formation',
                description: 'The Sun formed from a collapsing molecular cloud in the Milky Way galaxy',
                type: 'discovery'
              },
              {
                date: '1859',
                title: 'Carrington Event',
                description: 'Largest recorded solar storm in history, causing widespread telegraph system failures',
                type: 'observation'
              },
              {
                date: '2024',
                title: 'Solar Maximum',
                description: 'Peak of current solar cycle 25, with increased sunspot activity and solar flares',
                type: 'observation'
              }
            ]
          }
        }
      ]
    };
  }
  
  if (lowerQuestion.includes('orion') || lowerQuestion.includes('constellation')) {
    console.log('[Space API] Mock response - Matched: Orion/Constellation');
    return {
      answer: 'Orion is one of the most recognizable constellations in the night sky. Named after a hunter in Greek mythology, it contains some of the brightest stars visible from Earth.',
      components: [
        {
          type: 'constellation',
          props: {
            name: 'Orion',
            abbreviation: 'Ori',
            description: 'The Hunter constellation, one of the most prominent and recognizable patterns in the night sky. Features the famous Orion\'s Belt asterism and the Orion Nebula.',
            brightestStar: 'Rigel (β Orionis)',
            visibility: 'Visible worldwide, best seen December-March',
            stars: [
              { name: 'Rigel', magnitude: 0.13 },
              { name: 'Betelgeuse', magnitude: 0.50 },
              { name: 'Bellatrix', magnitude: 1.64 },
              { name: 'Alnilam', magnitude: 1.69 },
              { name: 'Alnitak', magnitude: 1.77 },
              { name: 'Saiph', magnitude: 2.09 }
            ]
          }
        }
      ]
    };
  }
  
  // Default response for general space questions
  console.log('[Space API] Mock response - Matched: Default/General');
  return {
    answer: 'I can help you explore the cosmos! Ask me about planets, moons, stars, galaxies, or any astronomical phenomena. For example, you could ask about Mars, the Moon, Jupiter, or the Sun.',
    components: [
      {
        type: 'alert-box',
        props: {
          message: 'Try asking about specific celestial bodies like planets, moons, or stars!',
          severity: 'info',
          title: 'Space Explorer Ready'
        }
      }
    ]
  };
}

/**
 * POST /api/ask-space
 * Handle space/astronomy related questions
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Space API] Received POST request');
    const body = await request.json();
    const { question, session_id } = body;
    console.log('[Space API] Raw question from body:', question);

    // Validate and sanitize input
    const validation = validateQuestion(question);
    if (!validation.valid) {
      console.log('[Space API] Validation failed:', validation.error);
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    // Validate session_id if provided (OWASP security: input validation)
    if (session_id !== undefined && typeof session_id !== 'string') {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'session_id must be a string' },
        { status: 400 }
      );
    }

    console.log('[Space API] Validation passed. Sanitized question:', validation.sanitized);
    console.log('[Space API] Session ID provided:', !!session_id);

    // Query Langflow with sanitized input using the 'space' theme
    // Falls back to mock responses if Langflow is not configured or fails
    let result: SpaceQueryResult;
    
    try {
      console.log('[Space API] Attempting Langflow query with space theme');
      result = await queryLangflow(validation.sanitized!, 'space', session_id);
      console.log('[Space API] Langflow response received:', {
        hasAnswer: !!result.answer,
        answerLength: result.answer?.length,
        hasComponents: !!result.components,
        componentCount: result.components?.length,
        hasError: !!result.error
      });
    } catch (error) {
      console.warn('[Space API] Langflow query failed, falling back to mock responses:', error);
      result = getMockSpaceResponse(validation.sanitized!);
      console.log('[Space API] Mock response generated:', {
        hasAnswer: !!result.answer,
        answerLength: result.answer?.length,
        hasComponents: !!result.components,
        componentCount: result.components?.length,
        hasError: !!result.error
      });
    }
    
    console.log('[Space API] Final result prepared:', {
      hasAnswer: !!result.answer,
      answerLength: result.answer?.length,
      hasComponents: !!result.components,
      componentCount: result.components?.length,
      hasError: !!result.error
    });

    if (result.error) {
      console.log('[Space API] Result contains error:', result.error);
      return NextResponse.json<ApiErrorResponse>(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log('[Space API] Returning successful response');
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Space API] Route error:', error);
    
    // Provide more context in development for debugging
    const errorMessage = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error';
    
    const response: ApiErrorResponse = {
      error: 'Internal server error',
    };

    // Include error details in development mode only
    if (process.env.NODE_ENV === 'development') {
      response.details = errorMessage;
    }

    return NextResponse.json(response, { status: 500 });
  }
}

// Made with Bob