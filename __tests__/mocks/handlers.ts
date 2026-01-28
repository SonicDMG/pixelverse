import { http, HttpResponse } from 'msw'

/**
 * MSW Mock Handlers for PixelTicker API Routes
 * 
 * These handlers intercept HTTP requests during testing and return mock responses.
 * This allows us to test components and services without making real API calls.
 */

// Base URL for API routes
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const handlers = [
  /**
   * Mock handler for /api/ask-stock
   * Returns a mock stock query response with chart data
   */
  http.post(`${API_BASE}/api/ask-stock`, async ({ request }) => {
    const body = await request.json() as { question: string; session_id?: string }
    
    // Validate request
    if (!body.question || typeof body.question !== 'string') {
      return HttpResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      )
    }

    // Mock successful response
    return HttpResponse.json({
      answer: 'Apple Inc. (AAPL) is currently trading at $150.25, up 2.5% today. The stock has shown strong performance over the past quarter.',
      components: [
        {
          type: 'stock-chart',
          props: {
            symbol: 'AAPL',
            data: [
              { date: '2024-01-01', price: 145.0 },
              { date: '2024-01-02', price: 147.5 },
              { date: '2024-01-03', price: 150.25 },
            ],
            timeRange: '1D'
          }
        }
      ]
    })
  }),

  /**
   * Mock handler for /api/ask-space
   * Returns a mock space query response with celestial body data
   */
  http.post(`${API_BASE}/api/ask-space`, async ({ request }) => {
    const body = await request.json() as { question: string; session_id?: string }
    
    // Validate request
    if (!body.question || typeof body.question !== 'string') {
      return HttpResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      )
    }

    const lowerQuestion = body.question.toLowerCase()

    // Return different responses based on question content
    if (lowerQuestion.includes('mars')) {
      return HttpResponse.json({
        answer: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System.',
        components: [
          {
            type: 'celestial-body-card',
            props: {
              name: 'Mars',
              bodyType: 'planet',
              description: 'The Red Planet, known for its rusty color caused by iron oxide.',
              diameter: '6,779 km',
              mass: '6.39 × 10²³ kg',
              distanceFrom: '227.9 million km',
              distanceFromLabel: 'Distance from Sun',
              orbitalPeriod: '687 Earth days',
              satellites: 2,
              satelliteLabel: 'Moons',
              planetType: 'terrestrial',
              enableImageGeneration: true
            }
          }
        ]
      })
    }

    if (lowerQuestion.includes('orion') || lowerQuestion.includes('constellation')) {
      return HttpResponse.json({
        answer: 'Orion is one of the most recognizable constellations in the night sky.',
        components: [
          {
            type: 'constellation',
            props: {
              name: 'Orion',
              abbreviation: 'Ori',
              description: 'The Hunter constellation, featuring the famous Orion\'s Belt.',
              brightestStar: 'Rigel (β Orionis)',
              visibility: 'Visible worldwide, best seen December-March',
              stars: [
                { name: 'Rigel', magnitude: 0.13 },
                { name: 'Betelgeuse', magnitude: 0.50 },
                { name: 'Bellatrix', magnitude: 1.64 },
                { name: 'Alnilam', magnitude: 1.69 }
              ]
            }
          }
        ]
      })
    }

    // Default space response
    return HttpResponse.json({
      answer: 'I can help you explore the cosmos! Ask me about planets, moons, stars, or galaxies.',
      components: []
    })
  }),

  /**
   * Mock handler for /api/music/[theme]
   * Returns a list of available music files for a theme
   */
  http.get(`${API_BASE}/api/music/:theme`, ({ params }) => {
    const { theme } = params

    // Validate theme
    if (theme !== 'ticker' && theme !== 'space') {
      return HttpResponse.json(
        { 
          error: 'Invalid theme ID',
          message: `Theme '${theme}' is not valid.`
        },
        { status: 400 }
      )
    }

    // Return mock music files based on theme
    if (theme === 'ticker') {
      return HttpResponse.json({
        files: [
          'Push Thru - The Grey Room _ Golden Palms.mp3',
          'Smooth and Cool - Nico Staf.mp3',
          'The Fifth Quadrant - Dan _Lebo_ Lebowitz, Tone Seeker.mp3'
        ]
      })
    }

    if (theme === 'space') {
      return HttpResponse.json({
        files: [
          'Equatorial Complex.mp3',
          'Galactic Rap.mp3',
          'Inspired.mp3',
          'Spacial Harvest.mp3'
        ]
      })
    }

    // Fallback
    return HttpResponse.json({ files: [] })
  }),

  /**
   * Mock handler for EverArt API (image generation)
   * Returns a mock image generation response
   */
  http.post('https://api.everart.ai/v1/images/generations', async ({ request }) => {
    const body = await request.json() as { prompt: string }
    
    if (!body.prompt) {
      return HttpResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Mock successful image generation
    return HttpResponse.json({
      id: 'mock-generation-id',
      status: 'completed',
      images: [
        {
          url: 'https://example.com/mock-image.jpg',
          width: 1024,
          height: 1024
        }
      ]
    })
  }),
]

// Made with Bob
