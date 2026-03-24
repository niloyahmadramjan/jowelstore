import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import connectDb from "@/lib/db";
import Product from "@/models/product.model";
import { RelatedProducts } from "@/app/components/products/related-products";
import { ProductDetailsClient } from "@/app/components/products/product-details-client";

/* ── Static params for SSG (optional but fast) ─────── */
export async function generateStaticParams() {
  await connectDb();
  const products = await Product.find({ isActive: true })
    .select("slug")
    .limit(100)
    .lean();
  return products.map((p) => ({ slug: p.slug }));
}

/* ── Dynamic metadata ───────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDb();

  const product = await Product.findOne({ slug, isActive: true })
    .select("name shortDesc thumbnail metaTitle metaDesc")
    .lean();

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.shortDesc ?? "",
    openGraph: {
      images: [product.thumbnail],
    },
  };
}

/* ── Page ───────────────────────────────────────────── */
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDb();

  const product = await Product.findOne({ slug, isActive: true }).lean();
  if (!product) notFound();

  /* Increment view count (fire and forget) */
  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

  const p = JSON.parse(JSON.stringify(product)); // serialise for client

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Product detail section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Images */}
          <ProductImages
            images={p.images}
            thumbnail={p.thumbnail}
            name={p.name}
          />

          {/* Right — Info + actions (client component) */}
          <ProductDetailsClient product={p} />
        </div>

        {/* ── Description ── */}
        {p.description && (
          <section className="mt-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
              পণ্যের বিবরণ
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
              {p.description}
            </p>
          </section>
        )}

        {/* ── Reviews summary ── */}
        {p.numReviews > 0 && (
          <section className="mt-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
              ক্রেতাদের মতামত ({p.numReviews})
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold text-stone-900 dark:text-white">
                {p.rating.toFixed(1)}
              </span>
              <div>
                <div className="flex items-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      className={
                        i < Math.round(p.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
                      }
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {p.numReviews} টি রিভিউ
                </p>
              </div>
            </div>

            {/* Show latest 3 reviews */}
            <div className="space-y-4">
              {p.reviews.slice(0, 3).map((review: any) => (
                <div
                  key={review._id}
                  className="border-t border-stone-100 dark:border-stone-800 pt-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {review.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          className={
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-200"
                          }
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Related products ── */}
        <RelatedProducts
          productId={String(p._id)}
          category={p.category}
          title="একই ধরনের পণ্য"
        />
      </div>
    </main>
  );
}

/* ── Server component — product images ─────────────── */
function ProductImages({
  images,
  thumbnail,
  name,
}: {
  images: string[];
  thumbnail: string;
  name: string;
}) {
  const allImages = images.length > 0 ? images : [thumbnail];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          unoptimized
          src={allImages[0]}
          alt={name}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {allImages.map((img, i) => (
            <div
              key={i}
              className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-transparent"
            >
              <Image
                unoptimized
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
