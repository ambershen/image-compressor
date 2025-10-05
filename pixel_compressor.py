#!/usr/bin/env python3
"""
Pixel Reduction Compressor for JPG files
Compresses images by reducing pixel count (resizing) with customizable dimensions and quality settings.
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image, ImageOps
import glob
import math


class PixelCompressor:
    """A class to handle pixel reduction compression operations."""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    
    def resize_image(self, input_path, output_path=None, resize_percent=None, 
                    max_width=None, max_height=None, quality=85, 
                    maintain_aspect=True, resample_method='LANCZOS'):
        """
        Resize and compress an image by reducing pixel count.
        
        Args:
            input_path (str): Path to the input image
            output_path (str): Path for the resized image (optional)
            resize_percent (int): Percentage to resize (e.g., 50 for 50% of original size)
            max_width (int): Maximum width in pixels
            max_height (int): Maximum height in pixels
            quality (int): JPEG quality (1-100)
            maintain_aspect (bool): Maintain aspect ratio
            resample_method (str): Resampling method ('LANCZOS', 'BILINEAR', 'BICUBIC', 'NEAREST')
            
        Returns:
            tuple: (success, original_size, resized_size, output_path, original_dimensions, new_dimensions)
        """
        try:
            # Validate input file
            if not os.path.exists(input_path):
                return False, 0, 0, f"Input file does not exist: {input_path}", None, None
            
            # Check if file is a supported format
            file_ext = Path(input_path).suffix.lower()
            if file_ext not in ['.jpg', '.jpeg']:
                return False, 0, 0, f"Unsupported file format: {file_ext}", None, None
            
            # Get original file size
            original_size = os.path.getsize(input_path)
            
            # Generate output path if not provided
            if output_path is None:
                input_path_obj = Path(input_path)
                suffix = ""
                if resize_percent:
                    suffix = f"_resized_{resize_percent}pct"
                elif max_width or max_height:
                    suffix = f"_resized_{max_width or 'auto'}x{max_height or 'auto'}"
                else:
                    suffix = "_resized"
                output_path = str(input_path_obj.parent / f"{input_path_obj.stem}{suffix}{input_path_obj.suffix}")
            
            # Get resampling method
            resample_methods = {
                'LANCZOS': Image.Resampling.LANCZOS,
                'BILINEAR': Image.Resampling.BILINEAR,
                'BICUBIC': Image.Resampling.BICUBIC,
                'NEAREST': Image.Resampling.NEAREST
            }
            resample = resample_methods.get(resample_method.upper(), Image.Resampling.LANCZOS)
            
            # Open and process the image
            with Image.open(input_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Apply auto-orientation based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                original_dimensions = img.size
                original_width, original_height = original_dimensions
                
                # Calculate new dimensions
                if resize_percent:
                    # Resize by percentage
                    new_width = int(original_width * (resize_percent / 100))
                    new_height = int(original_height * (resize_percent / 100))
                elif max_width or max_height:
                    # Resize to fit within max dimensions
                    if maintain_aspect:
                        # Calculate aspect ratio
                        aspect_ratio = original_width / original_height
                        
                        if max_width and max_height:
                            # Fit within both constraints
                            if original_width / max_width > original_height / max_height:
                                new_width = max_width
                                new_height = int(max_width / aspect_ratio)
                            else:
                                new_height = max_height
                                new_width = int(max_height * aspect_ratio)
                        elif max_width:
                            new_width = max_width
                            new_height = int(max_width / aspect_ratio)
                        else:  # max_height only
                            new_height = max_height
                            new_width = int(max_height * aspect_ratio)
                    else:
                        # Don't maintain aspect ratio
                        new_width = max_width or original_width
                        new_height = max_height or original_height
                else:
                    # No resize specified, use 75% as default
                    new_width = int(original_width * 0.75)
                    new_height = int(original_height * 0.75)
                
                new_dimensions = (new_width, new_height)
                
                # Resize the image
                resized_img = img.resize(new_dimensions, resample)
                
                # Save with compression settings
                resized_img.save(
                    output_path,
                    'JPEG',
                    quality=quality,
                    optimize=True,
                    progressive=True
                )
            
            # Get resized file size
            resized_size = os.path.getsize(output_path)
            
            return True, original_size, resized_size, output_path, original_dimensions, new_dimensions
            
        except Exception as e:
            return False, 0, 0, f"Error resizing image: {str(e)}", None, None
    
    def batch_resize(self, input_dir, output_dir=None, resize_percent=None, 
                    max_width=None, max_height=None, quality=85, 
                    maintain_aspect=True, resample_method='LANCZOS', suffix='_resized'):
        """
        Resize all JPG images in a directory.
        
        Args:
            input_dir (str): Directory containing input images
            output_dir (str): Directory for resized images (optional)
            resize_percent (int): Percentage to resize
            max_width (int): Maximum width in pixels
            max_height (int): Maximum height in pixels
            quality (int): JPEG quality (1-100)
            maintain_aspect (bool): Maintain aspect ratio
            resample_method (str): Resampling method
            
        Returns:
            dict: Results summary
        """
        if not os.path.exists(input_dir):
            return {"error": f"Input directory does not exist: {input_dir}"}
        
        # Create output directory if not specified
        if output_dir is None:
            output_dir = input_dir
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Find all JPG files
        jpg_patterns = ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']
        jpg_files = []
        for pattern in jpg_patterns:
            jpg_files.extend(glob.glob(os.path.join(input_dir, pattern)))
        
        if not jpg_files:
            return {"error": "No JPG files found in the input directory"}
        
        results = {
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "total_original_size": 0,
            "total_resized_size": 0,
            "files": []
        }
        
        for input_file in jpg_files:
            filename = os.path.basename(input_file)
            name_without_ext = os.path.splitext(filename)[0]
            
            # Generate output filename
            output_file = os.path.join(output_dir, f"{name_without_ext}{suffix}.jpg")
            
            success, orig_size, resized_size, output_path, orig_dims, new_dims = self.resize_image(
                input_file, output_file, resize_percent, max_width, max_height,
                quality, maintain_aspect, resample_method
            )
            
            results["processed"] += 1
            
            if success:
                results["successful"] += 1
                results["total_original_size"] += orig_size
                results["total_resized_size"] += resized_size
                
                compression_ratio = ((orig_size - resized_size) / orig_size) * 100 if orig_size > 0 else 0
                pixel_reduction = ((orig_dims[0] * orig_dims[1] - new_dims[0] * new_dims[1]) / 
                                 (orig_dims[0] * orig_dims[1])) * 100 if orig_dims and new_dims else 0
                
                results["files"].append({
                    "filename": filename,
                    "status": "success",
                    "original_size": orig_size,
                    "resized_size": resized_size,
                    "compression_ratio": compression_ratio,
                    "original_dimensions": orig_dims,
                    "new_dimensions": new_dims,
                    "pixel_reduction": pixel_reduction,
                    "output_path": output_path
                })
            else:
                results["failed"] += 1
                results["files"].append({
                    "filename": filename,
                    "status": "failed",
                    "error": output_path  # Error message is in output_path when failed
                })
        
        # Calculate summary statistics
        total_space_saved = results["total_original_size"] - results["total_resized_size"]
        average_pixel_reduction = 0
        average_size_reduction = 0
        
        if results["successful"] > 0:
            successful_files = [f for f in results["files"] if f["status"] == "success"]
            if successful_files:
                average_pixel_reduction = sum(f["pixel_reduction"] for f in successful_files) / len(successful_files)
                average_size_reduction = sum(f["compression_ratio"] for f in successful_files) / len(successful_files)
        
        return {
            "processed_count": results["processed"],
            "failed_count": results["failed"],
            "total_space_saved": total_space_saved,
            "average_pixel_reduction": average_pixel_reduction,
            "average_size_reduction": average_size_reduction,
            "files": results["files"]
        }


def format_file_size(size_bytes):
    """Convert bytes to human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}"


def main():
    parser = argparse.ArgumentParser(
        description="Compress JPG images by reducing pixel count (resizing)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Resize to 50% of original size
  python pixel_compressor.py input.jpg --percentage 50
  
  # Resize to maximum 1920x1080 (maintaining aspect ratio)
  python pixel_compressor.py input.jpg --max-width 1920 --max-height 1080
  
  # Resize to exact 800x600 (not maintaining aspect ratio)
  python pixel_compressor.py input.jpg --max-width 800 --max-height 600 --no-aspect
  
  # Batch resize all images to 75% with high quality
  python pixel_compressor.py /path/to/images --percentage 75 -q 95
  
  # Resize for web (max 1200px width)
  python pixel_compressor.py input.jpg --max-width 1200 -q 80
        """
    )
    
    # Input options
    parser.add_argument('input', help='Input JPG file or directory path')
    
    # Resize options (mutually exclusive)
    resize_group = parser.add_mutually_exclusive_group()
    resize_group.add_argument('--percentage', type=int, choices=range(1, 101),
                             help='Resize percentage (1-100)')
    resize_group.add_argument('--max-width', type=int, help='Maximum width in pixels')
    
    parser.add_argument('--max-height', type=int, help='Maximum height in pixels')
    
    # Output options
    parser.add_argument('-o', '--output', help='Output filename (for single files)')
    parser.add_argument('--suffix', default='_resized', help='Suffix for output files (default: "_resized")')
    
    # Quality and processing options
    parser.add_argument('-q', '--quality', type=int, default=85, choices=range(1, 101),
                       help='JPEG quality for output (1-100, default: 85)')
    parser.add_argument('--no-aspect', action='store_true',
                       help='Do not maintain aspect ratio')
    parser.add_argument('--resample', choices=['lanczos', 'bicubic', 'bilinear', 'nearest'],
                       default='lanczos', help='Resampling algorithm (default: lanczos)')
    
    # Display options
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Determine resize parameters
    if args.percentage:
        resize_params = {'resize_percent': args.percentage}
    elif args.max_width or args.max_height:
        resize_params = {'max_width': args.max_width, 'max_height': args.max_height}
    else:
        print("Error: Must specify either --percentage, --max-width, or --max-height")
        return
    
    # Set up compressor
    compressor = PixelCompressor()
    input_path = Path(args.input)
    
    # Process single file or directory
    if input_path.is_file():
        # Single file processing
        if args.output:
            output_path = args.output
        else:
            stem = input_path.stem
            suffix = input_path.suffix
            output_path = input_path.parent / f"{stem}{args.suffix}{suffix}"
        
        result = compressor.resize_image(
            input_path=str(input_path),
            output_path=str(output_path),
            quality=args.quality,
            maintain_aspect=not getattr(args, 'no_aspect', False),
            resample_method=args.resample.upper(),
            **resize_params
        )
        
        if result and len(result) >= 6:
            success, orig_size, resized_size, output_path_result, orig_dims, new_dims = result
            
            if args.verbose and success:
                print(f"Processing: {input_path.name}")
                
                # Calculate statistics
                orig_megapixels = (orig_dims[0] * orig_dims[1]) / 1_000_000 if orig_dims else 0
                new_megapixels = (new_dims[0] * new_dims[1]) / 1_000_000 if new_dims else 0
                pixel_reduction = ((orig_dims[0] * orig_dims[1] - new_dims[0] * new_dims[1]) / 
                                 (orig_dims[0] * orig_dims[1])) * 100 if orig_dims and new_dims else 0
                size_reduction = ((orig_size - resized_size) / orig_size) * 100 if orig_size > 0 else 0
                space_saved = orig_size - resized_size
                
                print(f"Original: {orig_dims[0]}x{orig_dims[1]} pixels "
                      f"({orig_megapixels:.1f} MP) - {format_file_size(orig_size)}")
                print(f"Resized: {new_dims[0]}x{new_dims[1]} pixels "
                      f"({new_megapixels:.1f} MP) - {format_file_size(resized_size)}")
                print(f"Pixel reduction: {pixel_reduction:.1f}%")
                print(f"Size reduction: {size_reduction:.1f}%")
                print(f"Space saved: {format_file_size(space_saved)}")
                print(f"Output: {output_path}")
            elif not success:
                print(f"Error processing {input_path}: {output_path_result}")
        else:
            print(f"Error: Unexpected result format from resize_image")
            
    elif input_path.is_dir():
        # Directory processing
        output_dir = args.output if args.output else None
        
        results = compressor.batch_resize(
            str(input_path),
            output_dir,
            quality=args.quality,
            maintain_aspect=not getattr(args, 'no_aspect', False),
            resample_method=args.resample.upper(),
            suffix=args.suffix,
            **resize_params
        )
        
        if "error" in results:
            print(f"❌ Batch resize failed: {results['error']}")
            sys.exit(1)
        
        # Display results
        print(f"📊 Batch Resize Results:")
        print(f"   Files processed: {results['processed']}")
        print(f"   Successful: {results['successful']}")
        print(f"   Failed: {results['failed']}")
        
        if results['successful'] > 0:
            total_orig = results['total_original_size']
            total_resized = results['total_resized_size']
            total_ratio = ((total_orig - total_resized) / total_orig) * 100 if total_orig > 0 else 0
            
            print(f"   Total original size: {format_file_size(total_orig)}")
            print(f"   Total resized size: {format_file_size(total_resized)}")
            print(f"   Overall file size reduction: {total_ratio:.1f}%")
        
        if args.verbose and results['files']:
            print("\n📁 Individual file results:")
            for file_info in results['files']:
                if file_info['status'] == 'success':
                    print(f"   ✅ {file_info['filename']}: "
                          f"{format_file_size(file_info['original_size'])} → "
                          f"{format_file_size(file_info['resized_size'])} "
                          f"({file_info['compression_ratio']:.1f}% size reduction, "
                          f"{file_info['pixel_reduction']:.1f}% pixel reduction)")
                else:
                    print(f"   ❌ {file_info['filename']}: {file_info['error']}")
    else:
        print(f"Error: {input_path} is not a valid file or directory")
        return


if __name__ == "__main__":
    main()