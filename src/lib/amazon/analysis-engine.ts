import { FileAnalysisResult, UploadedFile } from '@/types/amazon'
import { ExcelParser } from './excel-parser'
import { FieldMapper } from './field-mapper'

export class AnalysisEngine {
  private excelParser: ExcelParser | null = null
  private fieldMapper: FieldMapper

  constructor() {
    this.fieldMapper = new FieldMapper()
  }

  /**
   * Analyze uploaded Amazon Excel file
   */
  public async analyzeFile(uploadedFile: UploadedFile): Promise<FileAnalysisResult> {
    try {
      // Initialize Excel parser
      this.excelParser = new ExcelParser(uploadedFile.path, uploadedFile.originalName)

      // Parse the Excel file
      const parsedFile = this.excelParser.parse()

      // Map Amazon products to our schema
      const mappedProducts = this.fieldMapper.mapProducts(parsedFile.products)

      // Get mapping statistics
      const mappingStats = this.fieldMapper.getMappingStats(parsedFile.products)

      // Create analysis result
      const result: FileAnalysisResult = {
        file: uploadedFile,
        excel: parsedFile.fileInfo,
        sheets: parsedFile.sheets,
        products: parsedFile.products,
        preview: mappedProducts,
        summary: mappingStats,
        fieldMapping: this.fieldMapper.getFieldMapping(),
      }

      return result
    } catch (error) {
      console.error('Analysis error:', error)
      throw new Error(
        `Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate file structure before analysis
   */
  public validateFileStructure(uploadedFile: UploadedFile): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      console.log('Validating file structure for:', uploadedFile.path)

      // Check file exists and is readable
      const parser = new ExcelParser(uploadedFile.path, uploadedFile.originalName)
      console.log('Excel parser created successfully')

      const parsedFile = parser.parse()
      console.log('File parsed successfully')

      // Check if we found a template sheet
      if (!parsedFile.templateSheet) {
        errors.push('No valid Template sheet found in the Excel file')
        console.log('No template sheet found')
      } else {
        console.log('Template sheet found:', parsedFile.templateSheet.sheetName)
      }

      // Check if we have any products
      if (parsedFile.products.length === 0) {
        errors.push('No valid product data found in the file')
        console.log('No products found')
      } else {
        console.log('Products found:', parsedFile.products.length)
      }

      // Check for required columns
      if (parsedFile.templateSheet) {
        const headers = parsedFile.templateSheet.headers.map(h => h.toLowerCase())
        const requiredFields = ['item_sku', 'item_name', 'feed_product_type']

        for (const field of requiredFields) {
          if (!headers.some(h => h.includes(field))) {
            errors.push(`Required field '${field}' not found in the file`)
            console.log(`Missing required field: ${field}`)
          }
        }

        // Check for recommended fields
        const recommendedFields = ['product_description', 'main_image_url', 'standard_price']
        for (const field of recommendedFields) {
          if (!headers.some(h => h.includes(field))) {
            warnings.push(`Recommended field '${field}' not found in the file`)
            console.log(`Missing recommended field: ${field}`)
          }
        }
      }

      // Check file size and row count
      if (parsedFile.products.length > 10000) {
        warnings.push('Large file detected. Processing may take longer than usual.')
      }

      if (parsedFile.products.length < 5) {
        warnings.push('Very few products found. Please verify this is the correct file.')
      }

      const validationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
      }

      console.log('Validation completed:', validationResult)
      return validationResult
    } catch (error) {
      console.error('Validation error:', error)
      return {
        isValid: false,
        errors: [
          `Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
      }
    }
  }

  /**
   * Get detailed analysis statistics
   */
  public getDetailedStats(result: FileAnalysisResult): {
    fileStats: {
      fileName: string
      fileSize: string
      sheets: number
      totalRows: number
      totalColumns: number
    }
    productStats: {
      totalProducts: number
      validProducts: number
      invalidProducts: number
      duplicateSkus: number
      missingImages: number
      missingPrices: number
      missingDescriptions: number
    }
    fieldCoverage: {
      [fieldName: string]: {
        present: number
        missing: number
        percentage: number
      }
    }
  } {
    const fileStats = {
      fileName: result.file.originalName,
      fileSize: this.formatFileSize(result.file.size),
      sheets: result.sheets.length,
      totalRows: result.excel.totalRows,
      totalColumns: result.excel.totalColumns,
    }

    let missingImages = 0
    let missingPrices = 0
    let missingDescriptions = 0

    for (const product of result.preview) {
      if (!product.images || product.images.length === 0) missingImages++
      if (!product.price) missingPrices++
      if (!product.description || product.description.trim().length === 0) missingDescriptions++
    }

    const productStats = {
      totalProducts: result.summary.totalProducts,
      validProducts: result.summary.validProducts,
      invalidProducts: result.summary.invalidProducts,
      duplicateSkus: result.summary.duplicateSkus,
      missingImages,
      missingPrices,
      missingDescriptions,
    }

    // Calculate field coverage
    const fieldCoverage: any = {}
    const importantFields = [
      'item_sku',
      'item_name',
      'product_description',
      'main_image_url',
      'standard_price',
      'item_weight',
      'feed_product_type',
      'browse_nodes',
    ]

    for (const field of importantFields) {
      let present = 0
      for (const product of result.products) {
        if (product[field] && String(product[field]).trim().length > 0) {
          present++
        }
      }

      const missing = result.products.length - present
      fieldCoverage[field] = {
        present,
        missing,
        percentage:
          result.products.length > 0 ? Math.round((present / result.products.length) * 100) : 0,
      }
    }

    return {
      fileStats,
      productStats,
      fieldCoverage,
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Generate analysis report summary
   */
  public generateReportSummary(result: FileAnalysisResult): string {
    const stats = this.getDetailedStats(result)

    return `
Analysis Complete for ${stats.fileStats.fileName}

File Information:
- File Size: ${stats.fileStats.fileSize}
- Sheets: ${stats.fileStats.sheets}
- Total Rows: ${stats.fileStats.totalRows}
- Total Columns: ${stats.fileStats.totalColumns}

Product Summary:
- Total Products: ${stats.productStats.totalProducts}
- Valid Products: ${stats.productStats.validProducts}
- Invalid Products: ${stats.productStats.invalidProducts}
- Duplicate SKUs: ${stats.productStats.duplicateSkus}

Data Quality:
- Missing Images: ${stats.productStats.missingImages}
- Missing Prices: ${stats.productStats.missingPrices}
- Missing Descriptions: ${stats.productStats.missingDescriptions}

Ready for import: ${stats.productStats.validProducts} products
    `.trim()
  }

  /**
   * Export analysis results to JSON
   */
  public exportAnalysisResults(result: FileAnalysisResult): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      file: {
        name: result.file.originalName,
        size: result.file.size,
        uploadedAt: result.file.uploadedAt,
      },
      analysis: this.getDetailedStats(result),
      summary: result.summary,
      fieldMapping: result.fieldMapping,
    }

    return JSON.stringify(exportData, null, 2)
  }
}
