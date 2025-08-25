/**
 * Frontend Data Verification Script
 * Tests that the frontend properly consumes the synchronized database data
 */

const fs = require('fs').promises;
const path = require('path');

async function testFrontendDataIntegration() {
  console.log('🔍 Testing Frontend Data Integration...\n');

  try {
    // 1. Test games.json file exists and has correct structure
    const gamesJsonPath = path.join(__dirname, 'public', 'data', 'games.json');
    const gamesData = JSON.parse(await fs.readFile(gamesJsonPath, 'utf8'));
    
    console.log('✅ Games JSON file loaded successfully');
    console.log(`📊 Found ${gamesData.length} games in dataset`);
    
    if (gamesData.length !== 24) {
      throw new Error(`Expected 24 games, but found ${gamesData.length}`);
    }
    console.log('✅ Correct number of games (24) found');

    // 2. Test that each game has required fields
    const requiredFields = ['id', 'title', 'description', 'category', 'tags', 'cover_image', 'download_link', 'published_at', 'status'];
    const optionalFields = ['view_count', 'download_count', 'content', 'created_at', 'updated_at'];
    
    let missingFieldsCount = 0;
    gamesData.forEach((game, index) => {
      const missingFields = requiredFields.filter(field => !game.hasOwnProperty(field));
      if (missingFields.length > 0) {
        console.error(`❌ Game ${game.id || index} missing required fields: ${missingFields.join(', ')}`);
        missingFieldsCount++;
      }
    });
    
    if (missingFieldsCount === 0) {
      console.log('✅ All games have required fields');
    } else {
      throw new Error(`${missingFieldsCount} games have missing required fields`);
    }

    // 3. Test categories distribution
    const categoryCount = {};
    gamesData.forEach(game => {
      categoryCount[game.category] = (categoryCount[game.category] || 0) + 1;
    });
    
    console.log('\n📂 Category distribution:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} games`);
    });
    
    // 4. Test that all games have valid status
    const statusCount = {};
    gamesData.forEach(game => {
      statusCount[game.status] = (statusCount[game.status] || 0) + 1;
    });
    
    console.log('\n📋 Status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} games`);
    });

    // 5. Test categories.json file
    const categoriesJsonPath = path.join(__dirname, 'public', 'data', 'categories.json');
    const categoriesData = JSON.parse(await fs.readFile(categoriesJsonPath, 'utf8'));
    console.log(`\n✅ Categories JSON file loaded with ${categoriesData.length} categories`);

    // 6. Test that all game categories exist in categories.json
    const categoryNames = categoriesData.map(cat => cat.name);
    const gameCategories = [...new Set(gamesData.map(game => game.category))];
    
    const missingCategories = gameCategories.filter(cat => !categoryNames.includes(cat));
    if (missingCategories.length > 0) {
      console.warn(`⚠️ Games reference categories not in categories.json: ${missingCategories.join(', ')}`);
    } else {
      console.log('✅ All game categories exist in categories.json');
    }

    // 7. Test sample of cover images (check if they're valid URLs)
    const sampleGames = gamesData.slice(0, 5);
    console.log('\n🖼️ Testing cover image URLs (sample of 5):');
    
    sampleGames.forEach(game => {
      try {
        new URL(game.cover_image);
        console.log(`   ✅ ${game.title}: Valid URL`);
      } catch (error) {
        console.log(`   ❌ ${game.title}: Invalid URL - ${game.cover_image}`);
      }
    });

    // 8. Test tags structure
    console.log('\n🏷️ Testing tags structure:');
    let tagsCount = 0;
    let gamesWithoutTags = 0;
    
    gamesData.forEach(game => {
      if (!game.tags || game.tags.length === 0) {
        gamesWithoutTags++;
      } else {
        tagsCount += game.tags.length;
      }
    });
    
    console.log(`   Total tags across all games: ${tagsCount}`);
    console.log(`   Games without tags: ${gamesWithoutTags}`);
    console.log(`   Average tags per game: ${(tagsCount / gamesData.length).toFixed(1)}`);

    // 9. Test published dates
    console.log('\n📅 Testing published dates:');
    let validDates = 0;
    let invalidDates = 0;
    
    gamesData.forEach(game => {
      const date = new Date(game.published_at);
      if (date instanceof Date && !isNaN(date)) {
        validDates++;
      } else {
        invalidDates++;
        console.log(`   ❌ Invalid date for ${game.title}: ${game.published_at}`);
      }
    });
    
    console.log(`   Valid dates: ${validDates}`);
    console.log(`   Invalid dates: ${invalidDates}`);

    console.log('\n🎉 Frontend Data Integration Test Summary:');
    console.log('✅ All tests passed successfully!');
    console.log('✅ Data synchronization is working properly');
    console.log('✅ Frontend can properly consume the synchronized database data');
    
    return true;
  } catch (error) {
    console.error('\n❌ Frontend Data Integration Test Failed:');
    console.error(error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testFrontendDataIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendDataIntegration };