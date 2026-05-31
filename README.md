# FreeSeva

FreeSeva is a community-focused initiative offering free digital services for students, professionals, applicants, and everyday users.

The first live product is **Document Tools**: a privacy-first browser toolkit for preparing PDFs, images, signatures, and form-ready files.

Production domain: `https://www.freeseva.org`

## What FreeSeva Does Today

FreeSeva helps users complete common document tasks without mandatory signup or unnecessary uploads:

- Compress PDFs for exam, job, admission, and government portals.
- Compress images to common KB targets such as 20KB, 50KB, and 100KB.
- Compress signatures to common limits such as 10KB and 20KB.
- Resize photos by pixels, centimeters, or millimeters.
- Crop photos for passport, square, or custom form sizes.
- Convert images between JPG, PNG, and WEBP.
- Convert images to PDF.
- Merge and split PDF files.
- Prepare photos, signatures, and PDFs together in the All-in-One Workspace.
- Generate white-background photos with local AI background removal.

More free product tools may be added over time, but the current production product is Document Tools.

## Privacy Model

FreeSeva is designed as a browser-first utility.

- Files are processed locally in the user's browser whenever possible.
- No account is required.
- No files are intentionally stored by the app.
- Downloads are generated from browser memory using File, Blob, Canvas, PDF, and ZIP APIs.
- Background removal uses local browser AI processing with GPU acceleration when available and CPU/WASM fallback when needed.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Canvas API
- `browser-image-compression`
- `pdf-lib`
- `pdfjs-dist`
- `@imgly/background-removal`
- `onnxruntime-web`
- `react-image-crop`
- `jszip`
- `lucide-react`

## Routes

Core routes:

- `/` - FreeSeva homepage and mission
- `/document-tools` - Document Tools overview
- `/form-helper` - All-in-One Workspace

Tool routes:

- `/pdf-compressor`
- `/pdf-merge`
- `/pdf-split`
- `/image-compressor`
- `/signature-compressor`
- `/image-resizer`
- `/image-cropper`
- `/white-background`
- `/image-converter`
- `/image-to-pdf`

## SEO Setup

The project follows an intent-page SEO pattern similar to major document utility platforms:

- One route per tool intent.
- Exact-match page titles and H1s for tool pages.
- Route-specific descriptions, keywords, FAQs, use cases, how-to steps, and related tools.
- Dynamic canonical tags and Open Graph/Twitter metadata.
- FAQPage, HowTo, WebApplication, WebSite, Organization, and BreadcrumbList JSON-LD.
- Sitemap and robots files for search engines.
- `llms.txt` for AI/search crawlers.

SEO files:

- `src/utils/seo.ts`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`
- `index.html`

Canonical domain:

```text
https://www.freeseva.org
```

Vercel currently redirects the apex domain `freeseva.org` to `www.freeseva.org`.

## Social Sharing And Icons

Social preview image:

```text
public/freeseva.png
```

Favicon package:

```text
public/favicon_io_freeseva/
```

The main icon references are wired in `index.html` and `public/manifest.webmanifest`.

## Project Structure

```text
src/
  App.tsx
  main.tsx
  components/
    layout/
    ui/
  features/
    all-in-one/
    background-tool/
    image-compressor/
    image-converter/
    image-cropper/
    image-resizer/
    image-to-pdf/
    pdf-compressor/
    pdf-merge/
    pdf-split/
    signature-tool/
  routes/
    Home.tsx
    DocumentTools.tsx
  utils/
    engines/
    seo.ts
```

Important docs:

- `freeSeva.md` contains product notes.
- `PROJECT_PLAN.md` tracks phased implementation work.
- `VALIDATION.md` contains manual validation cases for processing engines and file workflows.

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the production app. |
| `npm run lint` | Run ESLint across the codebase. |
| `npm run preview` | Preview the built app locally. |

## Deployment

The app is configured for Vercel.

Recommended deployment checks:

```bash
npm run lint
npm run build
```

Recommended Vercel environment variable:

```text
VITE_SITE_URL=https://www.freeseva.org
```

The app uses `BrowserRouter`, so Vercel rewrites are required for direct route refreshes. This is handled in `vercel.json`.

## Search Console Checklist

After deployment:

- Add `https://www.freeseva.org` to Google Search Console.
- Submit `https://www.freeseva.org/sitemap.xml`.
- Confirm `https://www.freeseva.org/robots.txt` is reachable.
- Confirm `https://www.freeseva.org/freeseva.png` is reachable for link previews.
- Inspect key URLs such as `/pdf-compressor`, `/image-compressor`, `/signature-compressor`, and `/image-to-pdf`.

## Development Priorities

- Keep processing local and private.
- Keep tool pages focused on exact user intent.
- Preserve document readability, especially for PDF compression.
- Keep mobile workflows reliable.
- Improve real-file validation for heavy tools.
- Keep `npm run lint` and `npm run build` passing before deployment.
