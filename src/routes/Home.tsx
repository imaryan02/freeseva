import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileImage,
  FileText,
  HeartHandshake,
  Image,
  Lock,
  Mail,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { freeSevaProducts } from '../products';

const trustItems = [
  { label: 'For Students', text: 'Use free tools for exams, admissions, notes, applications and daily digital tasks.', icon: BookOpen },
  { label: 'For Professionals', text: 'Handle practical workflows for documents, productivity and public web utilities.', icon: Briefcase },
  { label: 'For Everyone', text: 'Simple public projects that do not require technical knowledge.', icon: Users },
  { label: 'Privacy First', text: 'Projects are designed to avoid unnecessary accounts, uploads and storage.', icon: ShieldCheck },
  { label: 'Completely Free', text: 'No pricing pages, paywalls or hidden document limits.', icon: HeartHandshake },
  { label: 'More Tools Ahead', text: 'Useful public projects will be added here as they are built.', icon: Sparkles },
];

const capabilities = [
  'PDF compression',
  'Image compression',
  'Signature preparation',
  'Document resizing and cropping',
  'Image to PDF conversion',
  'All-in-One Workspace',
];

const futureAreas = [
  'More document utilities',
  'Productivity helpers',
  'Student-friendly digital helpers',
  'Simple public-service workflows',
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_0%_20%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#fbfdff_0%,#f5f8fc_48%,#ffffff_100%)] font-sans text-navy-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-1 font-display text-2xl font-black tracking-tight text-brand-600">
            free<span className="text-navy-900">Seva</span>
            <span className="text-brand-600">+</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-black text-navy-600 md:flex">
            <a href="#home" className="hover:text-brand-700">Home</a>
            <Link to="/tools" className="hover:text-brand-700">Tools</Link>
            <a href="#mission" className="hover:text-brand-700">Mission</a>
            <a href="#future" className="hover:text-brand-700">Future</a>
            <a href="#privacy" className="hover:text-brand-700">Privacy</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://aryan-gupta-portfolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-black text-navy-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 sm:inline-flex"
            >
              Aryan Gupta
            </a>
            <a
              href="https://www.linkedin.com/in/imaryan02/"
              target="_blank"
              rel="noreferrer"
              aria-label="Aryan Gupta on LinkedIn"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#0a66c2]/15 bg-[#0a66c2] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#084f96] sm:inline-flex"
            >
              in
            </a>
            <Link
              to="/tools"
              className="hidden rounded-full bg-navy-950 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-navy-900/10 transition hover:-translate-y-0.5 md:inline-flex"
            >
              Open Tools
            </Link>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="mx-auto px-5 py-8 md:px-8 md:py-10">
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 px-6 py-8 text-center shadow-[0_30px_90px_rgba(31,49,82,0.10)] backdrop-blur-xl md:px-10 md:py-12 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10 lg:px-12 lg:text-left">
            <div className="absolute -right-16 top-0 h-[34rem] w-[52rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.17),rgba(59,130,246,0.10)_42%,transparent_70%)]" />
            <div className="absolute right-20 top-20 h-60 w-60 rounded-full bg-emerald-200/25 blur-3xl" />
            <div className="relative z-10">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-black text-violet-700 shadow-sm lg:mx-0">
                <HeartHandshake className="h-4 w-4" />
                Community initiative
              </div>

              <h1 className="mx-auto mt-7 max-w-3xl font-display text-5xl font-black leading-[1.04] tracking-tight text-navy-950 sm:text-6xl md:text-7xl lg:mx-0">
                Free Digital Services{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-600 bg-clip-text text-transparent">
                  For Everyone
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-black leading-relaxed text-navy-600 md:text-xl lg:mx-0">
                An initiative to contribute to the community by helping students, professionals and everyday users
                complete important digital tasks quickly, securely and without cost.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-relaxed text-navy-500 md:text-base lg:mx-0">
                Document Tools is the first live product. More free projects will be added here whenever
                they can solve real problems for people.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/document-tools"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5"
                >
                  Start with Document Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/tools"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white px-7 py-4 text-sm font-black text-navy-850 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
                >
                  Browse All Tools
                </Link>
              </div>
            </div>

            <div className="relative z-10 mx-auto min-h-[340px] w-full max-w-[640px] select-none md:min-h-[430px] lg:max-w-[760px]">
              <div className="absolute inset-x-2 top-8 h-72 rounded-full border border-white/70 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.20),rgba(59,130,246,0.11)_48%,transparent_70%)] shadow-[0_0_90px_rgba(139,92,246,0.20)] md:inset-x-6 md:h-80" />
              <div className="absolute left-1/2 top-1/2 flex h-80 w-80 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[3rem] bg-white/45 shadow-[0_30px_90px_rgba(74,103,170,0.18)] backdrop-blur-sm md:h-[25rem] md:w-[25rem] xl:h-[27rem] xl:w-[27rem]">
                <img
                  src="/freeseva.png"
                  alt="FreeSeva digital services illustration"
                  className="h-[88%] w-[88%] object-contain drop-shadow-[0_30px_45px_rgba(31,49,82,0.20)]"
                  loading="eager"
                />
              </div>

              {[
                { label: 'Fast', sub: 'Quick tools', icon: <Zap className="h-5 w-5 text-violet-600" />, pos: '-left-4 top-2 lg:-left-7 lg:top-10 xl:-left-10 xl:top-12' },
                { label: 'Private', sub: 'Browser local', icon: <Lock className="h-5 w-5 text-navy-700" />, pos: '-right-4 top-10 lg:-right-7 lg:top-20 xl:-right-10 xl:top-22' },
                { label: 'Easy', sub: 'One click', icon: <MousePointerClick className="h-5 w-5 text-navy-700" />, pos: '-left-4 bottom-2 lg:-left-7 lg:bottom-12 xl:-left-10 xl:bottom-14' },
                { label: 'Community', sub: 'Free service', icon: <HeartHandshake className="h-5 w-5 text-navy-700" />, pos: '-right-4 bottom-2 lg:-right-7 lg:bottom-10 xl:-right-10 xl:bottom-12' },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className={`absolute ${badge.pos} hidden min-w-36 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-xl backdrop-blur-xl md:flex`}
                >
                  {badge.icon}
                  <div>
                    <p className="text-xs font-black text-navy-950">{badge.label}</p>
                    <p className="text-[10px] font-bold text-navy-500">{badge.sub}</p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-1/2 grid w-[92%] -translate-x-1/2 grid-cols-3 gap-2 rounded-3xl border border-white/80 bg-white/75 p-3 shadow-xl backdrop-blur-xl md:hidden">
                {[
                  { label: 'PDF', icon: FileText },
                  { label: 'Image', icon: Image },
                  { label: 'Sign', icon: FileImage },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-navy-50/70 p-3 text-center">
                      <Icon className="mx-auto h-5 w-5 text-brand-600" />
                      <p className="mt-1 text-[10px] font-black text-navy-850">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
          <div className="mb-6 flex flex-col gap-2 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Who FreeSeva helps</p>
            <h2 className="font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">
              Built around real everyday needs
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.label}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-[0_18px_55px_rgba(31,49,82,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(31,49,82,0.12)]"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_68%)] transition group-hover:scale-125" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-violet-50 text-brand-600 shadow-sm ring-1 ring-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative mt-5 text-lg font-black text-navy-950">{item.label}</h3>
                  <p className="relative mt-2 text-sm font-bold leading-relaxed text-navy-550">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">FreeSeva tools</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">
                Public projects available for everyone
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-navy-600 md:text-base">
                FreeSeva is the home for useful projects I build and decide to share publicly.
                Each product can stay modular while being discoverable from one place.
              </p>
              <Link
                to="/tools"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-navy-950 px-5 py-3 text-xs font-black text-white shadow-lg shadow-navy-900/10 transition hover:-translate-y-0.5"
              >
                View dedicated tools page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-navy-100 bg-white/80 px-4 py-3 text-xs font-black text-navy-700 shadow-sm backdrop-blur">
              {freeSevaProducts.length} live tools
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {freeSevaProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>

        <section id="document-tools" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/76 p-6 shadow-[0_30px_90px_rgba(31,49,82,0.10)] backdrop-blur-xl md:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="relative grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Available now</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">Document Tools for daily form work</h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-navy-600 md:text-base">
                The first FreeSeva product helps you prepare PDFs, photos and signatures for exams,
                admissions, job portals, government forms and everyday document submissions.
              </p>
              <Link
                to="/document-tools"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
              >
                Open Document Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div key={capability} className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-600" />
                  <span className="text-sm font-black text-navy-800">{capability}</span>
                </div>
              ))}
            </div>
            </div>
          </div>
        </section>

        <section id="mission" className="py-10 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Mission</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">
                A growing initiative to make useful digital help accessible.
              </h2>
            </div>
            <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/75 p-6 text-base font-bold leading-relaxed text-navy-600 shadow-[0_18px_55px_rgba(31,49,82,0.08)] backdrop-blur-xl">
              <p>
                FreeSeva exists to contribute to the community by reducing small but frustrating digital barriers
                faced by students, professionals, applicants and families.
              </p>
              <p>
                The goal is simple: keep building free, reliable projects and publish the ones that can help
                people complete important online tasks with confidence.
              </p>
            </div>
          </div>
        </section>

        <section id="future" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Growing with purpose</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">
                More free projects will be added as they become useful.
              </h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-navy-600">
                FreeSeva will expand carefully around projects that genuinely help people, especially where a free,
                clean and privacy-conscious solution can save time.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {futureAreas.map((area) => (
                <div key={area} className="rounded-[1.5rem] border border-white/80 bg-white/75 p-5 shadow-[0_16px_45px_rgba(31,49,82,0.07)] backdrop-blur-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-black text-navy-850">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="py-10 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Privacy by default</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 md:text-4xl">Built for trust, not lock-in.</h2>
            </div>
            <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/75 p-6 text-base font-bold leading-relaxed text-navy-600 shadow-[0_18px_55px_rgba(31,49,82,0.08)] backdrop-blur-xl">
            <p>Files stay on your device whenever possible, with no mandatory accounts and no unnecessary storage.</p>
              <p>FreeSeva is designed for people who need quick public tools without giving up control of personal data.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-18">
          <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_14%_0%,rgba(124,58,237,0.70),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.28),transparent_34%),linear-gradient(135deg,#24105f_0%,#121a43_54%,#061927_100%)] p-7 text-white shadow-[0_30px_90px_rgba(31,27,93,0.26)] md:p-10">
            <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative">
            <p className="text-sm font-black text-emerald-300">Ready to get started?</p>
            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <h2 className="max-w-2xl font-display text-3xl font-black tracking-tight md:text-4xl">
                Explore the tools and use anything that helps.
              </h2>
              <Link
                to="/document-tools"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-navy-950 transition hover:bg-emerald-100"
              >
                Open Document Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy-100 bg-white px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm font-semibold text-navy-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-navy-950">freeSeva</p>
            <p className="mt-1">A growing public initiative built by Aryan Gupta.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/tools" className="hover:text-brand-700">Tools</Link>
            <a href="#mission" className="hover:text-brand-700">Mission</a>
            <a href="#future" className="hover:text-brand-700">Future</a>
            <a href="#privacy" className="hover:text-brand-700">Privacy</a>
            <Link to="/document-tools" className="hover:text-brand-700">Document Tools</Link>
            <a href="mailto:aryan.official02@gmail.com" className="inline-flex items-center gap-1 hover:text-brand-700">
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
