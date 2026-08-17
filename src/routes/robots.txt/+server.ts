import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const sitemap = `${url.origin}/sitemap.xml`;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
