import { amazonProductData, db, products } from '@/lib/db'
import { ProductPreview } from '@/types/amazon'
import { eq } from 'drizzle-orm'
import { DataTransformer, ImportSettings } from './data-transformer'
import { DuplicateHandler, DuplicateHandlingOptions } from './duplicate-handler'

export interface ImportProcessorOptions {
  importSettings: ImportSettings
  duplicateHandling: DuplicateHandlingOptions
  batchSize?: number
  enableLogging?: boolean
  dryRun?: boolean
}

export interface ImportResult {
  success: boolean
  total: number
  successful: number
  failed: number
  skipped: number
  errors: Array<{
    sku: string
    error: string
    details?: any
  }>
  warnings: Array<{
    sku: string
    warning: string
    details?: any
  }>
  duplicates: Array<{
    sku: string
    action: string
    reason: string
  }>
  processingTime: number
  statistics: {
    newProducts: number
    updatedProducts: number
    duplicatesSkipped: number
    duplicatesOverwritten: number
    duplicatesMerged: number
    duplicatesRenamed: number
  }
}

export class ImportProcessor {
  private dataTransformer: DataTransformer
  private duplicateHandler: DuplicateHandler
  private options: ImportProcessorOptions

  constructor(options: ImportProcessorOptions) {
    this.options = {
      batchSize: 50,
      enableLogging: true,
      dryRun: false,
      ...options,
    }

    this.dataTransformer = new DataTransformer(options.importSettings)
    this.duplicateHandler = new DuplicateHandler(options.duplicateHandling)
  }

  /**
   * Process import of products
   */
  async processImport(productsToImport: ProductPreview[]): Promise<ImportResult> {
    const startTime = Date.now()

    const result: ImportResult = {
      success: false,
      total: productsToImport.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: [],
      duplicates: [],
      processingTime: 0,
      statistics: {
        newProducts: 0,
        updatedProducts: 0,
        duplicatesSkipped: 0,
        duplicatesOverwritten: 0,
        duplicatesMerged: 0,
        duplicatesRenamed: 0,
      },
    }

    try {
      // Validate options
      const validationResult = this.validateOptions()
      if (!validationResult.valid) {
        throw new Error(`Invalid options: ${validationResult.errors.join(', ')}`)
      }

      // Process products in batches
      const batchSize = this.options.batchSize || 50
      const batches = this.createBatches(productsToImport, batchSize)

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        if (!batch) continue // Skip empty batches
        this.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} products)`)

        for (const productData of batch) {
          try {
            await this.processProduct(productData, result)
          } catch (error) {
            result.failed++
            result.errors.push({
              sku: productData.sku,
              error: error instanceof Error ? error.message : 'Unknown error',
              details: error,
            })
            this.log(`Failed to process product ${productData.sku}: ${error}`)
          }
        }
      }

      result.success = result.failed === 0
      result.processingTime = Date.now() - startTime

      this.log(`Import completed in ${result.processingTime}ms`)
      this.log(
        `Results: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`
      )

      return result
    } catch (error) {
      result.processingTime = Date.now() - startTime
      result.errors.push({
        sku: 'SYSTEM',
        error: error instanceof Error ? error.message : 'Unknown system error',
        details: error,
      })

      this.log(`Import failed: ${error}`)
      return result
    }
  }

  /**
   * Process a single product
   */
  private async processProduct(productData: ProductPreview, result: ImportResult): Promise<void> {
    // Check for duplicates
    const duplicateCheck = await this.duplicateHandler.checkDuplicate(productData.sku)

    result.duplicates.push({
      sku: productData.sku,
      action: duplicateCheck.action,
      reason: duplicateCheck.reason || 'No reason provided',
    })

    // Handle duplicate based on strategy
    if (duplicateCheck.isDuplicate) {
      switch (duplicateCheck.action) {
        case 'skip':
          result.skipped++
          result.statistics.duplicatesSkipped++
          this.log(`Skipped duplicate product: ${productData.sku}`)
          return

        case 'overwrite':
          await this.overwriteProduct(productData, duplicateCheck.existingProduct, result)
          return

        case 'merge':
          await this.mergeProduct(
            productData,
            duplicateCheck.existingProduct,
            duplicateCheck.existingAmazonData,
            result
          )
          return

        case 'rename':
          await this.renameAndCreateProduct(productData, result)
          return
      }
    }

    // Create new product
    await this.createNewProduct(productData, result)
  }

  /**
   * Create a new product
   */
  private async createNewProduct(productData: ProductPreview, result: ImportResult): Promise<void> {
    const transformedData = this.dataTransformer.transformProduct(productData)

    // Validate transformed data
    const validation = this.dataTransformer.validateTransformedData(transformedData)
    if (!validation.valid) {
      throw new Error(`Invalid product data: ${validation.errors.join(', ')}`)
    }

    if (this.options.dryRun) {
      this.log(`[DRY RUN] Would create new product: ${productData.sku}`)
      result.successful++
      result.statistics.newProducts++
      return
    }

    // Insert product
    const [newProduct] = await db.insert(products).values(transformedData.productData).returning()

    if (!newProduct) {
      throw new Error('Failed to create product - no product returned from database')
    }

    // Insert Amazon data
    await db.insert(amazonProductData).values({
      ...transformedData.amazonData,
      productId: newProduct.id,
    })

    result.successful++
    result.statistics.newProducts++
    this.log(`Created new product: ${productData.sku} (ID: ${newProduct.id})`)
  }

  /**
   * Overwrite existing product
   */
  private async overwriteProduct(
    productData: ProductPreview,
    existingProduct: any,
    result: ImportResult
  ): Promise<void> {
    const transformedData = this.dataTransformer.transformProduct(productData)

    if (this.options.dryRun) {
      this.log(`[DRY RUN] Would overwrite product: ${productData.sku}`)
      result.successful++
      result.statistics.duplicatesOverwritten++
      return
    }

    // Update product
    await db
      .update(products)
      .set({
        ...transformedData.productData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, existingProduct.id))

    // Update or insert Amazon data
    const existingAmazonData = await db
      .select()
      .from(amazonProductData)
      .where(eq(amazonProductData.productId, existingProduct.id))
      .limit(1)

    if (existingAmazonData.length > 0) {
      await db
        .update(amazonProductData)
        .set({
          ...transformedData.amazonData,
          productId: existingProduct.id,
          updatedAt: new Date(),
        })
        .where(eq(amazonProductData.productId, existingProduct.id))
    } else {
      await db.insert(amazonProductData).values({
        ...transformedData.amazonData,
        productId: existingProduct.id,
      })
    }

    result.successful++
    result.statistics.duplicatesOverwritten++
    this.log(`Overwritten product: ${productData.sku} (ID: ${existingProduct.id})`)
  }

  /**
   * Merge product data with existing product
   */
  private async mergeProduct(
    productData: ProductPreview,
    existingProduct: any,
    existingAmazonData: any,
    result: ImportResult
  ): Promise<void> {
    const transformedData = this.dataTransformer.transformProduct(productData)

    // Merge product data
    const mergedProductData = this.duplicateHandler.mergeProductData(
      existingProduct,
      transformedData.productData
    )

    // Merge Amazon data
    const mergedAmazonData = existingAmazonData
      ? this.duplicateHandler.mergeAmazonData(existingAmazonData, transformedData.amazonData)
      : transformedData.amazonData

    if (this.options.dryRun) {
      this.log(`[DRY RUN] Would merge product: ${productData.sku}`)
      result.successful++
      result.statistics.duplicatesMerged++
      return
    }

    // Update product
    await db.update(products).set(mergedProductData).where(eq(products.id, existingProduct.id))

    // Update or insert Amazon data
    if (existingAmazonData) {
      await db
        .update(amazonProductData)
        .set({
          ...mergedAmazonData,
          productId: existingProduct.id,
        })
        .where(eq(amazonProductData.productId, existingProduct.id))
    } else {
      await db.insert(amazonProductData).values({
        ...mergedAmazonData,
        productId: existingProduct.id,
      })
    }

    result.successful++
    result.statistics.duplicatesMerged++
    this.log(`Merged product: ${productData.sku} (ID: ${existingProduct.id})`)
  }

  /**
   * Rename and create product
   */
  private async renameAndCreateProduct(
    productData: ProductPreview,
    result: ImportResult
  ): Promise<void> {
    const newSku = this.duplicateHandler.generateNewSku(productData.sku)
    const renamedProductData = { ...productData, sku: newSku }

    result.warnings.push({
      sku: productData.sku,
      warning: `SKU renamed to avoid duplicate: ${newSku}`,
      details: { originalSku: productData.sku, newSku },
    })

    await this.createNewProduct(renamedProductData, result)
    result.statistics.duplicatesRenamed++
    this.log(`Renamed and created product: ${productData.sku} -> ${newSku}`)
  }

  /**
   * Create batches for processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Validate processor options
   */
  private validateOptions(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.options.importSettings) {
      errors.push('Import settings are required')
    }

    if (!this.options.duplicateHandling) {
      errors.push('Duplicate handling options are required')
    }

    if (this.options.batchSize && this.options.batchSize <= 0) {
      errors.push('Batch size must be greater than 0')
    }

    // Validate duplicate handler options
    const duplicateValidation = this.duplicateHandler.validateOptions()
    if (!duplicateValidation.valid) {
      errors.push(...duplicateValidation.errors)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string): void {
    if (this.options.enableLogging) {
      console.log(`[ImportProcessor] ${message}`)
    }
  }

  /**
   * Get import statistics
   */
  static async getImportStatistics(timeRange?: { start: Date; end: Date }): Promise<{
    totalImports: number
    totalProducts: number
    successfulImports: number
    failedImports: number
    averageProcessingTime: number
  }> {
    // This would typically query an import_logs table
    // For now, return placeholder data
    return {
      totalImports: 0,
      totalProducts: 0,
      successfulImports: 0,
      failedImports: 0,
      averageProcessingTime: 0,
    }
  }
}

export default ImportProcessor
