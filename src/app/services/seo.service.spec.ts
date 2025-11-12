import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let metaService: jasmine.SpyObj<Meta>;
  let titleService: jasmine.SpyObj<Title>;
  let mockDocument: any;

  beforeEach(() => {
    const metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    mockDocument = {
      createElement: jasmine.createSpy('createElement').and.returnValue({
        setAttribute: jasmine.createSpy('setAttribute')
      }),
      querySelector: jasmine.createSpy('querySelector').and.returnValue(null),
      head: {
        appendChild: jasmine.createSpy('appendChild')
      },
      location: {
        origin: 'http://localhost:4300'
      }
    };

    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Meta, useValue: metaSpy },
        { provide: Title, useValue: titleSpy },
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });

    service = TestBed.inject(SeoService);
    metaService = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateMetaTags', () => {
    it('should set default meta tags when no config provided', () => {
      service.updateMetaTags();

      expect(titleService.setTitle).toHaveBeenCalledWith('Planning in Partnership');
      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'description',
        content: 'Find, learn about, and comment on active land and water planning engagements in British Columbia.'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'index, follow'
      });
    });

    it('should set custom title with site name appended', () => {
      service.updateMetaTags({ title: 'Contact Us' });

      expect(titleService.setTitle).toHaveBeenCalledWith('Contact Us - Planning in Partnership');
    });

    it('should update Open Graph tags', () => {
      service.updateMetaTags({
        title: 'Test Page',
        description: 'Test description',
        url: 'https://example.com/test',
        type: 'article'
      });

      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:title',
        content: 'Test Page - Planning in Partnership'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:description',
        content: 'Test description'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:type',
        content: 'article'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:url',
        content: 'https://example.com/test'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:site_name',
        content: 'Planning in Partnership'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:locale',
        content: 'en_CA'
      });
    });

    it('should update Twitter Card tags', () => {
      service.updateMetaTags({
        title: 'Test Page',
        description: 'Test description'
      });

      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'twitter:card',
        content: 'summary_large_image'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'twitter:title',
        content: 'Test Page - Planning in Partnership'
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'twitter:description',
        content: 'Test description'
      });
    });

    it('should convert relative image URLs to absolute URLs', () => {
      service.updateMetaTags({
        image: '/assets/images/test.jpg'
      });

      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          property: 'og:image',
          content: 'http://localhost:4300/assets/images/test.jpg'
        })
      );
    });

    it('should keep absolute image URLs unchanged', () => {
      service.updateMetaTags({
        image: 'https://example.com/image.jpg'
      });

      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          property: 'og:image',
          content: 'https://example.com/image.jpg'
        })
      );
    });

    it('should update canonical URL', () => {
      const canonicalLink = {
        setAttribute: jasmine.createSpy('setAttribute')
      };
      mockDocument.createElement.and.returnValue(canonicalLink);

      service.updateMetaTags({ url: 'https://example.com/page' });

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(canonicalLink.setAttribute).toHaveBeenCalledWith('rel', 'canonical');
      expect(canonicalLink.setAttribute).toHaveBeenCalledWith('href', 'https://example.com/page');
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(canonicalLink);
    });

    it('should remove existing canonical link before adding new one', () => {
      const existingCanonical = {
        remove: jasmine.createSpy('remove')
      };
      mockDocument.querySelector.and.returnValue(existingCanonical);

      service.updateMetaTags({ url: 'https://example.com/page' });

      expect(mockDocument.querySelector).toHaveBeenCalledWith('link[rel="canonical"]');
      expect(existingCanonical.remove).toHaveBeenCalled();
    });
  });

  describe('setNoIndex', () => {
    it('should set robots meta tag to noindex, nofollow', () => {
      service.setNoIndex();

      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'noindex, nofollow'
      });
    });
  });

  describe('setIndex', () => {
    it('should set robots meta tag to index, follow', () => {
      service.setIndex();

      expect(metaService.updateTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'index, follow'
      });
    });
  });

  describe('getBaseUrl', () => {
    it('should return the default base URL', () => {
      expect(service.getBaseUrl()).toBe('https://planninginpartnership.ca');
    });
  });

  describe('getFullUrl', () => {
    it('should generate full URL from path with leading slash', () => {
      expect(service.getFullUrl('/projects')).toBe('https://planninginpartnership.ca/projects');
    });

    it('should generate full URL from path without leading slash', () => {
      expect(service.getFullUrl('projects')).toBe('https://planninginpartnership.ca/projects');
    });
  });
});
