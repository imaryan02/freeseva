import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { getSeoPage, getSiteOrigin } from '../../utils/seo';
import {
  ArrowLeft,
  Download,
  Grid,
  Home as HomeIcon,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  seoTitle?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  seoTitle,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const seoPage = getSeoPage(location.pathname);
  const pageTitle = seoTitle || seoPage.title || `${title ? `${title} | ` : ''}freeSeva - 100% Free Form Assistant`;
  const pageDescription = seoPage.description || description || 'Free privacy-first browser tools to prepare images, signatures and PDFs for forms.';
  const canonicalUrl = `${getSiteOrigin()}${seoPage.path}`;
  const shareImageUrl = `${getSiteOrigin()}/freeseva.png`;

  useEffect(() => {
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    document.title = pageTitle;
    setMeta('description', pageDescription);
    setMeta('keywords', seoPage.keywords.join(', '));
    setMeta('robots', 'index, follow, max-image-preview:large');
    setMeta('og:title', pageTitle, 'property');
    setMeta('og:description', pageDescription, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:site_name', 'freeSeva', 'property');
    setMeta('og:image', shareImageUrl, 'property');
    setMeta('og:image:secure_url', shareImageUrl, 'property');
    setMeta('og:image:type', 'image/png', 'property');
    setMeta('og:image:width', '1254', 'property');
    setMeta('og:image:height', '1254', 'property');
    setMeta('og:image:alt', 'freeSeva free PDF, image and signature tools', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDescription);
    setMeta('twitter:image', shareImageUrl);
    setLink('canonical', canonicalUrl);

    document.head.querySelectorAll('script[data-freeseva-schema="true"]').forEach((node) => node.remove());

    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${getSiteOrigin()}/#organization`,
          name: 'freeSeva',
          url: getSiteOrigin(),
          founder: {
            '@type': 'Person',
            name: 'Aryan Gupta',
            sameAs: 'https://www.linkedin.com/in/imaryan02/',
          },
          image: shareImageUrl,
        },
        {
          '@type': 'WebSite',
          '@id': `${getSiteOrigin()}/#website`,
          name: 'freeSeva',
          url: getSiteOrigin(),
          description: 'Free browser-local PDF, image and signature tools for forms, exams and job portals.',
          publisher: { '@id': `${getSiteOrigin()}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${getSiteOrigin()}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'WebApplication',
          '@id': `${canonicalUrl}#webapp`,
          name: seoPage.h1,
          url: canonicalUrl,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          description: pageDescription,
          image: shareImageUrl,
          browserRequirements: 'Requires JavaScript and a modern browser.',
          featureList: seoPage.useCases,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${getSiteOrigin()}/`,
            },
            ...(seoPage.path === '/'
              ? []
              : [
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: seoPage.h1,
                    item: canonicalUrl,
                  },
                ]),
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: seoPage.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
        {
          '@type': 'HowTo',
          name: `How to use ${seoPage.h1}`,
          description: pageDescription,
          step: seoPage.howToSteps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            text: step,
          })),
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.freesevaSchema = 'true';
    script.textContent = JSON.stringify(schemaGraph);
    document.head.appendChild(script);

    window.scrollTo(0, 0);
  }, [canonicalUrl, pageDescription, pageTitle, seoPage, shareImageUrl]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInstallClick = async () => {
    if (!installPrompt) {
      showToast('Install from your browser menu: open menu (...) and choose Add to Home Screen or Install app.');
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    showToast(
      choice.outcome === 'accepted'
        ? 'freeSeva is being added to your home screen.'
        : 'Install cancelled. You can add freeSeva later from the browser menu.'
    );
  };

  const navItems: Array<{
    name: string;
    path: string;
    icon: React.ReactNode;
    isPlaceholder?: boolean;
    badge?: string;
  }> = [
    { name: 'Home', path: '/', icon: <HomeIcon className="h-4.5 w-4.5" /> },
    { name: 'Document Tools', path: '/document-tools', icon: <Grid className="h-4.5 w-4.5" /> },
    { name: 'All-in-One', path: '/form-helper', icon: <Sparkles className="h-4.5 w-4.5 text-violet-500" /> },
  ];

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.isPlaceholder) {
      e.preventDefault();
      showToast(`${item.name} is coming soon. Core tools are ready and stay fully local.`);
      return;
    }

    if (item.path.startsWith('/#')) {
      setIsMobileMenuOpen(false);
      const id = item.path.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsMobileMenuOpen(false);
  };

  const renderLogo = () => (
    <Link to="/" className="flex min-w-0 items-center gap-1 group" onClick={() => setIsMobileMenuOpen(false)}>
      <span className="text-xl min-[380px]:text-2xl font-black tracking-tight text-brand-600 font-display leading-none">
        free<span className="text-navy-850">Seva</span>
      </span>
      <Plus className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4 text-brand-600 stroke-[3.5] flex-shrink-0" />
    </Link>
  );

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-white/85 select-none">
      <div className="flex items-center gap-1.5 px-6 py-6">
        {renderLogo()}
      </div>

      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path.startsWith('/#') && location.pathname === '/');

          return (
            <Link
              to={item.isPlaceholder ? '#' : item.path}
              key={item.name}
              onClick={(e) => handleNavClick(item, e)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-semibold text-xs border ${
                isActive
                  ? 'bg-emerald-500/8 border-brand-100 text-brand-750 font-bold shadow-sm shadow-emerald-100/50'
                  : 'text-navy-500 border-transparent hover:bg-white hover:text-navy-900 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-brand-600' : 'text-navy-450'}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[8px] tracking-wider uppercase font-extrabold bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full text-brand-750">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,#ffffff_0%,#effdf6_100%)] p-4 text-center shadow-sm select-none group">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-300/25 blur-2xl transition-transform group-hover:scale-110" />
          <div className="absolute -bottom-10 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full bg-sky-200/25 blur-2xl" />
          <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-sky-500 opacity-15 blur-md" />
            <div className="absolute h-13 w-13 rotate-[-8deg] rounded-2xl border border-emerald-200 bg-white shadow-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="absolute -right-1 bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-300 text-[9px] font-black text-emerald-950">
              OK
            </span>
          </div>
          <h4 className="relative text-[12px] font-black text-navy-950 uppercase tracking-wide">100% Private</h4>
          <p className="relative mx-auto mt-1 max-w-38 text-[10px] text-navy-500 font-bold leading-relaxed">
            Browser-only tools. Files never leave your device.
          </p>
          <div className="relative mt-3 flex justify-center gap-1.5">
            {['Local', 'No login'].map((item) => (
              <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,#f1e8ff_0,#f7fbff_32%,#ffffff_72%)] font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-9999 bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-navy-800 animate-fadeIn max-w-sm">
          <ShieldCheck className="h-4.5 w-4.5 text-brand-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 border-r border-navy-100/70 bg-white/80 backdrop-blur-xl z-40 select-none">
        {renderSidebarContent()}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-999 flex lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs transition-opacity duration-300 ease-out"
          />
          <div className="relative w-64 max-w-xs h-full bg-white flex flex-col shadow-2xl animate-fadeIn">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-white/65 backdrop-blur-xl border-b border-navy-100/60 py-3.5 px-3 sm:px-6 lg:px-8 select-none lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-navy-600 hover:text-navy-900 hover:bg-navy-100 transition-all active:scale-95 flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {location.pathname !== '/document-tools' && (
              <Link
                to="/document-tools"
                className="p-1.5 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors border border-navy-150 flex items-center gap-1 text-[10px] font-bold flex-shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden min-[390px]:inline">Dashboard</span>
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>100% Private - Browser Local</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-navy-100 text-navy-700 text-[10px] font-extrabold rounded-full shadow-sm">
              <span>Made in India</span>
              <span aria-label="India flag" role="img">🇮🇳</span>
            </div>
          </div>

          <div className="flex min-w-0 justify-center overflow-hidden lg:hidden">
            {renderLogo()}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-navy-100 bg-white px-2 py-1 shadow-sm">
              <span className="pl-2 text-[10px] font-black text-navy-600">
                Developed by <span className="text-navy-950">Aryan</span>
              </span>
              <a
                href="https://www.linkedin.com/in/imaryan02/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#0a66c2] px-3 py-1.5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#084f96] active:scale-95"
              >
                LinkedIn
              </a>
            </div>

            <button
              onClick={handleInstallClick}
              className="hidden sm:flex px-4 py-2 text-[10px] font-black tracking-wide text-navy-700 bg-white border border-navy-200 rounded-full hover:bg-navy-50 active:scale-95 transition-all items-center gap-2 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{installPrompt ? 'Install App' : 'Add to Home Screen'}</span>
            </button>

            <button
              onClick={() => showToast('Login is not required. Files stay on your device and tools run in the browser.')}
              className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-95 flex-shrink-0"
              title="Privacy"
              aria-label="Privacy details"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 border-b border-navy-100/60 bg-white/55 px-3 sm:px-4 py-2 backdrop-blur-xl xl:hidden">
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-navy-700 shadow-sm ring-1 ring-navy-100">
            Made in India 🇮🇳
          </span>
          <span className="hidden min-[360px]:inline text-[10px] font-black text-navy-500">
            Developed by <span className="text-navy-950">Aryan</span>
          </span>
          <a
            href="https://www.linkedin.com/in/imaryan02/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#0a66c2] px-3 py-1 text-[10px] font-black text-white shadow-sm transition hover:bg-[#084f96] active:scale-95"
          >
            LinkedIn
          </a>
        </div>

        <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
          {(title || description) && (
            <div className="mb-8 border-b border-navy-100 pb-4 select-none">
              {title && (
                <h1 className="text-xl md:text-2xl font-black text-navy-950 font-display tracking-tight flex items-center gap-1.5">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-xs text-navy-500 font-semibold leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="animate-fadeIn">{children}</div>

          <section className="mt-10 rounded-3xl border border-navy-100 bg-white/75 p-5 shadow-sm backdrop-blur md:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-700">
                  Tool guide
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-950">
                  {seoPage.h1}
                </h2>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-navy-600">
                  {seoPage.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {seoPage.keywords.slice(0, 6).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-navy-50/70 p-4">
                <h3 className="text-sm font-black text-navy-950">Common use cases</h3>
                <ul className="mt-3 space-y-2">
                  {seoPage.useCases.map((useCase) => (
                    <li key={useCase} className="flex gap-2 text-xs font-semibold leading-relaxed text-navy-600">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-navy-100 bg-white p-4">
                <h3 className="text-sm font-black text-navy-950">How to use this tool</h3>
                <ol className="mt-3 space-y-2">
                  {seoPage.howToSteps.map((step, index) => (
                    <li key={step} className="flex gap-2 text-xs font-semibold leading-relaxed text-navy-600">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-black text-brand-700">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-navy-50/70 p-4">
                <h3 className="text-sm font-black text-navy-950">Related tools</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seoPage.relatedTools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-white bg-white px-3 py-1.5 text-[10px] font-black text-navy-700 shadow-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {seoPage.faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-navy-100 bg-white p-4">
                  <h3 className="text-xs font-black leading-snug text-navy-950">{faq.question}</h3>
                  <p className="mt-2 text-[11px] font-semibold leading-relaxed text-navy-500">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};
