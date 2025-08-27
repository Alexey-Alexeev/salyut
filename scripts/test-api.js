// scripts/test-api.js
/**
 * Simple test for the orders API endpoint
 * Run: node scripts/test-api.js
 */

const testOrderData = {
  customer_name: "Test User",
  customer_phone: "+7903433231",
  customer_contact: "",
  contact_method: null,
  comment: "Test order",
  total_amount: 1000,
  delivery_cost: 500,
  discount_amount: 0,
  age_confirmed: true,
  items: [
    {
      product_id: "test-product-id",
      quantity: 1,
      price_at_time: 1000
    }
  ]
}

async function testAPI() {
  try {
    console.log('🧪 Testing Orders API...')
    console.log('📋 Test data:', JSON.stringify(testOrderData, null, 2))
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    })
    
    const result = await response.json()
    
    console.log('📊 Response status:', response.status)
    console.log('📋 Response data:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ API test successful!')
    } else {
      console.log('❌ API test failed!')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testAPI()