import { Metadata } from 'next'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'
import ProductClient from '@/app/product/[slug]/product-client'

type PageProps = { params: { slug: string } }

export async function generateStaticParams() {
  const rows = await db.select({ slug: products.slug }).from(products)
  return rows.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, params.slug),
  })

  if (!product) return {}

  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.short_description || undefined,
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.short_description || undefined,
      images: product.images?.[0]
        ? [{ url: product.images[0] as string }]
        : undefined,
    },
    alternates: { canonical: `/product/${product.slug}` },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, params.slug),
  })

  if (!product) {
    return null
  }

  return <ProductClient product={product} />
}