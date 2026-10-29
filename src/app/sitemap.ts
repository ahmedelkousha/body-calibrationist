import type { MetadataRoute } from "next";
import { readDb } from "@/lib/db";
import type { Database } from "@/lib/types";

const base = "https://shelleys.studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Firebase is the only data source. If credentials are not present (for
  // example during a build before .env.local is created), still publish the
  // static routes instead of failing the deployment.
  let db: Database | null = null;
  try {
    db = await readDb();
  } catch {
    db = null;
  }

  const staticRoutes = [
    "",
    "/treatments",
    "/store",
    "/blog",
    "/approach",
    "/workshops",
    "/stories",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const serviceRoutes = (db?.services ?? []).map((service) => ({
    url: `${base}/treatments/${service.slug}`,
    lastModified: new Date(service.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productRoutes = (db?.products ?? [])
    .filter((product) => product.status === "active")
    .map((product) => ({
      url: `${base}/store/${product.slug}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const blogRoutes = (db?.blogs ?? [])
    .filter((post) => post.status === "published")
    .map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...serviceRoutes, ...productRoutes, ...blogRoutes];
}
