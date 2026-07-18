import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmall.com.gh';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/orders', '/cart', '/checkout', '/payment', '/auth'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
