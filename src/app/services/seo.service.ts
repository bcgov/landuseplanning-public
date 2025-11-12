import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  robots?: string;
  siteName?: string;
  locale?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultConfig: SeoConfig = {
    title: 'Planning in Partnership',
    description: 'Find, learn about, and comment on active land and water planning engagements in British Columbia.',
    image: '/assets/images/lup_revelstoke.jpg',
    url: 'https://landuseplanning.gov.bc.ca',
    type: 'website',
    robots: 'index, follow',
    siteName: 'Planning in Partnership',
    locale: 'en_CA'
  };

  constructor(
    private meta: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Update all SEO-related meta tags based on the provided configuration.
   * Falls back to default values if not specified.
   */
  updateMetaTags(config: SeoConfig = {}): void {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Set page title
    const fullTitle = config.title
      ? `${config.title} - ${this.defaultConfig.siteName}`
      : this.defaultConfig.title;
    this.titleService.setTitle(fullTitle);

    // Convert relative image URLs to absolute URLs for social media
    const absoluteImageUrl = this.getAbsoluteImageUrl(mergedConfig.image);

    // Update or add basic meta tags
    this.meta.updateTag({ name: 'description', content: mergedConfig.description });
    this.meta.updateTag({ name: 'robots', content: mergedConfig.robots });

    // Update or add Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: mergedConfig.description });
    this.meta.updateTag({ property: 'og:type', content: mergedConfig.type });
    this.meta.updateTag({ property: 'og:url', content: mergedConfig.url });
    this.meta.updateTag({ property: 'og:image', content: absoluteImageUrl });
    this.meta.updateTag({ property: 'og:site_name', content: mergedConfig.siteName });
    this.meta.updateTag({ property: 'og:locale', content: mergedConfig.locale });

    // Update or add Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: mergedConfig.description });
    this.meta.updateTag({ name: 'twitter:image', content: absoluteImageUrl });

    // Update canonical URL
    this.updateCanonicalUrl(mergedConfig.url);
  }

  /**
   * Update the canonical URL link element.
   */
  private updateCanonicalUrl(url: string): void {
    // Remove existing canonical link if present
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create and add new canonical link
    const canonical = this.document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    this.document.head.appendChild(canonical);
  }

  /**
   * Set robots meta tag to prevent indexing (useful for admin or internal pages).
   */
  setNoIndex(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  /**
   * Set robots meta tag to allow indexing.
   */
  setIndex(): void {
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

  /**
   * Get the default base URL for the site.
   */
  getBaseUrl(): string {
    return this.defaultConfig.url;
  }

  /**
   * Generate full URL from a path.
   */
  getFullUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Convert relative image URLs to absolute URLs for social media crawlers.
   * If the URL is already absolute or starts with http/https, return as-is.
   */
  private getAbsoluteImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.getFullUrl(this.defaultConfig.image);
    }

    // If already absolute URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If relative URL, get current origin and append
    const origin = this.document.location.origin;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${origin}${cleanPath}`;
  }
}
