import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsm (alternative)
  'application/octet-stream', // Generic binary (sometimes used for .xlsm)
]

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.xlsm']

// Function to validate file type
function isValidExcelFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

  // Check file extension first (most reliable)
  const hasValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)

  // Check MIME type (secondary validation)
  const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.type)

  // Accept if either extension is valid OR MIME type is valid
  // This handles cases where browsers report different MIME types
  return hasValidExtension || hasValidMimeType
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Debug logging
    console.log('File upload attempt:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type using improved logic
    if (!isValidExcelFile(file)) {
      const fileName = file.name.toLowerCase()
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

      return NextResponse.json(
        {
          error: 'Invalid file type. Only Excel files (.xlsx, .xls, .xlsm) are allowed',
          debug: {
            fileName: file.name,
            detectedType: file.type,
            detectedExtension: fileExtension,
            allowedExtensions: ALLOWED_EXTENSIONS,
            allowedMimeTypes: ALLOWED_MIME_TYPES,
          },
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'amazon')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file info
    const fileInfo = {
      id: timestamp.toString(),
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      path: filepath,
    }

    console.log('File uploaded successfully:', fileInfo)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

// Handle file size limit exceeded
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
