'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product, ProductStatus, ProductVisibility } from '@/types/products'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Icons } from '@/lib/icons'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

interface ProductCardProps {
  product: Product
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function ProductCard({
  product,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  className,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Card
      className={cn('group relative overflow-hidden transition-all hover:shadow-lg', className)}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="bg-background border-2"
          />
        </div>
      )}

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
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
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Icons.Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Icons.Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="p-0">
        {/* Product Image */}
        <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden">
          {product.featuredImageUrl && !imageError ? (
            <img
              src={product.featuredImageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center">
              <Icons.Image className="mb-2 h-12 w-12" />
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.status === ProductStatus.DRAFT && (
            <Badge variant="secondary" className="text-xs">
              Draft
            </Badge>
          )}
          {product.status === ProductStatus.INACTIVE && (
            <Badge variant="outline" className="text-xs">
              Inactive
            </Badge>
          )}
          {product.status === ProductStatus.ARCHIVED && (
            <Badge variant="destructive" className="text-xs">
              Archived
            </Badge>
          )}
          {product.visibility === ProductVisibility.PRIVATE && (
            <Badge variant="secondary" className="text-xs">
              Private
            </Badge>
          )}
          {product.visibility === ProductVisibility.HIDDEN && (
            <Badge variant="outline" className="text-xs">
              Hidden
            </Badge>
          )}
        </div>

        {/* Sale Badge */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="text-xs">
              Sale
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 p-4">
        {/* Product Name */}
        <div>
          <Link
            href={`/products/${product.id}`}
            className="line-clamp-2 text-sm font-semibold hover:underline"
          >
            {product.name}
          </Link>
        </div>

        {/* SKU */}
        <div className="text-muted-foreground text-xs">
          SKU: <code className="bg-muted rounded px-1 py-0.5">{product.sku}</code>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{product.shortDescription}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                product.availableStock > 0
                  ? product.availableStock > 10
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                  : 'bg-red-500'
              )}
            />
            <span className="text-muted-foreground">
              {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map(category => (
              <Badge key={category.id} variant="outline" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {product.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{product.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-muted-foreground flex items-center justify-between p-4 pt-0 text-xs">
        <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
        <Badge variant={statusVariants[product.status]} className="text-xs">
          {product.status}
        </Badge>
      </CardFooter>
    </Card>
  )
}

// Grid container component for products
interface ProductGridProps {
  products: Product[]
  selectedProducts?: string[]
  onSelectProduct?: (productId: string, selected: boolean) => void
  onEditProduct?: (productId: string) => void
  onDeleteProduct?: (productId: string) => void
  className?: string
}

export function ProductGrid({
  products,
  selectedProducts = [],
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icons.Package className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No products found</h3>
        <p className="text-muted-foreground mb-4">Get started by creating your first product.</p>
        <Button asChild>
          <Link href="/products/new">
            <Icons.Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          selected={selectedProducts.includes(product.id)}
          onSelect={onSelectProduct ? selected => onSelectProduct(product.id, selected) : undefined}
          onEdit={onEditProduct ? () => onEditProduct(product.id) : undefined}
          onDelete={onDeleteProduct ? () => onDeleteProduct(product.id) : undefined}
        />
      ))}
    </div>
  )
}
