"""
Convert MATLAB .mat files to JSON format for the web app.

This script requires scipy to read MATLAB .mat files.
Install with: pip install scipy numpy
"""

import json
import sys
import os
from pathlib import Path

try:
    from scipy.io import loadmat
    import numpy as np
except ImportError:
    print("Error: scipy and numpy are required.")
    print("Install with: pip install scipy numpy")
    sys.exit(1)


def convert_mat_to_json(mat_file_path, output_dir="data"):
    """
    Convert a MATLAB .mat file to JSON format.
    
    Args:
        mat_file_path: Path to the .mat file
        output_dir: Directory to save JSON files
    """
    try:
        # Load MATLAB file
        mat_data = loadmat(mat_file_path)
        
        # Extract g and H matrices
        # MATLAB files typically store variables with '__' prefix for metadata
        # We need to find the actual variable names
        keys = [k for k in mat_data.keys() if not k.startswith('__')]
        
        if len(keys) < 2:
            print(f"Warning: {mat_file_path} doesn't seem to have g and H variables")
            print(f"Found keys: {keys}")
            return False
        
        # Try to identify g and H
        # g is typically a 2x2 matrix, H is typically a 3D array
        g = None
        H = None
        
        for key in keys:
            data = mat_data[key]
            if data.shape == (2, 2):
                g = data.tolist()
            elif len(data.shape) == 3 and data.shape[0] == 2:
                # H might be 2x3xm or 3x3xm
                H = []
                for i in range(data.shape[2]):
                    H.append(data[:, :, i].tolist())
            elif len(data.shape) == 3 and data.shape[0] == 3:
                # H might be 3x3xm
                H = []
                for i in range(data.shape[2]):
                    H.append(data[:, :, i].tolist())
        
        # Alternative: if g and H are stored with those exact names
        if 'g' in mat_data:
            g = mat_data['g'].tolist()
        if 'H' in mat_data:
            H_data = mat_data['H']
            if len(H_data.shape) == 3:
                H = []
                for i in range(H_data.shape[2]):
                    H.append(H_data[:, :, i].tolist())
        
        if g is None or H is None:
            print(f"Error: Could not extract g and H from {mat_file_path}")
            print(f"Available keys: {keys}")
            return False
        
        # Create output structure
        output_data = {
            "g": g,
            "H": H
        }
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate output filename
        mat_filename = Path(mat_file_path).stem
        output_path = os.path.join(output_dir, f"{mat_filename}.json")
        
        # Save as JSON
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Converted {mat_file_path} -> {output_path}")
        return True
        
    except Exception as e:
        print(f"Error converting {mat_file_path}: {e}")
        return False


def convert_all_mats(input_dir="EFG7Program", output_dir="data"):
    """
    Convert all .mat files in a directory.
    
    Args:
        input_dir: Directory containing .mat files
        output_dir: Directory to save JSON files
    """
    mat_files = list(Path(input_dir).glob("*.mat"))
    
    if not mat_files:
        print(f"No .mat files found in {input_dir}")
        return
    
    print(f"Found {len(mat_files)} .mat files")
    success_count = 0
    
    for mat_file in mat_files:
        if convert_mat_to_json(str(mat_file), output_dir):
            success_count += 1
    
    print(f"\nConverted {success_count}/{len(mat_files)} files successfully")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Convert specific file
        convert_mat_to_json(sys.argv[1])
    else:
        # Convert all files in EFG7Program directory
        convert_all_mats()

