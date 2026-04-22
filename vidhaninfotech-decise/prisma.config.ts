import { defineConfig, env } from 'prisma/config';

// Prisma 7.x requires the datasource URL to be supplied here (in prisma.config.ts)
// rather than in the `datasource` block of schema.prisma.
// See: https://pris.ly/d/config-datasource
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
