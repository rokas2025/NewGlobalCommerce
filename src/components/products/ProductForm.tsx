'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCategories, useCreateProduct, useSkuCheck, useUpdateProduct } from '@/hooks/useProducts'
import {
  createProductSchema,
  type CreateProductFormData,
  type UpdateProductFormData,
} from '@/lib/validations/products'
import { ProductStatus, ProductVisibility, type ProductWithCategories } from '@/types/products'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { Icons } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface ProductFormProps {
  product?: ProductWithCategories
  mode?: 'create' | 'edit'
}

export function ProductForm({ product, mode = 'create' }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>(product?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [skuError, setSkuError] = useState<string | null>(null)

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const { data: categories } = useCategories()

  const isEdit = mode === 'edit'

  // Use createProductSchema as base and handle edit mode in submission
  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues:
      isEdit && product
        ? {
            name: product.name,
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            sku: product.sku,
            barcode: product.barcode || '',
            price: product.price,
            compareAtPrice: product.compareAtPrice || undefined,
            costPrice: product.costPrice || undefined,
            status: product.status,
            visibility: product.visibility,
            featuredImageUrl: product.featuredImageUrl || '',
            galleryImages: product.galleryImages || [],
            weight: product.weight || undefined,
            dimensions: product.dimensions || '',
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
            tags: product.tags || [],
            categoryIds: product.categories?.map(c => c.id) || [],
            primaryCategoryId: product.primaryCategory?.id || undefined,
          }
        : {
            name: '',
            description: '',
            shortDescription: '',
            sku: '',
            barcode: '',
            price: 0,
            costPrice: undefined,
            compareAtPrice: undefined,
            weight: undefined,
            dimensions: '',
            status: ProductStatus.DRAFT,
            visibility: ProductVisibility.PRIVATE,
            featuredImageUrl: '',
            galleryImages: [],
            seoTitle: '',
            seoDescription: '',
            tags: [],
            categoryIds: [],
            primaryCategoryId: undefined,
          },
  })

  const watchSku = form.watch('sku')

  // SKU check hook - must be after watchSku is declared
  const skuCheckQuery = useSkuCheck(watchSku || '', product?.id)

  // SKU validation
  useEffect(() => {
    if (!watchSku || (isEdit && watchSku === product?.sku)) {
      setSkuError(null)
      return
    }

    if (skuCheckQuery.data?.exists) {
      setSkuError('SKU already exists')
    } else {
      setSkuError(null)
    }
  }, [skuCheckQuery.data, watchSku, isEdit, product?.sku])

  // Handle tag operations
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      form.setValue('tags', updatedTags)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    form.setValue('tags', updatedTags)
  }

  // Handle form submission
  const onSubmit = async (data: CreateProductFormData) => {
    if (skuError) return

    setIsSubmitting(true)
    try {
      // Transform empty strings to null/undefined for API compatibility
      const transformedData = {
        ...data,
        description: data.description || null,
        shortDescription: data.shortDescription || null,
        barcode: data.barcode || null,
        costPrice: data.costPrice || null,
        compareAtPrice: data.compareAtPrice || null,
        weight: data.weight || null,
        dimensions: data.dimensions || null,
        featuredImageUrl: data.featuredImageUrl || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        primaryCategoryId: data.primaryCategoryId || null,
      }

      if (isEdit && product) {
        // For edit mode, add the ID and cast to UpdateProductFormData
        const updateData = {
          id: product.id,
          ...transformedData,
        } as UpdateProductFormData

        await updateProduct.mutateAsync({
          id: product.id,
          data: updateData,
        })
        router.push(`/products/${product.id}`)
      } else {
        const result = await createProduct.mutateAsync(transformedData as CreateProductFormData)
        router.push(`/products/${result.id}`)
      }
    } catch (error) {
      // Error handling is done by the mutations
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential product details and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief product description for listings"
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>Brief description shown in product listings</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description"
                          className="resize-none"
                          rows={6}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>Detailed description shown on product pages</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory & Pricing</CardTitle>
                <CardDescription>SKU, pricing, and inventory information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter unique SKU"
                          {...field}
                          className={cn(skuError && 'border-destructive')}
                        />
                      </FormControl>
                      {skuError && (
                        <Alert variant="destructive">
                          <Icons.AlertCircle className="h-4 w-4" />
                          <AlertDescription>{skuError}</AlertDescription>
                        </Alert>
                      )}
                      <FormDescription>Unique identifier for inventory tracking</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Product barcode" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>UPC, EAN, or other barcode format</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare At Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(parseFloat(e.target.value) || undefined)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Original price for sale display</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(parseFloat(e.target.value) || undefined)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Your cost for this product</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
                <CardDescription>Weight, dimensions, and shipping information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Weight in kilograms for shipping calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions (L x W x H cm)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 30 x 20 x 10"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Product dimensions for shipping calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO & Meta Information</CardTitle>
                <CardDescription>Search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO title for search engines"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Title displayed in search engine results (60 chars max)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO description for search engines"
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Description displayed in search engine results (160 chars max)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Visibility</CardTitle>
                <CardDescription>Control product availability and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                          <SelectItem value={ProductStatus.ARCHIVED}>Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ProductVisibility.PUBLIC}>Public</SelectItem>
                          <SelectItem value={ProductVisibility.PRIVATE}>Private</SelectItem>
                          <SelectItem value={ProductVisibility.HIDDEN}>Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>Main product image for listings</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>URL of the product's featured image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Organize your product into categories</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={value => {
                            const currentIds = field.value || []
                            if (!currentIds.includes(value)) {
                              field.onChange([...currentIds, value])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select categories" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {field.value?.map((categoryId: string) => {
                          const category = categories?.find(c => c.id === categoryId)
                          return category ? (
                            <Badge key={categoryId} variant="secondary">
                              {category.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-4 w-4 p-0"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter((id: string) => id !== categoryId)
                                  )
                                }}
                              >
                                <Icons.X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags for better organization and search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Icons.Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0"
                        onClick={() => removeTag(tag)}
                      >
                        <Icons.X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !!skuError}>
            {isSubmitting ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : isEdit ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
