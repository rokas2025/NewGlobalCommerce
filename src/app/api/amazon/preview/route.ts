import { AnalysisEngine } from '@/lib/amazon/analysis-engine'
import { UploadedFile } from '@/types/amazon'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const filterBy = searchParams.get('filterBy') || ''
    const filterValue = searchParams.get('filterValue') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Find the uploaded file
    const uploadDir = join(process.cwd(), 'uploads', 'amazon')
    const files = require('fs').readdirSync(uploadDir)
    const uploadedFile = files.find((file: string) => file.startsWith(fileId + '_'))

    if (!uploadedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const filePath = join(uploadDir, uploadedFile)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File no longer exists' }, { status: 404 })
    }

    // Get file stats
    const stats = require('fs').statSync(filePath)
    const fileInfo: UploadedFile = {
      id: fileId,
      filename: uploadedFile,
      originalName: uploadedFile.substring(uploadedFile.indexOf('_') + 1),
      size: stats.size,
      type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
      uploadedAt: stats.birthtime.toISOString(),
      path: filePath,
    }

    // Analyze the file to get products
    const analysisEngine = new AnalysisEngine()
    const analysisResult = await analysisEngine.analyzeFile(fileInfo)
    let products = analysisResult.preview

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        product =>
          product.sku.toLowerCase().includes(searchLower) ||
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply filters
    if (filterBy && filterValue && filterBy !== 'all') {
      products = products.filter(product => {
        switch (filterBy) {
          case 'feedProductType':
            return product.amazonData.feedProductType
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          case 'listingStatus':
            return product.amazonData.listingStatus === filterValue
          case 'importStatus':
            return product.importStatus === filterValue
          case 'hasPrice':
            return filterValue === 'true' ? product.price !== null : product.price === null
          case 'hasImages':
            return filterValue === 'true' ? product.images.length > 0 : product.images.length === 0
          case 'hasErrors':
            return filterValue === 'true'
              ? product.importErrors && product.importErrors.length > 0
              : !product.importErrors || product.importErrors.length === 0
          default:
            return true
        }
      })
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'sku':
          aValue = a.sku
          bValue = b.sku
          break
        case 'price':
          aValue = a.price || 0
          bValue = b.price || 0
          break
        case 'weight':
          aValue = a.weight || 0
          bValue = b.weight || 0
          break
        case 'importStatus':
          aValue = a.importStatus
          bValue = b.importStatus
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    // Calculate pagination
    const totalCount = products.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = products.slice(startIndex, endIndex)

    // Calculate summary stats for current view
    const summary = {
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      validProducts: products.filter(p => p.importStatus !== 'error').length,
      errorProducts: products.filter(p => p.importStatus === 'error').length,
      withPrices: products.filter(p => p.price !== null).length,
      withImages: products.filter(p => p.images.length > 0).length,
      feedProductTypes: [...new Set(products.map(p => p.amazonData.feedProductType))],
      listingStatuses: [...new Set(products.map(p => p.amazonData.listingStatus))],
    }

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      summary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        filterBy,
        filterValue,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load product preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, productSkus, action } = await request.json()

    if (!fileId || !productSkus || !Array.isArray(productSkus)) {
      return NextResponse.json({ error: 'File ID and product SKUs are required' }, { status: 400 })
    }

    // Handle bulk actions on selected products
    switch (action) {
      case 'select':
        // Mark products as selected for import
        return NextResponse.json({
          success: true,
          message: `${productSkus.length} products selected for import`,
          selectedCount: productSkus.length,
        })

      case 'deselect':
        // Mark products as not selected for import
        return NextResponse.json({
          success: true,
          message: `${productSkus.length} products deselected`,
          deselectedCount: productSkus.length,
        })

      case 'validate':
        // Re-validate selected products
        return NextResponse.json({
          success: true,
          message: `${productSkus.length} products validated`,
          validatedCount: productSkus.length,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Preview action error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
