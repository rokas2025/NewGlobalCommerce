'use client'

import { useProduct } from '@/hooks/useProducts'
import { ProductForm } from './ProductForm'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/lib/icons'

interface ProductEditFormProps {
  productId: string
}

export function ProductEditForm({ productId }: ProductEditFormProps) {
  const { data: product, isLoading, error } = useProduct(productId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information Skeleton */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>

            {/* Pricing Skeleton */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status Skeleton */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Image Skeleton */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
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

  return <ProductForm product={product} mode="edit" />
}
