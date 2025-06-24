import { NextResponse } from 'next/server'

// Mock category data for demo
const mockCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    parentId: null,
    sortOrder: 1,
    isActive: true,
    seoTitle: 'Electronics - Latest Gadgets and Devices',
    seoDescription: 'Discover the latest electronics, gadgets, and tech devices.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    children: [
      {
        id: 'audio',
        name: 'Audio',
        slug: 'audio',
        description: 'Audio equipment and accessories',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        parentId: 'electronics',
        sortOrder: 1,
        isActive: true,
        seoTitle: 'Audio Equipment - Headphones, Speakers & More',
        seoDescription:
          'High-quality audio equipment including headphones, speakers, and accessories.',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        children: [],
      },
      {
        id: 'fitness',
        name: 'Fitness',
        slug: 'fitness',
        description: 'Fitness and health tracking devices',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        parentId: 'electronics',
        sortOrder: 2,
        isActive: true,
        seoTitle: 'Fitness Electronics - Smart Watches & Health Trackers',
        seoDescription:
          'Track your fitness goals with smart watches and health monitoring devices.',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        children: [],
      },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    slug: 'furniture',
    description: 'Home and office furniture',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    parentId: null,
    sortOrder: 2,
    isActive: true,
    seoTitle: 'Furniture - Home & Office Solutions',
    seoDescription: 'Quality furniture for your home and office spaces.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    children: [
      {
        id: 'office',
        name: 'Office',
        slug: 'office',
        description: 'Office furniture and accessories',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        parentId: 'furniture',
        sortOrder: 1,
        isActive: true,
        seoTitle: 'Office Furniture - Chairs, Desks & Storage',
        seoDescription: 'Professional office furniture including ergonomic chairs and desks.',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        children: [],
      },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Various accessories and add-ons',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    parentId: null,
    sortOrder: 3,
    isActive: true,
    seoTitle: 'Accessories - Enhance Your Devices',
    seoDescription: 'Quality accessories to enhance and protect your devices.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    children: [],
  },
]

export async function GET() {
  try {
    return NextResponse.json(mockCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
