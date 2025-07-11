
// Quick verification after Vercel configuration
async function testProduction() {
    try {
        const response = await fetch('https://easy-gift-search.vercel.app/api/status');
        const data = await response.json();
        console.log('✅ Production Status:', data);
        
        // Test search endpoint
        const searchResponse = await fetch('https://easy-gift-search.vercel.app/api/custom-search?query=smartphone&maxPrice=1000');
        const searchData = await searchResponse.json();
        console.log('✅ Search Working:', searchData.length > 0 ? 'YES' : 'NO');
        
    } catch (error) {
        console.error('❌ Production Test Failed:', error.message);
    }
}

// Uncomment to test after configuration:
// testProduction();
