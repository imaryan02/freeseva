import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './routes/Home';
import { ImageCompressor } from './features/image-compressor/ImageCompressor';
import { SignatureCompressor } from './features/signature-tool/SignatureCompressor';
import { ImageResizer } from './features/image-resizer/ImageResizer';
import { ImageCropper } from './features/image-cropper/ImageCropper';
import { BackgroundWhite } from './features/background-tool/BackgroundWhite';
import { ImageConverter } from './features/image-converter/ImageConverter';
import { PdfCompressor } from './features/pdf-compressor/PdfCompressor';
import { PdfMerge } from './features/pdf-merge/PdfMerge';
import { PdfSplit } from './features/pdf-split/PdfSplit';
import { ImageToPdf } from './features/image-to-pdf/ImageToPdf';
import { AllInOneWorkspace } from './features/all-in-one/AllInOneWorkspace';

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Home Route */}
        <Route path="/" element={<Home />} />
        
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
    </Router>
  );
}

export default App;
