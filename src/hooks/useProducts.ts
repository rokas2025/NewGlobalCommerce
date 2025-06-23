'use client'

import type {
  Category,
  CategoryWithChildren,
  CreateProductData,
  Product,
  ProductAnalytics,
  ProductFilters,
  ProductListResponse,
  ProductWithCategories,
  UpdateProductData,
} from '@/types/products'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// API functions (these would be implemented in a separate api layer)
const productApi = {
  getList: async (
    filters: ProductFilters = {},
    page = 1,
    limit = 20
  ): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.set(key, String(value))
        }
      }
    })

    searchParams.set('page', String(page))
    searchParams.set('limit', String(limit))

    const response = await fetch(`/api/products?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  },

  getById: async (id: string): Promise<ProductWithCategories> => {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return response.json()
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create product')
    return response.json()
  },

  update: async (id: string, data: Partial<UpdateProductData>): Promise<Product> => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update product')
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete product')
  },

  bulkUpdate: async (productIds: string[], updates: Partial<UpdateProductData>): Promise<void> => {
    const response = await fetch('/api/products/bulk-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, updates }),
    })
    if (!response.ok) throw new Error('Failed to update products')
  },

  bulkDelete: async (productIds: string[], hardDelete = false): Promise<void> => {
    const response = await fetch('/api/products/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, hardDelete }),
    })
    if (!response.ok) throw new Error('Failed to delete products')
  },

  getAnalytics: async (): Promise<ProductAnalytics> => {
    const response = await fetch('/api/products/analytics')
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  },

  checkSku: async (sku: string, excludeId?: string): Promise<{ exists: boolean }> => {
    const searchParams = new URLSearchParams({ sku })
    if (excludeId) searchParams.set('excludeId', excludeId)

    const response = await fetch(`/api/products/check-sku?${searchParams}`)
    if (!response.ok) throw new Error('Failed to check SKU')
    return response.json()
  },
}

const categoryApi = {
  getAll: async (): Promise<CategoryWithChildren[]> => {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  getById: async (id: string): Promise<Category> => {
    const response = await fetch(`/api/categories/${id}`)
    if (!response.ok) throw new Error('Failed to fetch category')
    return response.json()
  },

  create: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create category')
    return response.json()
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update category')
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete category')
  },
}

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  analytics: () => [...productKeys.all, 'analytics'] as const,
  skuCheck: (sku: string, excludeId?: string) =>
    [...productKeys.all, 'sku-check', sku, excludeId] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// Product hooks
export function useProducts(filters: ProductFilters = {}, page = 1, limit = 20) {
  return useQuery({
    queryKey: productKeys.list({ ...filters, page, limit } as ProductFilters),
    queryFn: () => productApi.getList(filters, page, limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useProductAnalytics() {
  return useQuery({
    queryKey: productKeys.analytics(),
    queryFn: productApi.getAnalytics,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSkuCheck(sku: string, excludeId?: string) {
  return useQuery({
    queryKey: productKeys.skuCheck(sku, excludeId),
    queryFn: () => productApi.checkSku(sku, excludeId),
    enabled: !!sku && sku.length >= 2,
    staleTime: 30 * 1000,
  })
}

// Infinite query for large product lists
export function useInfiniteProducts(filters: ProductFilters = {}, limit = 20) {
  return useInfiniteQuery({
    queryKey: productKeys.list({ ...filters, limit } as ProductFilters),
    queryFn: ({ pageParam = 1 }) => productApi.getList(filters, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      return lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined
    },
    staleTime: 30 * 1000,
  })
}

// Product mutations
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: newProduct => {
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.analytics() })

      // Add to cache
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct)

      toast.success('Product created successfully')
    },
    onError: error => {
      toast.error(error.message || 'Failed to create product')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateProductData> }) =>
      productApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(productKeys.detail(id), (old: ProductWithCategories | undefined) => {
        if (!old) return old
        return { ...old, ...data, updatedAt: new Date() }
      })

      return { previousProduct }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct)
      }
      toast.error(error.message || 'Failed to update product')
    },
    onSuccess: (updatedProduct, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(productKeys.detail(id), updatedProduct)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.analytics() })

      toast.success('Product updated successfully')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productApi.delete,
    onMutate: async id => {
      // Cancel related queries
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Snapshot previous values
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))
      const previousLists = queryClient.getQueriesData({ queryKey: productKeys.lists() })

      // Optimistically remove from lists
      queryClient.setQueriesData<ProductListResponse>({ queryKey: productKeys.lists() }, old => {
        if (!old) return old
        return {
          ...old,
          products: old.products.filter(p => p.id !== id),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        }
      })

      return { previousProduct, previousLists }
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(error.message || 'Failed to delete product')
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.analytics() })

      toast.success('Product deleted successfully')
    },
  })
}

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productIds,
      updates,
    }: {
      productIds: string[]
      updates: Partial<UpdateProductData>
    }) => productApi.bulkUpdate(productIds, updates),
    onSuccess: (_, { productIds }) => {
      // Invalidate affected queries
      productIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.analytics() })

      toast.success(`${productIds.length} products updated successfully`)
    },
    onError: error => {
      toast.error(error.message || 'Failed to update products')
    },
  })
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productIds, hardDelete }: { productIds: string[]; hardDelete?: boolean }) =>
      productApi.bulkDelete(productIds, hardDelete),
    onSuccess: (_, { productIds }) => {
      // Remove from cache
      productIds.forEach(id => {
        queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.analytics() })

      toast.success(`${productIds.length} products deleted successfully`)
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete products')
    },
  })
}

// Category hooks
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoryApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: newCategory => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.setQueryData(categoryKeys.detail(newCategory.id), newCategory)
      toast.success('Category created successfully')
    },
    onError: error => {
      toast.error(error.message || 'Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
    onSuccess: (updatedCategory, { id }) => {
      queryClient.setQueryData(categoryKeys.detail(id), updatedCategory)
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success('Category updated successfully')
    },
    onError: error => {
      toast.error(error.message || 'Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success('Category deleted successfully')
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete category')
    },
  })
}

// Utility hooks
export function useProductSearch(searchTerm: string, debounceMs = 300) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  return useProducts({ search: debouncedSearch }, 1, 10)
}

// Helper function to get flat category list
export function useFlatCategories() {
  const { data: categories } = useCategories()

  return useMemo(() => {
    if (!categories) return []

    const flattenCategories = (cats: CategoryWithChildren[], level = 0): Category[] => {
      return cats.reduce((acc, cat) => {
        const { children, ...categoryData } = cat
        acc.push({ ...categoryData, name: '  '.repeat(level) + categoryData.name })
        if (children.length > 0) {
          acc.push(...flattenCategories(children, level + 1))
        }
        return acc
      }, [] as Category[])
    }

    return flattenCategories(categories)
  }, [categories])
}
