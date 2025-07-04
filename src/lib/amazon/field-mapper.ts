import { AmazonProduct, FieldMapping, ProductPreview } from '@/types/amazon'

export interface MappingRule {
  amazonField: string
  dbField: string
  transform?: (value: any) => any
  required?: boolean
  validation?: (value: any) => boolean
}

export class FieldMapper {
  private mappingRules: MappingRule[] = []

  constructor() {
    this.initializeDefaultMappings()
  }

  /**
   * Initialize default field mappings based on our analysis
   */
  private initializeDefaultMappings(): void {
    this.mappingRules = [
      // Core product information
      {
        amazonField: 'item_sku',
        dbField: 'sku',
        required: true,
        validation: value => typeof value === 'string' && value.trim().length > 0,
      },
      {
        amazonField: 'item_name',
        dbField: 'name',
        required: true,
        validation: value => typeof value === 'string' && value.trim().length > 0,
      },
      {
        amazonField: 'product_description',
        dbField: 'description',
        transform: value => (value ? String(value).trim() : ''),
      },

      // Images - combine main image and other images
      {
        amazonField: 'main_image_url',
        dbField: 'images',
        transform: (value, product) => {
          const images = []
          if (value) images.push(value)

          // Add other images
          for (let i = 1; i <= 8; i++) {
            const otherImage = product[`other_image_url${i}`]
            if (otherImage) images.push(otherImage)
          }

          return images
        },
      },

      // Pricing - Updated to use actual Amazon price fields with fallback logic
      {
        amazonField: 'price_extraction',
        dbField: 'price',
        transform: (value, product) => {
          // Try multiple price fields in order of preference
          const priceFields = [
            'list_price_with_tax',
            'purchasable_offer[marketplace_id=A1F83G8C2ARO7P]#1.our_price#1.schedule#1.value_with_tax',
            'standard_price',
            'our_price',
            'price',
          ]

          console.log('Extracting price for product:', product.item_sku)

          for (const field of priceFields) {
            const priceValue = product[field]
            console.log(`  Checking field '${field}':`, priceValue)
            if (priceValue !== undefined && priceValue !== null && priceValue !== '') {
              const price = parseFloat(String(priceValue))
              if (!isNaN(price) && price > 0) {
                console.log(`  ✅ Found price: ${price} from field '${field}'`)
                return price
              }
            }
          }

          console.log('  ❌ No valid price found')
          return null
        },
      },

      // Physical attributes
      {
        amazonField: 'item_weight',
        dbField: 'weight',
        transform: value => {
          if (!value) return null
          const weight = parseFloat(String(value))
          return isNaN(weight) ? null : weight
        },
      },
      {
        amazonField: 'item_length',
        dbField: 'dimensions',
        transform: (value, product) => {
          const length = parseFloat(String(value || 0))
          const width = parseFloat(String(product.item_width || 0))
          const height = parseFloat(String(product.item_height || 0))
          const unit = product.item_dimensions_unit_of_measure || 'inches'

          if (length > 0 || width > 0 || height > 0) {
            return { length, width, height, unit }
          }
          return null
        },
      },

      // Tags from bullet points and keywords
      {
        amazonField: 'bullet_point1',
        dbField: 'tags',
        transform: (value, product) => {
          const tags = []

          // Add bullet points as tags
          for (let i = 1; i <= 5; i++) {
            const bullet = product[`bullet_point${i}`]
            if (bullet) {
              // Extract meaningful keywords from bullet points
              const keywords = String(bullet)
                .split(/[,;.]/)
                .map(k => k.trim())
                .filter(k => k.length > 2 && k.length < 50)
              tags.push(...keywords)
            }
          }

          // Add generic keywords
          if (product.generic_keywords) {
            const keywords = String(product.generic_keywords)
              .split(/[,;]/)
              .map(k => k.trim())
              .filter(k => k.length > 2)
            tags.push(...keywords)
          }

          // Remove duplicates and limit to reasonable number
          return [...new Set(tags)].slice(0, 20)
        },
      },

      // Amazon-specific data
      {
        amazonField: 'feed_product_type',
        dbField: 'amazonData.feedProductType',
        required: true,
      },
      {
        amazonField: 'browse_nodes',
        dbField: 'amazonData.browseNodes',
      },
      {
        amazonField: 'listing_status',
        dbField: 'amazonData.listingStatus',
      },
    ]
  }

  /**
   * Map Amazon product to our database schema
   */
  public mapProduct(amazonProduct: AmazonProduct): ProductPreview {
    // Debug: Show all available fields for the first product
    if (amazonProduct.item_sku === '20181311') {
      console.log('🔍 DEBUG: Available fields for product', amazonProduct.item_sku)
      console.log(
        'All fields:',
        Object.keys(amazonProduct).filter(key => key.includes('price') || key.includes('cost'))
      )
    }

    const mapped: any = {
      // Initialize with defaults
      sku: '',
      name: '',
      description: '',
      images: [],
      price: null,
      compareAtPrice: null,
      weight: null,
      dimensions: null,
      tags: [],
      amazonData: {
        amazonSku: amazonProduct.item_sku || '',
        feedProductType: amazonProduct.feed_product_type || '',
        browseNodes: amazonProduct.browse_nodes || '',
        bulletPoints: this.extractBulletPoints(amazonProduct),
        listingStatus: amazonProduct.listing_status || 'active',
      },
      importStatus: 'pending' as const,
      importErrors: [],
    }

    // Apply all mapping rules
    for (const rule of this.mappingRules) {
      try {
        const value = amazonProduct[rule.amazonField]

        // Special handling for custom transformation rules (like price_extraction)
        if (rule.transform && rule.amazonField === 'price_extraction') {
          // For custom transformations, always run the transform function
          let transformedValue = rule.transform(value, amazonProduct)
          this.setNestedValue(mapped, rule.dbField, transformedValue)
        } else if (value !== undefined && value !== null && value !== '') {
          let transformedValue = rule.transform ? rule.transform(value, amazonProduct) : value
          this.setNestedValue(mapped, rule.dbField, transformedValue)
        }
      } catch (error) {
        console.error(`Error mapping field ${rule.amazonField}:`, error)
        if (!mapped.importErrors) mapped.importErrors = []
        mapped.importErrors.push(`Failed to map field: ${rule.amazonField}`)
      }
    }

    // Validate required fields
    const validationErrors = this.validateMappedProduct(mapped)
    if (validationErrors.length > 0) {
      mapped.importStatus = 'error'
      mapped.importErrors = [...(mapped.importErrors || []), ...validationErrors]
    }

    return mapped as ProductPreview
  }

  /**
   * Extract bullet points from Amazon product
   */
  private extractBulletPoints(product: AmazonProduct): string[] {
    const bulletPoints = []
    for (let i = 1; i <= 5; i++) {
      const bullet = product[`bullet_point${i}`]
      if (bullet && String(bullet).trim()) {
        bulletPoints.push(String(bullet).trim())
      }
    }
    return bulletPoints
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * Validate mapped product for required fields
   */
  private validateMappedProduct(product: any): string[] {
    const errors = []

    if (!product.sku || product.sku.trim().length === 0) {
      errors.push('SKU is required')
    }

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required')
    }

    if (!product.amazonData?.feedProductType) {
      errors.push('Feed product type is required')
    }

    return errors
  }

  /**
   * Get field mapping configuration
   */
  public getFieldMapping(): FieldMapping {
    return {
      sku: 'item_sku',
      name: 'item_name',
      description: 'product_description',
      mainImage: 'main_image_url',
      price: 'standard_price',
      weight: 'item_weight',
      dimensions: {
        length: 'item_length',
        width: 'item_width',
        height: 'item_height',
        unit: 'item_dimensions_unit_of_measure',
      },
      feedProductType: 'feed_product_type',
      browseNodes: 'browse_nodes',
      bulletPoints: [
        'bullet_point1',
        'bullet_point2',
        'bullet_point3',
        'bullet_point4',
        'bullet_point5',
      ],
      keywords: 'generic_keywords',
      listingStatus: 'listing_status',
    }
  }

  /**
   * Map multiple products in batch
   */
  public mapProducts(amazonProducts: AmazonProduct[]): ProductPreview[] {
    return amazonProducts.map(product => this.mapProduct(product))
  }

  /**
   * Get mapping statistics
   */
  public getMappingStats(amazonProducts: AmazonProduct[]): {
    totalProducts: number
    validProducts: number
    invalidProducts: number
    duplicateSkus: number
    missingRequiredFields: number
  } {
    const mapped = this.mapProducts(amazonProducts)
    const skus = new Set()
    let duplicateSkus = 0
    let missingRequiredFields = 0

    for (const product of mapped) {
      if (skus.has(product.sku)) {
        duplicateSkus++
      } else {
        skus.add(product.sku)
      }

      if (product.importErrors && product.importErrors.length > 0) {
        missingRequiredFields++
      }
    }

    return {
      totalProducts: amazonProducts.length,
      validProducts: mapped.filter(p => p.importStatus !== 'error').length,
      invalidProducts: mapped.filter(p => p.importStatus === 'error').length,
      duplicateSkus,
      missingRequiredFields,
    }
  }

  /**
   * Add custom mapping rule
   */
  public addMappingRule(rule: MappingRule): void {
    this.mappingRules.push(rule)
  }

  /**
   * Remove mapping rule
   */
  public removeMappingRule(amazonField: string): void {
    this.mappingRules = this.mappingRules.filter(rule => rule.amazonField !== amazonField)
  }

  /**
   * Update existing mapping rule
   */
  public updateMappingRule(amazonField: string, updates: Partial<MappingRule>): void {
    const ruleIndex = this.mappingRules.findIndex(rule => rule.amazonField === amazonField)
    if (ruleIndex >= 0) {
      this.mappingRules[ruleIndex] = { ...this.mappingRules[ruleIndex], ...updates }
    }
  }
}
