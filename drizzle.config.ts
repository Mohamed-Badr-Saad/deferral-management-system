import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL); // DEBUG

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ← Use env variable, not hardcoded
  },
});
