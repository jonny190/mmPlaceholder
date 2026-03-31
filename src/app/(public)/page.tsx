export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/ProductGrid";
import { SubscribeForm } from "@/components/SubscribeForm";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, availability: { not: "Sold" } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl">
            We buy, sell and rent food processing &amp; packing machinery.
          </h1>
          <p className="mt-6 text-lg text-[var(--muted)] max-w-xl font-light">
            High-quality used machines with fast delivery, fair valuations, and flexible rental options.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/buy"
              className="px-8 py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors"
            >
              Buy a machine
            </Link>
            <Link
              href="/sell"
              className="px-8 py-3 border border-[var(--border)] text-sm rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              Sell a machine
            </Link>
            <Link
              href="/rent"
              className="px-8 py-3 border border-[var(--border)] text-sm rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              Rent a machine
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light">Machines in stock</h2>
              <Link href="/buy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                View all &rarr;
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-light mb-6">About Moving Machines</h2>
          <div className="max-w-2xl space-y-4 text-[var(--muted)] font-light leading-relaxed">
            <p>
              At Moving Machines we specialise in buying, selling and renting used food and packing
              machinery. We offer a fast, simple, and transparent service.
            </p>
            <p>
              If you are selling we will give you a fair valuation for your machine, with payment,
              collection and storage options to best suit your needs.
            </p>
            <p>
              If you are buying we can arrange viewings and demonstrations, fast delivery, and
              servicing/support if you need it.
            </p>
            <p>Our dedicated team is here to assist you every step of the way.</p>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-light mb-2">Stay updated</h2>
          <p className="text-[var(--muted)] font-light mb-6">
            Sign up to hear about new machines as they arrive in stock.
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-6">Partnered with</h2>
          <div className="flex flex-wrap items-center gap-10">
            <span className="text-sm text-[var(--muted)]">Inspection Technology</span>
            <span className="text-sm text-[var(--muted)]">Machinery Masters</span>
            <span className="text-sm text-[var(--muted)]">Machinio</span>
          </div>
        </div>
      </section>
    </div>
  );
}
