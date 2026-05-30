import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { 
  Image, 
  PenTool, 
  Maximize2, 
  Sparkles, 
  FileDown, 
  Combine, 
  Scissors, 
  FileImage, 
  Award,
  ShieldCheck
} from 'lucide-react';

interface ToolItem {
  name: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  isPrimary?: boolean;
}

export const Home: React.FC = () => {
  const tools: ToolItem[] = [
    {
      name: 'All-in-One Package Workspace',
      desc: 'Master Assistant: Upload photos, signatures, and document PDFs together. Set custom Min/Max targets (KB) to compress or expand everything in one batch and download as a single ZIP.',
      path: '/form-helper',
      icon: <Award className="h-6 w-6 text-brand-600" />,
      badge: 'Highly Recommended',
      isPrimary: true,
    },
    {
      name: 'Image Compressor',
      desc: 'Compress JPG, PNG, or WEBP photos to exact target sizes (10KB, 20KB, 50KB, 100KB, etc.) without losing critical details.',
      path: '/image-compressor',
      icon: <Image className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Signature Compressor',
      desc: 'Optimized compressor designed to flatten, contrast, and downscale your signature to strict limits (under 10KB/20KB).',
      path: '/signature-compressor',
      icon: <PenTool className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Image Resizer',
      desc: 'Resize photos to exact millimeter, centimeter, or pixel dimensions matching administrative guidelines and passport specs.',
      path: '/image-resizer',
      icon: <Maximize2 className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Image Crop Tool',
      desc: 'Interactive visual cropping with helpful aspect ratio helpers (Passport Size, Square, Stamp Size, Freeform).',
      path: '/image-cropper',
      icon: <Scissors className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'White Background Generator',
      desc: 'Remove tinted backgrounds or yellow hues from physical passport scans to generate acceptable pure white backgrounds.',
      path: '/white-background',
      icon: <Sparkles className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Image Converter',
      desc: 'Quickly convert between PNG, JPG, and WEBP formats client-side without uploading to external servers.',
      path: '/image-converter',
      icon: <FileImage className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'PDF Compressor',
      desc: 'Optimize layout structures and compress large document images to stay under portal limit guidelines.',
      path: '/pdf-compressor',
      icon: <FileDown className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Merge PDF',
      desc: 'Combine multiple PDF documents, letters, or certificates into a single consolidated file. Reorder pages visually.',
      path: '/pdf-merge',
      icon: <Combine className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Split PDF',
      desc: 'Extract individual PDF pages, ranges, or split documents easily for neat electronic submission.',
      path: '/pdf-split',
      icon: <Scissors className="h-5 w-5 text-navy-600" />,
    },
    {
      name: 'Images to PDF',
      desc: 'Combine and compile multiple physical sheets or document captures into a single optimized PDF document.',
      path: '/image-to-pdf',
      icon: <FileImage className="h-5 w-5 text-navy-600" />,
    },
  ];

  return (
    <PageLayout seoTitle="freeSeva - 100% Free local document tools for Indian Job/Exam Applications">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-16 max-w-4xl mx-auto flex flex-col items-center">
        {/* Trust Flag */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3.5 py-1.5 rounded-full mb-6 animate-pulse">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <span>Zero Server Uploads &bull; 100% Browser Local</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-navy-950 font-display leading-[1.1] max-w-3xl">
          Make Your Documents <br />
          <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
            Form Ready
          </span> in Seconds
        </h1>
        
        <p className="mt-4 text-base sm:text-lg text-navy-500 max-w-2xl font-medium leading-relaxed">
          Compress, resize, convert and prepare photos, signatures, and PDFs for government exam portals completely free. Done in under 60 seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
          <Link
            to="/form-helper"
            className="inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 px-6 py-3.5 gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/10 hover:shadow-brand-700/20 active:scale-[0.98] text-base"
          >
            <Award className="h-5 w-5" />
            Use All-in-One Package Workspace
          </Link>
          <a
            href="#tools-grid"
            className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-6 py-3.5 gap-2 border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 active:scale-[0.98] text-base"
          >
            Browse Individual Tools
          </a>
        </div>
      </section>

      {/* Trust & Local Processing Panel */}
      <section className="mb-14">
        <div className="bg-navy-950 rounded-2xl text-white p-6 md:p-8 border border-navy-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none translate-x-12 -translate-y-8">
            <ShieldCheck className="h-64 w-64" />
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-2 font-display">
                <ShieldCheck className="h-6 w-6 text-brand-400" />
                Browser-First Privacy Guarantee
              </h2>
              <p className="text-xs text-navy-300 leading-relaxed">
                Most platforms upload your personal documents, certificates, and signatures to remote cloud servers, exposing you to security threats. On <strong>freeSeva</strong>, all compression, resizing, and conversions happen directly on your CPU/GPU inside your browser. No files are ever sent to our servers.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:col-span-2 gap-4">
              <div className="bg-navy-900 border border-navy-800 rounded-xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-brand-400 font-display">100%</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-navy-400 mt-0.5">Secure Offline</div>
              </div>
              <div className="bg-navy-900 border border-navy-800 rounded-xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-brand-400 font-display">0 KB</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-navy-400 mt-0.5">Server Storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid Header */}
      <div id="tools-grid" className="border-b border-navy-100 pb-4 mb-8">
        <h2 className="text-xl md:text-2xl font-black text-navy-900 tracking-tight font-display">
          All Application Tools
        </h2>
        <p className="text-xs text-navy-500 font-semibold mt-0.5">
          Select an outcome-focused tool below to quickly resolve your portal requirements
        </p>
      </div>

      {/* Tool Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {tools.map((tool) => (
          <Link
            to={tool.path}
            key={tool.name}
            className={`group text-left h-full flex flex-col justify-between ${
              tool.isPrimary 
                ? 'md:col-span-2 lg:col-span-3 border-brand-200 bg-brand-50/20 hover:bg-brand-50/40 shadow-sm hover:shadow-md'
                : 'hover:border-navy-200'
            }`}
          >
            <Card 
              hoverEffect 
              className={`h-full flex flex-col justify-between border-navy-100 ${
                tool.isPrimary ? 'bg-transparent border-brand-200 p-6 md:p-8' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${tool.isPrimary ? 'bg-brand-100 text-brand-600' : 'bg-navy-50 text-navy-600'} group-hover:scale-110 transition-transform duration-200`}>
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-100 border border-brand-200 px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>
                
                <h3 className={`font-bold tracking-tight text-navy-900 font-display ${tool.isPrimary ? 'text-lg md:text-xl' : 'text-base'}`}>
                  {tool.name}
                </h3>
                
                <p className={`text-navy-500 font-medium leading-relaxed mt-2 ${tool.isPrimary ? 'text-xs md:text-sm' : 'text-xs'}`}>
                  {tool.desc}
                </p>
              </div>
              
              <div className="mt-5 pt-3 border-t border-navy-100/50 flex justify-end">
                <span className="inline-flex items-center text-xs font-bold text-navy-800 group-hover:text-brand-600 transition-colors">
                  Open Tool &rarr;
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </PageLayout>
  );
};
