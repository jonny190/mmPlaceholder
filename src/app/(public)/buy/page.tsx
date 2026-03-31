export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/ProductGrid";

interface BuyPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export const metadata = {
  title: "Buy a Machine",
  description: "Browse our stock of used food processing and packing machinery.",
};

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const { category, search } = await searchParams;

  const where: Record<string, unknown> = {
    availability: { not: "Sold" },
  };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { manufacturer: { contains: search, mode: "insensitive" } },
      { ref: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.product.findMany({
    where: { availability: { not: "Sold" } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-light mb-2">Buy a machine</h1>
      <p className="text-[var(--muted)] font-light mb-10">
        Browse our current stock of used food processing and packing machinery.
      </p>

      <div className="flex flex-wrap gap-4 mb-10">
        <form className="flex gap-3 flex-1 min-w-[200px]" action="/buy" method="GET">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            name="search"
            placeholder="Search machines..."
            defaultValue={search || ""}
            className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
          />
          <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <a
            href="/buy"
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              !category ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            All
          </a>
          {categories.map(({ category: cat }) => (
            <a
              key={cat}
              href={`/buy?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                category === cat ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
