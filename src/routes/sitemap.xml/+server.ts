import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const loc = `${url.origin}/`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${loc}</loc>\n  </url>\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
