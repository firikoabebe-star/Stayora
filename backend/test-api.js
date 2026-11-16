// Simple API test script
// Run with: node test-api.js

const BASE_URL = "http://localhost:5000/api";

async function testAPI() {
  console.log("🧪 Testing Stayora API endpoints...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(
      `${BASE_URL.replace("/api", "")}/health`,
    );
    const health = await healthResponse.json();
    console.log("✅ Health check:", health.status);

    // Test get amenities
    console.log("\n2. Testing amenities endpoint...");
    const amenitiesResponse = await fetch(
      `${BASE_URL}/properties/amenities/all`,
    );
    const amenities = await amenitiesResponse.json();
    console.log(`✅ Amenities loaded: ${amenities.length} items`);

    // Test get properties
    console.log("\n3. Testing properties endpoint...");
    const propertiesResponse = await fetch(`${BASE_URL}/properties`);
    const propertiesData = await propertiesResponse.json();
    console.log(
      `✅ Properties loaded: ${propertiesData.properties?.length || 0} items`,
    );

    // Test property search with filters
    console.log("\n4. Testing property search with filters...");
    const searchResponse = await fetch(
      `${BASE_URL}/properties?location=New York&minPrice=100&maxPrice=200`,
    );
    const searchData = await searchResponse.json();
    console.log(
      `✅ Search results: ${searchData.properties?.length || 0} items`,
    );

    // Test get single property
    if (propertiesData.properties && propertiesData.properties.length > 0) {
      const propertyId = propertiesData.properties[0].id;
      console.log("\n5. Testing single property endpoint...");
      const propertyResponse = await fetch(
        `${BASE_URL}/properties/${propertyId}`,
      );
      const property = await propertyResponse.json();
      console.log(`✅ Property details loaded: ${property.title}`);
    }

    console.log("\n🎉 All API tests passed!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.log("\n💡 Make sure the server is running: npm run dev");
  }
}

testAPI();
