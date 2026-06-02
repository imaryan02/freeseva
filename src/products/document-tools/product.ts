import type { FreeSevaProduct } from '../types';

export const documentToolsProduct: FreeSevaProduct = {
  id: 'document-tools',
  name: 'Document Tools',
  tagline: 'Prepare PDFs, photos, signatures and form files.',
  description:
    'Compress, resize, crop, convert and package everyday document files with browser-local processing.',
  category: 'Documents',
  href: '/document-tools',
  access: 'internal',
  status: 'live',
  icon: 'documents',
  accentClass: 'from-emerald-50 via-white to-sky-50',
  badge: 'Flagship',
  highlights: ['PDF tools', 'Image tools', 'Signature tools', 'Form helper'],
};
