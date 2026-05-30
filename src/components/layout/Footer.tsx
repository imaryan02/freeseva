import React from 'react';
import { ShieldAlert, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10 border-b border-navy-800 pb-10">
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white font-display">
              free<span className="text-brand-400">Seva</span>
            </span>
            <p className="mt-3 text-xs text-navy-400 leading-relaxed max-w-sm">
              An outcome-driven, client-side utility helper designed for students, candidates, and job seekers in India. Format your passport photo, signatures, thumb impressions, and PDFs in seconds.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Security Guarantee
            </h3>
            <ul className="space-y-2.5 text-xs text-navy-400">
              <li className="flex gap-2">
                <ShieldAlert className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <span><strong>No Uploads:</strong> Files never leave your browser. They are loaded in memory and handled 100% locally.</span>
              </li>
              <li className="flex gap-2">
                <Zap className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <span><strong>Fast Processing:</strong> Uses multi-thread browser canvas rendering to deliver downloads in under 3 seconds.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Popular Utilities
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-navy-400">
              <Link to="/image-compressor" className="hover:text-white transition-colors">Image Compressor</Link>
              <Link to="/signature-compressor" className="hover:text-white transition-colors">Signature Tool</Link>
              <Link to="/image-resizer" className="hover:text-white transition-colors">Image Resizer</Link>
              <Link to="/white-background" className="hover:text-white transition-colors">White Background</Link>
              <Link to="/pdf-compressor" className="hover:text-white transition-colors">PDF Compressor</Link>
              <Link to="/form-helper" className="hover:text-brand-400 text-brand-500 font-semibold transition-colors">Form Helper</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-navy-500">
          <div className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            <span>Built 100% serverless. Proudly private.</span>
          </div>
          <div>
            &copy; {currentYear} freeSeva. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
