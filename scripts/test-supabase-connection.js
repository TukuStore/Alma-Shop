/**
 * Test script to verify Supabase connection and environment variables
 * Run with: node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Supabase Connection Test ===\n');

console.log('Environment Variables:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ ERROR: Environment variables are not set!');
  console.log('Please check your .env file contains:');
  console.log('  EXPO_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log('\n✅ Environment variables are set');
console.log('\nAttempting to connect to Supabase...');

// Test fetch connection
fetch(supabaseUrl)
  .then(response => {
    console.log('✅ Successfully connected to Supabase!');
    console.log('Status:', response.status);
  })
  .catch(error => {
    console.error('❌ Connection failed:', error.message);
    console.log('\nThis might be due to:');
    console.log('  1. No internet connection');
    console.log('  2. Supabase URL is incorrect');
    console.log('  3. Firewall/network restrictions');
  });

console.log('\n=== End of Test ===');
