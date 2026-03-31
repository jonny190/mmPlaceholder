"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductFormProps {
  product?: {
    id: string;
    ref: string;
    name: string;
    description: string;
    category: string;
    manufacturer: string | null;
    modelName: string | null;
    yearOfManufacture: number | null;
    condition: string | null;
    availability: string;
    featured: boolean;
    images: string[];
  };
}

const categories = ["Processing", "Packing", "Labelling", "Metal Detection", "Bakery", "Washing", "Freezing", "Other"];
const availabilities = ["For Sale", "For Rent", "Both", "Sold"];
const conditions = ["Excellent", "Good", "Fair", "Refurbished"];

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);

  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      ref: form.get("ref"),
      name: form.get("name"),
      description: form.get("description"),
      category: form.get("category"),
      manufacturer: form.get("manufacturer") || null,
      modelName: form.get("modelName") || null,
      yearOfManufacture: form.get("yearOfManufacture") ? parseInt(form.get("yearOfManufacture") as string) : null,
      condition: form.get("condition") || null,
      availability: form.get("availability"),
      featured: form.get("featured") === "on",
      images,
    };

    const url = isEdit ? `/api/products/${product.id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("Failed to save product");
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!isEdit) {
      alert("Save the product first, then upload images.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("images", file);
    }

    const res = await fetch(`/api/products/${product.id}/images`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setImages(updated.images);
    }
    setUploading(false);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">REF *</label>
          <input name="ref" defaultValue={product?.ref || ""} required className={inputClass} placeholder="MM0001" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Category *</label>
          <select name="category" defaultValue={product?.category || ""} required className={inputClass}>
            <option value="">Select...</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Name *</label>
        <input name="name" defaultValue={product?.name || ""} required className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Description *</label>
        <textarea name="description" defaultValue={product?.description || ""} required rows={8} className={inputClass + " resize-y"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Manufacturer</label>
          <input name="manufacturer" defaultValue={product?.manufacturer || ""} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Model</label>
          <input name="modelName" defaultValue={product?.modelName || ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Year</label>
          <input name="yearOfManufacture" type="number" defaultValue={product?.yearOfManufacture || ""} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Condition</label>
          <select name="condition" defaultValue={product?.condition || ""} className={inputClass}>
            <option value="">Select...</option>
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Availability *</label>
          <select name="availability" defaultValue={product?.availability || "For Sale"} required className={inputClass}>
            {availabilities.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input name="featured" type="checkbox" defaultChecked={product?.featured || false} id="featured" />
        <label htmlFor="featured" className="text-sm">Featured on homepage</label>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-2">Images</label>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 border border-[var(--border)] rounded-lg overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs rounded-bl-lg"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {isEdit && (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="text-sm"
          />
        )}
        {!isEdit && <p className="text-xs text-[var(--muted)]">Save the product first to upload images.</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Update product" : "Create product"}
      </button>
    </form>
  );
}
