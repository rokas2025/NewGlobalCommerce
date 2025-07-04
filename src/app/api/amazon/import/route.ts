import { AnalysisEngine } from '@/lib/amazon/analysis-engine'
import { ImportProcessor } from '@/lib/amazon/import-processor'
import { UploadedFile } from '@/types/amazon'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, selectedSkus, importSettings = {}, duplicateHandling = {} } = body

    if (!fileId || !selectedSkus || !Array.isArray(selectedSkus)) {
      return NextResponse.json({ error: 'File ID and selected SKUs are required' }, { status: 400 })
    }

    // Find the uploaded file (same method as analyze API)
    const uploadDir = join(process.cwd(), 'uploads', 'amazon')
    const files = require('fs').readdirSync(uploadDir)
    const uploadedFileName = files.find((file: string) => file.startsWith(fileId + '_'))

    console.log('Looking for file with ID:', fileId)
    console.log('Available files:', files)
    console.log('Found file:', uploadedFileName)

    if (!uploadedFileName) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const filePath = join(uploadDir, uploadedFileName)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File no longer exists' }, { status: 404 })
    }

    // Get file stats and create file info
    const stats = require('fs').statSync(filePath)
    const uploadedFile: UploadedFile = {
      id: fileId,
      filename: uploadedFileName,
      originalName: uploadedFileName.substring(uploadedFileName.indexOf('_') + 1),
      size: stats.size,
      type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
      uploadedAt: stats.birthtime.toISOString(),
      path: filePath,
    }

    // Analyze file to get product data
    const analysisEngine = new AnalysisEngine()
    const analysisResult = await analysisEngine.analyzeFile({
      id: fileId,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      size: uploadedFile.size,
      type: uploadedFile.type,
      uploadedAt: uploadedFile.uploadedAt,
      path: filePath,
    })

    if (!analysisResult.preview || analysisResult.preview.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to analyze file for import - no products found',
          details: 'Analysis completed but no valid products were extracted',
        },
        { status: 400 }
      )
    }

    // Filter products by selected SKUs
    const productsToImport = analysisResult.preview.filter(product =>
      selectedSkus.includes(product.sku)
    )

    if (productsToImport.length === 0) {
      return NextResponse.json(
        { error: 'No valid products found for selected SKUs' },
        { status: 400 }
      )
    }

    // Set up import processor with options
    const processorOptions = {
      importSettings: {
        skipDuplicates: true,
        overwriteExisting: false,
        defaultCategory: 'uncategorized',
        defaultStatus: 'draft',
        defaultStockLevel: 0,
        priceMarkup: 0,
        enableAutoTags: true,
        ...importSettings,
      },
      duplicateHandling: {
        strategy: 'skip' as const,
        renamePattern: '{sku}-amazon-{timestamp}',
        mergeFields: ['images', 'tags', 'description'],
        compareFields: ['name', 'price', 'description', 'images'],
        ...duplicateHandling,
      },
      batchSize: 50,
      enableLogging: true,
      dryRun: false,
    }

    // Process the import
    const processor = new ImportProcessor(processorOptions)
    const importResult = await processor.processImport(productsToImport)

    return NextResponse.json({
      success: importResult.success,
      message: `Import completed: ${importResult.successful} successful, ${importResult.failed} failed, ${importResult.skipped} skipped`,
      results: importResult,
      fileId,
      selectedSkus,
      settings: processorOptions,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const importId = searchParams.get('importId')

    if (!importId) {
      return NextResponse.json({ error: 'Import ID is required' }, { status: 400 })
    }

    // For now, return a placeholder response
    // In a real implementation, you would track import jobs and return their status
    return NextResponse.json({
      success: true,
      importId,
      status: 'completed',
      message: 'Import status endpoint - to be implemented with job tracking',
    })
  } catch (error) {
    console.error('Import status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get import status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
