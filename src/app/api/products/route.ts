import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedApi } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const availability = searchParams.get("availability");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (availability) where.availability = availability;
  if (featured === "true") where.featured = true;
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

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedApi(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slug = slugify(body.name);

  const product = await prisma.product.create({
    data: {
      slug,
      ref: body.ref,
      name: body.name,
      description: body.description || "",
      category: body.category,
      manufacturer: body.manufacturer || null,
      modelName: body.modelName || null,
      yearOfManufacture: body.yearOfManufacture || null,
      condition: body.condition || null,
      availability: body.availability || "For Sale",
      images: body.images || [],
      featured: body.featured || false,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
