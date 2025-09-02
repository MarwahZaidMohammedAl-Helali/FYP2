// testAPI.js - Run with: node testAPI.js
const axios = require('axios');

async function testAPI() {
  console.log('Testing User Engagement API...\n');
  
  try {
    // First, test the endpoint without auth
    console.log('1. Testing without auth (should fail):');
    try {
      const response1 = await axios.get('http://localhost:3001/api/user-engagement/85?page=1&pageSize=10');
      console.log('   Unexpected success:', response1.status);
    } catch (error) {
      console.log('   Expected failure:', error.response?.status, error.response?.data);
    }
    
    // Test with session (you'll need to get a valid session cookie)
    console.log('\n2. Testing test endpoint:');
    try {
      const response2 = await axios.get('http://localhost:3001/api/test-engagement/85?page=1&pageSize=10');
      console.log('   Success:', response2.status);
      console.log('   Data:', JSON.stringify(response2.data, null, 2));
    } catch (error) {
      console.log('   Failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAPI();