import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileImage,
  FileText,
  Image,
  Lock,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const trustItems = [
  { label: 'Privacy First', text: 'Tools are designed to keep files on your device whenever possible.', icon: ShieldCheck },
  { label: 'Fast Processing', text: 'Compress, convert and prepare common documents in seconds.', icon: Zap },
  { label: 'Browser-Based', text: 'Use FreeSeva directly from a modern browser.', icon: Lock },
  { label: 'Completely Free', text: 'No pricing pages, paywalls or hidden document limits.', icon: Sparkles },
  { label: 'No Signups', text: 'Start preparing files without creating an account.', icon: CheckCircle2 },
  { label: 'No Unnecessary Uploads', text: 'The product is built around local-first document handling.', icon: FileText },
];

const capabilities = [
  'PDF compression',
  'Image compression',
  'Signature preparation',
  'Document resizing and cropping',
  'Image to PDF conversion',
  'All-in-One Workspace',
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.13),transparent_32%),radial-gradient(circle_at_8%_18%,rgba(16,185,129,0.13),transparent_28%),#f8fbff] font-sans text-navy-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-1 font-display text-2xl font-black tracking-tight text-brand-600">
            free<span className="text-navy-900">Seva</span>
            <span className="text-brand-600">+</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-black text-navy-600 md:flex">
            <a href="#home" className="hover:text-brand-700">Home</a>
            <a href="#mission" className="hover:text-brand-700">Mission</a>
            <a href="#privacy" className="hover:text-brand-700">Privacy</a>
            <Link to="/document-tools" className="hover:text-brand-700">Document Tools</Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://www.linkedin.com/in/imaryan02/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-black text-navy-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 sm:inline-flex"
            >
              Aryan Gupta
            </a>
            <Link
              to="/document-tools"
              className="hidden rounded-full bg-navy-950 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-navy-900/10 transition hover:-translate-y-0.5 md:inline-flex"
            >
              Open Document Tools
            </Link>
            <button className="rounded-xl p-2 text-navy-700 md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:px-8 md:py-18 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm">
              <span className="text-base" aria-label="India flag" role="img">{'\u{1F1EE}\u{1F1F3}'}</span>
              Made in India for everyday digital work
            </div>

            <h1 className="mt-7 max-w-3xl font-display text-5xl font-black leading-[1.03] tracking-tight text-navy-950 md:text-7xl">
              Free Digital Services For Everyone
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-navy-600 md:text-xl">
              FreeSeva provides privacy-first digital tools that help people complete everyday tasks quickly,
              securely, and without hidden costs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/document-tools"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5"
              >
                Open Document Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#mission"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white px-7 py-4 text-sm font-black text-navy-850 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_28px_90px_rgba(31,49,82,0.10)] backdrop-blur">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-200/55 blur-3xl" />
            <div className="absolute -bottom-24 left-4 h-64 w-64 rounded-full bg-emerald-200/55 blur-3xl" />
            <div className="relative rounded-[1.5rem] bg-[linear-gradient(135deg,#28106b,#11264b_58%,#06251f)] p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg">
                  <Sparkles className="h-7 w-7" />
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[11px] font-black text-emerald-200">
                  Privacy-first
                </span>
              </div>
              <h2 className="mt-8 text-3xl font-black leading-tight">
                One place for PDFs, images and signatures.
              </h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-white/78">
                Start with document tools today: compress PDFs, prepare images, resize photos and package files for forms.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'PDF', icon: FileText },
                  { label: 'Image', icon: Image },
                  { label: 'Sign', icon: FileImage },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                      <Icon className="mx-auto h-6 w-6 text-emerald-200" />
                      <p className="mt-2 text-xs font-black">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="rounded-3xl border border-navy-100 bg-white/80 p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-brand-600" />
                  <h3 className="mt-4 text-base font-black text-navy-950">{item.label}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-navy-550">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="document-tools" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-18">
          <div className="grid gap-7 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_24px_80px_rgba(31,49,82,0.08)] md:p-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">What can you do today?</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 md:text-4xl">Document Tools</h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-navy-600 md:text-base">
                The first FreeSeva service is a complete document preparation toolkit for forms, exams,
                job applications and everyday file tasks.
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
                <div key={capability} className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-navy-50/60 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-600" />
                  <span className="text-sm font-black text-navy-800">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="bg-white/65 py-14 md:py-18">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Privacy by default</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 md:text-4xl">Built for trust, not lock-in.</h2>
            </div>
            <div className="space-y-4 text-base font-semibold leading-relaxed text-navy-600">
              <p>Files stay on your device whenever possible, with no mandatory accounts and no unnecessary storage.</p>
              <p>FreeSeva is designed for people who need quick utility tools without giving up control of personal documents.</p>
            </div>
          </div>
        </section>

        <section id="mission" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-18">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Why FreeSeva exists</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 md:text-4xl">
              Useful digital services should be simple, accessible and respectful.
            </h2>
            <p className="mt-5 text-base font-semibold leading-relaxed text-navy-600">
              Many online tools are filled with ads, account walls, upload queues and confusing restrictions.
              FreeSeva exists to provide practical digital services that solve everyday problems online with a
              user-first, privacy-conscious approach.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-18">
          <div className="rounded-[2rem] bg-navy-950 p-7 text-white md:p-10">
            <p className="text-sm font-black text-emerald-300">Ready to get started?</p>
            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <h2 className="max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
                Open Document Tools and prepare your files now.
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
        </section>
      </main>

      <footer className="border-t border-navy-100 bg-white px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm font-semibold text-navy-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-navy-950">freeSeva</p>
            <p className="mt-1">Built with care by Aryan Gupta.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#mission" className="hover:text-brand-700">Mission</a>
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
