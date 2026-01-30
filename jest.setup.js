// Import jest-dom matchers
import '@testing-library/jest-dom'

// Import canvas mock for Chart.js
// Mock d3-geo to avoid ES module issues in Jest
jest.mock('d3-geo')

import 'jest-canvas-mock'

// Mock Next.js Request and Response for API route testing
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.body = init?.body;
      this._bodyInit = init?.body;
    }
    
    async json() {
      if (typeof this._bodyInit === 'string') {
        return JSON.parse(this._bodyInit);
      }
      return this._bodyInit;
    }
    
    async text() {
      return typeof this._bodyInit === 'string' ? this._bodyInit : JSON.stringify(this._bodyInit);
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super(init ? Object.entries(init) : []);
    }
    
    get(name) {
      return super.get(name.toLowerCase());
    }
    
    set(name, value) {
      return super.set(name.toLowerCase(), value);
    }
    
    has(name) {
      return super.has(name.toLowerCase());
    }
  };
}

// Mock Web Audio API (simple mock without external library)
global.AudioContext = class AudioContext {
  constructor() {
    this.destination = {}
    this.sampleRate = 44100
    this.currentTime = 0
    this.state = 'running'
  }
  createGain() {
    return { connect: jest.fn(), disconnect: jest.fn(), gain: { value: 1 } }
  }
  createOscillator() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 440 }
    }
  }
  createAnalyser() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn()
    }
  }
  close() {
    return Promise.resolve()
  }
  resume() {
    return Promise.resolve()
  }
  suspend() {
    return Promise.resolve()
  }
}

global.OfflineAudioContext = global.AudioContext

// Mock Web Speech API
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text
    this.lang = 'en-US'
    this.voice = null
    this.volume = 1
    this.rate = 1
    this.pitch = 1
    this.onstart = null
    this.onend = null
    this.onerror = null
    this.onpause = null
    this.onresume = null
    this.onmark = null
    this.onboundary = null
  }
}

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null,
}

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.load = jest.fn()
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
window.HTMLMediaElement.prototype.pause = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console errors in tests (optional - remove if you want to see all errors)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Setup MSW
// NOTE: MSW v2 has ESM compatibility issues with Jest in Node.js environment
// For API mocking in tests, you can:
// 1. Import and setup MSW directly in individual test files that need it
// 2. Use manual mocks in __mocks__ directories
// 3. Wait for better Jest ESM support or use Vitest instead
//
// Uncomment below when MSW/Jest ESM issues are resolved:
// import { server } from './__tests__/mocks/server'
// beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// Made with Bob
