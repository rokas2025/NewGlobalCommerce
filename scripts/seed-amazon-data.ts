import { db } from '../src/lib/db/connection'
import { amazonProductData } from '../src/lib/db/schema'

// Sample Amazon product data for testing
const sampleAmazonProducts = [
  {
    amazonSku: 'KORNELY-DRILL-BRUSH-001',
    productId: null, // Will be linked to actual product after import
    itemName: 'Kornely Drill Brush Attachment Set - 3 Piece Power Scrubber Kit',
    productDescription:
      'Professional grade drill brush attachment set for deep cleaning. Includes 3 different brush heads for various cleaning tasks.',
    feedProductType: 'Tools',
    browseNodes: '228013,2244166011,256798011',
    mainImageUrl: 'https://m.media-amazon.com/images/I/71ABC123def.jpg',
    otherImageUrls: [
      'https://m.media-amazon.com/images/I/71DEF456ghi.jpg',
      'https://m.media-amazon.com/images/I/71GHI789jkl.jpg',
    ],
    bulletPoints: [
      'Professional grade drill brush attachment set',
      'Includes 3 different brush heads',
      'Compatible with most standard drills',
      'Durable nylon bristles',
      'Perfect for bathroom, kitchen, and automotive cleaning',
    ],
    genericKeywords:
      'drill brush, cleaning brush, power scrubber, bathroom cleaner, kitchen cleaner',
    itemWeight: 0.5,
    itemWeightUnit: 'pounds',
    itemLength: 6.0,
    itemWidth: 4.0,
    itemHeight: 2.0,
    itemDimensionsUnit: 'inches',
    listingStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    amazonSku: 'KORNELY-DRILL-BRUSH-002',
    productId: null,
    itemName: 'Kornely Heavy Duty Drill Brush - Large 5 Inch Power Scrubber',
    productDescription:
      'Heavy duty 5-inch drill brush for tough cleaning jobs. Ideal for large surface areas and stubborn stains.',
    feedProductType: 'Tools',
    browseNodes: '228013,2244166011,256798011',
    mainImageUrl: 'https://m.media-amazon.com/images/I/71MNO123pqr.jpg',
    otherImageUrls: ['https://m.media-amazon.com/images/I/71STU456vwx.jpg'],
    bulletPoints: [
      'Heavy duty 5-inch drill brush',
      'Perfect for large surface cleaning',
      'Stiff bristles for tough stains',
      'Universal drill attachment',
      'Professional cleaning results',
    ],
    genericKeywords:
      'heavy duty drill brush, large cleaning brush, power scrubber, industrial cleaning',
    itemWeight: 0.8,
    itemWeightUnit: 'pounds',
    itemLength: 8.0,
    itemWidth: 5.0,
    itemHeight: 3.0,
    itemDimensionsUnit: 'inches',
    listingStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    amazonSku: 'KORNELY-DRILL-BRUSH-003',
    productId: null,
    itemName: 'Kornely Soft Drill Brush - Delicate Surface Cleaning Attachment',
    productDescription:
      'Soft bristle drill brush designed for delicate surfaces. Safe for car interiors, upholstery, and sensitive materials.',
    feedProductType: 'Tools',
    browseNodes: '228013,2244166011,15684181',
    mainImageUrl: 'https://m.media-amazon.com/images/I/71YZA123bcd.jpg',
    otherImageUrls: [
      'https://m.media-amazon.com/images/I/71EFG456hij.jpg',
      'https://m.media-amazon.com/images/I/71KLM789nop.jpg',
      'https://m.media-amazon.com/images/I/71QRS012tuv.jpg',
    ],
    bulletPoints: [
      'Soft bristles for delicate surfaces',
      'Safe for car interiors and upholstery',
      'Gentle yet effective cleaning',
      'Standard drill attachment',
      'Versatile cleaning tool',
    ],
    genericKeywords:
      'soft drill brush, delicate cleaning, car interior, upholstery cleaner, gentle brush',
    itemWeight: 0.3,
    itemWeightUnit: 'pounds',
    itemLength: 5.0,
    itemWidth: 3.0,
    itemHeight: 2.0,
    itemDimensionsUnit: 'inches',
    listingStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedAmazonData() {
  try {
    console.log('🌱 Seeding Amazon product data...')

    // Insert sample Amazon product data
    const insertedProducts = await db
      .insert(amazonProductData)
      .values(sampleAmazonProducts)
      .returning()

    console.log(`✅ Successfully seeded ${insertedProducts.length} Amazon products`)

    // Display seeded products
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.itemName} (SKU: ${product.amazonSku})`)
    })

    console.log('🎉 Amazon data seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding Amazon data:', error)
    throw error
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedAmazonData()
    .then(() => {
      console.log('Seeding completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export { sampleAmazonProducts, seedAmazonData }
