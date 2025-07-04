'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, FileSpreadsheet, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'

interface FileUploadProps {
  onFileUploaded?: (fileInfo: any) => void
  maxSize?: number
  accept?: string
}

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  uploadedAt: string
}

export default function FileUpload({
  onFileUploaded,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = '.xlsx,.xls,.xlsm',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file extension first (most reliable)
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    const allowedExtensions = ['.xlsx', '.xls', '.xlsm']

    // Check MIME type (secondary validation)
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      'application/octet-stream',
    ]

    const hasValidExtension = allowedExtensions.includes(fileExtension)
    const hasValidMimeType = allowedMimeTypes.includes(file.type)

    // Accept if either extension is valid OR MIME type is valid
    if (!hasValidExtension && !hasValidMimeType) {
      return 'Invalid file type. Only Excel files (.xlsx, .xls, .xlsm) are allowed.'
    }

    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}.`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/amazon/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadedFile(result.file)
      setUploadProgress(100)
      onFileUploaded?.(result.file)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0]) {
      uploadFile(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && files[0]) {
      uploadFile(files[0])
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setError(null)
    setUploadProgress(0)
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Amazon Category Listings Report
        </CardTitle>
        <CardDescription>
          Upload your Amazon Category Listings Report Excel file (.xlsx, .xls, .xlsm) to analyze and
          import products. Maximum file size: {formatFileSize(maxSize)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFile ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! You can now proceed to analyze the file.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{uploadedFile.originalName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)} • Uploaded{' '}
                    {new Date(uploadedFile.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload
                  className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse and select a file
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {isUploading ? 'Uploading...' : 'Select File'}
                </Button>
              </div>

              <input
                id="file-input"
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Supported formats: Excel (.xlsx, .xls, .xlsm)</p>
          <p>• Maximum file size: {formatFileSize(maxSize)}</p>
          <p>• Your file will be processed to extract product information</p>
        </div>
      </CardContent>
    </Card>
  )
}
