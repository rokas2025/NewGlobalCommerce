import { AnalysisEngine } from '@/lib/amazon/analysis-engine'
import { AnalysisResponse, UploadedFile } from '@/types/amazon'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    console.log('Analysis request for fileId:', fileId)

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Find the uploaded file
    const uploadDir = join(process.cwd(), 'uploads', 'amazon')
    const files = require('fs').readdirSync(uploadDir)
    const uploadedFile = files.find((file: string) => file.startsWith(fileId + '_'))

    console.log('Looking for file with ID:', fileId)
    console.log('Available files:', files)
    console.log('Found file:', uploadedFile)

    if (!uploadedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const filePath = join(uploadDir, uploadedFile)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File no longer exists' }, { status: 404 })
    }

    console.log('File path:', filePath)

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

    console.log('File info:', fileInfo)

    // Initialize analysis engine
    const analysisEngine = new AnalysisEngine()

    // Validate file structure first
    console.log('Starting file validation...')
    const validation = analysisEngine.validateFileStructure(fileInfo)
    console.log('Validation result:', validation)

    if (!validation.isValid) {
      console.error('File validation failed:', validation.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'File validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      )
    }

    // Analyze the file
    console.log('Starting file analysis...')
    const analysisResult = await analysisEngine.analyzeFile(fileInfo)
    console.log('Analysis completed successfully')

    // Store analysis result (in a real app, you'd save this to database)
    // For now, we'll just return it
    const response: AnalysisResponse = {
      success: true,
      message: 'File analyzed successfully',
      result: analysisResult,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get analysis status or retrieve cached results
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  // In a real app, you'd check database for cached analysis results
  // For now, return a simple status
  return NextResponse.json({
    status: 'ready',
    message: 'Ready for analysis',
  })
}
