import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './routes/Home';
import { Tools } from './routes/Tools';
import { DocumentTools } from './routes/DocumentTools';
import { Spinner } from './components/ui/Spinner';

const ImageCompressor = lazy(() =>
  import('./features/image-compressor/ImageCompressor').then((module) => ({
    default: module.ImageCompressor,
  }))
);
const SignatureCompressor = lazy(() =>
  import('./features/signature-tool/SignatureCompressor').then((module) => ({
    default: module.SignatureCompressor,
  }))
);
const ImageResizer = lazy(() =>
  import('./features/image-resizer/ImageResizer').then((module) => ({
    default: module.ImageResizer,
  }))
);
const ImageCropper = lazy(() =>
  import('./features/image-cropper/ImageCropper').then((module) => ({
    default: module.ImageCropper,
  }))
);
const BackgroundWhite = lazy(() =>
  import('./features/background-tool/BackgroundWhite').then((module) => ({
    default: module.BackgroundWhite,
  }))
);
const ImageConverter = lazy(() =>
  import('./features/image-converter/ImageConverter').then((module) => ({
    default: module.ImageConverter,
  }))
);
const PdfCompressor = lazy(() =>
  import('./features/pdf-compressor/PdfCompressor').then((module) => ({
    default: module.PdfCompressor,
  }))
);
const PdfMerge = lazy(() =>
  import('./features/pdf-merge/PdfMerge').then((module) => ({
    default: module.PdfMerge,
  }))
);
const PdfSplit = lazy(() =>
  import('./features/pdf-split/PdfSplit').then((module) => ({
    default: module.PdfSplit,
  }))
);
const ImageToPdf = lazy(() =>
  import('./features/image-to-pdf/ImageToPdf').then((module) => ({
    default: module.ImageToPdf,
  }))
);
const AllInOneWorkspace = lazy(() =>
  import('./features/all-in-one/AllInOneWorkspace').then((module) => ({
    default: module.AllInOneWorkspace,
  }))
);

const routeFallback = (
  <div className="min-h-screen bg-navy-50/50 flex items-center justify-center">
    <Spinner size="lg" label="Loading tool..." />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={routeFallback}>
        <Routes>
          {/* Core Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/document-tools" element={<DocumentTools />} />
          
          {/* Tool Shell Routes */}
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/signature-compressor" element={<SignatureCompressor />} />
          <Route path="/image-resizer" element={<ImageResizer />} />
          <Route path="/image-cropper" element={<ImageCropper />} />
          <Route path="/white-background" element={<BackgroundWhite />} />
          <Route path="/image-converter" element={<ImageConverter />} />
          <Route path="/pdf-compressor" element={<PdfCompressor />} />
          <Route path="/pdf-merge" element={<PdfMerge />} />
          <Route path="/pdf-split" element={<PdfSplit />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/form-helper" element={<AllInOneWorkspace />} />
          
          {/* Route Redirects & Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
