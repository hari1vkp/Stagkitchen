// Simple test to verify Google AI API is working
require('dotenv').config();

async function testGoogleAI() {
  console.log('Testing Google AI API...');
  console.log('API Key present:', !!process.env.GOOGLE_API_KEY);
  console.log('API Key starts with:', process.env.GOOGLE_API_KEY?.substring(0, 10) + '...');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Test Successful!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testGoogleAI();