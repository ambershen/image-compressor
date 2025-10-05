# Image Compressor

A modern, web-based image compression tool built with React, TypeScript, and Node.js. Compress your JPG/JPEG images with advanced quality and pixel reduction options while maintaining optimal visual quality.

## 🚀 Live Demo

**Try it now:** [https://traeimage-compressorepwd.vercel.app](https://traeimage-compressorepwd.vercel.app/)

## ✨ Features

- **Quality Compression**: Reduce file size while maintaining visual quality
- **Pixel Reduction**: Resize images by percentage with optional aspect ratio preservation
- **Drag & Drop Interface**: Easy file upload with modern UI
- **Real-time Processing**: Live progress tracking with visual feedback
- **Instant Download**: Download compressed images immediately
- **File Size Comparison**: See before/after file sizes
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark Theme**: Modern dark interface with geometric animations

## 🎯 How to Use

### Step 1: Upload Your Image
1. Visit the [live demo](https://traeimage-compressorepwd-ambershen-ambershens-projects.vercel.app)
2. Drag and drop a JPG/JPEG image onto the upload area, or click to browse files
3. Maximum file size: 50MB
4. Supported formats: JPG, JPEG

### Step 2: Choose Compression Type
**Quality Compression:**
- Reduces file size while preserving image dimensions
- Adjust quality slider (1-100%)
- Best for: General file size reduction

**Pixel Reduction:**
- Resizes image by percentage
- Optional: Maintain aspect ratio
- Adjust quality after resizing
- Best for: Creating thumbnails or smaller versions

### Step 3: Configure Settings
- **Quality Compression**: Set quality level (85% recommended)
- **Pixel Reduction**: Set resize percentage (50% default) and quality level
- Toggle aspect ratio preservation as needed

### Step 4: Process & Download
1. Click "Start Processing"
2. Watch real-time progress with animated feedback
3. View compression results and file size comparison
4. Download your optimized image instantly

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sharp** - High-performance image processing
- **Multer** - File upload handling
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Serverless deployment platform
- **Vercel KV** - Redis-compatible storage

## 🏗️ Project Structure

```
image-compressor/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   │   ├── Home.tsx       # Main upload interface
│   │   ├── Processing.tsx # Processing progress page
│   │   └── Results.tsx    # Results and download page
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── styles/            # CSS and animations
├── api/                   # Backend API routes
│   ├── app.ts            # Express app configuration
│   ├── server.ts         # Server setup
│   └── routes/           # API endpoints
├── public/               # Static assets
├── uploads/              # Temporary file storage
├── output/               # Processed images
└── images/               # Sample images
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd image-compressor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run client:dev` - Start only the frontend development server
- `npm run server:dev` - Start only the backend development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality

### Environment Setup
Create a `.env` file in the root directory for any environment variables needed for local development.

## 📝 API Endpoints

- `POST /api/upload` - Upload image file
- `POST /api/process` - Process uploaded image with specified options
- `GET /api/download/:filename` - Download processed image

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
