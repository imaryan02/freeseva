export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  summary: string;
  useCases: string[];
  faqs: SeoFaq[];
}

const commonPrivacyFaq: SeoFaq = {
  question: 'Are my files uploaded to a server?',
  answer:
    'No. freeSeva processes files in your browser so photos, signatures and PDFs stay on your device.',
};

export const SEO_PAGES: Record<string, SeoPage> = {
  '/': {
    path: '/',
    title: 'freeSeva - Free PDF, Image and Signature Tools for Forms',
    description:
      'Use free browser-local tools to compress PDFs, compress images, resize photos, convert images to PDF, prepare signatures, merge PDFs and split PDFs for Indian exam, job and government forms.',
    h1: 'Free online PDF, image and signature tools',
    keywords: [
      'free pdf compressor',
      'image compressor',
      'signature compressor',
      'image to pdf',
      'pdf merge',
      'pdf split',
      'government form photo resize',
      'exam form signature compressor',
    ],
    summary:
      'freeSeva is a privacy-first utility toolkit for students, job seekers and applicants who need form-ready photos, signatures and PDFs without uploading files to a server.',
    useCases: [
      'Compress PDF files for job portals and exam forms.',
      'Compress photos to 20KB, 50KB, 100KB or custom limits.',
      'Prepare signatures under common upload limits such as 10KB and 20KB.',
      'Convert JPG, PNG and WEBP images into PDF documents.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Is freeSeva free to use?',
        answer: 'Yes. The tools are free and designed for quick browser-based document preparation.',
      },
      {
        question: 'Which form tools are available?',
        answer:
          'freeSeva includes PDF compressor, image compressor, signature compressor, image resizer, image to PDF, PDF merge, PDF split, image converter, crop tool and white background tools.',
      },
    ],
  },
  '/image-compressor': {
    path: '/image-compressor',
    title: 'Free Image Compressor Online - Compress JPG, PNG, WEBP',
    description:
      'Compress JPG, PNG and WEBP images online to exact KB targets for forms. Reduce photos to 20KB, 50KB, 100KB or custom size locally in your browser.',
    h1: 'Free image compressor for JPG, PNG and WEBP',
    keywords: ['image compressor', 'compress image to 50kb', 'compress jpg', 'compress png', 'photo size reducer'],
    summary:
      'Use the image compressor to reduce photo size for online forms while keeping control over target KB limits, output names and formats.',
    useCases: [
      'Compress passport photos for government forms.',
      'Reduce JPG or PNG images to exact upload limits.',
      'Batch compress multiple images and download a ZIP.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I compress an image to 50KB?',
        answer: 'Yes. Set a single target or range such as 20KB to 50KB before compressing.',
      },
      {
        question: 'Which image formats are supported?',
        answer: 'The tool supports common image formats including JPG, JPEG, PNG and WEBP.',
      },
    ],
  },
  '/signature-compressor': {
    path: '/signature-compressor',
    title: 'Free Signature Compressor - Compress Signature to 10KB or 20KB',
    description:
      'Compress scanned signatures for forms. Clean background noise, sharpen ink and reduce signature size below 10KB, 20KB or custom limits in your browser.',
    h1: 'Free signature compressor for exam and job forms',
    keywords: ['signature compressor', 'compress signature to 20kb', 'signature under 10kb', 'scan signature compressor'],
    summary:
      'Prepare clean, form-ready signatures by reducing file size while preserving readable ink strokes and removing scanner noise.',
    useCases: [
      'Compress signature under 20KB for exam forms.',
      'Reduce signature under 10KB for job applications.',
      'Clean scanned signature background before upload.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I compress a signature below 20KB?',
        answer: 'Yes. The signature compressor is built for common limits such as 10KB and 20KB.',
      },
      {
        question: 'Will the signature remain readable?',
        answer: 'The tool attempts to preserve ink clarity while reducing file size for upload limits.',
      },
    ],
  },
  '/image-resizer': {
    path: '/image-resizer',
    title: 'Free Image Resizer - Resize Photo in Pixels, CM or MM',
    description:
      'Resize images online for application forms. Set exact pixels, centimeters or millimeters and download form-ready photos locally.',
    h1: 'Free image resizer for form photos',
    keywords: ['image resizer', 'resize photo online', 'resize image in cm', 'resize image in mm', 'passport photo resizer'],
    summary:
      'Resize photos by dimensions for portals that require exact width, height, pixel, centimeter or millimeter limits.',
    useCases: [
      'Resize passport photos to portal specifications.',
      'Set exact pixel dimensions for upload forms.',
      'Batch resize photos and download as a ZIP.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I resize images by pixels?',
        answer: 'Yes. You can set exact pixel dimensions and export the resized image.',
      },
      {
        question: 'Can I resize photos in centimeters or millimeters?',
        answer: 'Yes. The tool supports physical dimensions for form photo requirements.',
      },
    ],
  },
  '/image-cropper': {
    path: '/image-cropper',
    title: 'Free Image Crop Tool - Crop Photo for Forms',
    description:
      'Crop photos online for passport, square and custom form sizes. Prepare images locally with a visual crop overlay.',
    h1: 'Free image crop tool for passport and form photos',
    keywords: ['image crop tool', 'crop passport photo', 'crop image online', 'photo cropper for forms'],
    summary:
      'Crop scanned photos and profile images into upload-ready sizes for forms, applications and documents.',
    useCases: ['Crop passport photos.', 'Create square profile photos.', 'Crop custom dimensions for portals.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I crop passport size photos?',
        answer: 'Yes. Use the visual crop overlay to prepare passport or custom photo sizes.',
      },
    ],
  },
  '/white-background': {
    path: '/white-background',
    title: 'Free White Background Tool - Remove Background from Photo',
    description:
      'Remove image background and replace it with solid white for forms, IDs and profile photos. Runs locally in your browser.',
    h1: 'Free white background photo tool',
    keywords: ['white background photo', 'remove background', 'photo white background', 'passport photo white background'],
    summary:
      'Create form-friendly white background photos from images using local browser processing.',
    useCases: ['Make ID photos white background.', 'Prepare profile photos for forms.', 'Clean photo background before upload.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I make a photo background white?',
        answer: 'Yes. The tool removes the background and replaces it with solid white.',
      },
    ],
  },
  '/image-converter': {
    path: '/image-converter',
    title: 'Free Image Converter - Convert JPG, PNG and WEBP',
    description:
      'Convert images between JPG, PNG and WEBP formats online. Browser-local image conversion for form uploads and documents.',
    h1: 'Free JPG, PNG and WEBP image converter',
    keywords: ['image converter', 'jpg to png', 'png to jpg', 'webp to jpg', 'convert image online'],
    summary:
      'Convert image formats quickly when a portal accepts only a specific file type.',
    useCases: ['Convert PNG to JPG.', 'Convert WEBP to JPG.', 'Convert images for upload forms.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I convert WEBP to JPG?',
        answer: 'Yes. The image converter supports common conversions between WEBP, JPG and PNG.',
      },
    ],
  },
  '/pdf-compressor': {
    path: '/pdf-compressor',
    title: 'Free PDF Compressor Online - Compress PDF to 100KB, 200KB, 300KB',
    description:
      'Compress PDF files online for forms and applications. Reduce PDFs to 100KB, 200KB, 300KB or custom size locally without uploading.',
    h1: 'Free PDF compressor for form uploads',
    keywords: ['pdf compressor', 'compress pdf online', 'compress pdf to 100kb', 'compress pdf to 200kb', 'reduce pdf size'],
    summary:
      'Reduce PDF file size for portals with strict upload limits while keeping files private in the browser.',
    useCases: [
      'Compress PDF under 100KB.',
      'Compress PDF under 200KB or 300KB.',
      'Batch compress multiple PDFs and download a ZIP.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I compress a PDF to 100KB?',
        answer: 'Yes. You can set a target limit such as 100KB, 200KB, 300KB or a custom range.',
      },
      {
        question: 'Will my PDF be uploaded?',
        answer: 'No. PDF processing happens locally in your browser.',
      },
    ],
  },
  '/pdf-merge': {
    path: '/pdf-merge',
    title: 'Free PDF Merger - Merge PDF Files Online',
    description:
      'Merge multiple PDF files into one document online. Combine certificates, forms and documents locally in your browser.',
    h1: 'Free PDF merger',
    keywords: ['merge pdf', 'pdf merger', 'combine pdf', 'join pdf files'],
    summary: 'Combine multiple PDF documents into a single upload-ready file without sending files to a server.',
    useCases: ['Merge certificates.', 'Combine form documents.', 'Join multiple PDFs into one file.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I merge multiple PDFs into one?',
        answer: 'Yes. Upload multiple PDFs, arrange them and download one merged file.',
      },
    ],
  },
  '/pdf-split': {
    path: '/pdf-split',
    title: 'Free PDF Splitter - Split PDF Pages Online',
    description:
      'Split PDF files online by pages or ranges. Extract selected PDF pages locally in your browser.',
    h1: 'Free PDF splitter',
    keywords: ['split pdf', 'pdf splitter', 'extract pdf pages', 'separate pdf pages'],
    summary: 'Extract pages from PDFs for portals that require only selected pages or individual documents.',
    useCases: ['Extract PDF pages.', 'Split PDF by range.', 'Separate documents from one PDF.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I extract selected PDF pages?',
        answer: 'Yes. Select page numbers or ranges and download the split PDF output.',
      },
    ],
  },
  '/image-to-pdf': {
    path: '/image-to-pdf',
    title: 'Free Image to PDF Converter - JPG, PNG to PDF',
    description:
      'Convert JPG, PNG and WEBP images to PDF online. Create a single PDF from photos, scanned sheets and documents locally.',
    h1: 'Free image to PDF converter',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'convert images to pdf'],
    summary:
      'Create PDFs from photos or scanned images with page size, margin and orientation controls.',
    useCases: ['Convert JPG to PDF.', 'Convert multiple photos into one PDF.', 'Create PDF from scanned document photos.'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I convert multiple images to one PDF?',
        answer: 'Yes. Add multiple images, reorder them and compile a single PDF.',
      },
    ],
  },
  '/form-helper': {
    path: '/form-helper',
    title: 'All-in-One Form Helper - Prepare Photos, Signatures and PDFs',
    description:
      'Upload photos, signatures and PDFs once, set size targets and download a complete form-ready ZIP package. Free browser-local all-in-one workspace.',
    h1: 'All-in-one form helper workspace',
    keywords: ['form helper', 'document tools', 'photo signature pdf compressor', 'government form helper', 'job form documents'],
    summary:
      'The all-in-one workspace prepares multiple file types in one batch for application forms, exam portals and job portals.',
    useCases: [
      'Prepare photo, signature and PDF files together.',
      'Set custom KB limits for each file.',
      'Download a complete ZIP package for form submission.',
    ],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'Can I prepare photos, signatures and PDFs together?',
        answer: 'Yes. The all-in-one workspace lets you process mixed file types in one batch.',
      },
    ],
  },
};

export const getSeoPage = (path: string): SeoPage => SEO_PAGES[path] || SEO_PAGES['/'];

export const getSiteOrigin = (): string => {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://freeseva.in';
};
