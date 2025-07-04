import { AmazonProduct, ExcelFileInfo, ExcelSheetData } from '@/types/amazon'
import { existsSync, readFileSync } from 'fs'
import * as XLSX from 'xlsx'

export interface ParsedExcelFile {
  fileInfo: ExcelFileInfo
  sheets: ExcelSheetData[]
  templateSheet: ExcelSheetData | null
  products: AmazonProduct[]
}

export class ExcelParser {
  private workbook: XLSX.WorkBook | null = null
  private filename: string = ''
  private filePath: string = ''

  constructor(filePath: string, filename: string) {
    this.filename = filename
    this.filePath = filePath

    try {
      // Check if file exists and is accessible
      if (!existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`)
      }

      // Try to read the file to check permissions
      const buffer = readFileSync(filePath)
      console.log('File read successfully, size:', buffer.length)

      // Parse the Excel file from buffer
      this.workbook = XLSX.read(buffer, { type: 'buffer' })
      console.log('Excel workbook loaded successfully')
    } catch (error) {
      console.error('Error loading Excel file:', error)
      throw new Error(
        `Cannot access file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Parse the Excel file and extract all relevant data
   */
  public parse(): ParsedExcelFile {
    if (!this.workbook) {
      throw new Error('Excel file not loaded')
    }

    console.log('Parsing Excel file:', this.filename)
    console.log('Available sheets:', this.workbook.SheetNames)

    const sheets = this.parseAllSheets()
    console.log(
      'Parsed sheets:',
      sheets.map(s => ({ name: s.sheetName, rows: s.rowCount, cols: s.columnCount }))
    )

    const templateSheet = this.findTemplateSheet(sheets)
    console.log('Template sheet found:', templateSheet ? templateSheet.sheetName : 'None')

    if (templateSheet) {
      console.log('Template sheet headers:', templateSheet.headers.slice(0, 10)) // First 10 headers
      console.log(
        'Template sheet data sample:',
        templateSheet.data.slice(0, 5).map(row => row.slice(0, 5))
      ) // First 5 rows, 5 columns
    }

    const products = templateSheet ? this.extractProducts(templateSheet) : []
    console.log('Extracted products count:', products.length)

    if (products.length > 0) {
      console.log('Sample product:', products[0])
    }

    const fileInfo: ExcelFileInfo = {
      filename: this.filename,
      sheets: this.workbook.SheetNames,
      totalRows: templateSheet ? templateSheet.rowCount : 0,
      totalColumns: templateSheet ? templateSheet.columnCount : 0,
      analyzedAt: new Date().toISOString(),
    }

    return {
      fileInfo,
      sheets,
      templateSheet,
      products,
    }
  }

  /**
   * Parse all sheets in the workbook
   */
  private parseAllSheets(): ExcelSheetData[] {
    if (!this.workbook) return []

    return this.workbook.SheetNames.map(sheetName => {
      const worksheet = this.workbook!.Sheets[sheetName]
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')

      // Convert sheet to array of arrays
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      })

      // Extract headers (assuming row 3 contains field names for Template sheet)
      const headers =
        sheetName.toLowerCase() === 'template' && data.length > 2 ? data[2] || [] : data[0] || []

      return {
        sheetName,
        headers: headers.map(h => String(h)),
        data,
        rowCount: range.e.r + 1,
        columnCount: range.e.c + 1,
      }
    })
  }

  /**
   * Find the Template sheet which contains the actual product data
   */
  private findTemplateSheet(sheets: ExcelSheetData[]): ExcelSheetData | null {
    // First, try to find sheet named "Template"
    let templateSheet = sheets.find(sheet => sheet.sheetName.toLowerCase() === 'template')

    // If not found, look for sheet with most data
    if (!templateSheet) {
      templateSheet = sheets.reduce((largest, current) =>
        current.rowCount > largest.rowCount ? current : largest
      )
    }

    // Validate that this looks like a product sheet
    if (templateSheet && this.isValidProductSheet(templateSheet)) {
      return templateSheet
    }

    return null
  }

  /**
   * Validate that a sheet contains Amazon product data
   */
  private isValidProductSheet(sheet: ExcelSheetData): boolean {
    const requiredFields = [
      'item_sku',
      'item_name',
      'product_description',
      'main_image_url',
      'feed_product_type',
    ]

    const headers = sheet.headers.map(h => h.toLowerCase())
    console.log('Validating sheet:', sheet.sheetName)
    console.log('Sheet headers (first 10):', headers.slice(0, 10))
    console.log('Sheet dimensions:', { rows: sheet.rowCount, columns: sheet.columnCount })

    const fieldMatches = requiredFields.map(field => {
      const found = headers.some(header => header.includes(field))
      console.log(`Field '${field}' found:`, found)
      return found
    })

    const hasRequiredFields = fieldMatches.some(match => match)
    console.log('Has required fields:', hasRequiredFields)

    const isValid = hasRequiredFields && sheet.rowCount > 3 && sheet.columnCount > 10
    console.log('Sheet validation result:', isValid)

    return isValid
  }

  /**
   * Extract Amazon products from the template sheet
   */
  private extractProducts(templateSheet: ExcelSheetData): AmazonProduct[] {
    const products: AmazonProduct[] = []
    const headers = templateSheet.headers
    const data = templateSheet.data

    // Skip header rows (first 3 rows typically contain metadata, headers, field names)
    const dataStartRow = this.findDataStartRow(data, headers)

    for (let i = dataStartRow; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const product = this.parseProductRow(row, headers)
      if (product && this.isValidProduct(product)) {
        products.push(product)
      }
    }

    return products
  }

  /**
   * Find the row where actual product data starts
   */
  private findDataStartRow(data: any[][], headers: string[]): number {
    // For Amazon Category Listings Report, data typically starts at row 4 (index 3)
    // But let's be smart about it and find the first row with actual product data

    for (let i = 3; i < Math.min(data.length, 10); i++) {
      const row = data[i]
      if (row && row.length > 0) {
        // Check if this row has data in key columns
        const skuIndex = this.findColumnIndex(headers, 'item_sku')
        const nameIndex = this.findColumnIndex(headers, 'item_name')

        if (skuIndex >= 0 && nameIndex >= 0) {
          if (row[skuIndex] && row[nameIndex]) {
            return i
          }
        }
      }
    }

    return 3 // Default to row 4 (index 3)
  }

  /**
   * Parse a single product row
   */
  private parseProductRow(row: any[], headers: string[]): AmazonProduct | null {
    try {
      const product: any = {}

      // Map all available fields
      headers.forEach((header, index) => {
        const value = row[index]
        if (value !== undefined && value !== null && value !== '') {
          product[header] = String(value).trim()
        }
      })

      // Ensure required fields exist
      const requiredFields = ['item_sku', 'item_name', 'feed_product_type']
      for (const field of requiredFields) {
        if (!product[field]) {
          return null
        }
      }

      return product as AmazonProduct
    } catch (error) {
      console.error('Error parsing product row:', error)
      return null
    }
  }

  /**
   * Find column index by field name (case-insensitive, partial match)
   */
  private findColumnIndex(headers: string[], fieldName: string): number {
    return headers.findIndex(header => header.toLowerCase().includes(fieldName.toLowerCase()))
  }

  /**
   * Validate that a product has minimum required data
   */
  private isValidProduct(product: AmazonProduct): boolean {
    return !!(
      product.item_sku &&
      product.item_name &&
      product.feed_product_type &&
      product.item_sku.trim().length > 0 &&
      product.item_name.trim().length > 0
    )
  }

  /**
   * Get sheet statistics
   */
  public getSheetStats(sheetName: string): { rows: number; columns: number; hasData: boolean } {
    if (!this.workbook) {
      return { rows: 0, columns: 0, hasData: false }
    }

    const worksheet = this.workbook.Sheets[sheetName]
    if (!worksheet) {
      return { rows: 0, columns: 0, hasData: false }
    }

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
    const rows = range.e.r + 1
    const columns = range.e.c + 1
    const hasData = rows > 1 && columns > 1

    return { rows, columns, hasData }
  }

  /**
   * Extract specific cell value
   */
  public getCellValue(sheetName: string, cellAddress: string): string {
    if (!this.workbook) return ''

    const worksheet = this.workbook.Sheets[sheetName]
    if (!worksheet) return ''

    const cell = worksheet[cellAddress]
    return cell ? String(cell.v || '') : ''
  }
}
