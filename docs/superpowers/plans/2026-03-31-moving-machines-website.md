# Moving Machines Ltd Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js website for Moving Machines Ltd — a used catering equipment reseller — with public product catalog, enquiry forms, admin dashboard, and REST API, deployable on Coolify.

**Architecture:** Single Next.js 14+ App Router application with Prisma/PostgreSQL for data, NextAuth for admin auth, Nodemailer for enquiry emails, and local filesystem for image storage. API routes serve both the admin UI and external integrations via API key auth.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js, Nodemailer

**Spec:** `docs/superpowers/specs/2026-03-31-moving-machines-website-design.md`

---

## File Structure

```
src/
  app/
    layout.tsx                    # Root layout — Inter font, Tailwind, metadata
    page.tsx                      # Homepage
    buy/
      page.tsx                    # Product catalog with search/filter
      [slug]/
        page.tsx                  # Product detail page
    sell/
      page.tsx                    # Sell service page + enquiry form
    rent/
      page.tsx                    # Rent service page + enquiry form
    contact/
      page.tsx                    # General contact form
    privacy-policy/
      page.tsx                    # Privacy policy
    admin/
      layout.tsx                  # Admin layout with sidebar nav + auth gate
      page.tsx                    # Redirect to /admin/products
      login/
        page.tsx                  # Admin login form
      products/
        page.tsx                  # Product list table
        new/
          page.tsx                # Create product form
        [id]/
          edit/
            page.tsx              # Edit product form
    api/
      auth/[...nextauth]/
        route.ts                  # NextAuth handler
      products/
        route.ts                  # GET list, POST create
        [id]/
          route.ts                # GET one, PUT update, DELETE
          images/
            route.ts              # POST image upload
      enquiries/
        route.ts                  # POST send enquiry email
      subscribers/
        route.ts                  # POST subscribe to mailing list
  components/
    Header.tsx                    # Site header with nav
    Footer.tsx                    # Site footer
    ProductCard.tsx               # Product card for grids
    ProductGrid.tsx               # Grid of ProductCards
    EnquiryForm.tsx               # Reusable enquiry form
    ImageGallery.tsx              # Product image gallery with lightbox
    ShareLinks.tsx                # Social share links
    AdminSidebar.tsx              # Admin navigation sidebar
    ProductForm.tsx               # Admin product create/edit form
    ProductTable.tsx              # Admin product list table
    SubscribeForm.tsx             # Mailing list signup form
  lib/
    prisma.ts                     # Prisma client singleton
    auth.ts                       # NextAuth config
    email.ts                      # Nodemailer transport + send helpers
    api-auth.ts                   # API key validation middleware
    utils.ts                      # Slug generation, etc.
prisma/
  schema.prisma                   # Product, User, Subscriber models
  seed.ts                         # Seed script for initial products
Dockerfile                        # Multi-stage build for Coolify
docker-compose.yml                # Local dev with Postgres
.env.example                      # Template for env vars
tailwind.config.ts                # Tailwind config
next.config.ts                    # Next.js config (image domains, output)
```

---

## Task 1: Project Scaffolding & Database

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.example`, `docker-compose.yml`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd g:/movingmachinesltd.com
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the base project structure.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client next-auth nodemailer bcryptjs
npm install -D @types/nodemailer @types/bcryptjs
```

- [ ] **Step 3: Create docker-compose.yml for local Postgres**

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: movingmachines
      POSTGRES_PASSWORD: localdev
      POSTGRES_DB: movingmachines
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:

```env
DATABASE_URL="postgresql://movingmachines:localdev@localhost:5432/movingmachines"
NEXTAUTH_SECRET="change-me-to-a-random-string"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
ENQUIRY_EMAIL="info@movingmachinesltd.com"
API_KEY="change-me-to-a-random-api-key"
```

Copy to `.env`:

```bash
cp .env.example .env
```

- [ ] **Step 5: Initialize Prisma and create schema**

```bash
npx prisma init
```

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id                String   @id @default(cuid())
  slug              String   @unique
  ref               String   @unique
  name              String
  description       String
  category          String
  manufacturer      String?
  modelName         String?
  yearOfManufacture Int?
  condition         String?
  availability      String   @default("For Sale")
  images            String[]
  featured          Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model User {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  name         String
  role         String @default("admin")
}

model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

- [ ] **Step 6: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Start Postgres, run migration, verify**

```bash
docker compose up -d
npx prisma db push
npx prisma studio
```

Expected: Prisma Studio opens in browser showing Product, User, Subscriber tables (empty).

- [ ] **Step 8: Update .gitignore and commit**

Add to `.gitignore`:

```
.env
uploads/
```

```bash
git init
git add -A
git commit -m "feat: project scaffolding with Next.js, Prisma, Postgres"
```

---

## Task 2: Root Layout, Header & Footer Components

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css for modern minimal theme**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #1a1a1a;
  --background: #fafafa;
  --muted: #999999;
  --border: #e0e0e0;
  --accent: #222222;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-inter), sans-serif;
}
```

- [ ] **Step 2: Create Header component**

Create `src/components/Header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">MM</span>
          </div>
          <span className="text-[var(--foreground)] text-sm font-light tracking-[3px] uppercase">
            Moving Machines
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/buy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Buy
          </Link>
          <Link href="/sell" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Sell
          </Link>
          <Link href="/rent" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Rent
          </Link>
          <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Contact
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--border)] bg-white px-6 py-4 flex flex-col gap-4">
          <Link href="/buy" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Buy</Link>
          <Link href="/sell" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Sell</Link>
          <Link href="/rent" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Rent</Link>
          <Link href="/contact" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create Footer component**

Create `src/components/Footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">MM</span>
              </div>
              <span className="text-sm font-light tracking-[2px] uppercase">Moving Machines</span>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-xs">
              Specialists in buying, selling and renting used food processing and packing machinery.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Services</h4>
              <div className="flex flex-col gap-2">
                <Link href="/buy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Buy</Link>
                <Link href="/sell" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Sell</Link>
                <Link href="/rent" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Rent</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Contact</Link>
                <Link href="/privacy-policy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} Moving Machines Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Used Food Processing Machinery | Moving Machines Ltd",
    template: "%s | Moving Machines Ltd",
  },
  description:
    "At Moving Machines we specialise in buying, selling and renting high-quality, used food processing and packing machinery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create placeholder homepage**

Replace `src/app/page.tsx` with:

```tsx
export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-light tracking-tight">
        We buy, sell and rent food processing &amp; packing machinery.
      </h1>
    </div>
  );
}
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000. Expected: minimal page with header (MM logo, nav links), hero text, footer.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: root layout with Header and Footer components"
```

---

## Task 3: Auth Setup (NextAuth + API Key)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/api-auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create NextAuth config**

Create `src/lib/auth.ts`:

```typescript
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
};
```

- [ ] **Step 2: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Create API key auth helper**

Create `src/lib/api-auth.ts`:

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function isAuthorizedApi(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return token === process.env.API_KEY;
  }
  const session = await getServerSession(authOptions);
  return !!session;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: NextAuth credentials provider and API key auth"
```

---

## Task 4: Products API Routes

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[id]/route.ts`
- Create: `src/app/api/products/[id]/images/route.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utils (slug generation)**

Create `src/lib/utils.ts`:

```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

- [ ] **Step 2: Create products list + create route**

Create `src/app/api/products/route.ts`:

```typescript
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
```

- [ ] **Step 3: Create single product route (GET, PUT, DELETE)**

Create `src/app/api/products/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedApi } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedApi(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedApi(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create image upload route**

Create `src/app/api/products/[id]/images/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedApi } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedApi(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("images") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads", id);
  await mkdir(uploadDir, { recursive: true });

  const newPaths: string[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    newPaths.push(`/uploads/${id}/${filename}`);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { images: [...product.images, ...newPaths] },
  });

  return NextResponse.json(updated);
}
```

- [ ] **Step 5: Add static file serving for uploads in next.config**

Replace `next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
```

Create `src/app/api/uploads/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), "uploads", ...segments);

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".gif": "image/gif",
    };

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
```

- [ ] **Step 6: Verify API works**

```bash
npm run dev
```

Test creating a product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer change-me-to-a-random-api-key" \
  -d '{"ref":"MM0001","name":"Test Machine","description":"A test","category":"Processing"}'
```

Expected: 201 response with created product JSON.

Then list:

```bash
curl http://localhost:3000/api/products
```

Expected: Array containing the test product.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: products API with CRUD, image upload, and file serving"
```

---

## Task 5: Email Setup & Enquiry/Subscriber API Routes

**Files:**
- Create: `src/lib/email.ts`
- Create: `src/app/api/enquiries/route.ts`
- Create: `src/app/api/subscribers/route.ts`

- [ ] **Step 1: Create email helper**

Create `src/lib/email.ts`:

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EnquiryEmail {
  type: "buy" | "rent" | "sell" | "general";
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  phone?: string;
  machineRef?: string;
  machineName?: string;
  interestType?: string;
  message: string;
}

export async function sendEnquiryEmail(data: EnquiryEmail) {
  const subject = data.machineRef
    ? `[${data.type.toUpperCase()}] Enquiry: ${data.machineName} (${data.machineRef})`
    : `[${data.type.toUpperCase()}] New enquiry from ${data.firstName}`;

  const lines = [
    `Name: ${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : null,
    data.phone ? `Phone: ${data.phone}` : null,
    data.interestType ? `Interest: ${data.interestType}` : null,
    data.machineRef ? `Machine: ${data.machineName} (${data.machineRef})` : null,
    "",
    `Message:`,
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ENQUIRY_EMAIL,
    replyTo: data.email,
    subject,
    text: lines,
  });
}

export async function sendSubscriberNotification(email: string) {
  if (!process.env.ENQUIRY_EMAIL) return;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ENQUIRY_EMAIL,
    subject: "[SUBSCRIBER] New mailing list signup",
    text: `New subscriber: ${email}`,
  });
}
```

- [ ] **Step 2: Create enquiries API route**

Create `src/app/api/enquiries/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { sendEnquiryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { type, firstName, lastName, email, company, phone, machineRef, machineName, interestType, message } = body;

  if (!firstName || !email || !message || !type) {
    return NextResponse.json(
      { error: "firstName, email, message, and type are required" },
      { status: 400 }
    );
  }

  try {
    await sendEnquiryEmail({
      type,
      firstName,
      lastName,
      email,
      company,
      phone,
      machineRef,
      machineName,
      interestType,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send enquiry email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create subscribers API route**

Create `src/app/api/subscribers/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriberNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await prisma.subscriber.create({ data: { email } });
    await sendSubscriberNotification(email).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: enquiry email sending and subscriber signup API"
```

---

## Task 6: Shared UI Components

**Files:**
- Create: `src/components/ProductCard.tsx`
- Create: `src/components/ProductGrid.tsx`
- Create: `src/components/EnquiryForm.tsx`
- Create: `src/components/ImageGallery.tsx`
- Create: `src/components/ShareLinks.tsx`
- Create: `src/components/SubscribeForm.tsx`

- [ ] **Step 1: Create ProductCard**

Create `src/components/ProductCard.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  slug: string;
  name: string;
  ref: string;
  images: string[];
  category: string;
  availability: string;
}

export function ProductCard({ slug, name, ref, images, category, availability }: ProductCardProps) {
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
        <p className="text-xs text-[var(--muted)] uppercase tracking-wider">{category} &middot; {ref}</p>
        <h3 className="text-sm font-medium leading-snug">{name}</h3>
        <p className="text-xs text-[var(--muted)]">{availability}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create ProductGrid**

Create `src/components/ProductGrid.tsx`:

```tsx
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
          ref={product.ref}
          images={product.images}
          category={product.category}
          availability={product.availability}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create EnquiryForm**

Create `src/components/EnquiryForm.tsx`:

```tsx
"use client";

import { useState } from "react";

interface EnquiryFormProps {
  type: "buy" | "rent" | "sell" | "general";
  machineRef?: string;
  machineName?: string;
}

export function EnquiryForm({ type, machineRef, machineName }: EnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);
    const data = {
      type,
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      company: form.get("company"),
      phone: form.get("phone"),
      interestType: form.get("interestType"),
      machineRef,
      machineName,
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-light">Thank you, we will be in touch shortly!</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="firstName" placeholder="First name *" required className={inputClass} />
        <input name="lastName" placeholder="Last name" className={inputClass} />
      </div>
      <input name="email" type="email" placeholder="Email *" required className={inputClass} />
      <input name="company" placeholder="Company name" className={inputClass} />
      <input name="phone" type="tel" placeholder="Phone" className={inputClass} />

      {(type === "buy" || type === "rent") && machineRef && (
        <>
          <select name="interestType" className={inputClass} defaultValue={type === "buy" ? "Buying this machine" : "Renting this machine"}>
            <option>Buying this machine</option>
            <option>Renting this machine</option>
          </select>
          <input value={`${machineName} | ${machineRef}`} disabled className={inputClass + " text-[var(--muted)]"} />
        </>
      )}

      <textarea
        name="message"
        placeholder={type === "sell" ? "Machine details *" : type === "rent" ? "Machine requirements *" : "Message *"}
        required
        rows={4}
        className={inputClass + " resize-none"}
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Create ImageGallery**

Create `src/components/ImageGallery.tsx`:

```tsx
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
```

- [ ] **Step 5: Create ShareLinks**

Create `src/components/ShareLinks.tsx`:

```tsx
"use client";

interface ShareLinksProps {
  url: string;
  title: string;
}

export function ShareLinks({ url, title }: ShareLinksProps) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { name: "Facebook", href: `https://facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}` },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send/?phone&text=${encodedTitle}%20${encoded}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}` },
  ];

  return (
    <div className="flex gap-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create SubscribeForm**

Create `src/components/SubscribeForm.tsx`:

```tsx
"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-sm text-[var(--muted)]">Thanks! You&apos;re signed up.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="px-6 py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "..." : "Sign up"}
      </button>
    </form>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: shared UI components — ProductCard, Grid, EnquiryForm, Gallery, ShareLinks, Subscribe"
```

---

## Task 7: Public Pages — Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build full homepage**

Replace `src/app/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Verify homepage renders**

```bash
npm run dev
```

Open http://localhost:3000. Expected: hero section, featured products (empty if no products seeded yet), about, subscribe form, partners.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: homepage with hero, featured products, about, subscribe, partners"
```

---

## Task 8: Public Pages — Buy (Catalog + Product Detail)

**Files:**
- Create: `src/app/buy/page.tsx`
- Create: `src/app/buy/[slug]/page.tsx`

- [ ] **Step 1: Create product catalog page**

Create `src/app/buy/page.tsx`:

```tsx
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

      {/* Filters */}
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
```

- [ ] **Step 2: Create product detail page**

Create `src/app/buy/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/ImageGallery";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ShareLinks } from "@/components/ShareLinks";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || "https://mmplaceholder.daveys.xyz";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <ImageGallery images={product.images} alt={product.name} />

        {/* Right: Details */}
        <div className="space-y-6">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
              REF: {product.ref}
            </p>
            <h1 className="text-2xl font-light">{product.name}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.category}</span>
            {product.condition && (
              <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.condition}</span>
            )}
            <span className="px-3 py-1 text-xs border border-[var(--border)] rounded-full">{product.availability}</span>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--muted)] font-light whitespace-pre-wrap">
            {product.description}
          </div>

          {product.manufacturer && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Manufacturer:</span> {product.manufacturer}
            </div>
          )}
          {product.modelName && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Model:</span> {product.modelName}
            </div>
          )}
          {product.yearOfManufacture && (
            <div className="text-sm">
              <span className="text-[var(--muted)]">Year:</span> {product.yearOfManufacture}
            </div>
          )}

          <ShareLinks url={`${baseUrl}/buy/${product.slug}`} title={product.name} />

          <div className="border-t border-[var(--border)] pt-6">
            <h2 className="text-lg font-light mb-4">I&apos;m interested in this machine</h2>
            <EnquiryForm type="buy" machineRef={product.ref} machineName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify both pages**

```bash
npm run dev
```

Visit http://localhost:3000/buy — should show catalog page with search/filter (empty if no products).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: buy page with product catalog, search, filters, and product detail page"
```

---

## Task 9: Public Pages — Sell, Rent, Contact, Privacy Policy

**Files:**
- Create: `src/app/sell/page.tsx`
- Create: `src/app/rent/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/privacy-policy/page.tsx`

- [ ] **Step 1: Create sell page**

Create `src/app/sell/page.tsx`:

```tsx
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Sell Your Machine",
  description: "We offer fair valuations, fast payment and hassle-free removal of your used machinery.",
};

const features = [
  { title: "Fast Valuation", description: "One of our specialists can visit your site and provide a fast valuation. We can usually confirm a buy price on that day." },
  { title: "Multiple Purchase Options", description: "We can offer you multiple purchase options, from brokering through to outright purchase, based on your needs." },
  { title: "Speed of Payment", description: "You can expect prompt payment when we've agreed on the best buying option." },
  { title: "Removal & Storage", description: "We can remove the machine from your site quickly, freeing up space. If we are brokering a machine for you we can provide temporary storage until it is sold." },
  { title: "Brokering", description: "If we agree to broker a machine for you we create the photos, videos, and adverts, and promote them to our marketing database." },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl mb-16">
        <h1 className="text-3xl font-light mb-4">Sell your used machine</h1>
        <p className="text-[var(--muted)] font-light leading-relaxed">
          We offer a fair and hassle-free experience for selling your used machinery. Our specialists
          can quickly value your machine and offer you purchase options — everything from same-day
          purchases to brokering and auctions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((f) => (
          <div key={f.title} className="p-6 border border-[var(--border)] rounded-xl">
            <h3 className="text-sm font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--muted)] font-light">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg">
        <h2 className="text-xl font-light mb-6">Enquire about selling</h2>
        <EnquiryForm type="sell" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create rent page**

Create `src/app/rent/page.tsx`:

```tsx
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Rent a Machine",
  description: "Flexible short and long-term machine rental with full support.",
};

const features = [
  { title: "Fast Delivery & Collection", description: "With our fast delivery and collection options, you can increase or decrease capacity rapidly, depending on your needs." },
  { title: "Weekly Rental Option", description: "After an initial period, machines can be rented on a weekly basis. Machines can be rented for a short-term project or an extended rental period." },
  { title: "Specialist Checked", description: "You can rent with confidence, knowing that our machines have been checked by our specialists in advance." },
  { title: "Fully Supported", description: "Our rental service includes machine support in case of any issues that may arise during your rental period." },
];

export default function RentPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl mb-16">
        <h1 className="text-3xl font-light mb-4">Rent a machine</h1>
        <p className="text-[var(--muted)] font-light leading-relaxed">
          Some machines can be rented on a short-term or long-term basis. After a minimum period,
          machines can be rented weekly and returned with a week&apos;s notice. We will take care of
          delivery, collection and support, so you can scale your capabilities up and down as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map((f) => (
          <div key={f.title} className="p-6 border border-[var(--border)] rounded-xl">
            <h3 className="text-sm font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--muted)] font-light">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg">
        <h2 className="text-xl font-light mb-6">Enquire about renting</h2>
        <EnquiryForm type="rent" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create contact page**

Create `src/app/contact/page.tsx`:

```tsx
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Moving Machines Ltd.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-light mb-4">Contact us</h1>
        <p className="text-[var(--muted)] font-light mb-8">
          Have a question? Get in touch and our team will get back to you.
        </p>
        <EnquiryForm type="general" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create privacy policy page**

Create `src/app/privacy-policy/page.tsx`:

```tsx
export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-light mb-8">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-[var(--muted)] font-light space-y-6">
        <p>
          Moving Machines Ltd is committed to protecting your privacy. This policy explains how we
          collect, use and safeguard your personal information.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Information We Collect</h2>
        <p>
          We collect information you provide through our enquiry and contact forms, including your
          name, email address, phone number, and company name. We also collect email addresses from
          our mailing list signup.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">How We Use Your Information</h2>
        <p>
          We use your information to respond to enquiries, provide quotes and valuations, and send
          updates about new machines in stock (if you have subscribed to our mailing list).
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Cookies</h2>
        <p>
          This website uses essential cookies for authentication and session management. We do not
          use tracking or advertising cookies.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Contact</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at{" "}
          <a href="mailto:info@movingmachinesltd.com" className="underline">info@movingmachinesltd.com</a>.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify all pages**

```bash
npm run dev
```

Visit `/sell`, `/rent`, `/contact`, `/privacy-policy`. Expected: each page renders with content and forms.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sell, rent, contact, and privacy policy pages"
```

---

## Task 10: Admin — Login & Layout

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/AdminSidebar.tsx`

- [ ] **Step 1: Create AdminSidebar**

Create `src/components/AdminSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <aside className="w-56 border-r border-[var(--border)] bg-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <Link href="/admin" className="text-sm font-medium uppercase tracking-wider">
          Admin
        </Link>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname.startsWith(link.href)
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-[var(--border)]">
        <Link href="/" className="block text-xs text-[var(--muted)] hover:text-[var(--foreground)] mb-3">
          &larr; View site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  const isLoginPage =
    typeof children === "object" && children !== null;

  if (!session && !isLoginPage) {
    redirect("/admin/login");
  }

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
```

Note: The admin layout sits inside the root layout but the admin pages suppress the public Header/Footer. Update the root layout to exclude Header/Footer for `/admin` routes:

Modify `src/app/layout.tsx` — replace the body contents:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Used Food Processing Machinery | Moving Machines Ltd",
    template: "%s | Moving Machines Ltd",
  },
  description:
    "At Moving Machines we specialise in buying, selling and renting high-quality, used food processing and packing machinery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
```

Then create a route group for public pages. Move public layout to `src/app/(public)/layout.tsx`:

Create `src/app/(public)/layout.tsx`:

```tsx
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

Move all public pages into the `(public)` route group:
- `src/app/page.tsx` → `src/app/(public)/page.tsx`
- `src/app/buy/` → `src/app/(public)/buy/`
- `src/app/sell/` → `src/app/(public)/sell/`
- `src/app/rent/` → `src/app/(public)/rent/`
- `src/app/contact/` → `src/app/(public)/contact/`
- `src/app/privacy-policy/` → `src/app/(public)/privacy-policy/`

```bash
mkdir -p src/app/\(public\)
mv src/app/page.tsx src/app/\(public\)/page.tsx
mv src/app/buy src/app/\(public\)/buy
mv src/app/sell src/app/\(public\)/sell
mv src/app/rent src/app/\(public\)/rent
mv src/app/contact src/app/\(public\)/contact
mv src/app/privacy-policy src/app/\(public\)/privacy-policy
```

- [ ] **Step 3: Create admin index (redirect)**

Create `src/app/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/products");
}
```

- [ ] **Step 4: Create admin login page**

Create `src/app/admin/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin/products");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">MM</span>
          </div>
          <span className="text-sm font-light tracking-[3px] uppercase">Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors"
          >
            Sign in
          </button>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Fix admin layout auth check**

The admin layout needs to allow the login page without session. Update `src/app/admin/layout.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
```

Add middleware for admin auth protection. Create `src/middleware.ts`:

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
```

- [ ] **Step 6: Verify admin login page renders**

```bash
npm run dev
```

Visit http://localhost:3000/admin. Expected: redirected to `/admin/login`, shows login form.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: admin layout, sidebar, login page, and auth middleware"
```

---

## Task 11: Admin — Product Management

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/components/ProductTable.tsx`
- Create: `src/components/ProductForm.tsx`

- [ ] **Step 1: Create ProductTable**

Create `src/components/ProductTable.tsx`:

```tsx
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
```

- [ ] **Step 2: Create ProductForm**

Create `src/components/ProductForm.tsx`:

```tsx
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

      {/* Images */}
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
```

- [ ] **Step 3: Create admin products list page**

Create `src/app/admin/products/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Create new product page**

Create `src/app/admin/products/new/page.tsx`:

```tsx
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-light mb-8">Add product</h1>
      <ProductForm />
    </div>
  );
}
```

- [ ] **Step 5: Create edit product page**

Create `src/app/admin/products/[id]/edit/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-light mb-8">Edit: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
```

- [ ] **Step 6: Verify admin products pages**

```bash
npm run dev
```

Visit http://localhost:3000/admin/login. Log in (you'll need a user — see next task). Then check `/admin/products`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: admin product management — list, create, edit, delete"
```

---

## Task 12: Seed Script & Initial Admin User

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed config)

- [ ] **Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  { ref: "MM6376", name: "Unifiller iSpot Depositor", category: "Processing", manufacturer: "Unifiller Systems Inc.", modelName: "iSpot", yearOfManufacture: 2021, condition: "Excellent", description: "1 x Unifiller Systems Inc. food depositor mounted on a mobile height-adjustable frame. This is a compact, versatile machine which is easy to clean for a quick product changeover. Handles most fillings without particulates.\nModel - iSpot.\nSerial number - ISP103177-001-01.\nDate of manufacture - 2021.\nDepositing range - adjustable.\nSpeed - adjustable, up to 60 deposits / minute depending on volume.\nOperating temperature - up to +60C.\nFits containers up to 23\" deep (80 quart Hobart bowl).\nCondition - full working order and excellent condition for its age.", featured: true },
  { ref: "MM6375", name: "Outfeed Packing System", category: "Packing", description: "Outfeed packing system.", featured: true },
  { ref: "MM6374", name: "2020 Sovereign Labelling Machines Ltd C-Wrap Label Applicator", category: "Labelling", manufacturer: "Sovereign Labelling Machines Ltd", yearOfManufacture: 2020, description: "2020 Sovereign Labelling Machines Ltd C-Wrap Label Applicator.", featured: true },
  { ref: "MM6373", name: "Comek 'Bag-in-Bag' Packing System", category: "Packing", manufacturer: "Comek", description: "Comek Bag-in-Bag packing system.", featured: true },
  { ref: "MM6372", name: "Meiko DV 270.2 Pass-Through Utensil Washer", category: "Washing", manufacturer: "Meiko", modelName: "DV 270.2", description: "Meiko DV 270.2 pass-through utensil washer.", featured: true },
  { ref: "MM6371", name: "2024 Kempner Packing and Labelling Line", category: "Packing", manufacturer: "Kempner", yearOfManufacture: 2024, description: "2024 Kempner packing and labelling line.", featured: true },
  { ref: "MM6370", name: "Lorenzo Barroso K4-90 H-3200 Automatic Double Clipper", category: "Processing", manufacturer: "Lorenzo Barroso", modelName: "K4-90 H-3200", description: "Lorenzo Barroso K4-90 H-3200 automatic double clipper." },
  { ref: "MM6369", name: "Cintex Sentry Ferrous-in-Foil Metal Detector", category: "Metal Detection", manufacturer: "Cintex", modelName: "Sentry", description: "Cintex Sentry ferrous-in-foil metal detector." },
  { ref: "MM6368", name: "Fortress Phantom Metal Detector / Driver Southall DS300 Checkweigher Combi Unit", category: "Metal Detection", manufacturer: "Fortress / Driver Southall", description: "Fortress Phantom metal detector with Driver Southall DS300 checkweigher combi unit." },
  { ref: "MM6367", name: "Laser RM-50-ST Rotary Moulding Machine", category: "Processing", manufacturer: "Laser", modelName: "RM-50-ST", description: "Laser RM-50-ST rotary moulding machine." },
  { ref: "MM6366", name: "Robot Coupe Blixer 30V Vertical Cutter Mixer", category: "Processing", manufacturer: "Robot Coupe", modelName: "Blixer 30V", description: "Robot Coupe Blixer 30V vertical cutter mixer." },
  { ref: "MM6365", name: "Zumex MASTERY Cold-Press Commercial Juicer", category: "Processing", manufacturer: "Zumex", modelName: "MASTERY", description: "Zumex MASTERY cold-press commercial juicer." },
  { ref: "MM6364", name: "FoodTools Inc. CP-1F Sheet Press", category: "Processing", manufacturer: "FoodTools Inc.", modelName: "CP-1F", description: "FoodTools Inc. CP-1F sheet press." },
  { ref: "MM6363", name: "Italpack FPF 50 Automatic Collator, Shrink Wrapper and Heat Tunnel", category: "Packing", manufacturer: "Italpack", modelName: "FPF 50", description: "Italpack FPF 50 automatic collator, shrink wrapper and heat tunnel." },
  { ref: "MM6362", name: "Wraps (UK) Ltd AI60-351 Auto Sleeve Sealer & M60-35TR Heat Tunnel", category: "Packing", manufacturer: "Wraps (UK) Ltd", description: "Wraps (UK) Ltd AI60-351 auto sleeve sealer and M60-35TR heat tunnel." },
  { ref: "MM6361", name: "ROKK Processing RFE 300 Continuous Freezer & SP40BC Control Unit", category: "Freezing", manufacturer: "ROKK Processing", modelName: "RFE 300", description: "ROKK Processing RFE 300 continuous freezer with SP40BC control unit." },
  { ref: "MM6360", name: "Bertuetti Conical Rounder", category: "Bakery", manufacturer: "Bertuetti", description: "Bertuetti conical rounder." },
  { ref: "MM6359", name: "Damak DM IP 176 Intermediate Proofer", category: "Bakery", manufacturer: "Damak", modelName: "DM IP 176", description: "Damak DM IP 176 intermediate proofer." },
  { ref: "MM6319", name: "Damak / Bertuetti Bread Plant", category: "Bakery", manufacturer: "Damak / Bertuetti", description: "Damak / Bertuetti bread plant." },
  { ref: "MM6358", name: "Polar Systems Ltd Bulk Hopper, Vibratory Table, Base, Elevator and Diverter", category: "Processing", manufacturer: "Polar Systems Ltd", description: "Polar Systems Ltd bulk hopper, vibratory table, base, elevator and diverter." },
  { ref: "MM6357", name: "Lincat PO89X Twin Deck Pizza Oven", category: "Processing", manufacturer: "Lincat", modelName: "PO89X", description: "Lincat PO89X twin deck pizza oven." },
];

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@movingmachinesltd.com" },
    update: {},
    create: {
      email: "admin@movingmachinesltd.com",
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("Admin user created: admin@movingmachinesltd.com / admin123");

  // Create products
  for (const product of products) {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await prisma.product.upsert({
      where: { ref: product.ref },
      update: {},
      create: {
        slug,
        ref: product.ref,
        name: product.name,
        description: product.description,
        category: product.category,
        manufacturer: product.manufacturer || null,
        modelName: product.modelName || null,
        yearOfManufacture: product.yearOfManufacture || null,
        condition: product.condition || null,
        availability: "For Sale",
        images: [],
        featured: product.featured || false,
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Add seed config to package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx:

```bash
npm install -D tsx
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected:
```
Seeding database...
Admin user created: admin@movingmachinesltd.com / admin123
Seeded 21 products.
```

- [ ] **Step 4: Verify end-to-end**

```bash
npm run dev
```

1. Visit http://localhost:3000 — homepage should show featured products
2. Visit http://localhost:3000/buy — full product catalog
3. Click a product — detail page with specs
4. Visit http://localhost:3000/admin/login — log in with `admin@movingmachinesltd.com` / `admin123`
5. Visit http://localhost:3000/admin/products — see all products in table

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seed script with initial products and admin user"
```

---

## Task 13: SEO — Sitemap & Metadata

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create sitemap generator**

Create `src/app/sitemap.ts`:

```typescript
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
```

- [ ] **Step 2: Create robots.txt**

Create `src/app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mmplaceholder.daveys.xyz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Visit http://localhost:3000/sitemap.xml — should list all public pages and product URLs.
Visit http://localhost:3000/robots.txt — should show rules.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: sitemap.xml and robots.txt generation"
```

---

## Task 14: Dockerfile & Coolify Deployment

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create .dockerignore**

Create `.dockerignore`:

```
node_modules
.next
.git
.env
uploads
docs
```

- [ ] **Step 2: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma db push --skip-generate && node server.js"]
```

- [ ] **Step 3: Update next.config.ts for standalone output**

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["bcryptjs"],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Test Docker build locally**

```bash
docker build -t moving-machines .
```

Expected: Build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Dockerfile for Coolify deployment with standalone output"
```

---

## Task 15: Final Verification & Placeholder SVG

**Files:**
- Create: `public/placeholder.svg`

- [ ] **Step 1: Create placeholder image for products without photos**

Create `public/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f5f5f5"/>
  <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#999">No image</text>
</svg>
```

- [ ] **Step 2: Run full build to verify no errors**

```bash
npm run build
```

Expected: Build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: placeholder image and verify production build"
```

- [ ] **Step 4: Push to remote for Coolify deployment**

Set up the git remote (user provides the repo URL from Coolify) and push:

```bash
git remote add origin https://github.com/jonny190/mmPlaceholder.git
git push -u origin main
```

Coolify will pick up the Dockerfile and deploy. Configure the following env vars in Coolify:

- `DATABASE_URL` — from Coolify's Postgres service
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `https://mmplaceholder.daveys.xyz`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — your email provider
- `ENQUIRY_EMAIL` — `info@movingmachinesltd.com`
- `API_KEY` — generate with `openssl rand -hex 32`

Mount `/app/uploads` as a persistent volume.
