import { NextRequest, NextResponse } from 'next/server';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Space query result interface
 */
interface SpaceQueryResult {
  text: string;
  ui_spec?: {
    components?: Array<{
      type: string;
      props: Record<string, any>;
      id?: string;
    }>;
  };
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
  
  // Detect space-related topics
  if (lowerQuestion.includes('mars') || lowerQuestion.includes('red planet')) {
    return {
      text: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Known as the "Red Planet" due to iron oxide on its surface, Mars has a thin atmosphere and features the largest volcano in the solar system, Olympus Mons.',
      ui_spec: {
        components: [
          {
            type: 'metric-grid',
            props: {
              metrics: [
                { label: 'Distance from Sun', value: '227.9M km', icon: '🌍' },
                { label: 'Diameter', value: '6,779 km', icon: '📏' },
                { label: 'Day Length', value: '24.6 hours', icon: '⏰' },
                { label: 'Year Length', value: '687 Earth days', icon: '📅' }
              ]
            }
          }
        ]
      }
    };
  }
  
  if (lowerQuestion.includes('moon') || lowerQuestion.includes('lunar')) {
    return {
      text: 'The Moon is Earth\'s only natural satellite. It orbits Earth at an average distance of 384,400 km and has a significant influence on Earth\'s tides and climate.',
      ui_spec: {
        components: [
          {
            type: 'metric-card',
            props: {
              title: 'Moon Distance',
              value: '384,400 km',
              subtitle: 'Average distance from Earth',
              change: 0
            }
          }
        ]
      }
    };
  }
  
  if (lowerQuestion.includes('jupiter') || lowerQuestion.includes('gas giant')) {
    return {
      text: 'Jupiter is the largest planet in our Solar System, a gas giant with a mass more than twice that of all other planets combined. It features the famous Great Red Spot, a giant storm that has raged for centuries.',
      ui_spec: {
        components: [
          {
            type: 'data-table',
            props: {
              title: 'Jupiter Facts',
              headers: ['Property', 'Value'],
              rows: [
                ['Mass', '1.898 × 10²⁷ kg'],
                ['Radius', '69,911 km'],
                ['Moons', '95 confirmed'],
                ['Rotation Period', '9.9 hours']
              ]
            }
          }
        ]
      }
    };
  }
  
  if (lowerQuestion.includes('sun') || lowerQuestion.includes('solar') || lowerQuestion.includes('star')) {
    return {
      text: 'The Sun is the star at the center of our Solar System. It\'s a nearly perfect sphere of hot plasma, containing 99.86% of the total mass of the Solar System.',
      ui_spec: {
        components: [
          {
            type: 'metric-grid',
            props: {
              metrics: [
                { label: 'Age', value: '4.6 billion years', icon: '⏳' },
                { label: 'Temperature', value: '5,778 K', icon: '🌡️' },
                { label: 'Diameter', value: '1.39M km', icon: '⭕' },
                { label: 'Mass', value: '1.989 × 10³⁰ kg', icon: '⚖️' }
              ]
            }
          }
        ]
      }
    };
  }
  
  // Default response for general space questions
  return {
    text: 'I can help you explore the cosmos! Ask me about planets, moons, stars, galaxies, or any astronomical phenomena. For example, you could ask about Mars, the Moon, Jupiter, or the Sun.',
    ui_spec: {
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
    }
  };
}

/**
 * POST /api/ask-space
 * Handle space/astronomy related questions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    // Validate and sanitize input
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    console.log('[Space API] Processing question:', validation.sanitized);

    // TODO: Replace with actual Langflow integration when space flow is configured
    // For now, use mock responses
    const result = getMockSpaceResponse(validation.sanitized!);

    if (result.error) {
      return NextResponse.json<ApiErrorResponse>(
        { error: result.error },
        { status: 500 }
      );
    }

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