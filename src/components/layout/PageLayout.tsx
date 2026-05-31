import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import sidebarLockImg from '../../assets/sidebar_lock.png';
import {
  ArrowLeft,
  Download,
  FileText,
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

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  seoTitle,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = seoTitle || `${title ? `${title} | ` : ''}freeSeva - 100% Free Form Assistant`;
    window.scrollTo(0, 0);
  }, [title, seoTitle]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <HomeIcon className="h-4.5 w-4.5" /> },
    { name: 'All Tools', path: '/#tools-grid', icon: <Grid className="h-4.5 w-4.5" /> },
    { name: 'All-in-One', path: '/form-helper', icon: <Sparkles className="h-4.5 w-4.5 text-violet-500" /> },
    { name: 'Use Cases', path: '#use-cases', icon: <FileText className="h-4.5 w-4.5" />, isPlaceholder: true, badge: 'Soon' },
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
    <Link to="/" className="flex items-center gap-1 group" onClick={() => setIsMobileMenuOpen(false)}>
      <span className="text-2xl font-black tracking-tight text-brand-600 font-display">
        free<span className="text-navy-850">Seva</span>
      </span>
      <Plus className="h-4 w-4 text-brand-600 stroke-[3.5]" />
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
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm select-none group">
          <div className="absolute top-0 right-0 translate-x-3 -translate-y-3 w-16 h-16 bg-brand-100/50 rounded-full blur-lg pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="relative h-14 w-14 flex items-center justify-center mb-3 animate-float-fast drop-shadow-sm select-none pointer-events-none">
            <img src={sidebarLockImg} alt="Secure local processing" className="w-full h-full object-contain" />
          </div>
          <h4 className="text-[11px] font-extrabold text-navy-850 uppercase tracking-wide">100% Private</h4>
          <p className="text-[10px] text-navy-450 mt-1 font-semibold leading-relaxed">
            Files stay on your device. No login, no upload queue, no tracking.
          </p>
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
        <header className="sticky top-0 z-30 bg-white/65 backdrop-blur-xl border-b border-navy-100/60 py-3.5 px-4 sm:px-6 lg:px-8 select-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-navy-600 hover:text-navy-900 hover:bg-navy-100 transition-all active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-1.5 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors border border-navy-150 flex items-center gap-1 text-[10px] font-bold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>100% Private - Browser Local</span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
            {renderLogo()}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Install freeSeva from your browser menu with Add to Home Screen.')}
              className="hidden sm:flex px-4 py-2 text-[10px] font-black tracking-wide text-navy-700 bg-white border border-navy-200 rounded-full hover:bg-navy-50 active:scale-95 transition-all items-center gap-2 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Add to Home Screen</span>
            </button>

            <button
              onClick={() => showToast('Login is not required. Files stay on your device and tools run in the browser.')}
              className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-95"
              title="Privacy"
              aria-label="Privacy details"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>
          </div>
        </header>

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
        </main>
      </div>
    </div>
  );
};
