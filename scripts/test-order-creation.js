// scripts/test-order-creation.js
/**
 * Script to test order creation directly
 * Run: node scripts/test-order-creation.js
 */

require('dotenv').config({ path: '.env.local' })

const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { orders } = require('../db/schema')

async function testOrderCreation() {
  console.log('🧪 Testing order creation...\n')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!')
    return
  }

  try {
    // Create connection
    const connectionString = process.env.DATABASE_URL
    const client = postgres(connectionString, {
      ssl: process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema: { orders } })

    // Test data
    const testOrderData = {
      customer_name: 'Test Customer',
      customer_phone: '+1234567890',
      customer_contact: null,
      contact_method: null,
      comment: 'Test order',
      total_amount: 1000,
      delivery_cost: 500,
      discount_amount: 100,
      age_confirmed: true,
    }

    console.log('📋 Test data:', testOrderData)
    console.log('📋 Data types:', {
      customer_name: typeof testOrderData.customer_name,
      customer_phone: typeof testOrderData.customer_phone,
      customer_contact: typeof testOrderData.customer_contact,
      contact_method: typeof testOrderData.contact_method,
      comment: typeof testOrderData.comment,
      total_amount: typeof testOrderData.total_amount,
      delivery_cost: typeof testOrderData.delivery_cost,
      discount_amount: typeof testOrderData.discount_amount,
      age_confirmed: typeof testOrderData.age_confirmed,
    })

    // Try to insert
    console.log('\n🔄 Attempting to insert order...')
    const [order] = await db.insert(orders).values(testOrderData).returning()
    
    console.log('✅ Order created successfully!')
    console.log('📝 Order ID:', order.id)
    console.log('📝 Created at:', order.created_at)

    // Clean up - delete the test order
    console.log('\n🧹 Cleaning up test data...')
    await db.delete(orders).where(orders.id.eq(order.id))
    console.log('✅ Test order deleted')

    await client.end()
    console.log('\n🎉 Test completed successfully!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    
    if (error.message.includes('Failed query')) {
      console.error('\n🔍 Database query error detected')
      console.error('Error details:', error)
    }
    
    if (error.code) {
      console.error('Error code:', error.code)
    }
  }
}

testOrderCreation().catch(console.error)