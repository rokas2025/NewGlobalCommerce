#!/usr/bin/env tsx

import { db } from '../src/lib/db/connection'
import {
  categories,
  inventory,
  languages,
  products,
  systemSettings,
  users,
  warehouses,
  type NewCategory,
  type NewInventory,
  type NewLanguage,
  type NewProduct,
  type NewSystemSetting,
  type NewUser,
  type NewWarehouse,
} from '../src/lib/db/schema'

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // =============================================================================
    // SYSTEM SETTINGS
    // =============================================================================
    console.log('📋 Seeding system settings...')

    const systemSettingsData: NewSystemSetting[] = [
      {
        key: 'site_name',
        value: 'Global Commerce',
        description: 'The name of the e-commerce platform',
        isPublic: true,
      },
      {
        key: 'site_description',
        value:
          'A comprehensive multilingual e-commerce platform with AI-powered content generation',
        description: 'Site description for SEO',
        isPublic: true,
      },
      {
        key: 'default_currency',
        value: 'USD',
        description: 'Default currency for the platform',
        isPublic: true,
      },
      {
        key: 'tax_rate',
        value: '0.08',
        description: 'Default tax rate (8%)',
        isPublic: false,
      },
    ]

    await db.insert(systemSettings).values(systemSettingsData)
    console.log('✅ System settings seeded')

    // =============================================================================
    // LANGUAGES
    // =============================================================================
    console.log('🌍 Seeding languages...')

    const languagesData: NewLanguage[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        isActive: true,
        isDefault: true,
        isRtl: false,
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        isActive: true,
        isDefault: false,
        isRtl: false,
      },
      {
        code: 'lt',
        name: 'Lithuanian',
        nativeName: 'Lietuvių',
        isActive: true,
        isDefault: false,
        isRtl: false,
      },
    ]

    await db.insert(languages).values(languagesData)
    console.log('✅ Languages seeded')

    // =============================================================================
    // USERS
    // =============================================================================
    console.log('👥 Seeding users...')

    const usersData: NewUser[] = [
      {
        email: 'admin@globalcommerce.com',
        username: 'admin',
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active',
        phone: '+1-555-0001',
        preferences: {
          theme: 'dark',
          language: 'en',
        },
      },
      {
        email: 'manager@globalcommerce.com',
        username: 'manager',
        fullName: 'Store Manager',
        role: 'manager',
        status: 'active',
        phone: '+1-555-0002',
      },
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        fullName: 'John Doe',
        companyName: 'Acme Corp',
        role: 'customer',
        status: 'active',
        phone: '+1-555-0101',
      },
    ]

    const insertedUsers = await db.insert(users).values(usersData).returning()
    console.log('✅ Users seeded')

    // =============================================================================
    // WAREHOUSES
    // =============================================================================
    console.log('🏭 Seeding warehouses...')

    const warehousesData: NewWarehouse[] = [
      {
        name: 'Main Warehouse',
        code: 'MAIN-001',
        address: {
          street: '123 Commerce Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        isActive: true,
        isDefault: true,
      },
    ]

    const insertedWarehouses = await db.insert(warehouses).values(warehousesData).returning()
    console.log('✅ Warehouses seeded')

    // =============================================================================
    // CATEGORIES
    // =============================================================================
    console.log('📂 Seeding categories...')

    const categoriesData: NewCategory[] = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Physical and digital books',
        isActive: true,
        sortOrder: 3,
      },
    ]

    const insertedCategories = await db.insert(categories).values(categoriesData).returning()
    console.log('✅ Categories seeded')

    // =============================================================================
    // PRODUCTS
    // =============================================================================
    console.log('📦 Seeding products...')

    const adminUser = insertedUsers.find(u => u.email === 'admin@globalcommerce.com')

    const productsData: NewProduct[] = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced camera system and A17 Pro chip.',
        shortDescription: 'Latest iPhone with A17 Pro chip',
        sku: 'APPLE-IP15P-128',
        status: 'active',
        price: '999.00',
        compareAtPrice: '1099.00',
        costPrice: '750.00',
        weight: '0.187',
        tags: ['smartphone', 'apple', 'ios'],
        attributes: {
          brand: 'Apple',
          storage: '128GB',
          color: 'Natural Titanium',
        },
        seoTitle: 'iPhone 15 Pro - Latest Apple Smartphone',
        seoDescription: 'Buy the new iPhone 15 Pro with A17 Pro chip and titanium design.',
        isDigital: false,
        requiresShipping: true,
        trackInventory: true,
        createdBy: adminUser?.id,
      },
      {
        name: 'Premium Cotton T-Shirt',
        slug: 'premium-cotton-t-shirt',
        description: 'Comfortable cotton t-shirt made from 100% organic cotton.',
        shortDescription: '100% organic cotton t-shirt',
        sku: 'CLOTHING-TSHIRT-M',
        status: 'active',
        price: '29.99',
        compareAtPrice: '39.99',
        costPrice: '15.00',
        weight: '0.2',
        tags: ['clothing', 'tshirt', 'organic'],
        attributes: {
          material: '100% Organic Cotton',
          size: 'Medium',
          color: 'Navy Blue',
        },
        seoTitle: 'Premium Organic Cotton T-Shirt',
        seoDescription: 'Shop our premium organic cotton t-shirt.',
        isDigital: false,
        requiresShipping: true,
        trackInventory: true,
        createdBy: adminUser?.id,
      },
    ]

    const insertedProducts = await db.insert(products).values(productsData).returning()
    console.log('✅ Products seeded')

    // =============================================================================
    // INVENTORY
    // =============================================================================
    console.log('📊 Seeding inventory...')

    const mainWarehouse = insertedWarehouses[0]
    if (!mainWarehouse) {
      throw new Error('Main warehouse not found')
    }

    const inventoryData: NewInventory[] = []

    for (const product of insertedProducts) {
      inventoryData.push({
        productId: product.id,
        warehouseId: mainWarehouse.id,
        quantity: 100,
        reservedQuantity: 0,
        reorderPoint: 20,
        reorderQuantity: 50,
        status: 'in_stock',
      })
    }

    await db.insert(inventory).values(inventoryData)
    console.log('✅ Inventory seeded')

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seeding process completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Seeding process failed:', error)
    process.exit(1)
  })
