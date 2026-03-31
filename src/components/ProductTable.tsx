"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  ref: string;
  name: string;
  category: string;
  availability: string;
  featured: boolean;
  updatedAt: string;
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-white">
            <th className="text-left p-3 font-medium">REF</th>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
            <th className="text-left p-3 font-medium hidden lg:table-cell">Featured</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/50">
              <td className="p-3 text-[var(--muted)]">{product.ref}</td>
              <td className="p-3">{product.name}</td>
              <td className="p-3 text-[var(--muted)] hidden md:table-cell">{product.category}</td>
              <td className="p-3 hidden md:table-cell">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.availability === "Sold" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {product.availability}
                </span>
              </td>
              <td className="p-3 hidden lg:table-cell">{product.featured ? "Yes" : ""}</td>
              <td className="p-3 text-right space-x-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
