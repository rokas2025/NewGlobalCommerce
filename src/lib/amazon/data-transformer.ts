import { AmazonProduct, ProductPreview } from '@/types/amazon'

export interface ImportSettings {
  skipDuplicates?: boolean
  overwriteExisting?: boolean
  defaultCategory?: string
  defaultStatus?: string
  defaultStockLevel?: number
  priceMarkup?: number
  enableAutoTags?: boolean
  categoryMapping?: Record<string, string>
}

export interface TransformedProductData {
  productData: {
    name: string
    description: string
    sku: string
    price: number | null
    salePrice: number | null
    cost: number | null
    stock: number
    lowStockThreshold: number
    trackStock: boolean
    weight: number | null
    dimensions: string | null
    images: string
    tags: string
    categoryId: string
    status: string
    featured: boolean
    metaTitle: string
    metaDescription: string
    slug: string
    createdAt: Date
    updatedAt: Date
  }
  amazonData: {
    productId?: number
    amazonSku: string
    amazonAsin?: string

    // Core Amazon identifiers
    externalProductId?: string
    externalProductIdType?: string

    // Product hierarchy
    parentSku?: string
    parentChild?: string
    relationshipType?: string
    variationTheme?: string

    // Basic product info
    feedProductType: string
    brandName?: string
    manufacturer?: string
    model?: string
    partNumber?: string
    updateDelete?: string

    // Amazon listing details
    listingStatus?: string
    browseNodes?: string[]
    recommendedBrowseNodes?: string

    // Product characteristics
    colorName?: string
    sizeName?: string
    materialType?: string
    handleMaterial?: string
    itemShape?: string
    itemTypeName?: string
    colorMap?: string

    // Quantities and packaging
    numberOfPieces?: string
    numberOfItems?: string
    numberOfBoxes?: string
    unitCount?: string
    unitCountType?: string
    itemPackageQuantity?: string

    // Physical dimensions
    itemWidth?: string
    itemHeight?: string
    itemLength?: string
    itemWidthUnitOfMeasure?: string
    itemHeightUnitOfMeasure?: string
    itemLengthUnitOfMeasure?: string

    // Alternative dimension fields
    lengthHeadToToe?: string
    lengthHeadToToeUnitOfMeasure?: string
    lengthWidthSideToSide?: string
    lengthWidthSideToSideUnitOfMeasure?: string
    lengthHeightFloorToTop?: string
    lengthHeightFloorToTopUnitOfMeasure?: string

    // Package dimensions
    packageLength?: string
    packageWidth?: string
    packageHeight?: string
    packageWeight?: string
    packageLengthUnitOfMeasure?: string
    packageWidthUnitOfMeasure?: string
    packageHeightUnitOfMeasure?: string
    packageWeightUnitOfMeasure?: string

    // Weight
    itemWeight?: string
    itemWeightUnitOfMeasure?: string

    // Special attributes
    specialFeatures1?: string
    specialFeatures2?: string
    specialFeatures3?: string
    specialFeatures4?: string
    specialFeatures5?: string

    // Included components
    includedComponents1?: string
    includedComponents2?: string
    includedComponents3?: string
    includedComponents4?: string
    includedComponents5?: string

    // Usage and compatibility
    specificUsesForProduct?: string
    surfaceRecommendation?: string
    powerPlugType?: string

    // Regulatory and safety
    isFragile?: string
    batteriesRequired?: string
    supplierDeclaredDgHzRegulation1?: string
    supplierDeclaredMaterialRegulation1?: string
    countryOfOrigin?: string
    conditionType?: string

    // Multi-language support
    languageValue1?: string
    languageValue2?: string
    languageValue3?: string
    languageValue4?: string

    // Pricing fields
    listPriceWithTax?: string
    minimumSellerAllowedPrice?: string
    maximumSellerAllowedPrice?: string

    // Gift options
    offeringCanBeGiftMessaged?: string
    offeringCanBeGiftwrapped?: string

    // Fulfillment and shipping
    merchantShippingGroupName?: string
    fulfillmentChannelCode?: string

    // Existing fields
    bulletPoints?: string[]
    searchTerms?: string[]
    genericKeywords?: string
    marketplaceData?: Record<string, any>
    amazonAttributes?: Record<string, any>

    // Legacy fields for backward compatibility
    itemName?: string
    itemType?: string
    brand?: string
    productCategory?: string
    productSubcategory?: string
    fulfillmentChannel?: string
    status?: string
    yourPrice?: number | null
    currency?: string
    quantity?: number
    leadTimeToShip?: number
    launchDate?: Date | null
    discontinueDate?: Date | null
    salePriceStartDate?: Date | null
    salePriceEndDate?: Date | null
    mainImageUrl?: string
    otherImageUrl1?: string
    otherImageUrl2?: string
    otherImageUrl3?: string
    otherImageUrl4?: string
    otherImageUrl5?: string
    otherImageUrl6?: string
    otherImageUrl7?: string
    otherImageUrl8?: string
    swatchImageUrl?: string
    bulletPoint1?: string
    bulletPoint2?: string
    bulletPoint3?: string
    bulletPoint4?: string
    bulletPoint5?: string
    subjectContent?: string
    platinumKeywords?: string

    createdAt: Date
    updatedAt: Date
  }
}

export class DataTransformer {
  private settings: ImportSettings

  constructor(settings: ImportSettings = {}) {
    this.settings = {
      skipDuplicates: true,
      overwriteExisting: false,
      defaultCategory: 'uncategorized',
      defaultStatus: 'draft',
      defaultStockLevel: 0,
      priceMarkup: 0,
      enableAutoTags: true,
      categoryMapping: {},
      ...settings,
    }
  }

  /**
   * Transform Amazon product data to database format
   */
  transformProduct(productData: ProductPreview | AmazonProduct): TransformedProductData {
    const now = new Date()

    // Handle different input types
    const sku = 'sku' in productData ? productData.sku : productData.item_sku
    const name = 'name' in productData ? productData.name : productData.item_name
    const description =
      'description' in productData ? productData.description : productData.product_description

    // Generate slug from SKU
    const slug = this.generateSlug(sku)

    // Extract price from Amazon data
    const price = this.extractPrice(productData)
    const salePrice = this.extractSalePrice(productData)

    // Generate tags
    const tags = this.generateTags(productData)

    // Map category
    const categoryId = this.mapCategory(this.getFeedProductType(productData))

    // Extract images
    const images = this.extractImages(productData)

    // Transform main product data
    const transformedProductData = {
      name,
      description: description || '',
      sku,
      price,
      salePrice,
      cost: null,
      stock: this.settings.defaultStockLevel || 0,
      lowStockThreshold: 5,
      trackStock: true,
      weight: this.extractWeight(productData),
      dimensions: this.extractDimensions(productData),
      images: JSON.stringify(images),
      tags: JSON.stringify(tags),
      categoryId,
      status: this.settings.defaultStatus || 'draft',
      featured: false,
      metaTitle: this.generateMetaTitle(name),
      metaDescription: this.generateMetaDescription(description),
      slug,
      createdAt: now,
      updatedAt: now,
    }

    // Transform Amazon-specific data with all new fields
    const transformedAmazonData = {
      amazonSku: sku,
      amazonAsin: 'amazon_asin' in productData ? productData.amazon_asin : undefined,

      // Core identifiers
      externalProductId:
        'external_product_id' in productData ? productData.external_product_id : undefined,
      externalProductIdType:
        'external_product_id_type' in productData
          ? productData.external_product_id_type
          : undefined,

      // Product hierarchy
      parentSku: 'parent_sku' in productData ? productData.parent_sku : undefined,
      parentChild: 'parent_child' in productData ? productData.parent_child : undefined,
      relationshipType:
        'relationship_type' in productData ? productData.relationship_type : undefined,
      variationTheme: 'variation_theme' in productData ? productData.variation_theme : undefined,

      // Basic product info
      feedProductType: this.getFeedProductType(productData),
      brandName: 'brand_name' in productData ? productData.brand_name : undefined,
      manufacturer: 'manufacturer' in productData ? productData.manufacturer : undefined,
      model: 'model' in productData ? productData.model : undefined,
      partNumber: 'part_number' in productData ? productData.part_number : undefined,
      updateDelete: 'update_delete' in productData ? productData.update_delete : undefined,

      // Amazon listing details
      listingStatus: this.getListingStatus(productData),
      browseNodes: this.extractBrowseNodes(productData),
      recommendedBrowseNodes:
        'recommended_browse_nodes' in productData
          ? productData.recommended_browse_nodes
          : undefined,

      // Product characteristics
      colorName: 'color_name' in productData ? productData.color_name : undefined,
      sizeName: 'size_name' in productData ? productData.size_name : undefined,
      materialType: 'material_type' in productData ? productData.material_type : undefined,
      handleMaterial: 'handle_material' in productData ? productData.handle_material : undefined,
      itemShape: 'item_shape' in productData ? productData.item_shape : undefined,
      itemTypeName: 'item_type_name' in productData ? productData.item_type_name : undefined,
      colorMap: 'color_map' in productData ? productData.color_map : undefined,

      // Quantities and packaging
      numberOfPieces: 'number_of_pieces' in productData ? productData.number_of_pieces : undefined,
      numberOfItems: 'number_of_items' in productData ? productData.number_of_items : undefined,
      numberOfBoxes: 'number_of_boxes' in productData ? productData.number_of_boxes : undefined,
      unitCount: 'unit_count' in productData ? productData.unit_count : undefined,
      unitCountType: 'unit_count_type' in productData ? productData.unit_count_type : undefined,
      itemPackageQuantity:
        'item_package_quantity' in productData ? productData.item_package_quantity : undefined,

      // Physical dimensions
      itemWidth: 'item_width' in productData ? productData.item_width : undefined,
      itemHeight: 'item_height' in productData ? productData.item_height : undefined,
      itemLength: 'item_length' in productData ? productData.item_length : undefined,
      itemWidthUnitOfMeasure:
        'item_width_unit_of_measure' in productData
          ? productData.item_width_unit_of_measure
          : undefined,
      itemHeightUnitOfMeasure:
        'item_height_unit_of_measure' in productData
          ? productData.item_height_unit_of_measure
          : undefined,
      itemLengthUnitOfMeasure:
        'item_length_unit_of_measure' in productData
          ? productData.item_length_unit_of_measure
          : undefined,

      // Alternative dimension fields
      lengthHeadToToe:
        'length_head_to_toe' in productData ? productData.length_head_to_toe : undefined,
      lengthHeadToToeUnitOfMeasure:
        'length_head_to_toe_unit_of_measure' in productData
          ? productData.length_head_to_toe_unit_of_measure
          : undefined,
      lengthWidthSideToSide:
        'length_width_side_to_side' in productData
          ? productData.length_width_side_to_side
          : undefined,
      lengthWidthSideToSideUnitOfMeasure:
        'length_width_side_to_side_unit_of_measure' in productData
          ? productData.length_width_side_to_side_unit_of_measure
          : undefined,
      lengthHeightFloorToTop:
        'length_height_floor_to_top' in productData
          ? productData.length_height_floor_to_top
          : undefined,
      lengthHeightFloorToTopUnitOfMeasure:
        'length_height_floor_to_top_unit_of_measure' in productData
          ? productData.length_height_floor_to_top_unit_of_measure
          : undefined,

      // Package dimensions
      packageLength: 'package_length' in productData ? productData.package_length : undefined,
      packageWidth: 'package_width' in productData ? productData.package_width : undefined,
      packageHeight: 'package_height' in productData ? productData.package_height : undefined,
      packageWeight: 'package_weight' in productData ? productData.package_weight : undefined,
      packageLengthUnitOfMeasure:
        'package_length_unit_of_measure' in productData
          ? productData.package_length_unit_of_measure
          : undefined,
      packageWidthUnitOfMeasure:
        'package_width_unit_of_measure' in productData
          ? productData.package_width_unit_of_measure
          : undefined,
      packageHeightUnitOfMeasure:
        'package_height_unit_of_measure' in productData
          ? productData.package_height_unit_of_measure
          : undefined,
      packageWeightUnitOfMeasure:
        'package_weight_unit_of_measure' in productData
          ? productData.package_weight_unit_of_measure
          : undefined,

      // Weight
      itemWeight: 'item_weight' in productData ? productData.item_weight : undefined,
      itemWeightUnitOfMeasure:
        'item_weight_unit_of_measure' in productData
          ? productData.item_weight_unit_of_measure
          : undefined,

      // Special attributes
      specialFeatures1:
        'special_features1' in productData ? productData.special_features1 : undefined,
      specialFeatures2:
        'special_features2' in productData ? productData.special_features2 : undefined,
      specialFeatures3:
        'special_features3' in productData ? productData.special_features3 : undefined,
      specialFeatures4:
        'special_features4' in productData ? productData.special_features4 : undefined,
      specialFeatures5:
        'special_features5' in productData ? productData.special_features5 : undefined,

      // Included components
      includedComponents1:
        'included_components1' in productData ? productData.included_components1 : undefined,
      includedComponents2:
        'included_components2' in productData ? productData.included_components2 : undefined,
      includedComponents3:
        'included_components3' in productData ? productData.included_components3 : undefined,
      includedComponents4:
        'included_components4' in productData ? productData.included_components4 : undefined,
      includedComponents5:
        'included_components5' in productData ? productData.included_components5 : undefined,

      // Usage and compatibility
      specificUsesForProduct:
        'specific_uses_for_product' in productData
          ? productData.specific_uses_for_product
          : undefined,
      surfaceRecommendation:
        'surface_recommendation' in productData ? productData.surface_recommendation : undefined,
      powerPlugType: 'power_plug_type' in productData ? productData.power_plug_type : undefined,

      // Regulatory and safety
      isFragile: 'is_fragile' in productData ? productData.is_fragile : undefined,
      batteriesRequired:
        'batteries_required' in productData ? productData.batteries_required : undefined,
      supplierDeclaredDgHzRegulation1:
        'supplier_declared_dg_hz_regulation1' in productData
          ? productData.supplier_declared_dg_hz_regulation1
          : undefined,
      supplierDeclaredMaterialRegulation1:
        'supplier_declared_material_regulation1' in productData
          ? productData.supplier_declared_material_regulation1
          : undefined,
      countryOfOrigin:
        'country_of_origin' in productData ? productData.country_of_origin : undefined,
      conditionType: 'condition_type' in productData ? productData.condition_type : undefined,

      // Multi-language support
      languageValue1: 'language_value1' in productData ? productData.language_value1 : undefined,
      languageValue2: 'language_value2' in productData ? productData.language_value2 : undefined,
      languageValue3: 'language_value3' in productData ? productData.language_value3 : undefined,
      languageValue4: 'language_value4' in productData ? productData.language_value4 : undefined,

      // Pricing fields
      listPriceWithTax:
        'list_price_with_tax' in productData ? productData.list_price_with_tax : undefined,
      minimumSellerAllowedPrice:
        'minimum_seller_allowed_price' in productData
          ? productData.minimum_seller_allowed_price
          : undefined,
      maximumSellerAllowedPrice:
        'maximum_seller_allowed_price' in productData
          ? productData.maximum_seller_allowed_price
          : undefined,

      // Gift options
      offeringCanBeGiftMessaged:
        'offering_can_be_gift_messaged' in productData
          ? productData.offering_can_be_gift_messaged
          : undefined,
      offeringCanBeGiftwrapped:
        'offering_can_be_giftwrapped' in productData
          ? productData.offering_can_be_giftwrapped
          : undefined,

      // Fulfillment and shipping
      merchantShippingGroupName:
        'merchant_shipping_group_name' in productData
          ? productData.merchant_shipping_group_name
          : undefined,
      fulfillmentChannelCode:
        'fulfillment_channel_code' in productData
          ? productData.fulfillment_channel_code
          : undefined,

      // Existing fields
      bulletPoints: this.extractBulletPoints(productData),
      searchTerms: this.extractSearchTerms(productData),
      genericKeywords: 'generic_keywords' in productData ? productData.generic_keywords : undefined,
      marketplaceData: this.extractMarketplaceData(productData),
      amazonAttributes: this.extractAmazonAttributes(productData),

      // Legacy fields for backward compatibility
      itemName: name,
      itemType: 'item_type_name' in productData ? productData.item_type_name : undefined,
      brand: 'brand_name' in productData ? productData.brand_name : undefined,
      productCategory: this.getFeedProductType(productData),
      productSubcategory: '',
      fulfillmentChannel:
        'fulfillment_channel_code' in productData
          ? productData.fulfillment_channel_code
          : 'DEFAULT',
      status: this.getListingStatus(productData) || 'active',
      yourPrice: price,
      currency: 'USD',
      quantity: 0,
      leadTimeToShip: 1,
      launchDate: null,
      discontinueDate: null,
      salePriceStartDate: null,
      salePriceEndDate: null,
      mainImageUrl: images[0] || '',
      otherImageUrl1: images[1] || '',
      otherImageUrl2: images[2] || '',
      otherImageUrl3: images[3] || '',
      otherImageUrl4: images[4] || '',
      otherImageUrl5: images[5] || '',
      otherImageUrl6: images[6] || '',
      otherImageUrl7: images[7] || '',
      otherImageUrl8: images[8] || '',
      swatchImageUrl: '',
      bulletPoint1: this.extractBulletPoints(productData)[0] || '',
      bulletPoint2: this.extractBulletPoints(productData)[1] || '',
      bulletPoint3: this.extractBulletPoints(productData)[2] || '',
      bulletPoint4: this.extractBulletPoints(productData)[3] || '',
      bulletPoint5: this.extractBulletPoints(productData)[4] || '',
      subjectContent: '',
      platinumKeywords: '',

      createdAt: now,
      updatedAt: now,
    }

    return {
      productData: transformedProductData,
      amazonData: transformedAmazonData,
    }
  }

  /**
   * Generate URL-friendly slug from SKU
   */
  private generateSlug(sku: string): string {
    return sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Generate meta title from product name
   */
  private generateMetaTitle(productName: string): string {
    if (productName.length <= 60) return productName
    return productName.substring(0, 57) + '...'
  }

  /**
   * Generate meta description from product description
   */
  private generateMetaDescription(description: string | null): string {
    if (!description) return ''
    if (description.length <= 160) return description
    return description.substring(0, 157) + '...'
  }

  /**
   * Map Amazon category to local category
   */
  private mapCategory(amazonCategory: string): string {
    if (!amazonCategory) return this.settings.defaultCategory || 'uncategorized'

    // Check if there's a custom mapping
    if (this.settings.categoryMapping?.[amazonCategory]) {
      return this.settings.categoryMapping[amazonCategory]
    }

    // Default category mapping logic
    const categoryMappings: Record<string, string> = {
      'Tools & Hardware': 'tools',
      'Home & Garden': 'home-garden',
      'Sports & Outdoors': 'sports',
      Automotive: 'automotive',
      Electronics: 'electronics',
      'Health & Beauty': 'health-beauty',
      'Clothing & Accessories': 'clothing',
      Books: 'books',
      'Toys & Games': 'toys',
      'Kitchen & Dining': 'kitchen',
    }

    return categoryMappings[amazonCategory] || this.settings.defaultCategory || 'uncategorized'
  }

  // Helper methods for extracting data from different product formats
  private getFeedProductType(productData: any): string {
    return productData.feed_product_type || productData.feedProductType || ''
  }

  private getListingStatus(productData: any): string {
    return (
      productData['::listing_status'] ||
      productData.listing_status ||
      productData.listingStatus ||
      'active'
    )
  }

  private extractPrice(productData: any): number | null {
    if (productData.price) return productData.price
    if (productData.list_price_with_tax) return parseFloat(productData.list_price_with_tax)
    if (
      productData[
        'purchasable_offer[marketplace_id=A1F83G8C2ARO7P]#1.our_price#1.schedule#1.value_with_tax'
      ]
    ) {
      return parseFloat(
        productData[
          'purchasable_offer[marketplace_id=A1F83G8C2ARO7P]#1.our_price#1.schedule#1.value_with_tax'
        ]
      )
    }
    return null
  }

  private extractSalePrice(productData: any): number | null {
    if (productData.salePrice) return productData.salePrice
    if (productData.compareAtPrice) return productData.compareAtPrice
    return null
  }

  private extractWeight(productData: any): number | null {
    if (productData.weight) return productData.weight
    if (productData.item_weight) return parseFloat(productData.item_weight)
    return null
  }

  private extractDimensions(productData: any): string | null {
    if (productData.dimensions) return JSON.stringify(productData.dimensions)

    const dimensions: any = {}
    if (productData.item_length) dimensions.length = productData.item_length
    if (productData.item_width) dimensions.width = productData.item_width
    if (productData.item_height) dimensions.height = productData.item_height
    if (productData.item_length_unit_of_measure)
      dimensions.unit = productData.item_length_unit_of_measure

    return Object.keys(dimensions).length > 0 ? JSON.stringify(dimensions) : null
  }

  private extractImages(productData: any): string[] {
    if (productData.images && Array.isArray(productData.images)) return productData.images

    const images: string[] = []
    if (productData.main_image_url) images.push(productData.main_image_url)

    for (let i = 1; i <= 8; i++) {
      const imageUrl = productData[`other_image_url${i}`]
      if (imageUrl) images.push(imageUrl)
    }

    return images.filter(url => url && url.trim() !== '')
  }

  private extractBulletPoints(productData: any): string[] {
    if (productData.bulletPoints && Array.isArray(productData.bulletPoints))
      return productData.bulletPoints

    const bulletPoints: string[] = []
    for (let i = 1; i <= 5; i++) {
      const bulletPoint = productData[`bullet_point${i}`]
      if (bulletPoint) bulletPoints.push(bulletPoint)
    }

    return bulletPoints.filter(point => point && point.trim() !== '')
  }

  private extractBrowseNodes(productData: any): string[] {
    if (productData.browseNodes && Array.isArray(productData.browseNodes))
      return productData.browseNodes
    if (productData.browse_nodes) {
      return typeof productData.browse_nodes === 'string'
        ? [productData.browse_nodes]
        : productData.browse_nodes
    }
    if (productData.recommended_browse_nodes) {
      return typeof productData.recommended_browse_nodes === 'string'
        ? [productData.recommended_browse_nodes]
        : productData.recommended_browse_nodes
    }
    return []
  }

  private extractSearchTerms(productData: any): string[] {
    if (productData.searchTerms && Array.isArray(productData.searchTerms))
      return productData.searchTerms
    if (productData.generic_keywords) {
      return productData.generic_keywords
        .split(/[,\s]+/)
        .filter((term: string) => term.trim() !== '')
    }
    return []
  }

  private extractMarketplaceData(productData: any): Record<string, any> {
    const marketplaceData: Record<string, any> = {}

    // Extract marketplace-specific pricing
    for (const key in productData) {
      if (key.includes('marketplace_id=') || key.includes('fulfillment_availability')) {
        marketplaceData[key] = productData[key]
      }
    }

    return marketplaceData
  }

  private extractAmazonAttributes(productData: any): Record<string, any> {
    const attributes: Record<string, any> = {}

    // Store all additional fields that aren't in the main schema
    const excludedFields = [
      'item_sku',
      'item_name',
      'product_description',
      'main_image_url',
      'feed_product_type',
      'brand_name',
      'manufacturer',
      'model',
    ]

    for (const key in productData) {
      if (
        !excludedFields.includes(key) &&
        productData[key] !== undefined &&
        productData[key] !== null
      ) {
        attributes[key] = productData[key]
      }
    }

    return attributes
  }

  /**
   * Validate transformed product data
   */
  public validateTransformedData(transformedData: TransformedProductData): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate required fields
    if (!transformedData.productData.sku || transformedData.productData.sku.trim().length === 0) {
      errors.push('SKU is required')
    }

    if (!transformedData.productData.name || transformedData.productData.name.trim().length === 0) {
      errors.push('Product name is required')
    }

    if (!transformedData.amazonData.feedProductType) {
      errors.push('Feed product type is required')
    }

    // Validate price
    if (transformedData.productData.price !== null && transformedData.productData.price < 0) {
      errors.push('Price cannot be negative')
    }

    // Validate weight
    if (transformedData.productData.weight !== null && transformedData.productData.weight < 0) {
      errors.push('Weight cannot be negative')
    }

    // Validate stock
    if (transformedData.productData.stock < 0) {
      errors.push('Stock cannot be negative')
    }

    // Validate SKU format (basic check)
    if (
      transformedData.productData.sku &&
      !/^[a-zA-Z0-9\-_]+$/.test(transformedData.productData.sku)
    ) {
      errors.push(
        'SKU contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed'
      )
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate tags from product data
   */
  private generateTags(productData: ProductPreview | AmazonProduct): string[] {
    if (!this.settings.enableAutoTags) return []

    const tags: string[] = []

    // Add brand as tag
    if (productData.brand) {
      tags.push(productData.brand)
    }

    // Add product type as tag
    if (productData.feedProductType) {
      tags.push(productData.feedProductType)
    }

    // Add category as tag
    if (productData.productCategory) {
      tags.push(productData.productCategory)
    }

    // Add subcategory as tag
    if (productData.productSubcategory) {
      tags.push(productData.productSubcategory)
    }

    // Extract keywords from search terms
    if (productData.searchTerms) {
      const keywords = productData.searchTerms
        .split(/[,;]/)
        .map(term => term.trim())
        .filter(term => term.length > 2)
      tags.push(...keywords)
    }

    // Remove duplicates and return
    return [...new Set(tags)]
  }
}

export default DataTransformer
