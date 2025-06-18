import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/lib/icons'
import { ProductEditForm } from '@/components/products/ProductEditForm'

interface ProductEditPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ProductEditPageProps): Promise<Metadata> {
  return {
    title: `Edit Product | Global Commerce`,
    description: 'Edit product details',
  }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products/${params.id}`}>
              <Icons.ArrowLeft className="mr-2 h-4 w-4" />
              Back to Product
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information and settings</p>
          </div>
        </div>
      </div>

      <ProductEditForm productId={params.id} />
    </div>
  )
}
