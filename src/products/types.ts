export type ProductStatus = 'live' | 'coming-soon';

export type ProductAccess = 'internal' | 'proxied' | 'external';

export type ProductIcon =
  | 'documents'
  | 'copy'
  | 'sparkles'
  | 'shield'
  | 'tools';

export interface FreeSevaProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  href: string;
  access: ProductAccess;
  status: ProductStatus;
  icon: ProductIcon;
  accentClass: string;
  badge: string;
  highlights: string[];
}
