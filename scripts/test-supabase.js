
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables.');
    console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log(`URL: ${supabaseUrl}`);

    try {
        // 1. Fetch Categories
        console.log('\n--- Fetching Categories ---');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .limit(5);

        if (catError) {
            console.error('❌ Error fetching categories:', catError.message);
        } else {
            console.log(`✅ Success! Found ${categories.length} categories.`);
            if (categories.length > 0) {
                console.log('Sample:', categories[0].name);
            } else {
                console.warn('⚠️ No categories found. Did you run the seed script?');
            }
        }

        // 2. Fetch Products
        console.log('\n--- Fetching Products ---');
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name, price')
            .limit(3);

        if (prodError) {
            console.error('❌ Error fetching products:', prodError.message);
        } else {
            console.log(`✅ Success! Found ${products.length} products.`);
            if (products.length > 0) {
                console.log('Sample:', products[0].name, '-', products[0].price);
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
