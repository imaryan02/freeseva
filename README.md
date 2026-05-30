# freeSeva

freeSeva is a free, privacy-first document utility app for preparing files used in government forms, job applications, admissions, exams, and everyday online submissions.

The app is built around common user goals:

- Compress a photo to a required KB limit.
- Compress a signature to 10KB or 20KB.
- Resize photos to form dimensions.
- Convert images and PDFs.
- Merge, split, and compress PDFs.
- Package photos, signatures, and documents together for form submission.

## Privacy Model

freeSeva is designed as a browser-first tool.

- Files are processed locally in the user's browser whenever possible.
- No account is required.
- No mandatory server upload is used for the MVP.
- No files are intentionally stored by the app.
- Downloads are generated from browser memory using File, Blob, Canvas, PDF, and ZIP APIs.

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
- `react-image-crop`
- `jszip`
- `lucide-react`

## Features

### Image Tools

- Image compressor
- Signature compressor
- Image resizer
- Image cropper
- White background generator
- Image format converter

### PDF Tools

- PDF compressor
- Merge PDF
- Split PDF
- Images to PDF

### Form Helper

- All-in-one package workspace for photos, signatures, and documents.
- Per-file size targets.
- Per-file rename controls.
- ZIP package download.

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
  utils/
    engines/
```

Important docs:

- `freeSeva.md` contains the product requirements document.
- `PROJECT_PLAN.md` tracks phased implementation work and progress.
- `VALIDATION.md` contains manual test cases for processing engines and file workflows.

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

## Development Priorities

Current priorities are tracked in `PROJECT_PLAN.md`.

The main active themes are:

- Keep processing local and private.
- Make the user workflow simple for non-technical users.
- Preserve document readability, especially for PDF compression.
- Make mobile workflows reliable.
- Keep build and lint checks passing.

## PDF Compression Notes

PDF compression is handled carefully because government forms often reject large files, but aggressive compression can make text unreadable.

The current policy is quality-first:

- Try structural PDF optimization first.
- Preserve vector text where possible.
- Use rasterization only when size targets require it.
- Prefer readable output over maximum shrinking.
- Avoid artificial file-size padding for PDFs.

## Deployment

The app is intended to be deployable on Vercel's free tier.

Recommended deployment checks:

```bash
npm run lint
npm run build
```

The app currently uses `HashRouter`, which is friendly for static hosting because browser refreshes do not require custom route rewrites.

## Known Follow-Up Work

- Finish real-file validation for PDF compression behavior.
- Run the full validation checklist in `VALIDATION.md` with local non-private sample files.
- Clean remaining encoding artifacts in UI/docs.
- Add route-level lazy loading for heavy PDF features.
- Add mobile UX polish for dense batch workspaces.
- Add smoke tests for important routes and file workflows.
- Replace advanced controls with simpler presets where possible.
