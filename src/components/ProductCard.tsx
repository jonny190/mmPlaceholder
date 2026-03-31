import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  slug: string;
  name: string;
  productRef: string;
  images: string[];
  category: string;
  availability: string;
}

export function ProductCard({ slug, name, productRef, images, category, availability }: ProductCardProps) {
  const imageUrl = images[0] || "/placeholder.svg";

  return (
    <Link href={`/buy/${slug}`} className="group block">
      <div className="aspect-square bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-3">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={400}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-[var(--muted)] uppercase tracking-wider">{category} &middot; {productRef}</p>
        <h3 className="text-sm font-medium leading-snug">{name}</h3>
        <p className="text-xs text-[var(--muted)]">{availability}</p>
      </div>
    </Link>
  );
}
