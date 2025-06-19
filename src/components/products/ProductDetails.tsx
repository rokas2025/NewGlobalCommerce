'use client'

import { useDeleteProduct, useProduct } from '@/hooks/useProducts'
import { ProductStatus, ProductVisibility } from '@/types/products'
import Link from 'next/link'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { Icons } from '@/lib/icons'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

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

interface ProductDetailsProps {
  productId: string
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: product, isLoading, error } = useProduct(productId)
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId)
      router.push('/products')
    } catch (error) {
      // Error handling is done by the mutation
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>

            {/* Pricing Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Icons.AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load product data. Please try again.</AlertDescription>
      </Alert>
    )
  }

  if (!product) {
    return (
      <Alert>
        <Icons.Package className="h-4 w-4" />
        <AlertDescription>Product not found.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>
                    SKU: <code className="bg-muted rounded px-1 py-0.5 text-sm">{product.sku}</code>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icons.MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/products/${product.id}/edit`}>
                        <Icons.Edit className="mr-2 h-4 w-4" />
                        Edit Product
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Icons.Trash className="mr-2 h-4 w-4" />
                      Delete Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Featured Image */}
              {product.featuredImageUrl && (
                <div>
                  <h4 className="mb-2 font-medium">Featured Image</h4>
                  <div className="bg-muted h-48 w-48 overflow-hidden rounded-lg border">
                    <img
                      src={product.featuredImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Short Description */}
              {product.shortDescription && (
                <div>
                  <h4 className="mb-2 font-medium">Short Description</h4>
                  <p className="text-muted-foreground">{product.shortDescription}</p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Physical Properties */}
              {(product.weight || product.dimensions) && (
                <div>
                  <h4 className="mb-2 font-medium">Physical Properties</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.weight && (
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-2">{product.weight} kg</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="ml-2">{product.dimensions} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEO Information */}
              {(product.seoTitle || product.seoDescription) && (
                <div>
                  <h4 className="mb-2 font-medium">SEO Information</h4>
                  <div className="space-y-2 text-sm">
                    {product.seoTitle && (
                      <div>
                        <span className="text-muted-foreground">SEO Title:</span>
                        <p className="mt-1">{product.seoTitle}</p>
                      </div>
                    )}
                    {product.seoDescription && (
                      <div>
                        <span className="text-muted-foreground">SEO Description:</span>
                        <p className="mt-1">{product.seoDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>
                  <div className="text-muted-foreground text-sm">Current Price</div>
                </div>
                {product.compareAtPrice && (
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-muted-foreground text-2xl font-bold line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </div>
                    <div className="text-muted-foreground text-sm">Compare At</div>
                  </div>
                )}
                {product.costPrice && (
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold">{formatCurrency(product.costPrice)}</div>
                    <div className="text-muted-foreground text-sm">Cost Price</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{product.totalStock}</div>
                  <div className="text-muted-foreground text-sm">Total Stock</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{product.availableStock}</div>
                  <div className="text-muted-foreground text-sm">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product Status</span>
                <Badge variant={statusVariants[product.status]}>{product.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Visibility</span>
                <Badge variant={visibilityVariants[product.visibility]}>{product.visibility}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map(category => (
                    <Badge key={category.id} variant="outline">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">{product.sku}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
