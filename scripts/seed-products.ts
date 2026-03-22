/**
 * Seed script — generates up to 10,000 products in bulk.
 *
 * Install deps first:
 *   pnpm add -D @faker-js/faker tsx dotenv
 *
 * Run:
 *   npx tsx scripts/seed-products.ts
 *   npx tsx scripts/seed-products.ts --count=500   (custom amount)
 *   npx tsx scripts/seed-products.ts --clear        (wipe + reseed)
 */

import mongoose               from "mongoose";
import { faker }              from "@faker-js/faker";
import dotenv                 from "dotenv";
import Product                from "../models/product.model";

dotenv.config({ path: ".env.local" });

/* ── Config ─────────────────────────────────────────── */
const TOTAL        = getArg("count", 10_000);   // total products to insert
const BATCH_SIZE   = 500;                        // insert 500 at a time → avoids memory spike
const CLEAR_FIRST  = process.argv.includes("--clear");
const ADMIN_ID     = new mongoose.Types.ObjectId("69bd5e6844752ccc0c76b85a");

/* ── Category / subCategory map ─────────────────────── */
const CATEGORY_MAP: Record<string, {
  subs:     string[];
  names:    string[];
  unit:     string;
  minPrice: number;
  maxPrice: number;
  tags:     string[];
}> = {
  groceries: {
    subs:     ["rice-dal", "oil-spices", "flour", "sugar-salt", "dry-food"],
    names:    [
      "মিনিকেট চাল", "নাজিরশাইল চাল", "বাসমতি চাল", "মসুর ডাল",
      "মুগ ডাল", "ছোলার ডাল", "সয়াবিন তেল", "সরিষার তেল",
      "পাম তেল", "হলুদ গুঁড়া", "মরিচ গুঁড়া", "ধনে গুঁড়া",
      "জিরা গুঁড়া", "গরম মশলা", "আটা", "ময়দা", "সুজি",
      "চিনি", "লবণ", "গুড়", "মধু", "চিড়া", "মুড়ি",
    ],
    unit:     "কেজি",
    minPrice: 40,
    maxPrice: 650,
    tags:     ["খাদ্য", "মুদিখানা", "রান্না", "ডাল", "চাল", "মশলা"],
  },
  beauty: {
    subs:     ["soap", "shampoo", "lotion", "cream", "hair-care"],
    names:    [
      "লাক্স সাবান", "ডেটল সাবান", "লাইফবয় সাবান", "Clear শ্যাম্পু",
      "Sunsilk শ্যাম্পু", "Head & Shoulders", "Vaseline লোশন",
      "Fair & Lovely ক্রিম", "Ponds ক্রিম", "Nivea বডি লোশন",
      "Parachute নারকেল তেল", "Garnier ফেস ওয়াশ", "Dove শ্যাম্পু",
      "Pantene কন্ডিশনার", "Himalaya ফেস ওয়াশ",
    ],
    unit:     "পিস",
    minPrice: 30,
    maxPrice: 450,
    tags:     ["প্রসাধনী", "সাবান", "শ্যাম্পু", "ক্রিম", "লোশন"],
  },
  snacks: {
    subs:     ["chips", "biscuit", "chocolate", "candy", "nuts"],
    names:    [
      "Oreo বিস্কুট", "Bourbon বিস্কুট", "Digestive বিস্কুট",
      "Pringles চিপস", "Lay's চিপস", "Cheetos", "Kit Kat",
      "Dairy Milk", "Twix", "Snickers", "কাজু বাদাম",
      "চিনা বাদাম", "পেস্তা বাদাম", "চানাচুর", "ঝুড়ি ভাজা",
    ],
    unit:     "প্যাক",
    minPrice: 20,
    maxPrice: 280,
    tags:     ["স্ন্যাকস", "বিস্কুট", "চিপস", "চকোলেট", "নাস্তা"],
  },
  drinks: {
    subs:     ["tea", "coffee", "juice", "soft-drink", "water"],
    names:    [
      "Tetley চা", "Taaza চা", "Nescafe কফি", "Bru কফি",
      "Horlicks", "Milo", "Ovaltine", "Tropicana জুস",
      "Real জুস", "Frooti আম জুস", "7UP", "Sprite",
      "Fanta", "RC Cola", "ACME জুস",
    ],
    unit:     "পিস",
    minPrice: 15,
    maxPrice: 350,
    tags:     ["পানীয়", "চা", "কফি", "জুস", "কোল্ড ড্রিংক"],
  },
  household: {
    subs:     ["detergent", "cleaning", "kitchen", "bathroom", "tools"],
    names:    [
      "Wheel ডিটারজেন্ট", "Rin পাউডার", "Surf Excel", "Vim বার",
      "Vim লিকুইড", "Harpic টয়লেট ক্লিনার", "Domex", "Colin স্প্রে",
      "Mortein মশার কয়েল", "Good Knight", "Hit স্প্রে",
      "Scotch Brite স্ক্রাবার", "মপ ক্লথ", "ঝাড়ু", "ব্রাশ",
    ],
    unit:     "পিস",
    minPrice: 25,
    maxPrice: 380,
    tags:     ["গৃহস্থালি", "ডিটারজেন্ট", "পরিষ্কার", "মশার কয়েল"],
  },
  baby: {
    subs:     ["baby-food", "baby-care", "diapers", "toys", "clothing"],
    names:    [
      "Cerelac শিশু খাবার", "Nestum শিশু খাবার", "Lactogen দুধ",
      "Nan Pro দুধ", "Johnson's Baby Soap", "Johnson's শ্যাম্পু",
      "Pampers ডায়াপার", "Huggies ডায়াপার", "WetWipes",
      "Baby Oil", "Baby Powder", "Baby Lotion", "Gripe Water",
    ],
    unit:     "পিস",
    minPrice: 55,
    maxPrice: 850,
    tags:     ["শিশু পণ্য", "বেবি", "ডায়াপার", "শিশু খাবার"],
  },
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

/* ── Slug tracker — ensures unique slugs ────────────── */
const usedSlugs = new Set<string>();

function makeSlug(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);

  let slug = `${base}-${index}`;
  let attempt = 0;

  while (usedSlugs.has(slug)) {
    attempt++;
    slug = `${base}-${index}-${attempt}`;
  }

  usedSlugs.add(slug);
  return slug;
}

/* ── Generate a single product ───────────────────────── */
function generateProduct(index: number) {
  const category    = faker.helpers.arrayElement(CATEGORIES);
  const meta        = CATEGORY_MAP[category];
  const subCategory = faker.helpers.arrayElement(meta.subs);
  const baseName    = faker.helpers.arrayElement(meta.names);

  /* Add weight/size suffix to make names unique-ish */
  const suffixes    = ["১ কেজি", "৫০০ গ্রাম", "২ কেজি", "২৫০ গ্রাম", "১ লিটার", "৫ পিস", "১ প্যাক", "৩ পিস"];
  const name        = `${baseName} ${faker.helpers.arrayElement(suffixes)}`;
  const slug        = makeSlug(`${baseName} ${index}`, index);

  const originalPrice = faker.number.int({ min: meta.minPrice, max: meta.maxPrice });
  const discountPct   = faker.helpers.arrayElement([0, 0, 5, 10, 10, 15, 20, 25]);
  const price         = discountPct > 0
    ? Math.round(originalPrice * (1 - discountPct / 100))
    : originalPrice;

  const stock      = faker.number.int({ min: 0, max: 500 });
  const sold       = faker.number.int({ min: 0, max: 2000 });
  const numReviews = faker.number.int({ min: 0, max: 200 });
  const rating     = numReviews > 0
    ? Math.round(faker.number.float({ min: 3.5, max: 5.0 }) * 10) / 10
    : 0;

  /* Pick 2–4 tags from category tags */
  const tags = faker.helpers.arrayElements(meta.tags, faker.number.int({ min: 2, max: 4 }));

  /* Thumbnail placeholder using category colour */
  const colors: Record<string, string> = {
    groceries: "dcfce7/166534",
    beauty:    "fce7f3/831843",
    snacks:    "fef3c7/92400e",
    drinks:    "eff6ff/1e3a8a",
    household: "f0f9ff/0c4a6e",
    baby:      "fff1f2/be123c",
  };
  const thumbnail = `https://placehold.co/400x400/${colors[category] ?? "f5f5f5/333333"}?text=${encodeURIComponent(baseName.charAt(0))}`;

  return {
    name,
    slug,
    description:  `${name} — উচ্চমানের পণ্য। ${faker.lorem.sentence()}`,
    shortDesc:    `${baseName} — ${faker.lorem.words(6)}`,
    thumbnail,
    images:       [thumbnail],
    price,
    originalPrice: discountPct > 0 ? originalPrice : undefined,
    discount:      discountPct > 0 ? discountPct : undefined,
    category,
    subCategory,
    tags,
    stock,
    sku:           `${category.substring(0, 2).toUpperCase()}-${String(index).padStart(6, "0")}`,
    unit:          meta.unit,
    variants:      [],
    sold,
    views:         faker.number.int({ min: sold, max: sold * 5 + 100 }),
    rating,
    numReviews,
    reviews:       [],
    isActive:      true,
    isFeatured:    faker.datatype.boolean({ probability: 0.08 }),  // ~8% featured
    isNewArrival:  faker.datatype.boolean({ probability: 0.15 }),  // ~15% new
    createdBy:     ADMIN_ID,
    createdAt:     faker.date.past({ years: 2 }),
  };
}

/* ── CLI arg helper ──────────────────────────────────── */
function getArg(name: string, fallback: number): number {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? Number(arg.split("=")[1]) : fallback;
}

/* ── Main seed function ──────────────────────────────── */
async function seed() {
  const MONGO_URI = process.env.MONGODB_URL ?? "";

  if (!MONGO_URI) {
    console.error("❌  MONGODB_URL not found in .env.local");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  /* Optionally wipe existing products */
  if (CLEAR_FIRST) {
    const deleted = await Product.deleteMany({});
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing products\n`);
    usedSlugs.clear();
  } else {
    /* Pre-load existing slugs so we don't insert duplicates */
    console.log("📋  Loading existing slugs...");
    const existing = await Product.find().select("slug").lean();
    existing.forEach((p) => usedSlugs.add(p.slug));
    console.log(`    Found ${usedSlugs.size} existing products\n`);
  }

  console.log(`🚀  Inserting ${TOTAL.toLocaleString()} products in batches of ${BATCH_SIZE}...\n`);

  let inserted   = 0;
  let batchCount = 0;
  const start    = Date.now();

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batchSize    = Math.min(BATCH_SIZE, TOTAL - i);
    const batch        = Array.from({ length: batchSize }, (_, j) =>
      generateProduct(i + j + usedSlugs.size),
    );

    /* ordered: false → skips duplicate key errors, continues inserting */
    const result = await Product.insertMany(batch, { ordered: false });
    inserted    += result.length;
    batchCount++;

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const pct     = Math.round((inserted / TOTAL) * 100);
    process.stdout.write(
      `\r  Batch ${batchCount} | ${inserted.toLocaleString()} / ${TOTAL.toLocaleString()} (${pct}%) | ${elapsed}s`,
    );
  }

  const totalTime = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n\n✅  Done — ${inserted.toLocaleString()} products inserted in ${totalTime}s`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message ?? err);
  process.exit(1);
});