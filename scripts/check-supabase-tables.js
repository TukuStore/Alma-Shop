/**
 * Check Supabase tables and structure
 * Run with: node scripts/check-supabase-tables.js
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Checking Supabase Database ===\n');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = ['categories', 'products', 'profiles', 'addresses', 'orders', 'order_items', 'wishlist_items'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table '${table}' does NOT exist`);
        } else {
          console.log(`⚠️  Table '${table}': ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' exists (${data.length} rows)`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Error - ${err.message}`);
    }
  }
}

checkTables().then(() => {
  console.log('\n=== Done ===');
}).catch(err => {
  console.error('Error:', err);
});
