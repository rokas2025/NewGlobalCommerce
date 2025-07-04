'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductPreview } from '@/types/amazon'
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Package,
  Search,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProductPreviewProps {
  fileId: string
  analysisResult?: any
  onImportReady?: () => void
}

interface PreviewResponse {
  success: boolean
  products: ProductPreview[]
  summary: {
    totalCount: number
    validProducts: number
    errorProducts: number
    withPrices: number
    withImages: number
    feedProductTypes: string[]
    listingStatuses: string[]
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    search: string
    filterBy: string
    filterValue: string
    sortBy: string
    sortOrder: string
  }
}

export default function ProductPreviewComponent({
  fileId,
  analysisResult,
  onImportReady,
}: ProductPreviewProps) {
  const [data, setData] = useState<PreviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  // Filter and pagination state
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [filterValue, setFilterValue] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(20)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        fileId,
        page: currentPage.toString(),
        limit: limit.toString(),
        search,
        filterBy,
        filterValue,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/amazon/preview?${params}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load products')
      }
    } catch (error) {
      setError('Failed to load products')
      console.error('Preview error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [fileId, currentPage, search, filterBy, filterValue, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilter = (by: string, value: string) => {
    setFilterBy(by)
    setFilterValue(value)
    setCurrentPage(1)
  }

  const handleSort = (by: string, order: string) => {
    setSortBy(by)
    setSortOrder(order)
    setCurrentPage(1)
  }

  const handleSelectProduct = (sku: string, selected: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (selected) {
      newSelected.add(sku)
    } else {
      newSelected.delete(sku)
    }
    setSelectedProducts(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected && data) {
      const allSkus = new Set([...selectedProducts, ...data.products.map(p => p.sku)])
      setSelectedProducts(allSkus)
    } else if (data) {
      const newSelected = new Set(selectedProducts)
      data.products.forEach(p => newSelected.delete(p.sku))
      setSelectedProducts(newSelected)
    }
  }

  const handleImportSelected = async () => {
    if (selectedProducts.size === 0) return

    setImporting(true)
    setError(null)

    try {
      const response = await fetch('/api/amazon/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          selectedSkus: Array.from(selectedProducts),
          importSettings: {
            skipDuplicates: true,
            overwriteExisting: false,
            defaultCategory: 'uncategorized',
            defaultStatus: 'draft',
            enableAutoTags: true,
          },
          duplicateHandling: {
            strategy: 'skip',
          },
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setImportResult(result)
        setSelectedProducts(new Set()) // Clear selection

        // Refresh the product list to show updated status
        await fetchProducts()

        // Call the callback to proceed to next step
        onImportReady?.()
      } else {
        setError(result.error || 'Failed to import products')
      }
    } catch (error) {
      setError('Failed to import products')
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'selected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      pending: 'outline',
      selected: 'default',
      error: 'destructive',
      imported: 'secondary',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data available</AlertDescription>
      </Alert>
    )
  }

  const currentPageProducts = data.products || []
  const allCurrentSelected =
    currentPageProducts.length > 0 && currentPageProducts.every(p => selectedProducts.has(p.sku))

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{data.summary.totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{data.summary.validProducts}</div>
            <div className="text-sm text-muted-foreground">Valid Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{data.summary.errorProducts}</div>
            <div className="text-sm text-muted-foreground">With Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{data.summary.withPrices}</div>
            <div className="text-sm text-muted-foreground">With Prices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{data.summary.withImages}</div>
            <div className="text-sm text-muted-foreground">With Images</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Product Preview</CardTitle>
          <CardDescription>
            Review and select products for import ({selectedProducts.size} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by SKU, name, or description..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterBy} onValueChange={value => handleFilter(value, '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="importStatus">Import Status</SelectItem>
                <SelectItem value="feedProductType">Product Type</SelectItem>
                <SelectItem value="hasPrice">Has Price</SelectItem>
                <SelectItem value="hasImages">Has Images</SelectItem>
                <SelectItem value="hasErrors">Has Errors</SelectItem>
              </SelectContent>
            </Select>

            {filterBy && (
              <Select value={filterValue} onValueChange={value => handleFilter(filterBy, value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Value..." />
                </SelectTrigger>
                <SelectContent>
                  {filterBy === 'importStatus' && (
                    <>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </>
                  )}
                  {filterBy === 'feedProductType' &&
                    data.summary.feedProductTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  {(filterBy === 'hasPrice' ||
                    filterBy === 'hasImages' ||
                    filterBy === 'hasErrors') && (
                    <>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            )}

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={value => {
                const [by, order] = value.split('-')
                if (by && order) {
                  handleSort(by, order)
                }
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="sku-asc">SKU A-Z</SelectItem>
                <SelectItem value="sku-desc">SKU Z-A</SelectItem>
                <SelectItem value="price-desc">Price High-Low</SelectItem>
                <SelectItem value="price-asc">Price Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <span className="text-sm font-medium">{selectedProducts.size} products selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleImportSelected}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import Selected'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProducts(new Set())}>
                Clear Selection
              </Button>
            </div>
          )}

          {importResult && (
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-sm font-medium text-green-800">
                Import completed successfully!
              </div>
              <div className="text-sm text-green-700">
                {importResult.results.successful} products imported, {importResult.results.failed}{' '}
                failed, {importResult.results.skipped} skipped
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allCurrentSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageProducts.map(product => (
                <TableRow key={product.sku}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.sku)}
                      onCheckedChange={checked =>
                        handleSelectProduct(product.sku, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(product.importStatus)}
                      {getStatusBadge(product.importStatus)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="truncate font-medium">{product.name}</div>
                      <div className="truncate text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.amazonData.feedProductType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(product.price ?? null)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {product.images.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
          {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of{' '}
          {data.pagination.totalCount} products
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!data.pagination.hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!data.pagination.hasNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
