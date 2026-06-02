import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { freeSevaProducts } from '../products';

export const Tools: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(freeSevaProducts.map((product) => product.category)))],
    []
  );

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return freeSevaProducts.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch =
        !term ||
        `${product.name} ${product.tagline} ${product.description} ${product.category} ${product.highlights.join(' ')}`
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_0%_20%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#fbfdff_0%,#f5f8fc_48%,#ffffff_100%)] font-sans text-navy-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-1 font-display text-2xl font-black tracking-tight text-brand-600">
            free<span className="text-navy-900">Seva</span>
            <span className="text-brand-600">+</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-black text-navy-600 md:flex">
            <Link to="/" className="hover:text-brand-700">Home</Link>
            <Link to="/tools" className="text-brand-700">Tools</Link>
            <Link to="/document-tools" className="hover:text-brand-700">Document Tools</Link>
          </nav>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-black text-navy-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 px-6 py-8 shadow-[0_30px_90px_rgba(31,49,82,0.10)] backdrop-blur-xl md:px-10 md:py-12">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-black text-violet-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Free public projects
                </div>
                <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-navy-950 sm:text-5xl md:text-6xl">
                  Tools built for real everyday use
                </h1>
                <p className="mt-5 max-w-2xl text-base font-bold leading-relaxed text-navy-600 md:text-lg">
                  A growing catalog of free tools and public projects under the FreeSeva initiative.
                  Some tools live inside this app, and some stay in their own repos while being available under FreeSeva.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy-950">Modular by design</h2>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-navy-500">
                      Add future tools by creating a product folder under `src/products`, then adding it to the catalog.
                      Separate apps can still be routed through FreeSeva paths.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search FreeSeva tools..."
                className="h-14 w-full rounded-2xl border border-navy-100 bg-white/85 pl-13 pr-5 text-sm font-bold text-navy-850 shadow-sm outline-none transition placeholder:text-navy-400 focus:border-brand-200 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-navy-100 bg-white/75 p-2 shadow-sm backdrop-blur">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`h-10 whitespace-nowrap rounded-xl px-4 text-xs font-black transition ${
                    category === item
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'bg-white text-navy-600 hover:bg-navy-50 hover:text-navy-950'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-navy-950">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'tool' : 'tools'}
            </h2>
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-violet-600">
              Back to initiative
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
