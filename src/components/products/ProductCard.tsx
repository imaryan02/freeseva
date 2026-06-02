import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCopy,
  ExternalLink,
  FileText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { FreeSevaProduct, ProductIcon } from '../../products';

const productIcons: Record<ProductIcon, React.ReactNode> = {
  documents: <FileText className="h-6 w-6" />,
  copy: <ClipboardCopy className="h-6 w-6" />,
  sparkles: <Sparkles className="h-6 w-6" />,
  shield: <ShieldCheck className="h-6 w-6" />,
  tools: <Wrench className="h-6 w-6" />,
};

interface ProductCardProps {
  product: FreeSevaProduct;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-navy-900 shadow-sm ring-1 ring-navy-100">
          {productIcons[product.icon]}
        </div>
        <span className="rounded-full border border-white bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-navy-600 shadow-sm">
          {product.badge}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{product.category}</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-navy-950">{product.name}</h3>
        <p className="mt-3 text-sm font-bold leading-relaxed text-navy-600">{product.tagline}</p>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-navy-500">{product.description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full border border-navy-100 bg-white/80 px-3 py-1.5 text-[10px] font-black text-navy-700"
          >
            {highlight}
          </span>
        ))}
      </div>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-navy-950">
        Open tool
        {product.access === 'internal' ? <ArrowRight className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
      </div>
    </>
  );

  const className = `group block ${compact ? 'min-h-[310px]' : 'min-h-[330px]'} rounded-[1.75rem] border border-white/80 bg-gradient-to-br ${product.accentClass} p-6 shadow-[0_18px_55px_rgba(31,49,82,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_75px_rgba(31,49,82,0.13)]`;

  if (product.access === 'internal') {
    return (
      <Link to={product.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={product.href} className={className}>
      {content}
    </a>
  );
};
