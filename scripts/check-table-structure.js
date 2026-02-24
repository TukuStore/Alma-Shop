/**
 * Check table structure
 */
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStructure() {
  console.log('=== Categories Table ===');
  const { data: categories } = await supabase
    .from('categories')
    .select('*');
  console.log(JSON.stringify(categories, null, 2));

  console.log('\n=== Products Table ===');
  const { data: products } = await supabase
    .from('products')
    .select('*');
  console.log(JSON.stringify(products, null, 2));
}

checkStructure().catch(console.error);
