import { ProductStatus, ProductVisibility } from '@/types/products'
import { NextRequest, NextResponse } from 'next/server'

// Mock product data for demo
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description:
      'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    shortDescription: 'Premium wireless headphones with noise cancellation',
    sku: 'WBH-001',
    barcode: '1234567890123',
    price: 299.99,
    compareAtPrice: 399.99,
    costPrice: 150.0,
    status: ProductStatus.ACTIVE,
    visibility: ProductVisibility.PUBLIC,
    featuredImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    ],
    weight: 0.25,
    dimensions: '20 x 18 x 8',
    seoTitle: 'Premium Wireless Bluetooth Headphones - High Quality Audio',
    seoDescription:
      'Experience premium sound quality with our wireless Bluetooth headphones featuring noise cancellation and long battery life.',
    tags: ['electronics', 'audio', 'wireless', 'bluetooth'],
    categoryIds: ['electronics', 'audio'],
    primaryCategoryId: 'electronics',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description:
      'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    shortDescription: 'Smart watch with fitness tracking and GPS',
    sku: 'SFW-002',
    barcode: '1234567890124',
    price: 199.99,
    compareAtPrice: 249.99,
    costPrice: 100.0,
    status: ProductStatus.ACTIVE,
    visibility: ProductVisibility.PUBLIC,
    featuredImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    galleryImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    ],
    weight: 0.05,
    dimensions: '4 x 4 x 1',
    seoTitle: 'Smart Fitness Watch - Advanced Health Tracking',
    seoDescription:
      'Track your fitness goals with our advanced smart watch featuring heart rate monitoring and GPS.',
    tags: ['electronics', 'fitness', 'smartwatch', 'health'],
    categoryIds: ['electronics', 'fitness'],
    primaryCategoryId: 'electronics',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString(),
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    description: 'Comfortable ergonomic office chair with lumbar support and adjustable height.',
    shortDescription: 'Ergonomic chair with lumbar support',
    sku: 'EOC-003',
    barcode: '1234567890125',
    price: 449.99,
    compareAtPrice: null,
    costPrice: 200.0,
    status: ProductStatus.ACTIVE,
    visibility: ProductVisibility.PUBLIC,
    featuredImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    galleryImages: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
    weight: 15.0,
    dimensions: '70 x 70 x 120',
    seoTitle: 'Ergonomic Office Chair - Premium Comfort',
    seoDescription:
      'Enhance your workspace with our ergonomic office chair featuring superior lumbar support.',
    tags: ['furniture', 'office', 'chair', 'ergonomic'],
    categoryIds: ['furniture', 'office'],
    primaryCategoryId: 'furniture',
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '4',
    name: 'Portable Laptop Stand',
    slug: 'portable-laptop-stand',
    description: 'Lightweight and adjustable laptop stand for better ergonomics and cooling.',
    shortDescription: 'Adjustable laptop stand for ergonomics',
    sku: 'PLS-004',
    barcode: '1234567890126',
    price: 79.99,
    compareAtPrice: 99.99,
    costPrice: 35.0,
    status: ProductStatus.DRAFT,
    visibility: ProductVisibility.PRIVATE,
    featuredImageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    galleryImages: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
    weight: 1.2,
    dimensions: '30 x 25 x 5',
    seoTitle: 'Portable Laptop Stand - Adjustable and Lightweight',
    seoDescription:
      'Improve your posture and laptop cooling with our portable adjustable laptop stand.',
    tags: ['accessories', 'laptop', 'stand', 'portable'],
    categoryIds: ['accessories', 'office'],
    primaryCategoryId: 'accessories',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const visibility = searchParams.get('visibility')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Filter products based on search and filters
    let filteredProducts = mockProducts

    if (search) {
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredProducts = filteredProducts.filter(product => product.status === status)
    }

    if (visibility) {
      filteredProducts = filteredProducts.filter(product => product.visibility === visibility)
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]

      if (sortBy === 'price' || sortBy === 'compareAtPrice' || sortBy === 'costPrice') {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortOrder === 'asc' ? 1 : -1
      if (bValue === null) return sortOrder === 'asc' ? -1 : 1

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Calculate pagination info
    const totalItems = filteredProducts.length
    const totalPages = Math.ceil(totalItems / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    const response = {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext,
        hasPrev,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
