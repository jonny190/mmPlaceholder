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
