// Base types from database schema
export interface Product {
  id: string
  name: string
  description: string | null
  shortDescription: string | null
  sku: string
  barcode: string | null
  price: number
  costPrice: number | null
  compareAtPrice: number | null
  weight: number | null
  dimensions: string | null
  status: ProductStatus
  visibility: ProductVisibility
  featuredImageUrl: string | null
  galleryImages: string[]
  seoTitle: string | null
  seoDescription: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  parentId: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  productId: string
  categoryId: string
  isPrimary: boolean
  createdAt: Date
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  altText: string | null
  sortOrder: number
  createdAt: Date
}

export interface Inventory {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  reorderPoint: number | null
  maxStock: number | null
  lastStockUpdate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Warehouse {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Enums
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum ProductVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HIDDEN = 'hidden',
}

// Extended types for API responses
export interface ProductWithCategories extends Product {
  categories: Category[]
  primaryCategory?: Category
  inventory?: Inventory[]
  totalStock?: number
  availableStock?: number
}

export interface ProductWithImages extends Product {
  images: ProductImage[]
}

export interface ProductListItem {
  id: string
  name: string
  sku: string
  price: number
  status: ProductStatus
  featuredImageUrl: string | null
  totalStock: number
  availableStock: number
  primaryCategory: string | null
  createdAt: Date
  updatedAt: Date
}

// Form types
export interface CreateProductData {
  name: string
  description?: string | null
  shortDescription?: string | null
  sku: string
  barcode?: string | null
  price: number
  costPrice?: number | null
  compareAtPrice?: number | null
  weight?: number | null
  dimensions?: string | null
  status: ProductStatus
  visibility: ProductVisibility
  featuredImageUrl?: string | null
  galleryImages?: string[]
  seoTitle?: string | null
  seoDescription?: string | null
  tags?: string[]
  categoryIds?: string[]
  primaryCategoryId?: string | null
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

// Filter and search types
export interface ProductFilters {
  search?: string
  status?: ProductStatus[]
  visibility?: ProductVisibility[]
  categoryIds?: string[]
  priceMin?: number
  priceMax?: number
  stockMin?: number
  stockMax?: number
  tags?: string[]
  createdAfter?: Date
  createdBefore?: Date
  sortBy?: ProductSortField
  sortOrder?: 'asc' | 'desc'
}

export enum ProductSortField {
  NAME = 'name',
  SKU = 'sku',
  PRICE = 'price',
  STOCK = 'stock',
  STATUS = 'status',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

// Pagination types
export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProductListResponse {
  products: ProductListItem[]
  pagination: ProductPagination
  filters: ProductFilters
}

// Category types
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  productCount: number
}

export interface CategoryFilters {
  search?: string
  isActive?: boolean
  parentId?: string | null
  hasProducts?: boolean
}

// Image upload types
export interface ImageUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface BulkImageUpload {
  files: File[]
  productId?: string
}

// Bulk operations
export interface BulkProductUpdate {
  productIds: string[]
  updates: Partial<UpdateProductData>
}

export interface BulkProductDelete {
  productIds: string[]
  hardDelete?: boolean
}

// Import/Export types
export interface ProductImportRow {
  name: string
  description?: string
  sku: string
  barcode?: string
  price: number
  costPrice?: number
  compareAtPrice?: number
  weight?: number
  status: string
  visibility: string
  categoryNames?: string
  tags?: string
  seoTitle?: string
  seoDescription?: string
}

export interface ProductExportOptions {
  filters?: ProductFilters
  includeCategories?: boolean
  includeImages?: boolean
  includeInventory?: boolean
  format: 'csv' | 'xlsx' | 'json'
}

// Analytics types
export interface ProductAnalytics {
  totalProducts: number
  activeProducts: number
  draftProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalValue: number
  averagePrice: number
  topCategories: Array<{
    categoryId: string
    categoryName: string
    productCount: number
  }>
  recentlyAdded: ProductListItem[]
  recentlyUpdated: ProductListItem[]
}

// Error types
export interface ProductError {
  code: string
  message: string
  field?: string
}

export interface ProductValidationError extends ProductError {
  field: string
  value: any
}

// API Response types
export interface ProductApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ProductError
  errors?: ProductValidationError[]
}

export interface ProductMutationResponse extends ProductApiResponse<Product> {}
export interface ProductListApiResponse extends ProductApiResponse<ProductListResponse> {}
export interface CategoryApiResponse extends ProductApiResponse<Category> {}
export interface CategoryListApiResponse extends ProductApiResponse<CategoryWithChildren[]> {}
