# freeSeva Project Plan

This plan converts the current project analysis into concrete work needed to make freeSeva reliable, polished, and ready for public use.

## Progress Checklist

- [x] Phase 1: Stabilize code quality
- [ ] Phase 2: Fix PDF compression range mismatch
- [x] Phase 3: Replace README and document setup
- [x] Phase 4: Simplify preset-based flows
- [ ] Phase 5: Validate processing engines with real files
- [x] Phase 6: Add route-level lazy loading
- [ ] Phase 7: Mobile and accessibility polish
- [ ] Phase 8: Launch readiness

### Current Phase

Phase 7: Mobile and accessibility polish

#### Phase 1 Checklist

- [x] Replace render-time `Math.random()` ids with stable React ids.
- [x] Remove render-time ref reads in image cropper.
- [x] Replace unsafe `any` usage found by lint.
- [x] Fix unused variables and prefer-const findings.
- [x] Resolve background white `useEffect` dependency warning.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.

#### Phase 2 Checklist

- [ ] Reproduce all-in-one PDF compression result for the original `473KB` sample targeting max `200KB`.
- [ ] Reproduce standalone PDF compressor output mismatch for the same original sample.
- [x] Compare all-in-one and standalone PDF compressor code paths.
- [x] Research Adobe-style PDF optimization behavior.
- [x] Unify target-size policy for PDF compression.
- [x] Make standalone PDF compressor use the visible size target instead of ignoring it through the preset path.
- [x] Update PDF candidate selection to prefer the largest output under max size instead of returning the first under-target candidate.
- [x] Expand PDF compression search granularity with more render scales and quality levels to avoid large output-size jumps.
- [x] Score PDF candidates by quality, render scale, and target fit so readable output wins over maximum shrinkage.
- [x] Keep structurally optimized vector PDFs as fallback when rasterization cannot produce a good quality target-sized result.
- [x] Stop applying artificial minimum-size padding to PDFs.
- [x] Replace the current full-page rasterization-first fallback with an Adobe-style quality-first policy:
  - Preserve vector text and copied pages when structural optimization is enough.
  - Strip metadata and unused document structure first.
  - Prefer high-quality raster candidates when a size target requires rasterization.
  - Avoid converting clean text PDFs into low-resolution page images by default when no acceptable raster candidate exists.
- [ ] Explore true image-object/downsampling optimization where browser libraries allow it.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.
- [ ] Verify displayed final size matches downloaded file size with the original sample.

#### Phase 3 Checklist

- [x] Replace the default Vite README.
- [x] Add project overview.
- [x] Add local setup instructions.
- [x] Add available scripts.
- [x] Add feature list.
- [x] Add privacy statement.
- [x] Add deployment notes for Vercel.
- [x] Reference `freeSeva.md` and `PROJECT_PLAN.md`.

#### Phase 4 Checklist

- [x] Add quick targets to Image Compressor.
- [x] Add quick targets to Signature Compressor.
- [x] Add quick targets to PDF Compressor.
- [x] Add standard mixed-package targets to All-in-One Workspace.
- [x] Keep advanced range/single controls available.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.

#### Phase 5 Checklist

- [x] Add a validation checklist for every core engine and file workflow.
- [x] Document required real sample files.
- [x] Document pass/fail rules for downloaded files, ZIPs, and displayed file sizes.
- [ ] Run Image Compressor validation with JPG, PNG, and WEBP samples.
- [ ] Run Signature Compressor validation with low-contrast and transparent samples.
- [ ] Run Image Resizer validation with px, cm, locked, and unlocked dimensions.
- [ ] Run Image Cropper validation with passport, square, and free crop.
- [ ] Run White Background validation with auto and color picker modes.
- [ ] Run Image Converter validation across PNG, JPG, and WEBP formats.
- [ ] Run PDF Compressor validation with scanned and text/vector PDFs.
- [ ] Run PDF Merge validation.
- [ ] Run PDF Split validation.
- [ ] Run Images to PDF validation.
- [ ] Run All-in-One Workspace validation.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.

#### Phase 6 Checklist

- [x] Convert heavy feature routes to `React.lazy`.
- [x] Add a route-level `Suspense` loading fallback.
- [x] Split PDF-specific code away from the initial home bundle.
- [x] Confirm initial app JS chunk is meaningfully smaller after build.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.
- [ ] Consider deeper PDF engine chunk optimization if needed after launch.

## 1. Stabilize Code Quality

### Fix lint failures

- Replace `Math.random()` calls during render with React `useId()` in shared form components.
- Remove `imageRef.current` reads during render in the image cropper; calculate dimensions in state or derived event handlers.
- Replace `any` usage with safe types, especially in catch blocks and event handlers.
- Fix unused variables and prefer-const warnings.
- Resolve the missing `useEffect` dependency in the background white tool.

### Acceptance criteria

- `npm run lint` passes with zero errors.
- `npm run build` continues to pass.
- No new TypeScript suppressions are added unless explicitly justified.

## 2. Clean Up Text and Encoding

### Fix visible encoding artifacts

- Replace broken characters such as `â€¢`, `â†’`, `ðŸ‘‰`, and `â€“`.
- Review `freeSeva.md`, feature pages, modals, tooltips, and status messages.
- Keep UI text simple and readable for mobile users.

### Acceptance criteria

- No mojibake appears in source files or rendered UI.
- User-facing text is plain, clear, and consistent.

## 3. Improve Core User Flows

### Prioritize simple presets

- Add one-click presets for common government form needs:
  - Photo: `20KB - 50KB`
  - Signature: `10KB - 20KB`
  - PDF: `Under 100KB`
  - Passport photo dimensions
  - Exam form photo/signature package

### Simplify first-run experience

- Make the all-in-one workspace the primary call to action.
- Keep advanced controls available, but avoid making them the first thing users must understand.
- Add clearer before/after file size display.
- Add stronger success states after each processing operation.

### Acceptance criteria

- A first-time user can complete a photo or signature compression task in under 60 seconds.
- The default path does not require understanding compression ratios, DPI, or quality percentages.

## 4. Validate Processing Engines

### Priority bug: PDF compression range mismatch

- Investigate why PDF compression does not consistently follow the selected size range.
- Reproduce the all-in-one package issue where a PDF around `473KB` is compressed to about `124KB` even when the max range is `200KB`.
- Reproduce the standalone PDF compressor issue where the same or similar file compresses much more aggressively, for example down to about `24KB`.
- Compare the code paths used by:
  - `AllInOneWorkspace`
  - `AllInOneEngine.processItem`
  - `PdfCompressor`
  - `PdfProcessingEngine.compress`
- Confirm whether the all-in-one flow and standalone PDF compressor are passing the same target size, compression mode, and rasterization options.
- Decide the expected behavior for a range such as `50KB - 200KB`:
  - Output should be below `200KB`.
  - Output should avoid unnecessary over-compression when it can stay closer to the upper target.
  - Readability should be protected over hitting an artificial minimum.
- Remove or rethink zero-byte padding for PDFs if it creates misleading file sizes or portal compatibility risk.
- Add clear UI feedback when the engine cannot hit the exact range without damaging quality.

### Acceptance criteria

- The same PDF produces consistent output behavior in all-in-one and standalone PDF compressor when the same settings are selected.
- For a `max 200KB` target, the output is under `200KB` where technically possible.
- The engine does not compress a PDF down to `24KB` when a readable `100KB - 200KB` result is possible.
- The displayed final size exactly matches the downloaded file size.
- PDF output remains readable after compression.

### Image compression

- Test JPG, PNG, WEBP inputs.
- Verify output stays under selected max size where technically possible.
- Avoid artificial minimum-size padding unless it is proven safe for target file formats.

### Signature compression

- Test scanned signatures, phone-camera signatures, transparent PNGs, and low-contrast images.
- Preserve readability as the main priority.
- Verify transparent background behavior for PNG output.

### PDF processing

- Test scanned PDFs, text PDFs, large PDFs, and small text-only PDFs.
- Confirm PDF compression does not produce unreadable output.
- Clearly warn when text PDFs must be rasterized.
- Add test cases for different target ranges, especially `50KB - 100KB`, `100KB - 200KB`, and `Under 200KB`.
- Verify all PDF tools use one shared compression policy instead of separate inconsistent behavior.

### Acceptance criteria

- Each core engine has manual test fixtures or automated smoke tests.
- Output files open correctly after download.
- File size reporting matches actual downloaded file size.

## 5. Reduce Bundle Size

### Add route-level lazy loading

- Lazy-load heavy tool pages with `React.lazy`.
- Split PDF-specific routes so `pdfjs-dist` and the PDF worker are not loaded on the home page.
- Keep the home page lightweight and fast.

### Acceptance criteria

- Initial JS bundle is meaningfully smaller.
- PDF worker loads only when a PDF tool is opened.
- `npm run build` still passes.

## 6. Improve Mobile UX

### Layout and interaction

- Review all workspaces on small Android-sized viewports.
- Reduce horizontal scrolling where possible.
- Make upload, process, and download actions large and obvious.
- Ensure buttons and labels do not overflow.

### Accessibility

- Add accessible labels for icon-only buttons.
- Ensure keyboard focus states are visible.
- Ensure modals can be understood by screen readers.
- Confirm color contrast on badges and status labels.

### Acceptance criteria

- Main workflows are usable on mobile without layout breakage.
- Core controls are keyboard-accessible.

## 7. Documentation

### Replace default README

- Add project overview.
- Add local setup instructions.
- Add available scripts.
- Add feature list.
- Add privacy statement.
- Add deployment notes for Vercel.

### Maintain PRD alignment

- Keep `freeSeva.md` as product requirements.
- Add implementation status by feature.
- Track future phase ideas separately from MVP tasks.

### Acceptance criteria

- `README.md` no longer contains stock Vite template text.
- New developers can run and understand the project from docs alone.

## 8. Testing Plan

### Minimum test coverage

- Build check: `npm run build`
- Lint check: `npm run lint`
- Manual browser checks for:
  - Home page
  - Image compressor
  - Signature compressor
  - Image resizer
  - Image cropper
  - Background white
  - Image converter
  - PDF compressor
  - PDF merge
  - PDF split
  - Images to PDF
  - All-in-one workspace

### Suggested future automated tests

- Add unit tests for pure utility functions.
- Add browser smoke tests for route loading.
- Add fixture-based tests for file output size where practical.

### Acceptance criteria

- Every release candidate has a documented test pass.
- Critical flows are checked with real sample files.

## 9. Launch Readiness

### Pre-launch checklist

- Lint passes.
- Build passes.
- No encoding artifacts.
- README is updated.
- Privacy messaging is clear.
- No server upload behavior is introduced.
- Vercel deployment works.
- Home page loads quickly.
- Core tools work on mobile.

### Post-launch improvements

- Add offline/PWA support.
- Add exam-specific templates.
- Add batch ZIP processing improvements.
- Add OCR and document conversion tools later.
- Consider AI background removal only after the MVP is stable.

## Recommended Execution Order

1. Fix lint and encoding issues.
2. Fix the PDF compression range mismatch between all-in-one and standalone PDF compressor.
3. Replace README and document project setup.
4. Simplify preset-based flows.
5. Validate processing engines with real files.
6. Add route-level lazy loading.
7. Perform mobile and accessibility polish.
8. Prepare Vercel deployment and launch checklist.
