export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mmplaceholder.daveys.xyz";

  const products = await prisma.product.findMany({
    where: { availability: { not: "Sold" } },
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/buy/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/buy`, lastModified: new Date() },
    { url: `${baseUrl}/sell`, lastModified: new Date() },
    { url: `${baseUrl}/rent`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
    ...productUrls,
  ];
}
