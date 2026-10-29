import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug, readDb } from "@/lib/db";
import { formatPrice, safeImage } from "@/lib/utils";
import AddToCartButton from "@/components/site/AddToCartButton";
import ProductCard from "@/components/site/ProductCard";
import Markdown from "@/lib/markdown";
import StarRating from "@/components/site/StarRating";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getBySlug("products", slug);
  if (!product || product.status !== "active") return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [safeImage(product.image, "/images/product-oil.webp")] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getBySlug("products", slug);
  if (!product || product.status !== "active") notFound();

  const db = await readDb();
  const related = db.products
    .filter((item) => item.id !== product.id && item.status === "active")
    .slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/store" className="hover:text-ink">Store</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-14">
        <div className="lg:col-span-6">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-cream-deep">
            <Image
              src={safeImage(product.image, "/images/product-oil.webp")}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[product.image, "/images/product-kit.webp", "/images/approach.webp"].map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-cream-deep">
                <Image src={safeImage(image, "/images/product-oil.webp")} alt="" fill sizes="120px" className="object-cover opacity-90" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 lg:pt-6">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{product.category}</p>
            {product.stock > 0 && product.stock <= 10 && (
              <span className="rounded-full bg-gold-light/60 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-ink">
                Only {product.stock} left
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={5} />
            <span className="text-[11px] text-ink-soft">48 reviews</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-ink-soft line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-6 space-y-3 text-[12px] text-ink-soft">
            <p className="flex items-center gap-2">
              <span className="text-gold">✦</span> Free shipping on orders over $120
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gold">✦</span> Dispatched from the studio within 2 business days
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gold">✦</span> Secure checkout · card and Apple Pay
            </p>
          </div>

          <div className="mt-9 divide-y divide-sand/70 border-y border-sand/70">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink">
                Details &amp; ingredients
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3">
                <Markdown content={product.details} className="text-sm leading-relaxed text-ink-soft" />
              </div>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink">
                Shipping &amp; returns
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Orders are packed Tuesday to Saturday and posted with tracking. If a product is not right for
                your skin, return it unopened within 30 days for a full refund. Opened products can be
                exchanged within 14 days.
              </p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink">
                How to use
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Use a small amount on damp skin or after cleansing. For a slower ritual, warm between the
                palms first. If you are unsure how a product fits your routine, mention it in your next
                enquiry and we will map it for you.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-ink">Pairs well with</h2>
          <Link href="/store" className="text-[11px] uppercase tracking-[0.16em] text-teal">
            All products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </>
  );
}
