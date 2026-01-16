I will implement the Image to SVG conversion feature by adding a new processing strategy to the existing application. This will involve updates to both the backend API and the frontend UI, ensuring alignment with the project's design system.

### 1. Backend Implementation (`api/`)
- **Dependencies**: Install `imagetracerjs` (or a suitable alternative like `potrace`) to handle the conversion logic.
- **Upload Handling**: Update the `multer` configuration in `api/app.ts` to accept `.png` files (currently restricted to `.jpeg`/`.jpg`).
- **Processing Logic**:
  - Update `ProcessingJob` interface to support SVG-specific metadata.
  - Expand the `/api/process/:jobId` endpoint to handle a new `type: 'svg'`.
  - Implement the conversion pipeline:
    1.  Pre-process image with `sharp` (resize if necessary to optimize performance).
    2.  Convert raster data to SVG vector paths.
    3.  Store the resulting SVG string.
- **Output**: Update `/api/download/:jobId` and `/api/preview/:jobId` to serve `image/svg+xml` with the correct `.svg` file extension when applicable.

### 2. Frontend Implementation (`src/pages/`)
- **Home Page (`Home.tsx`)**:
  - **File Selection**: Allow users to select or drop `.png` files.
  - **New Strategy**: Add a "Vectorize" card to the "Processing Strategy" section, styled consistently with the existing "Optimizer" and "Resizer" cards.
  - **Configuration**: Add SVG-specific controls in the configuration panel:
    - **Color Count**: Slider to control the number of colors (e.g., 2-16).
    - **Detail/Simplification**: Control for path simplification.
- **Results Page (`Results.tsx`)**:
  - Ensure the preview component correctly renders the generated SVG.
  - Update the download button to trigger the download with the `.svg` extension.

### 3. Verification
- Verify PNG upload support.
- Test SVG conversion with different color settings.
- Verify the downloaded file is a valid SVG.
- Ensure the UI matches the `personal-brand.md` color palette and minimal style.