'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from '@/hooks/useProducts'
import {
  ProductStatus,
  ProductVisibility,
  ProductSortField,
  type ProductFilters,
} from '@/types/products'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Icons } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

const statusVariants = {
  [ProductStatus.ACTIVE]: 'default',
  [ProductStatus.DRAFT]: 'secondary',
  [ProductStatus.INACTIVE]: 'outline',
  [ProductStatus.ARCHIVED]: 'destructive',
} as const

const visibilityVariants = {
  [ProductVisibility.PUBLIC]: 'default',
  [ProductVisibility.PRIVATE]: 'secondary',
  [ProductVisibility.HIDDEN]: 'outline',
} as const

export function ProductList() {
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: ProductSortField.CREATED_AT,
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const limit = 20

  const { data, isLoading, error } = useProducts(filters, page, limit)
  const deleteProduct = useDeleteProduct()
  const bulkDeleteProducts = useBulkDeleteProducts()

  // Handle search
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
    setPage(1)
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // Handle sorting
  const handleSort = (sortBy: ProductSortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.products) {
      setSelectedProducts(data.products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  // Handle delete
  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteProducts.mutateAsync({
        productIds: selectedProducts,
        hardDelete: false,
      })
      setSelectedProducts([])
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  // Pagination
  const totalPages = data?.pagination.totalPages || 0
  const hasNext = data?.pagination.hasNext || false
  const hasPrev = data?.pagination.hasPrev || false

  const getSortIcon = (field: ProductSortField) => {
    if (filters.sortBy !== field) {
      return <Icons.ArrowUpDown className="h-4 w-4" />
    }
    return filters.sortOrder === 'asc' ? (
      <Icons.ArrowUp className="h-4 w-4" />
    ) : (
      <Icons.ArrowDown className="h-4 w-4" />
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Icons.AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load products. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={bulkDeleteProducts.isPending}
            >
              <Icons.Trash className="mr-2 h-4 w-4" />
              Delete ({selectedProducts.length})
            </Button>
          )}
        </div>

        <Button asChild>
          <Link href="/products/new">
            <Icons.Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by name, SKU..."
                value={filters.search || ''}
                onChange={e => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status?.[0] || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'status',
                    value === 'all' ? undefined : [value as ProductStatus]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={ProductStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <Select
                value={filters.visibility?.[0] || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'visibility',
                    value === 'all' ? undefined : [value as ProductVisibility]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All visibility</SelectItem>
                  <SelectItem value={ProductVisibility.PUBLIC}>Public</SelectItem>
                  <SelectItem value={ProductVisibility.PRIVATE}>Private</SelectItem>
                  <SelectItem value={ProductVisibility.HIDDEN}>Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select
                value={filters.sortBy || ProductSortField.CREATED_AT}
                onValueChange={value => handleFilterChange('sortBy', value as ProductSortField)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductSortField.NAME}>Name</SelectItem>
                  <SelectItem value={ProductSortField.SKU}>SKU</SelectItem>
                  <SelectItem value={ProductSortField.PRICE}>Price</SelectItem>
                  <SelectItem value={ProductSortField.STATUS}>Status</SelectItem>
                  <SelectItem value={ProductSortField.CREATED_AT}>Created Date</SelectItem>
                  <SelectItem value={ProductSortField.UPDATED_AT}>Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {data ? `${data.pagination.total} products found` : 'Loading...'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProducts.length === data?.products.length &&
                        data?.products.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={!data?.products.length}
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(ProductSortField.NAME)}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Name {getSortIcon(ProductSortField.NAME)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(ProductSortField.SKU)}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      SKU {getSortIcon(ProductSortField.SKU)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(ProductSortField.PRICE)}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Price {getSortIcon(ProductSortField.PRICE)}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(ProductSortField.UPDATED_AT)}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Updated {getSortIcon(ProductSortField.UPDATED_AT)}
                    </Button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-10 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Icons.Package className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground">No products found</p>
                        <Button asChild size="sm">
                          <Link href="/products/new">Add your first product</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={checked =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded border">
                          {product.featuredImageUrl ? (
                            <img
                              src={product.featuredImageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icons.Image className="text-muted-foreground h-4 w-4" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/products/${product.id}`}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted rounded px-1 py-0.5 text-sm">{product.sku}</code>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[product.status]}>{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{product.totalStock}</div>
                          <div className="text-muted-foreground">
                            {product.availableStock} available
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.primaryCategory ? (
                          <Badge variant="outline">{product.primaryCategory}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground text-sm">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Icons.MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                <Icons.Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}/edit`}>
                                <Icons.Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(product.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive"
                            >
                              <Icons.Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({data.pagination.total} total)
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={!hasPrev}>
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrev}
                >
                  <Icons.ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNext}
                >
                  Next
                  <Icons.ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={!hasNext}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Product Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDelete(productToDelete)}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProducts.length} products? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteProducts.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteProducts.isPending ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
