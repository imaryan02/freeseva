# freeSeva Validation Checklist

Use this checklist before public release and after changes to processing engines.

The goal is to confirm that downloaded files are usable, readable, and match the size shown in the UI.

## Required Sample Files

Keep these local sample files for repeatable checks. Do not commit private user documents.

### Images

- JPG photo around `500KB - 2MB`
- PNG photo around `500KB - 2MB`
- WEBP image around `500KB - 2MB`
- Low-contrast signature photo
- Transparent PNG signature
- Passport-style photo with off-white or colored background

### PDFs

- Scanned PDF around `400KB - 1MB`
- Text/vector PDF under `350KB`
- Text/vector PDF over `500KB`
- Multi-page scanned PDF
- PDF with mixed text and images

## Validation Rules

For every output file:

- Open the downloaded file locally.
- Confirm it is not corrupted.
- Confirm the UI final size matches the downloaded file size.
- Confirm the file type and extension are correct.
- Confirm the output remains readable.
- Confirm ZIP downloads contain the expected files with expected names.

## Image Compressor

### Test Cases

- JPG to `20KB - 50KB`
- PNG to `20KB - 50KB`
- WEBP to `Under 100KB`
- Batch of at least 3 images

### Pass Criteria

- Output is under the max target when technically possible.
- Preview and downloaded file match.
- ZIP contains all processed files.
- File names respect custom rename fields.

## Signature Compressor

### Test Cases

- Low-contrast signature to `10KB - 20KB`
- Signature to `Under 10KB`
- Transparent PNG signature with alpha preservation enabled
- Batch of at least 2 signatures

### Pass Criteria

- Ink remains readable.
- Background cleanup does not erase important strokes.
- Transparent PNG remains transparent when requested.
- Output is under the selected max target when technically possible.

## Image Resizer

### Test Cases

- Resize using pixel dimensions.
- Resize using centimeter dimensions.
- Resize with aspect ratio locked.
- Resize with aspect ratio unlocked.
- Resize and compress together.

### Pass Criteria

- Output dimensions match the selected mode.
- Aspect lock behaves correctly.
- Output file opens correctly.
- ZIP contains all processed files.

## Image Cropper

### Test Cases

- Passport crop.
- Square crop.
- Free crop.
- Download cropped output.

### Pass Criteria

- Crop output matches selected visual area.
- Output dimensions shown in UI match downloaded image dimensions.
- Downloaded image opens correctly.

## White Background Generator

### Test Cases

- Auto lightness cleanup on off-white background.
- Color picker cleanup on colored background.
- Batch processing with multiple photos.

### Pass Criteria

- Background becomes acceptable white without damaging the face/signature.
- Color picker target updates correctly.
- Output file and ZIP download open correctly.

## Image Converter

### Test Cases

- PNG to JPG.
- JPG to PNG.
- WEBP to JPG.
- WEBP to PNG.

### Pass Criteria

- Output format and extension are correct.
- Transparency is handled correctly when converting to JPG.
- Downloaded file opens correctly.

## PDF Compressor

### Test Cases

- Scanned PDF to `Under 100KB`.
- Scanned PDF to `100KB - 200KB`.
- Scanned PDF to `Under 300KB`.
- Text/vector PDF to `Under 200KB`.
- Compare same PDF in standalone PDF Compressor and All-in-One Workspace.

### Pass Criteria

- Output is under max target when technically possible.
- Text/vector PDFs stay readable.
- Clean text PDFs are not unnecessarily rasterized into blurry images.
- Output is not over-compressed when a larger readable under-target candidate exists.
- Standalone and All-in-One produce consistent behavior for the same settings.

## PDF Merge

### Test Cases

- Merge two PDFs.
- Merge three or more PDFs.
- Reorder PDFs before merging.

### Pass Criteria

- Page order matches the UI order.
- Output page count equals the sum of input page counts.
- Downloaded PDF opens correctly.

## PDF Split

### Test Cases

- Extract one page.
- Extract a custom range such as `1-3, 5`.
- Select all pages.
- Clear selection and reselect.

### Pass Criteria

- Output contains only selected pages.
- Page order is preserved.
- Downloaded PDF opens correctly.

## Images to PDF

### Test Cases

- Create PDF from one image.
- Create PDF from multiple images.
- Reorder images before compiling.
- Test A4, Letter, and Fit page options.

### Pass Criteria

- Page count matches image count.
- Page order matches queue order.
- Images are visible and not clipped unexpectedly.
- Downloaded PDF opens correctly.

## All-in-One Workspace

### Test Cases

- Add photo, signature, and PDF.
- Apply `Standard Form Targets`.
- Rename each output.
- Download individual files.
- Download ZIP package.

### Pass Criteria

- Photo uses `20KB - 50KB`.
- Signature uses `10KB - 20KB`.
- PDF uses `100KB - 200KB`.
- Output files are readable and open correctly.
- ZIP contains all expected files.

## Release Gate

Before release:

```bash
npm run lint
npm run build
```

Both commands must pass.

