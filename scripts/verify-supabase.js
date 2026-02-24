/**
 * Final verification script - Test Supabase connection with actual queries
 */
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Supabase Connection Verification ===\n');
console.log('URL:', supabaseUrl?.substring(0, 40) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Test 1: Fetch categories
    console.log('\n1. Testing categories fetch...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(3);

    if (catError) throw catError;
    console.log(`   ✅ Success! Found ${categories.length} categories`);
    categories.forEach(c => console.log(`      - ${c.name}`));

    // Test 2: Fetch featured products
    console.log('\n2. Testing featured products fetch...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('is_featured', true)
      .limit(3);

    if (prodError) throw prodError;
    console.log(`   ✅ Success! Found ${products.length} featured products`);
    products.forEach(p => console.log(`      - ${p.name} (Rp ${p.price.toLocaleString()})`));

    console.log('\n=== All Tests Passed! ✅ ===');
    console.log('\nYour app is ready to use Supabase data.');
    console.log('Press "R" in Expo terminal to reload the app.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetails:', error);
  }
}

verify();
