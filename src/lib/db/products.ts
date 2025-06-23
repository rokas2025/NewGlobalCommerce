import { db } from '@/lib/db/connection'
import type { Category, Product } from '@/lib/db/schema'
import { categories, inventory, productCategories, productImages, products } from '@/lib/db/schema'
import type {
  CategoryWithChildren,
  CreateProductData,
  ProductAnalytics,
  ProductFilters,
  ProductListItem,
  ProductListResponse,
  ProductPagination,
  ProductStatus,
  ProductWithCategories,
  UpdateProductData,
} from '@/types/products'
import { ProductSortField } from '@/types/products'
import { and, asc, count, desc, eq, gte, inArray, isNull, like, lte, or, sql } from 'drizzle-orm'

// Product queries
export class ProductRepository {
  // Get product by ID with all relations
  async getById(id: string): Promise<ProductWithCategories | null> {
    try {
      const result: any[] = await db
        .select({
          product: products,
          category: categories,
          inventory: inventory,
        })
        .from(products)
        .leftJoin(productCategories, eq(products.id, productCategories.productId))
        .leftJoin(categories, eq(productCategories.categoryId, categories.id))
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(eq(products.id, id))

      if (!result.length) return null

      const productData = result[0].product
      const productCategoryList = result.filter(r => r.category).map(r => r.category!)

      const productInventory = result.filter(r => r.inventory).map(r => r.inventory!)

      const totalStock = productInventory.reduce((sum, inv) => sum + inv.quantity, 0)
      const availableStock = productInventory.reduce(
        (sum, inv) => sum + (inv.quantity - inv.reservedQuantity),
        0
      )

      return {
        ...productData,
        categories: productCategoryList,
        primaryCategory: productCategoryList.find(cat => {
          // Find if this category is marked as primary for this product
          return result.some(r => r.category?.id === cat.id)
        }),
        inventory: productInventory,
        totalStock,
        availableStock,
      }
    } catch (error) {
      console.error('Error fetching product by ID:', error)
      throw new Error('Failed to fetch product')
    }
  }

  // Get products with filters and pagination
  async getList(filters: ProductFilters = {}, page = 1, limit = 20): Promise<ProductListResponse> {
    try {
      const offset = (page - 1) * limit

      // Build where conditions
      const whereConditions: any[] = []

      if (filters.search) {
        whereConditions.push(
          or(
            like(products.name, `%${filters.search}%`),
            like(products.sku, `%${filters.search}%`),
            like(products.description, `%${filters.search}%`)
          )!
        )
      }

      if (filters.status?.length) {
        whereConditions.push(inArray(products.status, filters.status))
      }

      // Note: visibility field not implemented in schema yet

      if (filters.priceMin !== undefined) {
        whereConditions.push(gte(products.price, filters.priceMin.toString()))
      }

      if (filters.priceMax !== undefined) {
        whereConditions.push(lte(products.price, filters.priceMax.toString()))
      }

      if (filters.createdAfter) {
        whereConditions.push(gte(products.createdAt, filters.createdAfter))
      }

      if (filters.createdBefore) {
        whereConditions.push(lte(products.createdAt, filters.createdBefore))
      }

      // Build order by
      const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder)

      // Get total count
      const totalResult: any[] = await db
        .select({ count: count() })
        .from(products)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

      const total = totalResult[0]?.count || 0

      // Get products with basic info and inventory
      const productsQuery = db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          price: products.price,
          status: products.status,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          totalStock: sql<number>`COALESCE(SUM(${inventory.quantity}), 0)`,
          availableStock: sql<number>`COALESCE(SUM(${inventory.quantity} - ${inventory.reservedQuantity}), 0)`,
          primaryCategoryName: sql<string>`(
            SELECT ${categories.name} 
            FROM ${categories} 
            JOIN ${productCategories} pc ON ${categories.id} = pc.category_id 
            WHERE pc.product_id = ${products.id} AND pc.is_primary = true 
            LIMIT 1
          )`,
        })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(products.id)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)

      const productsList: any[] = await productsQuery

      const productItems: ProductListItem[] = productsList.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        status: p.status as ProductStatus,
        featuredImageUrl: null, // TODO: implement featured image logic
        totalStock: p.totalStock,
        availableStock: p.availableStock,
        primaryCategory: p.primaryCategoryName,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))

      const totalPages = Math.ceil(total / limit)
      const pagination: ProductPagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }

      return {
        products: productItems,
        pagination,
        filters,
      }
    } catch (error) {
      console.error('Error fetching products list:', error)
      throw new Error('Failed to fetch products')
    }
  }

  // Create new product
  async create(data: CreateProductData): Promise<Product> {
    try {
      const result = await db.transaction(async tx => {
        // Insert product
        const [product] = await tx
          .insert(products)
          .values({
            name: data.name,
            slug: data.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Generate slug from SKU
            description: data.description || null,
            shortDescription: data.shortDescription || null,
            sku: data.sku,
            barcode: data.barcode || null,
            price: data.price.toString(),
            costPrice: data.costPrice?.toString() || null,
            compareAtPrice: data.compareAtPrice?.toString() || null,
            weight: data.weight?.toString() || null,
            dimensions: data.dimensions || {},
            status: data.status,
            images: data.galleryImages || [],
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            tags: data.tags || [],
          })
          .returning()

        // Add category associations
        if (data.categoryIds?.length && product) {
          await tx.insert(productCategories).values(
            data.categoryIds.map(categoryId => ({
              productId: product.id,
              categoryId,
              isPrimary: categoryId === data.primaryCategoryId,
            }))
          )
        }

        if (!product) {
          throw new Error('Failed to create product')
        }

        return product
      })

      return result
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error('Failed to create product')
    }
  }

  // Update product
  async update(id: string, data: Partial<UpdateProductData>): Promise<Product> {
    try {
      const result = await db.transaction(async tx => {
        // Update product
        const [product] = await tx
          .update(products)
          .set({
            name: data.name,
            slug: data.sku ? data.sku.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined,
            description: data.description,
            shortDescription: data.shortDescription,
            sku: data.sku,
            barcode: data.barcode,
            price: data.price?.toString(),
            costPrice: data.costPrice?.toString(),
            compareAtPrice: data.compareAtPrice?.toString(),
            weight: data.weight?.toString(),
            dimensions: data.dimensions,
            status: data.status,
            images: data.galleryImages,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            tags: data.tags,
            updatedAt: new Date(),
          })
          .where(eq(products.id, id))
          .returning()

        if (!product) {
          throw new Error('Product not found')
        }

        // Update category associations if provided
        if (data.categoryIds !== undefined) {
          // Remove existing associations
          await tx.delete(productCategories).where(eq(productCategories.productId, id))

          // Add new associations
          if (data.categoryIds.length > 0) {
            await tx.insert(productCategories).values(
              data.categoryIds.map(categoryId => ({
                productId: id,
                categoryId,
                isPrimary: categoryId === data.primaryCategoryId,
              }))
            )
          }
        }

        return product
      })

      return result
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }

  // Delete product (hard delete)
  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.transaction(async tx => {
        // Delete associated records first
        await tx.delete(productCategories).where(eq(productCategories.productId, id))
        await tx.delete(productImages).where(eq(productImages.productId, id))
        await tx.delete(inventory).where(eq(inventory.productId, id))

        // Delete product
        const [deletedProduct] = await tx
          .delete(products)
          .where(eq(products.id, id))
          .returning({ id: products.id })

        return !!deletedProduct
      })

      return result
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }

  // Hard delete product
  async hardDelete(id: string): Promise<boolean> {
    try {
      const result = await db.transaction(async tx => {
        // Delete associated records first
        await tx.delete(productCategories).where(eq(productCategories.productId, id))
        await tx.delete(productImages).where(eq(productImages.productId, id))
        await tx.delete(inventory).where(eq(inventory.productId, id))

        // Delete product
        const [deletedProduct] = await tx
          .delete(products)
          .where(eq(products.id, id))
          .returning({ id: products.id })

        return !!deletedProduct
      })

      return result
    } catch (error) {
      console.error('Error hard deleting product:', error)
      throw new Error('Failed to permanently delete product')
    }
  }

  // Check if SKU exists
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    try {
      const whereConditions = [eq(products.sku, sku)]

      if (excludeId) {
        whereConditions.push(sql`${products.id} != ${excludeId}`)
      }

      const result = await db
        .select({ id: products.id })
        .from(products)
        .where(and(...whereConditions))
        .limit(1)

      return result.length > 0
    } catch (error) {
      console.error('Error checking SKU existence:', error)
      return false
    }
  }

  // Get product analytics
  async getAnalytics(): Promise<ProductAnalytics> {
    try {
      const [statsResult] = await db
        .select({
          totalProducts: count(),
          activeProducts: sql<number>`SUM(CASE WHEN ${products.status} = 'active' THEN 1 ELSE 0 END)`,
          draftProducts: sql<number>`SUM(CASE WHEN ${products.status} = 'draft' THEN 1 ELSE 0 END)`,
          totalValue: sql<number>`SUM(${products.price})`,
          averagePrice: sql<number>`AVG(${products.price})`,
        })
        .from(products)
        .where(sql`1=1`)

      // Get low stock and out of stock counts
      const [stockStats] = await db
        .select({
          lowStockProducts: sql<number>`COUNT(DISTINCT p.id)`,
          outOfStockProducts: sql<number>`COUNT(DISTINCT p2.id)`,
        })
        .from(
          sql`${products} p 
          LEFT JOIN ${inventory} i ON p.id = i.product_id 
          LEFT JOIN ${products} p2 ON p2.id = i.product_id AND i.quantity = 0`
        )
        .where(
          and(
            isNull(sql`p.deleted_at`),
            or(sql`i.quantity <= COALESCE(i.reorder_point, 10)`, sql`i.quantity = 0`)
          )
        )

      // Get top categories
      const topCategories = await db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          productCount: count(productCategories.productId),
        })
        .from(categories)
        .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
        .leftJoin(products, eq(productCategories.productId, products.id))
        .groupBy(categories.id, categories.name)
        .orderBy(desc(count(productCategories.productId)))
        .limit(5)

      // Get recently added products
      const recentlyAdded = await this.getList(
        { sortBy: ProductSortField.CREATED_AT, sortOrder: 'desc' },
        1,
        5
      )

      // Get recently updated products
      const recentlyUpdated = await this.getList(
        { sortBy: ProductSortField.UPDATED_AT, sortOrder: 'desc' },
        1,
        5
      )

      return {
        totalProducts: statsResult?.totalProducts || 0,
        activeProducts: statsResult?.activeProducts || 0,
        draftProducts: statsResult?.draftProducts || 0,
        lowStockProducts: stockStats?.lowStockProducts || 0,
        outOfStockProducts: stockStats?.outOfStockProducts || 0,
        totalValue: statsResult?.totalValue || 0,
        averagePrice: statsResult?.averagePrice || 0,
        topCategories,
        recentlyAdded: recentlyAdded.products,
        recentlyUpdated: recentlyUpdated.products,
      }
    } catch (error) {
      console.error('Error fetching product analytics:', error)
      throw new Error('Failed to fetch product analytics')
    }
  }

  // Helper method to build order by clause
  private buildOrderBy(sortBy?: ProductSortField, sortOrder?: 'asc' | 'desc') {
    const direction = sortOrder === 'asc' ? asc : desc

    switch (sortBy) {
      case ProductSortField.NAME:
        return [direction(products.name)]
      case ProductSortField.SKU:
        return [direction(products.sku)]
      case ProductSortField.PRICE:
        return [direction(products.price)]
      case ProductSortField.STATUS:
        return [direction(products.status)]
      case ProductSortField.UPDATED_AT:
        return [direction(products.updatedAt)]
      case ProductSortField.CREATED_AT:
      default:
        return [direction(products.createdAt)]
    }
  }
}

// Category repository
export class CategoryRepository {
  // Get all categories with hierarchy
  async getAll(): Promise<CategoryWithChildren[]> {
    try {
      const allCategories = await db
        .select({
          category: categories,
          productCount: sql<number>`COUNT(${productCategories.productId})`,
        })
        .from(categories)
        .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
        .leftJoin(products, eq(productCategories.productId, products.id))
        .groupBy(categories.id)
        .orderBy(categories.sortOrder, categories.name)

      // Build hierarchy
      const categoryMap = new Map<string, CategoryWithChildren>()
      const rootCategories: CategoryWithChildren[] = []

      // First pass: create all category objects
      allCategories.forEach(({ category, productCount }) => {
        const categoryWithChildren: CategoryWithChildren = {
          ...category,
          children: [],
          productCount,
        }
        categoryMap.set(category.id, categoryWithChildren)
      })

      // Second pass: build hierarchy
      allCategories.forEach(({ category }) => {
        const categoryWithChildren = categoryMap.get(category.id)!

        if (category.parentId) {
          const parent = categoryMap.get(category.parentId)
          if (parent) {
            parent.children.push(categoryWithChildren)
          } else {
            rootCategories.push(categoryWithChildren)
          }
        } else {
          rootCategories.push(categoryWithChildren)
        }
      })

      return rootCategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  // Get category by ID
  async getById(id: string): Promise<Category | null> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)

      return category || null
    } catch (error) {
      console.error('Error fetching category by ID:', error)
      throw new Error('Failed to fetch category')
    }
  }

  // Create category
  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const [category] = await db.insert(categories).values(data).returning()

      return category
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error('Failed to create category')
    }
  }

  // Update category
  async update(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const [category] = await db
        .update(categories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning()

      if (!category) {
        throw new Error('Category not found')
      }

      return category
    } catch (error) {
      console.error('Error updating category:', error)
      throw new Error('Failed to update category')
    }
  }

  // Delete category
  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.transaction(async tx => {
        // Check if category has products
        const [productCount] = await tx
          .select({ count: count() })
          .from(productCategories)
          .where(eq(productCategories.categoryId, id))

        if (productCount?.count && productCount.count > 0) {
          throw new Error('Cannot delete category with associated products')
        }

        // Check if category has children
        const [childCount] = await tx
          .select({ count: count() })
          .from(categories)
          .where(eq(categories.parentId, id))

        if (childCount?.count && childCount.count > 0) {
          throw new Error('Cannot delete category with child categories')
        }

        // Delete category
        const [deletedCategory] = await tx
          .delete(categories)
          .where(eq(categories.id, id))
          .returning({ id: categories.id })

        return !!deletedCategory
      })

      return result
    } catch (error) {
      console.error('Error deleting category:', error)
      throw new Error('Failed to delete category')
    }
  }
}

// Export repository instances
export const productRepository = new ProductRepository()
export const categoryRepository = new CategoryRepository()
