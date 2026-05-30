# freeSeva

## Product Requirements Document (PRD)

Version: 1.0

---

# Project Vision

freeSeva is a completely free document utility platform that helps users prepare files for government forms, job applications, college admissions, passport applications, and other online submissions.

The platform solves a common problem faced by millions of users:

* Image size too large
* Signature exceeds allowed size
* Passport photo dimensions incorrect
* PDF file size exceeds upload limit
* Background not accepted
* File format not supported

Most existing solutions are cluttered with ads, watermarks, upload limits, and privacy concerns.

freeSeva aims to provide a fast, privacy-focused, browser-first experience where files are processed locally whenever possible and never permanently stored.

---

# Core Principles

## Simplicity First

Users do not understand:

* Compression ratios
* DPI
* Quality percentages
* Pixel density

Users understand:

* Make this photo 20KB
* Make this signature 10KB
* Convert this image to PDF
* Resize this passport photo

The UI should be designed around user outcomes, not technical settings.

---

## Privacy First

Display prominently:

"Files are processed in your browser whenever possible. We do not store your files."

No user accounts.

No signups.

No mandatory uploads to servers.

---

## Mobile First

Most users will use:

* Android devices
* Budget phones
* Government exam candidates
* Students

All features must work smoothly on mobile.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* React Router

## Image Processing

* browser-image-compression
* Canvas API
* react-image-crop

## PDF Processing

* pdf-lib
* pdfjs

## File Handling

* File API
* Blob API
* FileReader

## Deployment

* Vercel

## Backend

None required for MVP.

Everything should work locally in browser.

---

# MVP Features

---

# Feature 1

## Image Compressor

### User Flow

Upload Image

Choose Target Size

Examples:

* 10 KB
* 20 KB
* 50 KB
* 100 KB
* 200 KB
* Custom

Click Compress

Download Result

---

### Supported Formats

* JPG
* JPEG
* PNG
* WEBP

---

### Acceptance Criteria

User uploads image

User selects target size

System automatically compresses image

Output size should be as close as possible to target

Preview displayed before download

---

# Feature 2

## Signature Compressor

### Purpose

Many government forms require:

* Signature below 10KB
* Signature below 20KB

Users struggle with this.

---

### User Flow

Upload Signature

Choose Target:

* 10 KB
* 20 KB
* 30 KB
* Custom

Generate

Download

---

### Acceptance Criteria

Output must remain readable

Transparent background preserved if possible

File size near selected target

---

# Feature 3

## Image Resizer

### User Flow

Upload Image

Choose:

Width

Height

or

Preset

Generate

Download

---

### Presets

Passport

SSC

UPSC

NEET

Custom

---

### Acceptance Criteria

Maintain aspect ratio option

Custom aspect ratio option

Preview available

---

# Feature 4

## White Background Generator

### Purpose

Many forms reject colored backgrounds.

---

### User Flow

Upload Photo

Select:

Make Background White

Generate

Download

---

### MVP Version

Simple background whitening

No AI required initially

---

### Future

AI background removal

Automatic white replacement

---

# Feature 5

## Image Format Converter

### Supported

PNG → JPG

JPG → PNG

WEBP → JPG

WEBP → PNG

---

### User Flow

Upload

Choose Output Format

Convert

Download

---

# Feature 6

## Image Crop Tool

### User Flow

Upload

Crop

Preview

Download

---

### Features

Square

Passport

Custom

Free Crop

---

# Feature 7

## PDF Compressor

### User Flow

Upload PDF

Choose Compression Level

Low

Medium

High

Compress

Download

---

### Acceptance Criteria

Preserve readability

Display original size

Display compressed size

Display savings percentage

---

# Feature 8

## Merge PDF

### User Flow

Upload Multiple PDFs

Reorder Files

Merge

Download

---

# Feature 9

## Split PDF

### User Flow

Upload PDF

Select Pages

Split

Download

---

# Feature 10

## Images to PDF

### User Flow

Upload Images

Reorder

Convert

Download PDF

---

# Government Form Helper

This is the most important feature.

---

## Purpose

Many forms require:

Photo

Signature

Thumb Impression

All with different size limits.

---

## User Flow

Upload Photo

Upload Signature

Upload Thumb

Select Exam Type

Examples:

SSC

UPSC

Railway

Banking

State Exams

Custom

Generate Everything

Download ZIP

---

## Example Output

photo_20kb.jpg

signature_10kb.jpg

thumb_50kb.jpg

---

# Homepage

## Hero Section

Headline:

Make Your Documents Form Ready in Seconds

Subheadline:

Compress, Resize, Convert and Prepare Photos, Signatures and PDFs for Government Forms Completely Free.

CTA:

Start Now

---

## Tool Grid

Image Compressor

Signature Compressor

Image Resizer

Background White

PDF Compressor

Merge PDF

Split PDF

Image to PDF

Government Form Helper

---

## Privacy Section

Files stay on your device.

No account required.

No file storage.

No watermarks.

Free forever.

---

# UI Guidelines

Clean

Minimal

Fast

No clutter

No unnecessary animations

Government-form users should immediately understand what to do.

---

# Folder Structure

src/

app/

components/

features/

image-compressor/

signature-tool/

image-resizer/

image-cropper/

background-tool/

pdf-compressor/

pdf-merge/

pdf-split/

image-to-pdf/

government-form-helper/

hooks/

utils/

types/

routes/

assets/

---

# Future Features

Phase 2

* AI Background Removal
* Passport Photo Generator
* Exam Specific Templates
* Batch Processing
* Drag and Drop Uploads
* Dark Mode

---

Phase 3

* OCR
* PDF to Word
* Word to PDF
* Bulk ZIP Processing
* Browser AI Processing
* Offline PWA Support

---

# Non Functional Requirements

Page load under 2 seconds

Mobile first

Responsive

Accessibility support

No mandatory backend

No user data storage

Deployable on Vercel free tier

SEO friendly

Fast download generation

---

# Success Metrics

Users can successfully:

Compress image to required size

Resize photo for forms

Generate acceptable signatures

Prepare PDFs

Complete tasks within 60 seconds

without external software or paid tools.

---

# Final Goal

Create the simplest and most trusted document utility platform for students, job seekers, government form applicants, and everyday users.

The user should be able to open the website, upload a file, solve their problem in less than one minute, and leave without creating an account.
