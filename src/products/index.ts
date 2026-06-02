import { copyPasteGuruProduct } from './copypasteguru/product';
import { documentToolsProduct } from './document-tools/product';
import type { FreeSevaProduct } from './types';

export const freeSevaProducts: FreeSevaProduct[] = [
  documentToolsProduct,
  copyPasteGuruProduct,
];

export type { FreeSevaProduct, ProductAccess, ProductIcon, ProductStatus } from './types';
