import React from 'react';
import { ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy-100/80 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {!isHome && (
              <Link
                to="/"
                className="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors mr-1"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2 select-none group">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-700 to-navy-700 bg-clip-text text-transparent group-hover:from-brand-600 group-hover:to-navy-600 transition-all duration-300 font-display">
                free<span className="text-navy-800 group-hover:text-navy-700">Seva</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded leading-none">
                beta
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Privacy Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-brand-800 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 shadow-sm select-none">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>100% Private: Processed in Browser</span>
            </div>
            
            {/* Mobile Privacy Badge (Icon Only) */}
            <div className="sm:hidden p-1.5 rounded-full text-brand-700 bg-brand-50 border border-brand-100 shadow-sm" title="Processed in your browser securely">
              <ShieldCheck className="h-4 w-4" />
            </div>

            {!isHome && (
              <Link
                to="/"
                className="inline-flex items-center text-xs font-semibold text-navy-600 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 border border-navy-200 px-3 py-1.5 rounded-lg transition-colors gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Home</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
