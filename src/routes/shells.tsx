import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Sparkles } from 'lucide-react';

interface ToolShellProps {
  name: string;
  desc: string;
}

const ToolShell: React.FC<ToolShellProps> = ({ name, desc }) => {
  return (
    <PageLayout title={name} description={desc}>
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-brand-50 text-brand-600 p-4 rounded-full mb-4 animate-bounce">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-navy-800 mb-2">Tool Ready Soon</h2>
        <p className="text-sm text-navy-500 max-w-md mb-6">
          The {name} engine is currently being built in accordance with our phased roadmap. All processing will occur 100% locally in your browser.
        </p>
        <div className="text-xs uppercase tracking-widest font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded">
          Coming in a future Phase
        </div>
      </Card>
    </PageLayout>
  );
};

export const ImageCompressorShell = () => (
  <ToolShell name="Image Compressor" desc="Compress your images to targeted file sizes like 10KB, 20KB, 50KB, or 100KB." />
);

export const SignatureCompressorShell = () => (
  <ToolShell name="Signature Compressor" desc="Specifically optimized algorithm to keep signatures readable and sharp under 10KB/20KB." />
);

export const ImageResizerShell = () => (
  <ToolShell name="Image Resizer" desc="Resize photos to official dimensional parameters or exact pixel/centimeter heights and widths." />
);

export const BackgroundWhiteShell = () => (
  <ToolShell name="White Background Generator" desc="Instantly replace colored or tinted backgrounds with pure white backgrounds for form submittals." />
);

export const ImageConverterShell = () => (
  <ToolShell name="Image Format Converter" desc="Inter-convert image files between JPG, PNG, and WEBP fully client-side." />
);

export const ImageCropperShell = () => (
  <ToolShell name="Image Crop Tool" desc="Interactive crop tool with preconfigured crop overlays for Passport size, Stamp size, and Custom aspect ratios." />
);

export const PdfCompressorShell = () => (
  <ToolShell name="PDF Compressor" desc="Reduce file sizes of PDF uploads by optimizing layouts and compressing images, locally in browser." />
);

export const PdfMergeShell = () => (
  <ToolShell name="Merge PDF" desc="Merge multiple PDF files into one clean document with intuitive drag-and-drop page ordering." />
);

export const PdfSplitShell = () => (
  <ToolShell name="Split PDF" desc="Select individual pages or custom page ranges visually to split a PDF into separate files." />
);

export const ImageToPdfShell = () => (
  <ToolShell name="Images to PDF" desc="Convert multiple photo uploads into a single compiled PDF sheet." />
);

export const GovernmentFormHelperShell = () => (
  <ToolShell name="Government Form Helper" desc="Super-charge your application process. Upload Photo, Signature, and Thumbprint, choose exam type, and get perfectly formatted files in a single ZIP." />
);
