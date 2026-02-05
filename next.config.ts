import type { NextConfig } from "next";
import { validateEnvironment } from './lib/env-validation';

// Skip validation during test runs and builds
// Validation will occur at runtime when the application starts
const shouldValidate = process.env.NODE_ENV !== 'test' && process.env.SKIP_ENV_VALIDATION !== 'true';

if (shouldValidate) {
  // Validate environment variables at config load time
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    console.error('❌ Environment validation failed:');
    envValidation.errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease check your .env.local file and ensure all required environment variables are set.');
    console.error('See .env.example for reference.\n');
    console.error('To skip validation during build, set SKIP_ENV_VALIDATION=true\n');
    process.exit(1);
  }

  if (envValidation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    envValidation.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log('✅ Environment validation passed');
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/storage.catbird.ai/**',
      },
      {
        protocol: 'https',
        hostname: '*.everart.ai',
      },
    ],
  },
  async headers() {
    // Determine if we're in production mode
    const isProd = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP)
          // Strengthened to remove unsafe-eval and unsafe-inline directives
          {
            key: 'Content-Security-Policy',
            value: [
              // Default fallback for all resource types
              "default-src 'self'",
              
              // Scripts: Allow self-hosted scripts only
              // Note: In development, Next.js requires both unsafe-eval (for HMR) and unsafe-inline (for dev tools)
              // In production, all unsafe directives are removed for maximum security
              isProd
                ? "script-src 'self'"
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              
              // Styles: Allow self-hosted, Google Fonts, and inline styles
              // Note: React inline styles (style prop) require 'unsafe-inline' in Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              
              // Images: Allow self, data URIs, blobs, and trusted image sources
              "img-src 'self' data: blob: https://*.everart.ai https://storage.googleapis.com",
              
              // AJAX/WebSocket connections: Allow self and trusted APIs
              "connect-src 'self' https://api.everart.ai",
              
              // Fonts: Allow self, data URIs, and Google Fonts
              "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
              
              // Media: Allow self-hosted and blob URLs (for audio/video)
              "media-src 'self' blob:",
              
              // Frames/iframes: Only allow same-origin
              "frame-src 'self'",
              
              // Object/embed/applet: Block all plugins
              "object-src 'none'",
              
              // Base tag: Only allow same-origin
              "base-uri 'self'",
              
              // Form submissions: Only allow same-origin
              "form-action 'self'",
              
              // Embedding this site in frames: Block all (clickjacking protection)
              "frame-ancestors 'none'",
              
              // Upgrade insecure requests to HTTPS
              "upgrade-insecure-requests",
            ].join('; '),
          },
          
          // X-Frame-Options: Prevent clickjacking attacks
          // DENY prevents the page from being displayed in any frame
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          
          // X-Content-Type-Options: Prevent MIME type sniffing
          // Forces browsers to respect the Content-Type header
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          
          // Referrer-Policy: Control referrer information
          // strict-origin-when-cross-origin sends full URL for same-origin,
          // only origin for cross-origin HTTPS, and nothing for HTTP
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          
          // Permissions-Policy: Control browser features
          // Disable camera, microphone, and geolocation access
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          
          // X-XSS-Protection: Legacy XSS protection for older browsers
          // Modern browsers use CSP instead, but this helps legacy browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Made with Bob
