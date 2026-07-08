import type { Plugin, Connect } from "vite";

const API_SERVER_ORIGIN = "http://localhost:8080";

const STATIC_PAGES = ["/", "/about", "/contact", "/services", "/quote"];

interface ServiceListItem {
  slug: string;
}

async function fetchServiceSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_SERVER_ORIGIN}/api/services`);
    if (!res.ok) return [];
    const services = (await res.json()) as ServiceListItem[];
    return services.map((s) => s.slug).filter(Boolean);
  } catch {
    return [];
  }
}

function resolveOrigin(req: Connect.IncomingMessage): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  return `${proto}://${host}`;
}

function buildSitemapXml(origin: string, serviceSlugs: string[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_PAGES.map((path) => ({ path, priority: path === "/" ? "1.0" : "0.7" })),
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}`, priority: "0.8" })),
  ];

  const entries = urls
    .map(
      ({ path, priority }) => `  <url>
    <loc>${origin}${path === "/" ? "/" : path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/**
 * Serves a real, dynamically generated sitemap.xml and robots.txt reflecting
 * the current set of static pages plus live service slugs from the API.
 * Registered early so it takes priority over Vite's static `public/` serving.
 */
export function sitemapPlugin(): Plugin {
  return {
    name: "pest-control-sitemap",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/sitemap.xml") return next();
        const origin = resolveOrigin(req);
        const slugs = await fetchServiceSlugs();
        res.setHeader("Content-Type", "application/xml");
        res.end(buildSitemapXml(origin, slugs));
      });
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/robots.txt") return next();
        const origin = resolveOrigin(req);
        res.setHeader("Content-Type", "text/plain");
        res.end(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/sitemap.xml") return next();
        const origin = resolveOrigin(req);
        const slugs = await fetchServiceSlugs();
        res.setHeader("Content-Type", "application/xml");
        res.end(buildSitemapXml(origin, slugs));
      });
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/robots.txt") return next();
        const origin = resolveOrigin(req);
        res.setHeader("Content-Type", "text/plain");
        res.end(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
      });
    },
  };
}
