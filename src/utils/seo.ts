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
  howToSteps: string[];
  relatedTools: string[];
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
    title: 'FreeSeva - Free Digital Services For Everyone',
    description:
      'FreeSeva is a community initiative offering free digital services for students, professionals and everyone, starting with privacy-first PDF, image and signature tools.',
    h1: 'Free digital services for everyone',
    keywords: [
      'free digital services',
      'free online tools',
      'freeSeva',
      'privacy first tools',
      'document utilities',
      'made in india tools',
      'free tools for students',
      'free tools for professionals',
    ],
    summary:
      'FreeSeva is a community-focused initiative that provides free, privacy-first digital services for students, professionals and everyday users, starting with document preparation tools.',
    useCases: [
      'Use free digital tools for exam, job, admission and document tasks.',
      'Access privacy-first utilities for PDFs, photos and signatures.',
      'Start with Document Tools today and use more FreeSeva products as they are added.',
    ],
    howToSteps: [
      'Open the Document Tools section.',
      'Choose the PDF, image, signature or all-in-one tool you need.',
      'Process your file locally in the browser and download the result.',
    ],
    relatedTools: ['Document Tools', 'PDF Compressor', 'Image Compressor', 'Signature Compressor'],
    faqs: [
      commonPrivacyFaq,
      {
        question: 'What is FreeSeva?',
        answer:
          'FreeSeva is a community initiative that provides free digital services for students, professionals and everyday users.',
      },
      {
        question: 'Which product is available today?',
        answer:
          'Document Tools is available today, including PDF compression, image compression, signature preparation and the All-in-One Workspace.',
      },
      {
        question: 'Will FreeSeva add more tools?',
        answer:
          'Yes. FreeSeva will keep adding useful free product tools over time, focused on real needs in education, work and everyday digital tasks.',
      },
    ],
  },
  '/document-tools': {
    path: '/document-tools',
    title: 'Free Document Tools - PDF Compressor, Image Compressor and Signature Tool',
    description:
      'Use free browser-local document tools to compress PDFs, compress images, resize photos, convert images to PDF, prepare signatures, merge PDFs and split PDFs for Indian exam, job and government forms.',
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
    howToSteps: [
      'Choose the document tool that matches your task.',
      'Upload or drop your PDF, image or signature file.',
      'Set size, format or page options if needed.',
      'Download the compressed, converted or form-ready file.',
    ],
    relatedTools: ['PDF Compressor', 'Image Compressor', 'Signature Compressor', 'Image to PDF'],
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
    title: 'Image Compressor - Compress JPG, PNG, WEBP Online',
    description:
      'Compress JPG, PNG and WEBP images online to exact KB targets for forms. Reduce photos to 20KB, 50KB, 100KB or custom size locally in your browser.',
    h1: 'Image Compressor',
    keywords: ['image compressor', 'compress image to 50kb', 'compress jpg', 'compress png', 'compress webp', 'photo size reducer', 'compress image to 20kb', 'compress image to 100kb'],
    summary:
      'Use the image compressor to reduce photo size for online forms while keeping control over target KB limits, output names and formats.',
    useCases: [
      'Compress passport photos for government forms.',
      'Reduce JPG or PNG images to exact upload limits.',
      'Batch compress multiple images and download a ZIP.',
    ],
    howToSteps: [
      'Upload JPG, PNG or WEBP images.',
      'Enter a target size such as 20KB, 50KB, 100KB or a custom limit.',
      'Compress the image locally in your browser.',
      'Download the optimized image or ZIP file.',
    ],
    relatedTools: ['Image Resizer', 'Image Crop Tool', 'White Background', 'Images to PDF'],
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
    title: 'Signature Compressor - Compress Signature to 10KB or 20KB',
    description:
      'Compress scanned signatures for forms. Clean background noise, sharpen ink and reduce signature size below 10KB, 20KB or custom limits in your browser.',
    h1: 'Signature Compressor',
    keywords: ['signature compressor', 'compress signature to 20kb', 'compress signature to 10kb', 'signature under 10kb', 'signature under 20kb', 'scan signature compressor', 'signature size reducer'],
    summary:
      'Prepare clean, form-ready signatures by reducing file size while preserving readable ink strokes and removing scanner noise.',
    useCases: [
      'Compress signature under 20KB for exam forms.',
      'Reduce signature under 10KB for job applications.',
      'Clean scanned signature background before upload.',
    ],
    howToSteps: [
      'Upload your scanned signature image.',
      'Choose a common target such as 10KB, 20KB or a custom size.',
      'Let FreeSeva clean and compress the signature.',
      'Download the form-ready signature file.',
    ],
    relatedTools: ['Image Compressor', 'Image Resizer', 'White Background', 'All-in-One Workspace'],
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
    title: 'Image Resizer - Resize Photo in Pixels, CM or MM',
    description:
      'Resize images online for application forms. Set exact pixels, centimeters or millimeters and download form-ready photos locally.',
    h1: 'Image Resizer',
    keywords: ['image resizer', 'resize photo online', 'resize image in cm', 'resize image in mm', 'passport photo resizer', 'resize photo for form', 'resize image pixels'],
    summary:
      'Resize photos by dimensions for portals that require exact width, height, pixel, centimeter or millimeter limits.',
    useCases: [
      'Resize passport photos to portal specifications.',
      'Set exact pixel dimensions for upload forms.',
      'Batch resize photos and download as a ZIP.',
    ],
    howToSteps: [
      'Upload the photo or image you want to resize.',
      'Choose pixels, centimeters or millimeters.',
      'Enter the required width and height for your form.',
      'Download the resized image.',
    ],
    relatedTools: ['Image Compressor', 'Image Crop Tool', 'White Background', 'Signature Compressor'],
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
    title: 'Image Crop Tool - Crop Photo Online for Forms',
    description:
      'Crop photos online for passport, square and custom form sizes. Prepare images locally with a visual crop overlay.',
    h1: 'Image Crop Tool',
    keywords: ['image crop tool', 'crop passport photo', 'crop image online', 'photo cropper for forms', 'crop photo for exam form', 'passport photo cropper'],
    summary:
      'Crop scanned photos and profile images into upload-ready sizes for forms, applications and documents.',
    useCases: ['Crop passport photos.', 'Create square profile photos.', 'Crop custom dimensions for portals.'],
    howToSteps: [
      'Upload your photo.',
      'Select passport, square or custom crop dimensions.',
      'Adjust the crop area visually.',
      'Download the cropped image.',
    ],
    relatedTools: ['Image Resizer', 'Image Compressor', 'White Background', 'Signature Compressor'],
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
    title: 'White Background Photo Tool - Make Photo Background White',
    description:
      'Remove image background and replace it with solid white for forms, IDs and profile photos. Runs locally in your browser.',
    h1: 'White Background Photo Tool',
    keywords: ['white background photo', 'remove background', 'photo white background', 'passport photo white background', 'make background white', 'id photo white background'],
    summary:
      'Create form-friendly white background photos from images using local browser processing.',
    useCases: ['Make ID photos white background.', 'Prepare profile photos for forms.', 'Clean photo background before upload.'],
    howToSteps: [
      'Upload the photo that needs a white background.',
      'Let FreeSeva remove or clean the existing background.',
      'Preview the white background result.',
      'Download the form-ready image.',
    ],
    relatedTools: ['Image Compressor', 'Image Resizer', 'Image Crop Tool', 'Signature Compressor'],
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
    title: 'Image Converter - Convert JPG, PNG and WEBP Online',
    description:
      'Convert images between JPG, PNG and WEBP formats online. Browser-local image conversion for form uploads and documents.',
    h1: 'Image Converter',
    keywords: ['image converter', 'jpg to png', 'png to jpg', 'webp to jpg', 'jpg to webp', 'convert image online'],
    summary:
      'Convert image formats quickly when a portal accepts only a specific file type.',
    useCases: ['Convert PNG to JPG.', 'Convert WEBP to JPG.', 'Convert images for upload forms.'],
    howToSteps: [
      'Upload the image you want to convert.',
      'Select the required output format.',
      'Convert the file in your browser.',
      'Download the converted image.',
    ],
    relatedTools: ['Image Compressor', 'Image Resizer', 'Images to PDF', 'White Background'],
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
    title: 'Compress PDF Online - Free PDF Compressor',
    description:
      'Compress PDF files online for forms and applications. Reduce PDFs to 100KB, 200KB, 300KB or custom size locally without uploading.',
    h1: 'Compress PDF Online',
    keywords: ['pdf compressor', 'compress pdf online', 'compress pdf to 100kb', 'compress pdf to 200kb', 'compress pdf to 300kb', 'reduce pdf size', 'pdf size reducer', 'free pdf compressor'],
    summary:
      'Reduce PDF file size for portals with strict upload limits while keeping files private in the browser.',
    useCases: [
      'Compress PDF under 100KB.',
      'Compress PDF under 200KB or 300KB.',
      'Batch compress multiple PDFs and download a ZIP.',
    ],
    howToSteps: [
      'Upload or drop your PDF file.',
      'Choose a target size such as 100KB, 200KB, 300KB or a custom limit.',
      'Compress the PDF locally in your browser.',
      'Download the reduced-size PDF file.',
    ],
    relatedTools: ['Merge PDF', 'Split PDF', 'Images to PDF', 'All-in-One Workspace'],
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
    title: 'Merge PDF Online - Free PDF Merger',
    description:
      'Merge multiple PDF files into one document online. Combine certificates, forms and documents locally in your browser.',
    h1: 'Merge PDF Online',
    keywords: ['merge pdf', 'pdf merger', 'combine pdf', 'join pdf files', 'merge pdf online', 'combine pdf online'],
    summary: 'Combine multiple PDF documents into a single upload-ready file without sending files to a server.',
    useCases: ['Merge certificates.', 'Combine form documents.', 'Join multiple PDFs into one file.'],
    howToSteps: [
      'Upload the PDF files you want to merge.',
      'Arrange them in the correct order.',
      'Combine the PDFs into one document.',
      'Download the merged PDF file.',
    ],
    relatedTools: ['PDF Compressor', 'Split PDF', 'Images to PDF', 'All-in-One Workspace'],
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
    title: 'Split PDF Online - Free PDF Splitter',
    description:
      'Split PDF files online by pages or ranges. Extract selected PDF pages locally in your browser.',
    h1: 'Split PDF Online',
    keywords: ['split pdf', 'pdf splitter', 'extract pdf pages', 'separate pdf pages', 'split pdf online', 'pdf page extractor'],
    summary: 'Extract pages from PDFs for portals that require only selected pages or individual documents.',
    useCases: ['Extract PDF pages.', 'Split PDF by range.', 'Separate documents from one PDF.'],
    howToSteps: [
      'Upload the PDF you want to split.',
      'Choose pages or page ranges to extract.',
      'Split the PDF in your browser.',
      'Download the separated PDF output.',
    ],
    relatedTools: ['PDF Compressor', 'Merge PDF', 'Images to PDF', 'All-in-One Workspace'],
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
    title: 'Image to PDF Converter - Convert JPG, PNG to PDF',
    description:
      'Convert JPG, PNG and WEBP images to PDF online. Create a single PDF from photos, scanned sheets and documents locally.',
    h1: 'Image to PDF Converter',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'convert images to pdf', 'images to pdf', 'jpg png to pdf'],
    summary:
      'Create PDFs from photos or scanned images with page size, margin and orientation controls.',
    useCases: ['Convert JPG to PDF.', 'Convert multiple photos into one PDF.', 'Create PDF from scanned document photos.'],
    howToSteps: [
      'Upload one or more JPG, PNG or WEBP images.',
      'Arrange image order and choose page settings.',
      'Convert the images into one PDF.',
      'Download the PDF document.',
    ],
    relatedTools: ['PDF Compressor', 'Merge PDF', 'Image Compressor', 'Image Converter'],
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
    h1: 'All-in-One Form Helper',
    keywords: ['form helper', 'document tools', 'photo signature pdf compressor', 'government form helper', 'job form documents', 'exam form document helper', 'photo signature pdf tools'],
    summary:
      'The all-in-one workspace prepares multiple file types in one batch for application forms, exam portals and job portals.',
    useCases: [
      'Prepare photo, signature and PDF files together.',
      'Set custom KB limits for each file.',
      'Download a complete ZIP package for form submission.',
    ],
    howToSteps: [
      'Upload photos, signatures and PDFs together.',
      'Set target sizes for each file type.',
      'Process the full document batch in one workspace.',
      'Download a ready-to-upload ZIP package.',
    ],
    relatedTools: ['PDF Compressor', 'Image Compressor', 'Signature Compressor', 'Images to PDF'],
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
  return 'https://www.freeseva.org';
};
