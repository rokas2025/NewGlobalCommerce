import { ProductDetails } from '@/components/products/ProductDetails'
import { Button } from '@/components/ui/button'
import { Icons } from '@/lib/icons'
import { Metadata } from 'next'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  return {
    title: `Product Details | Global Commerce`,
    description: 'View product information',
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
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
            <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
            <p className="text-muted-foreground">View and manage product information</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/products/${id}/edit`}>
              <Icons.Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductDetails productId={id} />
    </div>
  )
}
