import type { FreeSevaProduct } from '../types';

export const copyPasteGuruProduct: FreeSevaProduct = {
  id: 'copypasteguru',
  name: 'CopyPasteGuru',
  tagline: 'A focused tool for faster copy-paste workflows.',
  description:
    'CopyPasteGuru is a free real-time text sharing tool. Create a room, paste text, and open the same room on another device to instantly sync notes, links, or code snippets without logging in.',
  category: 'Productivity',
  href: '/copypasteguru/',
  access: 'proxied',
  status: 'live',
  icon: 'copy',
  accentClass: 'from-violet-50 via-white to-amber-50',
  badge: 'Standalone',
  highlights: ['Public tool', 'Separate repo', 'Free to use'],
};
