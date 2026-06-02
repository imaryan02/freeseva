export interface PdfDebugSession {
  id: string;
  browser: BrowserDiagnostics;
  step: (label: string, details?: Record<string, unknown>) => void;
  info: (label: string, details?: Record<string, unknown>) => void;
  warn: (label: string, details?: Record<string, unknown>) => void;
  error: (label: string, error: unknown, details?: Record<string, unknown>) => void;
  end: (label: string, details?: Record<string, unknown>) => void;
}

export interface BrowserDiagnostics {
  userAgent: string;
  platform: string;
  vendor: string;
  isIOS: boolean;
  isSafari: boolean;
  isMobileSafari: boolean;
  supportsFileArrayBuffer: boolean;
  supportsBlobStream: boolean;
  supportsWorker: boolean;
  supportsWebAssembly: boolean;
  supportsOffscreenCanvas: boolean;
  supportsCreateImageBitmap: boolean;
  deviceMemoryGB?: number;
  memory?: Record<string, number>;
}

const getMemorySnapshot = (): Record<string, number> | undefined => {
  const perf = performance as Performance & {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  };

  if (!perf.memory) return undefined;

  return {
    jsHeapSizeLimitMB: Math.round(perf.memory.jsHeapSizeLimit / 1024 / 1024),
    totalJSHeapSizeMB: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024),
    usedJSHeapSizeMB: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
  };
};

export const getBrowserDiagnostics = (): BrowserDiagnostics => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const userAgent = nav.userAgent || '';
  const platform = nav.platform || '';
  const isIOS = /iPad|iPhone|iPod/.test(platform) || /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(userAgent);

  return {
    userAgent,
    platform,
    vendor: nav.vendor || '',
    isIOS,
    isSafari,
    isMobileSafari: isIOS && isSafari,
    supportsFileArrayBuffer: typeof File !== 'undefined' && typeof File.prototype.arrayBuffer === 'function',
    supportsBlobStream: typeof Blob !== 'undefined' && typeof Blob.prototype.stream === 'function',
    supportsWorker: typeof Worker !== 'undefined',
    supportsWebAssembly: typeof WebAssembly !== 'undefined',
    supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    supportsCreateImageBitmap: typeof createImageBitmap !== 'undefined',
    deviceMemoryGB: nav.deviceMemory,
    memory: getMemorySnapshot(),
  };
};

export const describePdfError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message || error.name;
    if (/memory|allocation|out of memory|maximum call stack/i.test(message)) {
      return `Memory pressure while processing PDF: ${message}`;
    }
    if (/worker|fake worker|setting up fake worker|module script/i.test(message)) {
      return `PDF worker failed: ${message}`;
    }
    if (/canvas|toDataURL|drawImage|context/i.test(message)) {
      return `Canvas rendering failed: ${message}`;
    }
    if (/arraybuffer|file|blob|read/i.test(message)) {
      return `File read failed: ${message}`;
    }
    return message;
  }

  return typeof error === 'string' ? error : 'Unknown PDF processing failure';
};

export const createPdfDebugSession = (label: string): PdfDebugSession => {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = performance.now();
  const browser = getBrowserDiagnostics();
  let stepIndex = 0;

  const basePayload = (details?: Record<string, unknown>) => ({
    sessionId: id,
    elapsedMs: Math.round(performance.now() - startedAt),
    memory: getMemorySnapshot(),
    ...details,
  });

  const step = (stepLabel: string, details?: Record<string, unknown>) => {
    stepIndex += 1;
    console.log(`[PDF Debug][${id}] [Step ${stepIndex}] ${stepLabel}`, basePayload(details));
  };

  console.groupCollapsed(`[PDF Debug][${id}] ${label}`);
  console.log('[PDF Debug] Browser Diagnostics', browser);

  return {
    id,
    browser,
    step,
    info: (infoLabel, details) => {
      console.log(`[PDF Debug][${id}] ${infoLabel}`, basePayload(details));
    },
    warn: (warnLabel, details) => {
      console.warn(`[PDF Debug][${id}] ${warnLabel}`, basePayload(details));
    },
    error: (errorLabel, error, details) => {
      console.error(`[PDF Debug][${id}] ${errorLabel}`, {
        ...basePayload(details),
        reason: describePdfError(error),
        rawError: error,
      });
    },
    end: (endLabel, details) => {
      console.log(`[PDF Debug][${id}] ${endLabel}`, basePayload(details));
      console.groupEnd();
    },
  };
};

export const getFileDiagnostics = (file: File): Record<string, unknown> => ({
  name: file.name,
  type: file.type || '(empty)',
  sizeBytes: file.size,
  sizeMB: Number((file.size / 1024 / 1024).toFixed(2)),
  lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
});
