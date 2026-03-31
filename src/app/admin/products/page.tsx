import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/ProductTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-6 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors"
        >
          Add product
        </Link>
      </div>
      <ProductTable products={products.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />
    </div>
  );
}
