export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  pappers: {
    apiToken: process.env.PAPPERS_API_TOKEN || '',
    baseUrl: 'https://api.pappers.fr/v2',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '86400', 10),
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
  },
});
