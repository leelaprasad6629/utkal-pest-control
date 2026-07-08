// Generates a real sitemap.xml (and updates robots.txt) into public/ before the
// production build, using live service slugs from MongoDB and the deployed
// domain. Runs as a "prebuild" step so `pnpm run build` always ships a
// sitemap that matches the current catalog of services.
import { MongoClient } from "mongodb";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const STATIC_PAGES = [
  { path: "/", priority: "1.0" },
  { path: "/about", priority: "0.7" },
  { path: "/contact", priority: "0.7" },
  { path: "/services", priority: "0.7" },
  { path: "/quote", priority: "0.7" },
];

function resolveOrigin() {
  const domains = process.env.REPLIT_DOMAINS ?? process.env.REPLIT_DEV_DOMAIN;
  const domain = domains?.split(",")[0]?.trim();
  if (!domain) {
    throw new Error(
      "[sitemap] Could not determine the site domain (REPLIT_DOMAINS / REPLIT_DEV_DOMAIN are unset). " +
        "Refusing to generate a sitemap with a placeholder domain.",
    );
  }
  return `https://${domain}`;
}

async function fetchServiceSlugs() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[sitemap] MONGODB_URI not set, generating sitemap without service pages.");
    return [];
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const docs = await db
      .collection("services")
      .find({ active: true }, { projection: { slug: 1 } })
      .toArray();
    return docs.map((d) => d.slug).filter(Boolean);
  } catch (err) {
    console.warn("[sitemap] Failed to load services from MongoDB:", err.message);
    return [];
  } finally {
    await client.close();
  }
}

function buildSitemapXml(origin, serviceSlugs) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_PAGES,
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}`, priority: "0.8" })),
  ];
  const entries = urls
    .map(
      ({ path: p, priority }) => `  <url>
    <loc>${origin}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function main() {
  const origin = resolveOrigin();
  const slugs = await fetchServiceSlugs();
  const publicDir = path.resolve(import.meta.dirname, "..", "public");

  await writeFile(path.join(publicDir, "sitemap.xml"), buildSitemapXml(origin, slugs), "utf8");
  await writeFile(
    path.join(publicDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
    "utf8",
  );

  console.log(`[sitemap] Wrote sitemap.xml with ${slugs.length} service page(s) for origin ${origin}`);
}

await main();
