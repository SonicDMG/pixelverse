/**
 * Environment Variable Validation Utility
 *
 * Validates required environment variables at application startup.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Validators ────────────────────────────────────────────────────────────

function validateApiKey(value: string): boolean {
  return value.length > 0 && value.trim().length > 0;
}

function validateAuthPassword(value: string): boolean {
  return value.length >= 8;
}

function validateNodeEnv(value: string): boolean {
  return ['development', 'production', 'test'].includes(value);
}

// ── Required vars config ──────────────────────────────────────────────────

interface EnvVarConfig {
  required: boolean;
  validator: (value: string) => boolean;
  description: string;
  errorMessage?: string;
}

const REQUIRED_ENV_VARS: Record<string, EnvVarConfig> = {
  LLM_API_KEY: {
    required: true,
    validator: validateApiKey,
    description: 'LLM API key (OpenAI-compatible)',
    errorMessage: 'LLM_API_KEY must be set and non-empty',
  },
  EVERART_API_KEY: {
    required: true,
    validator: validateApiKey,
    description: 'EverArt API key for image generation',
    errorMessage: 'EVERART_API_KEY must be set and non-empty',
  },
  AUTH_PASSWORD: {
    required: true,
    validator: validateAuthPassword,
    description: 'Application authentication password (min 8 chars)',
    errorMessage: 'AUTH_PASSWORD must be at least 8 characters long',
  },
  NODE_ENV: {
    required: false,
    validator: validateNodeEnv,
    description: 'Node environment (development, production, or test)',
    errorMessage: 'NODE_ENV must be one of: development, production, test',
  },
};

// ── Public API ────────────────────────────────────────────────────────────

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    if (config.required && (!value || value.trim() === '')) {
      errors.push(`${key} is required but not set. ${config.errorMessage || config.description}`);
      continue;
    }

    if (!config.required && (!value || value.trim() === '')) continue;

    if (value && !config.validator(value)) {
      errors.push(`${key} validation failed. ${config.errorMessage || config.description}`);
    }
  }

  // Optional advisory checks
  if (!process.env.EMBED_API_KEY && !process.env.LLM_API_KEY) {
    warnings.push('EMBED_API_KEY not set — vector search will be disabled (FTS-only)');
  }

  if (!process.env.RAG_DB_PATH) {
    warnings.push('RAG_DB_PATH not set — using default data/corpus.db. Run: npx tsx scripts/ingest-corpus.ts');
  }

  if (process.env.NODE_ENV === 'production' && process.env.AUTH_PASSWORD && process.env.AUTH_PASSWORD.length < 12) {
    warnings.push('AUTH_PASSWORD is less than 12 characters — consider a longer password in production');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateEnvironmentOrExit(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nSee .env.example for reference.\n');
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log('✅ Environment validation passed');
}

/**
 * Get a validated environment variable at runtime.
 * @throws if the variable is missing or fails validation.
 */
export function getValidatedEnvVar(key: keyof typeof REQUIRED_ENV_VARS): string {
  const value = process.env[key];
  const config = REQUIRED_ENV_VARS[key];

  if (!value || value.trim() === '') {
    throw new Error(`${key} is not set. ${config.description}`);
  }

  if (!config.validator(value)) {
    throw new Error(`${key} validation failed. ${config.errorMessage || config.description}`);
  }

  return value;
}

// Made with Bob
