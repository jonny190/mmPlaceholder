# Moving Machines Ltd — Website Redesign Spec

## Overview

Rebuild movingmachinesltd.com as a modern Next.js application, replacing the current Wix site. The new site serves as a public product catalog for used catering/food processing machinery with an admin dashboard and REST API for product management. Hosted on Coolify.

## Business Context

Moving Machines Ltd buys, sells, and rents used food processing and packing machinery. The site needs to:

- Showcase current stock with detailed specs and images
- Allow customers to enquire about buying or renting machines
- Allow customers to enquire about selling their machines
- Provide an admin interface for managing product listings
- Expose an API for automated/external product updates

## Visual Design

**Direction: Modern Minimal**

- Ultra-clean aesthetic with generous whitespace
- Monochrome palette (near-black text, white/off-white backgrounds) with subtle accents
- Product photography is the visual centerpiece
- Clean typography, lightweight font weights
- Rounded corners on cards, subtle borders (#e0e0e0)
- No heavy brand colors — the machinery speaks for itself

## Pages & Routes

### Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero, Buy/Sell/Rent CTAs, featured products grid, about section, partner logos, mailing list signup |
| `/buy` | Product catalog: full product grid with search and filter by category/availability |
| `/buy/[slug]` | Product detail: image gallery, specs, enquiry form (buy or rent) |
| `/sell` | Selling service info + sell enquiry form |
| `/rent` | Rental service info + rent enquiry form |
| `/contact` | General contact form |
| `/privacy-policy` | Privacy policy page |

### Admin Pages

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard — redirect to products list |
| `/admin/products` | Product list: table with search, filter by category/availability |
| `/admin/products/new` | Create new product |
| `/admin/products/[id]/edit` | Edit existing product |
| `/admin/login` | Admin login page |

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | List all products (filterable via query params) |
| GET | `/api/products/[id]` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/[id]` | Update product |
| DELETE | `/api/products/[id]` | Delete product |
| POST | `/api/products/[id]/images` | Upload product images |
| POST | `/api/enquiries` | Submit enquiry (sends email, no DB storage) |

API authentication: API key passed via `Authorization: Bearer <key>` header. Admin UI uses session-based auth via NextAuth.

## Data Model

### Product

```prisma
model Product {
  id                String   @id @default(cuid())
  slug              String   @unique
  ref               String   @unique // e.g. "MM6376"
  name              String
  description       String   // Rich text / markdown for specs
  category          String   // e.g. "Packing", "Processing", "Labelling", "Metal Detection"
  manufacturer      String?
  modelName         String?
  yearOfManufacture Int?
  condition         String?  // "Excellent", "Good", "Refurbished"
  availability      String   @default("For Sale") // "For Sale", "For Rent", "Both", "Sold"
  images            String[] // Array of local file paths
  featured          Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### User (Admin)

```prisma
model User {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  name         String
  role         String @default("admin")
}
```

### No Enquiry Model

Enquiries are sent directly via email (Nodemailer/SMTP). No database storage.

## Enquiry Forms

Each form sends an email to the business email address containing all submitted fields.

**Product enquiry form** (on `/buy/[slug]`):
- First name, last name, email, company, phone
- Interest type: "Buying this machine" | "Renting this machine"
- Machine name + REF (pre-filled)
- Notes/comments

**Sell enquiry form** (on `/sell`):
- First name, last name, email, company, phone
- Machine details (free text)
- Notes/comments

**Rent enquiry form** (on `/rent`):
- First name, last name, email, company, phone
- Machine requirements (free text)
- Notes/comments

**General contact form** (on `/contact`):
- Name, email, phone
- Message

## Content (from current site)

### Homepage Hero
"We buy, sell and rent food processing & packing machinery."

### About Section
"At Moving Machines we specialise in buying, selling and renting used food and packing machinery. We offer a fast, simple, and transparent service. If you are selling we will give you a fair valuation for your machine, with payment, collection and storage options to best suit your needs. If you are buying we can arrange viewings and demonstrations, fast delivery, and servicing/support if you need it. Our dedicated team is here to assist you every step of the way."

### Buy Page Features
- Fast delivery
- Multiple payment options
- Machine sourcing
- Trade-in

### Sell Page Features
- Fast valuation
- Multiple purchase options
- Speed of payment
- Removal and storage
- Brokering

### Rent Page Features
- Fast delivery and collection
- Weekly rental option
- Specialist checked machines
- Fully supported

### Partners
- Inspection Technology
- Machinery Masters
- Machinio

### Mailing List CTA
"Sign up to hear about new machines as they arrive in stock"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (credentials provider) |
| Email | Nodemailer (SMTP configuration) |
| Images | Local filesystem (`/uploads` directory) |
| API Auth | API key (Bearer token) |
| Deployment | Docker container on Coolify + Postgres service |

## Deployment (Coolify)

- Single Dockerfile for the Next.js app
- PostgreSQL as a separate Coolify service
- Environment variables for:
  - `DATABASE_URL` — Postgres connection string
  - `NEXTAUTH_SECRET` — session signing
  - `NEXTAUTH_URL` — public URL
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — email config
  - `ENQUIRY_EMAIL` — destination for enquiry emails
  - `API_KEY` — for external API access
- Volume mount for `/uploads` to persist product images across deployments

## Product Detail Page Features

- Image gallery (lightbox for full-size viewing)
- Full specs in markdown
- Enquiry form (buy or rent)
- Social share links (Facebook, X/Twitter, WhatsApp, LinkedIn)

## Mailing List Signup

The homepage and service pages include a "Sign up for updates" CTA. This links to a simple email collection form that stores subscribers in a `Subscriber` table:

```prisma
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

New subscriber notifications can optionally be sent to the business email.

## Data Seeding

A seed script (`prisma/seed.ts`) will be created to import the initial product catalog scraped from the current Wix site. Product names, descriptions, REF numbers, categories, and image URLs are captured from the Firecrawl scrape and can be loaded into the database on first deployment.

## SEO

- Server-rendered product pages with proper meta tags
- `og:title`, `og:description`, `og:image` per product
- Sitemap generation
- Semantic HTML throughout
