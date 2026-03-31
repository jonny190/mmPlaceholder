"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white border border-[var(--border)] rounded-xl flex items-center justify-center">
        <p className="text-[var(--muted)]">No images</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="aspect-square bg-white border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[selected]}
            alt={alt}
            width={800}
            height={800}
            className="w-full h-full object-contain p-6"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-16 h-16 flex-shrink-0 border rounded-lg overflow-hidden ${
                  i === selected ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
              >
                <Image src={img} alt="" width={64} height={64} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-light"
            onClick={() => setLightbox(false)}
          >
            &times;
          </button>
          <Image
            src={images[selected]}
            alt={alt}
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
