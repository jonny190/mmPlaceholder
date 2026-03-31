export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/ImageGallery";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ShareLinks } from "@/components/ShareLinks";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || "https://mmplaceholder.daveys.xyz";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ImageGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
              REF: {product.ref}
            </p>
            <h1 className="text-2xl font-light">{product.name}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.category}</span>
            {product.condition && (
              <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.condition}</span>
            )}
            <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.availability}</span>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--muted)] font-light whitespace-pre-wrap">
            {product.description}
          </div>

          {product.manufacturer && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Manufacturer:</span> {product.manufacturer}
            </div>
          )}
          {product.modelName && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Model:</span> {product.modelName}
            </div>
          )}
          {product.yearOfManufacture && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Year:</span> {product.yearOfManufacture}
            </div>
          )}

          <ShareLinks url={`${baseUrl}/buy/${product.slug}`} title={product.name} />

          <div className="border-t border-[var(--border)] pt-6">
            <h2 className="text-lg font-light mb-4">I&apos;m interested in this machine</h2>
            <EnquiryForm type="buy" machineRef={product.ref} machineName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
