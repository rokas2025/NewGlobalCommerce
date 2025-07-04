'use client'

import FileUpload from '@/components/amazon/FileUpload'
import ProductPreview from '@/components/amazon/ProductPreview'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileAnalysisResult, ImportProgress, UploadedFile } from '@/types/amazon'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Upload,
} from 'lucide-react'
import { useState } from 'react'

export default function AmazonImportPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file)
    setActiveTab('analyze')
  }

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/amazon/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId: uploadedFile.id }),
      })

      const result = await response.json()
      if (response.ok) {
        setAnalysisResult(result.result)
        setActiveTab('preview')
      } else {
        console.error('Analysis failed:', result.error)
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStepStatus = (step: string) => {
    switch (step) {
      case 'upload':
        return uploadedFile ? 'completed' : 'current'
      case 'analyze':
        return analysisResult ? 'completed' : uploadedFile ? 'current' : 'pending'
      case 'preview':
        return analysisResult ? 'current' : 'pending'
      case 'import':
        return 'pending'
      default:
        return 'pending'
    }
  }

  const StepIndicator = ({
    step,
    title,
    description,
  }: {
    step: string
    title: string
    description: string
  }) => {
    const status = getStepStatus(step)

    return (
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            status === 'completed'
              ? 'bg-green-500 text-white'
              : status === 'current'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500'
          }`}
        >
          {status === 'completed' ? (
            <CheckCircle className="h-4 w-4" />
          ) : status === 'current' ? (
            <Clock className="h-4 w-4" />
          ) : (
            <span className="text-sm font-medium">
              {step === 'upload' ? '1' : step === 'analyze' ? '2' : step === 'preview' ? '3' : '4'}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Amazon Product Import</h1>
        <p className="text-muted-foreground">
          Import products from your Amazon Category Listings Report Excel file
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StepIndicator step="upload" title="Upload File" description="Upload your Excel file" />
        <StepIndicator
          step="analyze"
          title="Analyze Data"
          description="Process and validate products"
        />
        <StepIndicator
          step="preview"
          title="Preview & Select"
          description="Review products before import"
        />
        <StepIndicator
          step="import"
          title="Import Products"
          description="Add products to your catalog"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={!true}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="analyze" disabled={!uploadedFile}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!analysisResult}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="import" disabled={!analysisResult}>
            <Download className="mr-2 h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <FileUpload onFileUploaded={handleFileUploaded} />

          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle>File Ready for Analysis</CardTitle>
                <CardDescription>
                  Your file has been uploaded successfully. Click "Analyze" to process the data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{uploadedFile.originalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab('analyze')}>Proceed to Analysis</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Excel File</CardTitle>
              <CardDescription>
                Process your Amazon Category Listings Report to extract product data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFile && (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.originalName}</p>
                    <p className="text-sm text-muted-foreground">Ready for analysis</p>
                  </div>
                  <Button onClick={handleAnalyzeFile} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analyzing your Excel file... This may take a few moments.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {analysisResult && uploadedFile ? (
            <ProductPreview
              fileId={uploadedFile.id}
              analysisResult={analysisResult}
              onImportReady={() => setActiveTab('import')}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Product Preview</CardTitle>
                <CardDescription>Review and select products to import</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the analysis step to preview products
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Products</CardTitle>
              <CardDescription>Import selected products to your catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Import functionality will be available after completing the preview step
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
