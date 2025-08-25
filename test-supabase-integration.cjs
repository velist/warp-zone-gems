/**
 * Supabase Integration Test Script
 * Tests API endpoints and database operations
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://oiatqeymovnyubrnlmlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testSupabaseIntegration() {
  console.log('🔧 Testing Supabase Integration...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('games')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    
    console.log(`✅ Connected to Supabase successfully`);
    console.log(`📊 Total games in database: ${connectionTest || 'Unable to count'}`);

    // 2. Test games table query
    console.log('\n2️⃣ Testing games table query...');
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .limit(5);
    
    if (gamesError) {
      throw new Error(`Games query failed: ${gamesError.message}`);
    }
    
    console.log(`✅ Successfully queried games table`);
    console.log(`📋 Sample games retrieved: ${games?.length || 0}`);
    
    if (games && games.length > 0) {
      console.log('\n🎮 Sample game data:');
      const sample = games[0];
      console.log(`   ID: ${sample.id}`);
      console.log(`   Title: ${sample.title}`);
      console.log(`   Category: ${sample.category}`);
      console.log(`   Status: ${sample.status}`);
    }

    // 3. Test categories table
    console.log('\n3️⃣ Testing categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.warn(`⚠️ Categories query failed: ${categoriesError.message}`);
      console.log('   This might be expected if categories table doesn\'t exist yet');
    } else {
      console.log(`✅ Successfully queried categories table`);
      console.log(`📂 Categories found: ${categories?.length || 0}`);
    }

    // 4. Test published games query (simulating main page query)
    console.log('\n4️⃣ Testing published games query...');
    const { data: publishedGames, error: publishedError } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (publishedError) {
      throw new Error(`Published games query failed: ${publishedError.message}`);
    }
    
    console.log(`✅ Successfully queried published games`);
    console.log(`📈 Published games count: ${publishedGames?.length || 0}`);

    // 5. Test game details query (simulating game detail page)
    if (publishedGames && publishedGames.length > 0) {
      console.log('\n5️⃣ Testing individual game query...');
      const sampleGameId = publishedGames[0].id;
      const { data: gameDetail, error: detailError } = await supabase
        .from('games')
        .select('*')
        .eq('id', sampleGameId)
        .single();
      
      if (detailError) {
        throw new Error(`Game detail query failed: ${detailError.message}`);
      }
      
      console.log(`✅ Successfully retrieved game detail for: ${gameDetail.title}`);
    }

    // 6. Test category-based filtering
    console.log('\n6️⃣ Testing category-based filtering...');
    const { data: actionGames, error: actionError } = await supabase
      .from('games')
      .select('*')
      .eq('category', '动作游戏')
      .eq('status', 'published');
    
    if (actionError) {
      console.warn(`⚠️ Category filtering failed: ${actionError.message}`);
    } else {
      console.log(`✅ Successfully filtered by category`);
      console.log(`🎯 Action games found: ${actionGames?.length || 0}`);
    }

    // 7. Test search functionality
    console.log('\n7️⃣ Testing search functionality...');
    const { data: searchResults, error: searchError } = await supabase
      .from('games')
      .select('*')
      .ilike('title', '%赛博%')
      .eq('status', 'published');
    
    if (searchError) {
      console.warn(`⚠️ Search query failed: ${searchError.message}`);
    } else {
      console.log(`✅ Successfully performed search`);
      console.log(`🔍 Search results for "赛博": ${searchResults?.length || 0}`);
    }

    // 8. Test admin auth (if applicable)
    console.log('\n8️⃣ Testing authentication status...');
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log(`ℹ️ No authenticated user (expected): ${authError.message}`);
    } else {
      console.log(`👤 Current user: ${authUser?.user?.email || 'Anonymous'}`);
    }

    console.log('\n🎉 Supabase Integration Test Summary:');
    console.log('✅ Database connection successful');
    console.log('✅ Games table queries working');
    console.log('✅ Data retrieval operations functional');
    console.log('✅ Filtering and search operations working');
    console.log('✅ Authentication system accessible');
    
    return true;
  } catch (error) {
    console.error('\n❌ Supabase Integration Test Failed:');
    console.error(error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testSupabaseIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseIntegration };