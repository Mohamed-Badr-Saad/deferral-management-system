// // src/lib/db.ts
// import { drizzle } from 'drizzle-orm/neon-http';
// import { neon } from '@neondatabase/serverless';
// import * as schema from './db/schema';

// const sql = neon(process.env.DATABASE_URL!);

// export const db = drizzle(sql, { schema });



import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
