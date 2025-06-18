import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/lib/icons'
import { ProductForm } from '@/components/products/ProductForm'

export const metadata: Metadata = {
  title: 'Create Product | Global Commerce',
  description: 'Add a new product to your catalog',
}

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <Icons.ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
            <p className="text-muted-foreground">Add a new product to your catalog</p>
          </div>
        </div>
      </div>

      <ProductForm />
    </div>
  )
}
