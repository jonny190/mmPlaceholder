import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  ref: string;
  images: string[];
  category: string;
  availability: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-[var(--muted)] py-12">
        No machines found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          productRef={product.ref}
          images={product.images}
          category={product.category}
          availability={product.availability}
        />
      ))}
    </div>
  );
}
