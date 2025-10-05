#!/usr/bin/env python3
"""
Image Compressor Script for JPG files
Compresses JPG images with customizable quality settings and batch processing support.
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image, ImageOps
import glob


class ImageCompressor:
    """A class to handle JPG image compression operations."""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    
    def compress_image(self, input_path, output_path=None, quality=85, optimize=True, progressive=True):
        """
        Compress a single JPG image.
        
        Args:
            input_path (str): Path to the input image
            output_path (str): Path for the compressed image (optional)
            quality (int): Compression quality (1-100, higher = better quality)
            optimize (bool): Enable optimization
            progressive (bool): Enable progressive JPEG
            
        Returns:
            tuple: (success, original_size, compressed_size, output_path)
        """
        try:
            # Validate input file
            if not os.path.exists(input_path):
                return False, 0, 0, f"Input file does not exist: {input_path}"
            
            # Check if file is a supported format
            file_ext = Path(input_path).suffix.lower()
            if file_ext not in ['.jpg', '.jpeg']:
                return False, 0, 0, f"Unsupported file format: {file_ext}"
            
            # Get original file size
            original_size = os.path.getsize(input_path)
            
            # Generate output path if not provided
            if output_path is None:
                input_path_obj = Path(input_path)
                output_path = str(input_path_obj.parent / f"{input_path_obj.stem}_compressed{input_path_obj.suffix}")
            
            # Open and process the image
            with Image.open(input_path) as img:
                # Convert to RGB if necessary (handles RGBA, P mode, etc.)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Apply auto-orientation based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Save with compression settings
                img.save(
                    output_path,
                    'JPEG',
                    quality=quality,
                    optimize=optimize,
                    progressive=progressive
                )
            
            # Get compressed file size
            compressed_size = os.path.getsize(output_path)
            
            return True, original_size, compressed_size, output_path
            
        except Exception as e:
            return False, 0, 0, f"Error compressing image: {str(e)}"
    
    def batch_compress(self, input_dir, output_dir=None, quality=85, optimize=True, progressive=True):
        """
        Compress all JPG images in a directory.
        
        Args:
            input_dir (str): Directory containing input images
            output_dir (str): Directory for compressed images (optional)
            quality (int): Compression quality (1-100)
            optimize (bool): Enable optimization
            progressive (bool): Enable progressive JPEG
            
        Returns:
            dict: Results summary
        """
        if not os.path.exists(input_dir):
            return {"error": f"Input directory does not exist: {input_dir}"}
        
        # Create output directory if not specified
        if output_dir is None:
            output_dir = os.path.join(input_dir, "compressed")
        
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
            "total_compressed_size": 0,
            "files": []
        }
        
        for input_file in jpg_files:
            filename = os.path.basename(input_file)
            output_file = os.path.join(output_dir, filename)
            
            success, orig_size, comp_size, output_path = self.compress_image(
                input_file, output_file, quality, optimize, progressive
            )
            
            results["processed"] += 1
            
            if success:
                results["successful"] += 1
                results["total_original_size"] += orig_size
                results["total_compressed_size"] += comp_size
                
                compression_ratio = ((orig_size - comp_size) / orig_size) * 100 if orig_size > 0 else 0
                
                results["files"].append({
                    "filename": filename,
                    "status": "success",
                    "original_size": orig_size,
                    "compressed_size": comp_size,
                    "compression_ratio": compression_ratio,
                    "output_path": output_path
                })
            else:
                results["failed"] += 1
                results["files"].append({
                    "filename": filename,
                    "status": "failed",
                    "error": output_path  # Error message is in output_path when failed
                })
        
        return results


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
        description="Compress JPG images with customizable quality settings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Compress a single image with default quality (85)
  python image_compressor.py input.jpg
  
  # Compress with specific quality and output path
  python image_compressor.py input.jpg -o compressed.jpg -q 70
  
  # Batch compress all images in a directory
  python image_compressor.py -d /path/to/images -od /path/to/output
  
  # Compress with high quality and no progressive encoding
  python image_compressor.py input.jpg -q 95 --no-progressive
        """
    )
    
    # Input options
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('input_file', nargs='?', help='Input JPG file to compress')
    group.add_argument('-d', '--directory', help='Directory containing JPG files to compress')
    
    # Output options
    parser.add_argument('-o', '--output', help='Output file path (for single file) or directory (for batch)')
    parser.add_argument('-od', '--output-dir', help='Output directory for batch processing')
    
    # Compression options
    parser.add_argument('-q', '--quality', type=int, default=85, choices=range(1, 101),
                       help='JPEG quality (1-100, default: 85)')
    parser.add_argument('--no-optimize', action='store_true',
                       help='Disable JPEG optimization')
    parser.add_argument('--no-progressive', action='store_true',
                       help='Disable progressive JPEG encoding')
    
    # Display options
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Enable verbose output')
    
    args = parser.parse_args()
    
    compressor = ImageCompressor()
    
    # Single file compression
    if args.input_file:
        if args.verbose:
            print(f"Compressing: {args.input_file}")
            print(f"Quality: {args.quality}")
            print(f"Optimize: {not args.no_optimize}")
            print(f"Progressive: {not args.no_progressive}")
            print("-" * 50)
        
        success, orig_size, comp_size, output_path = compressor.compress_image(
            args.input_file,
            args.output,
            args.quality,
            not args.no_optimize,
            not args.no_progressive
        )
        
        if success:
            compression_ratio = ((orig_size - comp_size) / orig_size) * 100 if orig_size > 0 else 0
            print(f"✅ Compression successful!")
            print(f"   Original size: {format_file_size(orig_size)}")
            print(f"   Compressed size: {format_file_size(comp_size)}")
            print(f"   Compression ratio: {compression_ratio:.1f}%")
            print(f"   Output: {output_path}")
        else:
            print(f"❌ Compression failed: {output_path}")
            sys.exit(1)
    
    # Batch compression
    elif args.directory:
        output_dir = args.output_dir or args.output
        
        if args.verbose:
            print(f"Batch compressing directory: {args.directory}")
            print(f"Output directory: {output_dir or 'auto-generated'}")
            print(f"Quality: {args.quality}")
            print(f"Optimize: {not args.no_optimize}")
            print(f"Progressive: {not args.no_progressive}")
            print("-" * 50)
        
        results = compressor.batch_compress(
            args.directory,
            output_dir,
            args.quality,
            not args.no_optimize,
            not args.no_progressive
        )
        
        if "error" in results:
            print(f"❌ Batch compression failed: {results['error']}")
            sys.exit(1)
        
        # Display results
        print(f"📊 Batch Compression Results:")
        print(f"   Files processed: {results['processed']}")
        print(f"   Successful: {results['successful']}")
        print(f"   Failed: {results['failed']}")
        
        if results['successful'] > 0:
            total_orig = results['total_original_size']
            total_comp = results['total_compressed_size']
            total_ratio = ((total_orig - total_comp) / total_orig) * 100 if total_orig > 0 else 0
            
            print(f"   Total original size: {format_file_size(total_orig)}")
            print(f"   Total compressed size: {format_file_size(total_comp)}")
            print(f"   Overall compression ratio: {total_ratio:.1f}%")
        
        if args.verbose and results['files']:
            print("\n📁 Individual file results:")
            for file_info in results['files']:
                if file_info['status'] == 'success':
                    print(f"   ✅ {file_info['filename']}: "
                          f"{format_file_size(file_info['original_size'])} → "
                          f"{format_file_size(file_info['compressed_size'])} "
                          f"({file_info['compression_ratio']:.1f}%)")
                else:
                    print(f"   ❌ {file_info['filename']}: {file_info['error']}")


if __name__ == "__main__":
    main()