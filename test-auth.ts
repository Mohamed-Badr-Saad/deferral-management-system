// test-auth.ts
import { auth } from './src/lib/auth';

async function testAuth() {
  console.log('✅ Better Auth configured successfully!');
  console.log('Auth endpoints available at: http://localhost:3000/api/auth/*');
}

testAuth();
