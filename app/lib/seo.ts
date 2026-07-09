/**
 * seo.ts — Helpers tạo SEO meta tags chuẩn cho React Router v7.
 *
 * Usage trong route file:
 *   export const meta: MetaFunction = () => buildMeta({ title: "...", description: "..." });
 */

export interface SeoMeta {
  /** Page title — sẽ tự append " | GlowUp Cosmetics" nếu không có ký tự "|" */
  title: string;
  description?: string;
  keywords?: string;
  /** Canonical URL */
  canonical?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** noindex: true để ẩn khỏi Google (VD: checkout, mock-payment) */
  noindex?: boolean;
}

const SITE_NAME = "GlowUp Cosmetics";
const DEFAULT_DESC =
  "Discover thousands of authentic cosmetics. Skincare, makeup, and beauty care with attractive deals.";
const DEFAULT_OG = "/og-image.jpg";

/** Tạo mảng meta objects theo format React Router v7 MetaFunction */
export function buildMeta(opts: SeoMeta) {
  const title = opts.title.includes("|")
    ? opts.title
    : `${opts.title} | ${SITE_NAME}`;
  const description = opts.description ?? DEFAULT_DESC;
  const ogImage = opts.ogImage ?? DEFAULT_OG;

  const metas: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (opts.keywords) {
    metas.push({ name: "keywords", content: opts.keywords });
  }

  if (opts.canonical) {
    metas.push({ tagName: "link", rel: "canonical", href: opts.canonical });
  }

  if (opts.noindex) {
    metas.push({ name: "robots", content: "noindex, nofollow" });
  }

  return metas;
}

/** Product page SEO helper */
export function buildProductMeta(opts: {
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  price?: number;
}) {
  const desc = opts.description
    ? `${stripHtml(opts.description).substring(0, 155)}…`
    : `Buy authentic ${opts.name} at GlowUp. Genuine products guaranteed, fast delivery.`;

  return buildMeta({
    title: opts.name,
    description: desc,
    ogImage: opts.image,
    canonical: opts.slug ? `/product/${opts.slug}` : undefined,
  });
}

/** Strip HTML tags khỏi string (dùng cho description từ rich text) */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
