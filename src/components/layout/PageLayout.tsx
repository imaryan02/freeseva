import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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
  useEffect(() => {
    // Dynamically update document title for SEO and browser tab text
    document.title = seoTitle || `${title ? `${title} | ` : ''}freeSeva - 100% Free Form Assistant`;
    window.scrollTo(0, 0);
  }, [title, seoTitle]);

  return (
    <div className="flex flex-col min-h-screen bg-navy-50/50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {(title || description) && (
          <div className="text-center md:text-left mb-8 max-w-3xl">
            {title && (
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy-950 font-display">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-navy-500 font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
