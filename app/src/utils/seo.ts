export type SeoConfig = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

const DEFAULT_IMAGE = '/hero_city_street.jpg';
const SITE_NAME = 'SEO Pro Toolkit';

const ROUTE_SEO: Record<string, SeoConfig> = {
  '/': {
    title: 'SEO Pro Toolkit | Audit, Keywords, Backlinks & Rank Tracking',
    description:
      'Run SEO audits, track rankings, analyze backlinks, and uncover keyword opportunities in one unified SEO workspace.',
    path: '/',
  },
  '/login': {
    title: 'Login | SEO Pro Toolkit',
    description: 'Sign in to access your SEO dashboards, reports, and optimization tools.',
    path: '/login',
    noIndex: true,
  },
  '/dashboard': {
    title: 'SEO Dashboard | SEO Pro Toolkit',
    description: 'Monitor SEO performance, audits, and growth opportunities from a centralized dashboard.',
    path: '/dashboard',
    noIndex: true,
  },
};

function upsertMetaByName(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(id: string, schema: object) {
  let script = document.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function applySeo(pathname: string) {
  const seo = ROUTE_SEO[pathname] ?? ROUTE_SEO['/'];
  const origin = window.location.origin;
  const canonicalPath = seo.path === '/' ? '/' : `/#${seo.path}`;
  const canonical = `${origin}${canonicalPath}`;
  const image = `${origin}${DEFAULT_IMAGE}`;

  document.title = seo.title;
  upsertMetaByName('description', seo.description);
  upsertMetaByName('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow');
  upsertMetaByName('twitter:card', 'summary_large_image');
  upsertMetaByName('twitter:title', seo.title);
  upsertMetaByName('twitter:description', seo.description);
  upsertMetaByName('twitter:image', image);

  upsertMetaByProperty('og:type', 'website');
  upsertMetaByProperty('og:site_name', SITE_NAME);
  upsertMetaByProperty('og:title', seo.title);
  upsertMetaByProperty('og:description', seo.description);
  upsertMetaByProperty('og:url', canonical);
  upsertMetaByProperty('og:image', image);

  upsertCanonical(canonical);

  upsertJsonLd('seo-pro-toolkit-schema', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: seo.description,
    url: canonical,
  });
}
