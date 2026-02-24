/**
 * Test script to verify Supabase connection using https module
 * Run with: node scripts/test-https.js
 */

require('dotenv').config({ path: '.env' });
const https = require('https');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

console.log('=== Supabase HTTPS Connection Test ===\n');
console.log('Testing URL:', supabaseUrl);

try {
  const url = new URL(supabaseUrl);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000,
  };

  const req = https.request(options, (res) => {
    console.log('\n✅ Successfully connected to Supabase!');
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
  });

  req.on('error', (error) => {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\nPossible causes:');
    console.log('  1. No internet connection');
    console.log('  2. DNS resolution failed');
    console.log('  3. Firewall blocking the connection');
    console.log('  4. Supabase URL is incorrect');
  });

  req.on('timeout', () => {
    console.error('\n❌ Connection timed out');
    req.destroy();
  });

  req.end();
} catch (error) {
  console.error('❌ Error:', error.message);
}
