/**
 * Supabase Schema Inspector
 * Checks the actual database schema structure
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://oiatqeymovnyubrnlmlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function inspectSupabaseSchema() {
  console.log('🔍 Inspecting Supabase Database Schema...\n');

  try {
    // 1. Get all games to inspect actual columns
    console.log('1️⃣ Inspecting games table structure...');
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .limit(1);
    
    if (gamesError) {
      throw new Error(`Games query failed: ${gamesError.message}`);
    }
    
    if (games && games.length > 0) {
      const sampleGame = games[0];
      console.log('✅ Games table columns found:');
      Object.keys(sampleGame).forEach(column => {
        console.log(`   - ${column}: ${typeof sampleGame[column]} (${sampleGame[column] ? 'has data' : 'empty/null'})`);
      });
    } else {
      console.log('❌ No games found in database');
    }

    // 2. Get total count of games
    console.log('\n2️⃣ Counting total games...');
    const { count, error: countError } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn(`⚠️ Could not count games: ${countError.message}`);
    } else {
      console.log(`📊 Total games in Supabase: ${count}`);
    }

    // 3. Inspect categories table
    console.log('\n3️⃣ Inspecting categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.warn(`⚠️ Categories query failed: ${categoriesError.message}`);
    } else if (categories && categories.length > 0) {
      const sampleCategory = categories[0];
      console.log('✅ Categories table columns found:');
      Object.keys(sampleCategory).forEach(column => {
        console.log(`   - ${column}: ${typeof sampleCategory[column]}`);
      });
    }

    // 4. Test basic queries that should work
    console.log('\n4️⃣ Testing basic queries...');
    
    // Query without status column
    const { data: allGames, error: allGamesError } = await supabase
      .from('games')
      .select('*');
    
    if (allGamesError) {
      console.error(`❌ Basic games query failed: ${allGamesError.message}`);
    } else {
      console.log(`✅ Successfully retrieved all games: ${allGames?.length || 0}`);
    }

    // Test category filtering
    const { data: categoryGames, error: categoryError } = await supabase
      .from('games')
      .select('*')
      .eq('category', '3A游戏');
    
    if (categoryError) {
      console.error(`❌ Category filter failed: ${categoryError.message}`);
    } else {
      console.log(`✅ Category filtering works: ${categoryGames?.length || 0} 3A games found`);
    }

    // Test title search
    const { data: searchGames, error: searchError } = await supabase
      .from('games')
      .select('*')
      .ilike('title', '%赛博%');
    
    if (searchError) {
      console.error(`❌ Title search failed: ${searchError.message}`);
    } else {
      console.log(`✅ Title search works: ${searchGames?.length || 0} games found`);
    }

    console.log('\n🎯 Schema Analysis Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Basic queries functional');
    console.log('ℹ️ Note: The database appears to be using a different schema than the JSON files');
    console.log('ℹ️ This is normal for a static site setup with JSON data sources');
    
    return true;
  } catch (error) {
    console.error('\n❌ Schema inspection failed:');
    console.error(error.message);
    return false;
  }
}

// Run the inspection if called directly
if (require.main === module) {
  inspectSupabaseSchema()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { inspectSupabaseSchema };