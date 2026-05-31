import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import {
  ArrowRight,
  Check,
  Combine,
  Crop,
  FileDown,
  FileImage,
  FolderOpen,
  ImageIcon,
  Layers3,
  Lock,
  Maximize2,
  MousePointerClick,
  PenTool,
  RefreshCw,
  Scissors,
  Search,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ToolItem {
  name: string;
  desc: string;
  path: string;
  category: 'PDF Tools' | 'Image Tools' | 'Signature Tools';
  icon: React.ReactNode;
  iconClass: string;
  glowClass: string;
  arrowClass: string;
}

const tools: ToolItem[] = [
  {
    name: 'Image Compressor',
    desc: 'Compress JPG, PNG, WEBP to exact size',
    path: '/image-compressor',
    category: 'Image Tools',
    icon: <Layers3 className="h-6 w-6" />,
    iconClass: 'text-emerald-600 bg-emerald-50',
    glowClass: 'from-emerald-50/70',
    arrowClass: 'text-emerald-600 bg-emerald-50',
  },
  {
    name: 'Signature Compressor',
    desc: 'Make signatures under 10KB / 20KB',
    path: '/signature-compressor',
    category: 'Signature Tools',
    icon: <PenTool className="h-6 w-6" />,
    iconClass: 'text-violet-600 bg-violet-50',
    glowClass: 'from-violet-50/70',
    arrowClass: 'text-violet-600 bg-violet-50',
  },
  {
    name: 'Image Resizer',
    desc: 'Resize to mm, cm or pixel perfect',
    path: '/image-resizer',
    category: 'Image Tools',
    icon: <Maximize2 className="h-6 w-6" />,
    iconClass: 'text-blue-600 bg-blue-50',
    glowClass: 'from-blue-50/70',
    arrowClass: 'text-blue-600 bg-blue-50',
  },
  {
    name: 'White Background',
    desc: 'Remove background and get white background',
    path: '/white-background',
    category: 'Image Tools',
    icon: <Sparkle className="h-6 w-6" />,
    iconClass: 'text-amber-600 bg-amber-50',
    glowClass: 'from-amber-50/70',
    arrowClass: 'text-amber-600 bg-amber-50',
  },
  {
    name: 'PDF Compressor',
    desc: 'Compress PDF without losing quality',
    path: '/pdf-compressor',
    category: 'PDF Tools',
    icon: <FileDown className="h-6 w-6" />,
    iconClass: 'text-rose-600 bg-rose-50',
    glowClass: 'from-rose-50/70',
    arrowClass: 'text-rose-600 bg-rose-50',
  },
  {
    name: 'Merge PDF',
    desc: 'Merge multiple PDFs into one',
    path: '/pdf-merge',
    category: 'PDF Tools',
    icon: <Combine className="h-6 w-6" />,
    iconClass: 'text-pink-600 bg-pink-50',
    glowClass: 'from-pink-50/70',
    arrowClass: 'text-pink-600 bg-pink-50',
  },
  {
    name: 'Split PDF',
    desc: 'Extract pages or split PDF easily',
    path: '/pdf-split',
    category: 'PDF Tools',
    icon: <Scissors className="h-6 w-6" />,
    iconClass: 'text-purple-600 bg-purple-50',
    glowClass: 'from-purple-50/70',
    arrowClass: 'text-purple-600 bg-purple-50',
  },
  {
    name: 'Images to PDF',
    desc: 'Convert images to high quality PDF',
    path: '/image-to-pdf',
    category: 'PDF Tools',
    icon: <FileImage className="h-6 w-6" />,
    iconClass: 'text-teal-600 bg-teal-50',
    glowClass: 'from-teal-50/70',
    arrowClass: 'text-teal-600 bg-teal-50',
  },
  {
    name: 'Image Converter',
    desc: 'Convert between PNG, JPG, WEBP formats',
    path: '/image-converter',
    category: 'Image Tools',
    icon: <RefreshCw className="h-6 w-6" />,
    iconClass: 'text-orange-600 bg-orange-50',
    glowClass: 'from-orange-50/70',
    arrowClass: 'text-orange-600 bg-orange-50',
  },
  {
    name: 'Image Crop Tool',
    desc: 'Crop to passport, square or custom size',
    path: '/image-cropper',
    category: 'Image Tools',
    icon: <Crop className="h-6 w-6" />,
    iconClass: 'text-sky-600 bg-sky-50',
    glowClass: 'from-sky-50/70',
    arrowClass: 'text-sky-600 bg-sky-50',
  },
];

const toolCategories: ToolItem['category'][] = ['PDF Tools', 'Image Tools', 'Signature Tools'];

const HeroIllustration: React.FC = () => (
  <div className="relative h-[360px] w-full max-w-[620px] select-none">
    <div className="absolute inset-6 rounded-full border border-white/70 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16),transparent_58%)] shadow-[0_0_90px_rgba(139,92,246,0.20)]" />
    <div className="absolute left-1/2 top-1/2 h-52 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-blue-200/70 bg-gradient-to-br from-white via-blue-50 to-violet-100 shadow-[0_30px_80px_rgba(74,103,170,0.22)] animate-float-slow">
      <div className="absolute -top-8 left-10 h-24 w-44 rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-100 shadow-xl rotate-[-8deg]" />
      <div className="absolute -top-12 left-28 flex h-28 w-24 rotate-[8deg] flex-col items-center justify-center rounded-2xl border border-violet-100 bg-white shadow-xl">
        <FileDown className="h-9 w-9 text-violet-600" />
        <span className="mt-1 text-xs font-black text-violet-600">PDF</span>
      </div>
      <div className="absolute -top-2 left-5 flex h-16 w-16 rotate-[-3deg] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-brand-600 text-white shadow-xl">
        <ImageIcon className="h-8 w-8" />
      </div>
      <div className="absolute right-8 top-2 flex h-20 w-28 rotate-[7deg] items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-xl">
        <PenTool className="h-9 w-9" />
      </div>
      <div className="absolute bottom-8 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 text-white shadow-[0_18px_45px_rgba(59,130,246,0.35)]">
        <Check className="h-12 w-12 stroke-[3.4]" />
      </div>
    </div>

    {[
      { label: 'Fast', sub: 'Lightning Quick', icon: <Zap className="h-5 w-5 text-violet-600" />, pos: 'left-4 top-12' },
      { label: 'Easy', sub: 'One Click Tools', icon: <MousePointerClick className="h-5 w-5 text-navy-700" />, pos: 'left-0 bottom-16' },
      { label: 'Secure', sub: '100% Private', icon: <Lock className="h-5 w-5 text-navy-700" />, pos: 'right-3 top-24' },
      { label: 'Smart', sub: 'Perfect Output', icon: <Sparkles className="h-5 w-5 text-navy-700" />, pos: 'right-0 bottom-10' },
    ].map((badge) => (
      <div
        key={badge.label}
        className={`absolute ${badge.pos} hidden min-w-36 items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl lg:flex`}
      >
        {badge.icon}
        <div>
          <p className="text-xs font-black text-navy-950">{badge.label}</p>
          <p className="text-[10px] font-semibold text-navy-500">{badge.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

export const DocumentTools: React.FC = () => {
  const [query, setQuery] = useState('');

  const visibleTools = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tools;
    return tools.filter((tool) => `${tool.name} ${tool.desc}`.toLowerCase().includes(term));
  }, [query]);

  const visibleGroups = useMemo(
    () =>
      toolCategories
        .map((category) => ({
          category,
          tools: visibleTools.filter((tool) => tool.category === category),
        }))
        .filter((group) => group.tools.length > 0),
    [visibleTools]
  );

  return (
    <PageLayout seoTitle="freeSeva Document Tools - Free Local PDF, Image and Signature Tools">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 px-5 py-6 shadow-[0_24px_70px_rgba(31,49,82,0.08)] backdrop-blur-xl md:px-10 md:py-9 lg:px-12">
        <div className="absolute -right-20 top-0 h-96 w-[48rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.15),rgba(59,130,246,0.08)_45%,transparent_72%)]" />
        <div className="absolute right-14 top-16 h-56 w-56 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute -right-10 top-8 h-32 w-32 rounded-full bg-sky-300/15 blur-2xl md:hidden" />
        <div className="absolute right-5 top-24 hidden h-20 w-20 rotate-12 rounded-3xl border border-white/80 bg-white/50 shadow-xl backdrop-blur-sm sm:block md:hidden" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-black text-violet-700 shadow-sm">
              <Zap className="h-4 w-4 fill-current" />
              <span>Always Free. Forever</span>
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-navy-950 sm:text-5xl md:mt-7 md:text-6xl">
              Make Your Documents{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-600 bg-clip-text text-transparent">
                Form Ready
              </span>
              <Sparkles className="ml-1 inline h-6 w-6 text-violet-400 md:h-8 md:w-8" />
            </h1>

            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-navy-500 md:mt-6 md:text-lg">
              Compress, resize, convert and prepare your photos, signatures and PDFs in seconds.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur md:hidden">
              <div className="relative h-16 w-20 flex-shrink-0">
                <div className="absolute left-3 top-2 h-12 w-12 rotate-[-9deg] rounded-2xl bg-gradient-to-br from-emerald-400 to-brand-600 shadow-lg" />
                <div className="absolute left-8 top-0 flex h-14 w-12 rotate-[8deg] items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-600 shadow-lg">
                  <FileDown className="h-6 w-6" />
                </div>
                <div className="absolute bottom-0 left-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-600 text-white shadow-lg">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-navy-950">Ready for any form</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Local', 'No uploads', 'Fast'].map((chip) => (
                    <span key={chip} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8 md:gap-4">
              <Link
                to="/form-helper"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 md:px-7 md:py-4"
              >
                <Sparkles className="h-4 w-4" />
                All-in-One Workspace
              </Link>
              <a
                href="#tools-grid"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-150 bg-white px-6 py-3.5 text-sm font-black text-navy-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 md:px-7 md:py-4"
              >
                Browse All Tools
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="mt-5 md:mt-7">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any tool..."
            className="h-14 w-full rounded-2xl border border-navy-100 bg-white/85 pl-13 pr-5 text-sm font-bold text-navy-850 shadow-sm outline-none transition placeholder:text-navy-400 focus:border-brand-200 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </section>

      <section id="tools-grid" className="mt-5 grid gap-6 md:mt-8 xl:grid-cols-[1fr_360px] xl:gap-7">
        <div className="order-2 xl:order-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-navy-950">
              <Sparkle className="h-5 w-5 text-violet-600" />
              Popular Tools
            </h2>
            <a href="#tools-grid" className="inline-flex items-center gap-2 text-xs font-black text-violet-600">
              View all tools
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="space-y-7">
            {visibleGroups.map((group) => (
              <div key={group.category}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  <h3 className="text-sm font-black text-navy-850">{group.category}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
                  {group.tools.map((tool) => (
                    <Link
                      to={tool.path}
                      key={tool.name}
                      className={`group relative min-h-[190px] overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br ${tool.glowClass} via-white to-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-200/50`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tool.iconClass} shadow-sm transition group-hover:scale-105`}>
                        {tool.icon}
                      </div>

                      <h4 className="mt-5 max-w-32 text-lg font-black leading-tight text-navy-950">{tool.name}</h4>
                      <p className="mt-3 text-xs font-semibold leading-relaxed text-navy-500">{tool.desc}</p>

                      <span className={`absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white shadow-sm ${tool.arrowClass}`}>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-1 space-y-5 xl:order-2">
          <Link
            to="/form-helper"
            className="group relative block overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.75),transparent_35%),radial-gradient(circle_at_100%_18%,rgba(20,184,166,0.34),transparent_34%),linear-gradient(135deg,#24105f_0%,#121a43_54%,#061927_100%)] p-5 text-white shadow-[0_30px_80px_rgba(31,27,93,0.30)] ring-1 ring-white/10 transition hover:-translate-y-1 md:p-6"
          >
            <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-violet-500/35 blur-3xl" />
            <div className="absolute -bottom-16 right-10 h-52 w-52 rounded-full bg-emerald-400/24 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute right-4 top-18 h-28 w-28 rotate-[-10deg] rounded-[1.7rem] border border-emerald-300/10 bg-emerald-300/5 opacity-25 shadow-2xl backdrop-blur-sm" />
            <ImageIcon className="absolute right-20 top-29 h-8 w-8 rotate-[-8deg] text-emerald-200/18" />
            <FileDown className="absolute right-8 top-24 h-8 w-8 rotate-[10deg] text-violet-200/18" />
            <Check className="absolute right-11 top-37 h-10 w-10 text-sky-200/20" />

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between gap-4 md:mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-xl shadow-amber-400/25">
                  <Sparkles className="h-5 w-5 fill-current" />
                </div>
                <div className="flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-1 text-[10px] font-black text-emerald-200 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Flagship
                </div>
              </div>

              <div className="mb-3 inline-flex rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-100 ring-1 ring-white/10">
                Batch form assistant
              </div>

              <h3 className="relative max-w-none text-2xl font-black leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.35)]">
                All-in-One <span className="text-emerald-300">Workspace</span>
              </h3>
              <p className="mt-3 max-w-[18rem] text-sm font-bold leading-relaxed text-white/92 [text-shadow:0_1px_10px_rgba(0,0,0,0.25)] md:mt-4 md:text-sm">
                Drop every file once, choose portal limits, and export a ready-to-upload package.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-emerald-400/25 ring-1 ring-white/30 transition group-hover:bg-emerald-200 md:mt-6">
                Launch Workspace
                <ArrowRight className="h-4 w-4" />
              </span>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/8 p-3 shadow-inner shadow-white/5 backdrop-blur md:mt-6">
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { label: '3 photos', icon: <ImageIcon className="h-4 w-4" />, color: 'bg-violet-400/15 text-violet-100', bar: 'w-10' },
                    { label: '2 PDFs', icon: <FileDown className="h-4 w-4" />, color: 'bg-sky-400/15 text-sky-100', bar: 'w-14' },
                    { label: '1 sign', icon: <PenTool className="h-4 w-4" />, color: 'bg-emerald-400/15 text-emerald-100', bar: 'w-8' },
                  ].map((step) => (
                    <div key={step.label} className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border border-white/10 ${step.color}`}>
                      {step.icon}
                      <span className="mt-1 text-[10px] font-black">{step.label}</span>
                      <span className={`mt-1 h-1.5 rounded-full bg-current opacity-35 ${step.bar}`} />
                    </div>
                  ))}
                </div>

                <div className="mb-3 rounded-2xl bg-gradient-to-r from-emerald-300 to-sky-300 p-0.5">
                  <div className="flex items-center justify-between rounded-[0.9rem] bg-slate-950/80 px-3 py-2">
                    <span className="text-[11px] font-black text-white">Package health</span>
                    <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-[10px] font-black text-slate-950">Ready</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 md:block">
                {[
                  'Upload Multiple Files',
                  'Set Size Limits',
                  'Smart Optimize',
                  'Download ZIP',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 py-1.5 text-[11px] font-black text-white/92 md:gap-3 md:py-2 md:text-xs">
                    <Check className="h-4 w-4 rounded-full bg-amber-300/20 p-0.5 text-amber-200" />
                    <span>{item}</span>
                  </div>
                ))}
                </div>
              </div>

              <FolderOpen className="absolute right-1 top-28 h-24 w-24 rotate-[-8deg] text-emerald-300/10 transition group-hover:scale-105 md:right-2 md:top-16 md:h-28 md:w-28 md:text-emerald-300/18" />
            </div>
          </Link>

          <div className="hidden grid-cols-2 gap-3 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:grid">
            {[
              { label: '100% Private', text: 'Browser local', icon: <ShieldCheck className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Super Fast', text: 'Seconds', icon: <Zap className="h-5 w-5" />, color: 'text-violet-600 bg-violet-50' },
              { label: 'Easy to Use', text: 'One click', icon: <MousePointerClick className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50' },
              { label: 'No Login', text: 'Start instantly', icon: <Lock className="h-5 w-5" />, color: 'text-orange-600 bg-orange-50' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-3 text-center">
                <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}>{item.icon}</div>
                <h4 className="text-xs font-black text-navy-950">{item.label}</h4>
                <p className="mt-1 text-[10px] font-semibold text-navy-500">{item.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </PageLayout>
  );
};
