# SEO Optimization Plan for AI Chatbot Application

## Current SEO State Analysis
- **Basic metadata** in root layout with incorrect metadataBase URL pointing to `chat.vercel.ai`
- **Social media images** only for chat route group
- **Missing critical SEO elements**: robots.txt, sitemap, page-specific metadata, structured data
- **No canonical URLs** or comprehensive OpenGraph/Twitter configurations

## Proposed SEO Optimizations

### 1. **Fix Root Metadata & Add Comprehensive Meta Tags**
- Update `app/layout.tsx` with correct metadataBase URL
- Add comprehensive OpenGraph and Twitter Card metadata
- Improve title and description to reflect actual AI chatbot + language learning features
- Add keywords, author, and other essential meta tags

### 2. **Create Page-Specific Metadata**
- Add metadata exports to key pages:
  - Chat page (`app/(chat)/page.tsx`) - AI chatbot focused
  - Phrase learning page (`app/(phrase)/phrase/page.tsx`) - language learning focused
  - Individual chat pages (`app/(chat)/chat/[id]/page.tsx`) - dynamic metadata based on chat content
  - Auth pages - focused on user onboarding

### 3. **Add Essential SEO Files**
- Create `app/robots.txt/route.ts` for dynamic robots.txt
- Create `app/sitemap.xml/route.ts` for dynamic sitemap generation
- Include public chats, phrase learning routes, and static pages

### 4. **Implement Structured Data (JSON-LD)**
- Add WebApplication schema to root layout
- Add SoftwareApplication schema for the AI chatbot
- Add EducationalOrganization schema for language learning features
- Add FAQ schema for common chatbot/language learning questions

### 5. **Add Social Media Images**
- Create OpenGraph and Twitter images for:
  - Root application (`app/opengraph-image.tsx`, `app/twitter-image.tsx`)
  - Phrase learning section (`app/(phrase)/opengraph-image.tsx`)
  - Generate dynamic images for public chats

### 6. **Implement Canonical URLs**
- Add canonical URL logic for all pages
- Handle public chat sharing URLs properly
- Ensure consistent URL structure for SEO

### 7. **Enhance Next.js Config for SEO**
- Add trailing slashes configuration
- Configure headers for better SEO (security headers, cache headers)
- Add compression and performance optimizations

### 8. **Create SEO Utilities**
- Build helper functions for generating dynamic metadata
- Create utilities for structured data generation
- Add SEO-friendly URL slug generation

### 9. **Add Language/Internationalization Support**
- Add hreflang support for the language learning features
- Configure language detection and SEO for different languages

### 10. **Performance & Core Web Vitals**
- Add performance monitoring for SEO
- Optimize images and assets for better loading
- Implement proper caching headers

## Implementation Priority
1. **High Priority**: Root metadata fix, robots.txt, sitemap, page-specific metadata
2. **Medium Priority**: Structured data, social images, canonical URLs
3. **Low Priority**: Advanced features like dynamic images, internationalization

This plan will significantly improve search engine visibility for both the AI chatbot functionality and the language learning features, targeting relevant keywords and user search patterns.

## Implementation Status
- [ ] 1. Fix Root Metadata & Add Comprehensive Meta Tags
- [ ] 2. Create Page-Specific Metadata
- [ ] 3. Add Essential SEO Files (robots.txt, sitemap.xml)
- [ ] 4. Implement Structured Data (JSON-LD)
- [ ] 5. Add Social Media Images
- [ ] 6. Implement Canonical URLs
- [ ] 7. Enhance Next.js Config for SEO
- [ ] 8. Create SEO Utilities
- [ ] 9. Add Language/Internationalization Support
- [ ] 10. Performance & Core Web Vitals