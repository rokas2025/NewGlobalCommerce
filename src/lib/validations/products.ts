import { z } from 'zod'
import { ProductStatus, ProductVisibility, ProductSortField } from '@/types/products'

// Base validation schemas
export const productStatusSchema = z.nativeEnum(ProductStatus, {
  errorMap: () => ({ message: 'Please select a valid product status' }),
})

export const productVisibilitySchema = z.nativeEnum(ProductVisibility, {
  errorMap: () => ({ message: 'Please select a valid product visibility' }),
})

export const productSortFieldSchema = z.nativeEnum(ProductSortField, {
  errorMap: () => ({ message: 'Please select a valid sort field' }),
})

// SKU validation
export const skuSchema = z
  .string()
  .min(1, 'SKU is required')
  .max(50, 'SKU must be 50 characters or less')
  .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores')
  .transform(val => val.toUpperCase())

// Price validation
export const priceSchema = z
  .number()
  .min(0, 'Price must be 0 or greater')
  .max(999999.99, 'Price must be less than 1,000,000')
  .refine(val => Number.isFinite(val), 'Price must be a valid number')
  .refine(
    val => val.toString().split('.')[1]?.length <= 2,
    'Price can have at most 2 decimal places'
  )

// Optional price validation
export const optionalPriceSchema = z
  .number()
  .min(0, 'Price must be 0 or greater')
  .max(999999.99, 'Price must be less than 1,000,000')
  .refine(val => Number.isFinite(val), 'Price must be a valid number')
  .refine(
    val => val.toString().split('.')[1]?.length <= 2,
    'Price can have at most 2 decimal places'
  )
  .optional()
  .nullable()

// Weight validation
export const weightSchema = z
  .number()
  .min(0, 'Weight must be 0 or greater')
  .max(99999, 'Weight must be less than 100,000')
  .optional()
  .nullable()

// Dimensions validation
export const dimensionsSchema = z
  .string()
  .max(100, 'Dimensions must be 100 characters or less')
  .regex(/^[\d\.\sx]+$/, 'Dimensions should contain only numbers, dots, spaces, and x')
  .optional()
  .nullable()

// URL validation
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(500, 'URL must be 500 characters or less')
  .optional()
  .nullable()

// Image URL validation
export const imageUrlSchema = z
  .string()
  .url('Please enter a valid image URL')
  .max(500, 'Image URL must be 500 characters or less')
  .refine(url => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    return imageExtensions.some(ext => url.toLowerCase().includes(ext))
  }, 'URL must point to a valid image file')
  .optional()
  .nullable()

// Tags validation
export const tagsSchema = z
  .array(z.string().min(1, 'Tag cannot be empty').max(30, 'Tag must be 30 characters or less'))
  .max(20, 'Maximum 20 tags allowed')
  .optional()
  .default([])

// Gallery images validation
export const galleryImagesSchema = z
  .array(imageUrlSchema.refine((url): url is string => typeof url === 'string'))
  .max(10, 'Maximum 10 gallery images allowed')
  .optional()
  .default([])

// Product creation schema
export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(200, 'Product name must be 200 characters or less')
      .trim(),

    description: z
      .string()
      .max(5000, 'Description must be 5000 characters or less')
      .optional()
      .nullable(),

    shortDescription: z
      .string()
      .max(500, 'Short description must be 500 characters or less')
      .optional()
      .nullable(),

    sku: skuSchema,

    barcode: z.string().max(50, 'Barcode must be 50 characters or less').optional().nullable(),

    price: priceSchema,

    costPrice: optionalPriceSchema,

    compareAtPrice: optionalPriceSchema,

    weight: weightSchema,

    dimensions: dimensionsSchema,

    status: productStatusSchema.default(ProductStatus.DRAFT),

    visibility: productVisibilitySchema.default(ProductVisibility.PRIVATE),

    featuredImageUrl: imageUrlSchema,

    galleryImages: galleryImagesSchema,

    seoTitle: z.string().max(60, 'SEO title must be 60 characters or less').optional().nullable(),

    seoDescription: z
      .string()
      .max(160, 'SEO description must be 160 characters or less')
      .optional()
      .nullable(),

    tags: tagsSchema,

    categoryIds: z
      .array(z.string().uuid('Invalid category ID'))
      .max(10, 'Maximum 10 categories allowed')
      .optional()
      .default([]),

    primaryCategoryId: z.string().uuid('Invalid primary category ID').optional().nullable(),
  })
  .refine(
    data => {
      // If compareAtPrice is set, it should be greater than price
      if (data.compareAtPrice && data.compareAtPrice <= data.price) {
        return false
      }
      return true
    },
    {
      message: 'Compare at price must be greater than the regular price',
      path: ['compareAtPrice'],
    }
  )
  .refine(
    data => {
      // If costPrice is set, it should be less than or equal to price
      if (data.costPrice && data.costPrice > data.price) {
        return false
      }
      return true
    },
    {
      message: 'Cost price should not be greater than the selling price',
      path: ['costPrice'],
    }
  )
  .refine(
    data => {
      // If primaryCategoryId is set, it should be in categoryIds
      if (
        data.primaryCategoryId &&
        data.categoryIds &&
        !data.categoryIds.includes(data.primaryCategoryId)
      ) {
        return false
      }
      return true
    },
    {
      message: 'Primary category must be included in the selected categories',
      path: ['primaryCategoryId'],
    }
  )

// Product update schema (all fields optional except ID)
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid('Invalid product ID'),
})

// Product filters schema
export const productFiltersSchema = z
  .object({
    search: z.string().max(100).optional(),
    status: z.array(productStatusSchema).optional(),
    visibility: z.array(productVisibilitySchema).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    stockMin: z.number().min(0).optional(),
    stockMax: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    createdAfter: z.date().optional(),
    createdBefore: z.date().optional(),
    sortBy: productSortFieldSchema.optional().default(ProductSortField.CREATED_AT),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .refine(
    data => {
      // priceMax should be greater than priceMin
      if (data.priceMin && data.priceMax && data.priceMax <= data.priceMin) {
        return false
      }
      return true
    },
    {
      message: 'Maximum price must be greater than minimum price',
      path: ['priceMax'],
    }
  )
  .refine(
    data => {
      // stockMax should be greater than stockMin
      if (data.stockMin && data.stockMax && data.stockMax <= data.stockMin) {
        return false
      }
      return true
    },
    {
      message: 'Maximum stock must be greater than minimum stock',
      path: ['stockMax'],
    }
  )
  .refine(
    data => {
      // createdBefore should be after createdAfter
      if (data.createdAfter && data.createdBefore && data.createdBefore <= data.createdAfter) {
        return false
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['createdBefore'],
    }
  )

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Product list query schema
export const productListQuerySchema = productFiltersSchema.merge(paginationSchema)

// Category schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be 100 characters or less')
    .trim(),

  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .nullable(),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),

  parentId: z.string().uuid('Invalid parent category ID').optional().nullable(),

  imageUrl: imageUrlSchema,

  sortOrder: z.number().int().min(0).max(9999).default(0),

  isActive: z.boolean().default(true),

  seoTitle: z.string().max(60, 'SEO title must be 60 characters or less').optional().nullable(),

  seoDescription: z
    .string()
    .max(160, 'SEO description must be 160 characters or less')
    .optional()
    .nullable(),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
})

// Category filters schema
export const categoryFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
  hasProducts: z.boolean().optional(),
})

// Bulk operations schemas
export const bulkProductUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  updates: updateProductSchema.omit({ id: true }),
})

export const bulkProductDeleteSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  hardDelete: z.boolean().default(false),
})

// Image upload schemas
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      file => file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'File must be a valid image (JPEG, PNG, GIF, or WebP)'
    ),
  altText: z.string().max(200).optional(),
})

export const bulkImageUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1).max(10),
  productId: z.string().uuid().optional(),
})

// Import/Export schemas
export const productImportRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: skuSchema,
  barcode: z.string().optional(),
  price: priceSchema,
  costPrice: optionalPriceSchema,
  compareAtPrice: optionalPriceSchema,
  weight: weightSchema,
  status: z.string().refine(val => Object.values(ProductStatus).includes(val as ProductStatus)),
  visibility: z
    .string()
    .refine(val => Object.values(ProductVisibility).includes(val as ProductVisibility)),
  categoryNames: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
})

export const productExportOptionsSchema = z.object({
  filters: productFiltersSchema.optional(),
  includeCategories: z.boolean().default(true),
  includeImages: z.boolean().default(true),
  includeInventory: z.boolean().default(true),
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
})

// Form data types (inferred from schemas)
export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
export type ProductFiltersFormData = z.infer<typeof productFiltersSchema>
export type ProductListQueryFormData = z.infer<typeof productListQuerySchema>
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
export type CategoryFiltersFormData = z.infer<typeof categoryFiltersSchema>
export type BulkProductUpdateFormData = z.infer<typeof bulkProductUpdateSchema>
export type BulkProductDeleteFormData = z.infer<typeof bulkProductDeleteSchema>
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>
export type BulkImageUploadFormData = z.infer<typeof bulkImageUploadSchema>
export type ProductImportRowFormData = z.infer<typeof productImportRowSchema>
export type ProductExportOptionsFormData = z.infer<typeof productExportOptionsSchema>
