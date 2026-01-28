import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Server Setup for Node.js Testing Environment
 * 
 * This creates a mock server that intercepts HTTP requests during tests.
 * The server is configured in jest.setup.js to start before all tests,
 * reset after each test, and close after all tests complete.
 */
export const server = setupServer(...handlers)

// Made with Bob
