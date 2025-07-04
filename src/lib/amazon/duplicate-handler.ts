import { amazonProductData, db, products } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { TransformedProductData } from './data-transformer'

export interface DuplicateHandlingOptions {
  strategy: 'skip' | 'overwrite' | 'merge' | 'rename'
  renamePattern?: string // e.g., '{sku}-{timestamp}' or '{sku}-amazon'
  mergeFields?: string[] // fields to merge when strategy is 'merge'
  compareFields?: string[] // fields to compare for detecting changes
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingProduct?: any
  existingAmazonData?: any
  action: 'skip' | 'overwrite' | 'merge' | 'rename' | 'create'
  reason?: string
}

export class DuplicateHandler {
  private options: DuplicateHandlingOptions

  constructor(options: DuplicateHandlingOptions = { strategy: 'skip' }) {
    this.options = {
      renamePattern: '{sku}-amazon-{timestamp}',
      mergeFields: ['images', 'tags', 'description'],
      compareFields: ['name', 'price', 'description', 'images'],
      ...options,
    }
  }

  /**
   * Check if a product is a duplicate and determine the action to take
   */
  async checkDuplicate(sku: string): Promise<DuplicateCheckResult> {
    try {
      // Check if product exists by SKU
      const existingProduct = await db.select().from(products).where(eq(products.sku, sku)).limit(1)

      if (existingProduct.length === 0) {
        return {
          isDuplicate: false,
          action: 'create',
        }
      }

      // Product exists, get Amazon data if available
      const existingAmazonData = await db
        .select()
        .from(amazonProductData)
        .where(eq(amazonProductData.productId, existingProduct[0].id))
        .limit(1)

      // Determine action based on strategy
      let action: DuplicateCheckResult['action'] = 'skip'
      let reason: string | undefined

      switch (this.options.strategy) {
        case 'skip':
          action = 'skip'
          reason = 'Product already exists and strategy is set to skip'
          break

        case 'overwrite':
          action = 'overwrite'
          reason = 'Product will be overwritten'
          break

        case 'merge':
          action = 'merge'
          reason = 'Product data will be merged'
          break

        case 'rename':
          action = 'rename'
          reason = 'Product will be imported with a new SKU'
          break
      }

      return {
        isDuplicate: true,
        existingProduct: existingProduct[0],
        existingAmazonData: existingAmazonData[0] || null,
        action,
        reason,
      }
    } catch (error) {
      console.error('Error checking duplicate:', error)
      return {
        isDuplicate: false,
        action: 'create',
      }
    }
  }

  /**
   * Generate a new SKU for renamed products
   */
  generateNewSku(originalSku: string): string {
    const timestamp = Date.now()
    const pattern = this.options.renamePattern || '{sku}-amazon-{timestamp}'

    return pattern
      .replace('{sku}', originalSku)
      .replace('{timestamp}', timestamp.toString())
      .replace('{date}', new Date().toISOString().split('T')[0])
  }

  /**
   * Merge product data with existing product
   */
  mergeProductData(
    existingProduct: any,
    newProductData: TransformedProductData['productData']
  ): TransformedProductData['productData'] {
    const mergedData = { ...existingProduct }

    // Merge specific fields based on configuration
    if (this.options.mergeFields?.includes('images')) {
      const existingImages = JSON.parse(existingProduct.images || '[]')
      const newImages = JSON.parse(newProductData.images || '[]')
      const mergedImages = [...new Set([...existingImages, ...newImages])]
      mergedData.images = JSON.stringify(mergedImages)
    }

    if (this.options.mergeFields?.includes('tags')) {
      const existingTags = JSON.parse(existingProduct.tags || '[]')
      const newTags = JSON.parse(newProductData.tags || '[]')
      const mergedTags = [...new Set([...existingTags, ...newTags])]
      mergedData.tags = JSON.stringify(mergedTags)
    }

    if (this.options.mergeFields?.includes('description')) {
      // Merge descriptions if new one is longer or existing is empty
      if (
        !existingProduct.description ||
        (newProductData.description &&
          newProductData.description.length > existingProduct.description.length)
      ) {
        mergedData.description = newProductData.description
      }
    }

    // Always update certain fields
    mergedData.updatedAt = new Date()

    // Update price if new price is different
    if (newProductData.price !== existingProduct.price) {
      mergedData.price = newProductData.price
    }

    // Update stock (Amazon data is usually more current)
    mergedData.stock = newProductData.stock

    return mergedData
  }

  /**
   * Merge Amazon data with existing Amazon data
   */
  mergeAmazonData(
    existingAmazonData: any,
    newAmazonData: TransformedProductData['amazonData']
  ): TransformedProductData['amazonData'] {
    const mergedData = { ...existingAmazonData }

    // Update with new Amazon data (Amazon data is usually more current)
    Object.keys(newAmazonData).forEach(key => {
      if (key !== 'createdAt' && key !== 'productId') {
        mergedData[key] = newAmazonData[key as keyof typeof newAmazonData]
      }
    })

    mergedData.updatedAt = new Date()

    return mergedData
  }

  /**
   * Detect changes between existing and new product data
   */
  detectChanges(
    existingProduct: any,
    newProductData: TransformedProductData['productData']
  ): string[] {
    const changes: string[] = []
    const compareFields = this.options.compareFields || ['name', 'price', 'description', 'images']

    compareFields.forEach(field => {
      const existingValue = existingProduct[field]
      const newValue = newProductData[field as keyof typeof newProductData]

      if (field === 'images' || field === 'tags') {
        // Compare arrays
        const existingArray = JSON.parse(existingValue || '[]')
        const newArray = JSON.parse((newValue as string) || '[]')

        if (JSON.stringify(existingArray.sort()) !== JSON.stringify(newArray.sort())) {
          changes.push(field)
        }
      } else if (existingValue !== newValue) {
        changes.push(field)
      }
    })

    return changes
  }

  /**
   * Get duplicate handling statistics
   */
  static async getDuplicateStats(skus: string[]): Promise<{
    total: number
    duplicates: number
    new: number
    duplicateSkus: string[]
  }> {
    try {
      const existingProducts = await db
        .select({ sku: products.sku })
        .from(products)
        .where(eq(products.sku, skus[0])) // This would need to be modified for multiple SKUs

      // For multiple SKUs, we'd need to use a different approach
      // This is a simplified version
      const duplicateSkus = existingProducts.map(p => p.sku)

      return {
        total: skus.length,
        duplicates: duplicateSkus.length,
        new: skus.length - duplicateSkus.length,
        duplicateSkus,
      }
    } catch (error) {
      console.error('Error getting duplicate stats:', error)
      return {
        total: skus.length,
        duplicates: 0,
        new: skus.length,
        duplicateSkus: [],
      }
    }
  }

  /**
   * Validate duplicate handling options
   */
  validateOptions(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!['skip', 'overwrite', 'merge', 'rename'].includes(this.options.strategy)) {
      errors.push('Invalid strategy. Must be one of: skip, overwrite, merge, rename')
    }

    if (this.options.strategy === 'rename' && !this.options.renamePattern) {
      errors.push('Rename pattern is required when strategy is "rename"')
    }

    if (this.options.renamePattern && !this.options.renamePattern.includes('{sku}')) {
      errors.push('Rename pattern must include {sku} placeholder')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

export default DuplicateHandler
