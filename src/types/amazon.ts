// Amazon Import Types

export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  uploadedAt: string
  path: string
}

export interface ExcelFileInfo {
  filename: string
  sheets: string[]
  totalRows: number
  totalColumns: number
  analyzedAt: string
}

export interface ExcelSheetData {
  sheetName: string
  headers: string[]
  data: any[][]
  rowCount: number
  columnCount: number
}

export interface AmazonProduct {
  // Core identifiers
  item_sku: string
  item_name: string
  product_description: string
  external_product_id?: string
  external_product_id_type?: string

  // Product hierarchy
  parent_sku?: string
  parent_child?: string
  relationship_type?: string
  variation_theme?: string

  // Basic product info
  feed_product_type: string
  brand_name?: string
  manufacturer?: string
  model?: string
  part_number?: string
  update_delete?: string

  // Amazon listing
  '::listing_status'?: string
  '::title'?: string
  listing_status?: string
  recommended_browse_nodes?: string
  browse_nodes?: string

  // Product characteristics
  color_name?: string
  size_name?: string
  material_type?: string
  handle_material?: string
  item_shape?: string
  item_type_name?: string
  color_map?: string

  // Quantities
  number_of_pieces?: string
  number_of_items?: string
  number_of_boxes?: string
  unit_count?: string
  unit_count_type?: string
  item_package_quantity?: string

  // Images
  main_image_url: string
  other_image_url1?: string
  other_image_url2?: string
  other_image_url3?: string
  other_image_url4?: string
  other_image_url5?: string
  other_image_url6?: string
  other_image_url7?: string
  other_image_url8?: string

  // Bullet points
  bullet_point1?: string
  bullet_point2?: string
  bullet_point3?: string
  bullet_point4?: string
  bullet_point5?: string

  // Special features
  special_features1?: string
  special_features2?: string
  special_features3?: string
  special_features4?: string
  special_features5?: string

  // Included components
  included_components1?: string
  included_components2?: string
  included_components3?: string
  included_components4?: string
  included_components5?: string

  // Pricing
  list_price_with_tax?: string
  standard_price?: number
  minimum_seller_allowed_price?: string
  maximum_seller_allowed_price?: string

  // Marketplace pricing (complex field names)
  'purchasable_offer[marketplace_id=A1F83G8C2ARO7P]#1.our_price#1.schedule#1.value_with_tax'?: string
  'purchasable_offer[marketplace_id=A1F83G8C2ARO7P]#1.start_at.value'?: string
  'fulfillment_availability#1.fulfillment_channel_code'?: string

  // Physical dimensions
  item_weight?: string
  item_weight_unit_of_measure?: string
  item_length?: string
  item_width?: string
  item_height?: string
  item_length_unit_of_measure?: string
  item_width_unit_of_measure?: string
  item_height_unit_of_measure?: string
  item_dimensions_unit_of_measure?: string

  // Alternative dimension fields
  length_head_to_toe?: string
  length_head_to_toe_unit_of_measure?: string
  length_width_side_to_side?: string
  length_width_side_to_side_unit_of_measure?: string
  length_height_floor_to_top?: string
  length_height_floor_to_top_unit_of_measure?: string

  // Package dimensions
  package_length?: string
  package_width?: string
  package_height?: string
  package_weight?: string
  package_length_unit_of_measure?: string
  package_width_unit_of_measure?: string
  package_height_unit_of_measure?: string
  package_weight_unit_of_measure?: string

  // Usage and compatibility
  specific_uses_for_product?: string
  surface_recommendation?: string
  power_plug_type?: string

  // Regulatory and safety
  is_fragile?: string
  batteries_required?: string
  supplier_declared_dg_hz_regulation1?: string
  supplier_declared_material_regulation1?: string
  country_of_origin?: string
  condition_type?: string

  // Multi-language support
  language_value1?: string
  language_value2?: string
  language_value3?: string
  language_value4?: string

  // Gift options
  offering_can_be_gift_messaged?: string
  offering_can_be_giftwrapped?: string

  // Fulfillment and shipping
  merchant_shipping_group_name?: string
  fulfillment_channel_code?: string
  fulfillment_center_id?: string

  // Amazon specific
  generic_keywords?: string

  // Additional fields for any remaining data
  [key: string]: any
}

export interface ProductPreview {
  // Mapped to our database schema
  sku: string
  name: string
  description: string
  images: string[]
  price?: number
  compareAtPrice?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }
  tags: string[]

  // Amazon specific data
  amazonData: {
    amazonSku: string
    feedProductType: string
    browseNodes?: string
    bulletPoints: string[]
    listingStatus?: string
  }

  // Import status
  importStatus: 'pending' | 'selected' | 'imported' | 'error'
  importErrors?: string[]
}

export interface ImportSummary {
  totalProducts: number
  selectedProducts: number
  importedProducts: number
  errorProducts: number
  skippedProducts: number
  processingTime: number
  errors: string[]
}

export interface FileAnalysisResult {
  file: UploadedFile
  excel: ExcelFileInfo
  sheets: ExcelSheetData[]
  products: AmazonProduct[]
  preview: ProductPreview[]
  summary: {
    totalProducts: number
    validProducts: number
    invalidProducts: number
    duplicateSkus: number
    missingRequiredFields: number
  }
  fieldMapping: FieldMapping
}

export interface FieldMapping {
  // Core mappings
  sku: string
  name: string
  description: string
  mainImage: string

  // Optional mappings
  price?: string
  weight?: string
  dimensions?: {
    length: string
    width: string
    height: string
    unit: string
  }

  // Amazon specific
  feedProductType: string
  browseNodes?: string
  bulletPoints: string[]
  keywords?: string

  // Status
  listingStatus?: string
}

export interface ImportOptions {
  // What to import
  importImages: boolean
  importPricing: boolean
  importDimensions: boolean
  importKeywords: boolean

  // How to handle conflicts
  updateExisting: boolean
  skipDuplicates: boolean

  // Processing options
  batchSize: number
  validateData: boolean

  // Amazon specific
  preserveAmazonData: boolean
  linkToAmazon: boolean
}

export interface ImportProgress {
  status: 'idle' | 'analyzing' | 'processing' | 'importing' | 'completed' | 'error'
  currentStep: string
  progress: number
  processedCount: number
  totalCount: number
  errors: string[]
  startTime: Date
  endTime?: Date
}

// API Response Types
export interface UploadResponse {
  success: boolean
  message: string
  file: UploadedFile
}

export interface AnalysisResponse {
  success: boolean
  message: string
  result: FileAnalysisResult
}

export interface ImportResponse {
  success: boolean
  message: string
  summary: ImportSummary
}

// Error Types
export interface ImportError {
  code: string
  message: string
  field?: string
  value?: any
  row?: number
}
