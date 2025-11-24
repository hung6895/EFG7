# Fractal Zoom - Web Application

A web-based visualization tool for exploring self-similar fractals using Iterated Function Systems (IFS). 

## Credits

This application is a JavaScript/web conversion of the original MATLAB program created by **Professor Christoph Bandt** for the open-access paper:

**"Elementary Fractal Geometry 7: An Algorithm Visualizing the Magnification Flow"**  
by Christoph Bandt (ORCID)  
Published in *Fractal and Fractional*, 2025.

**Source Paper:**  
The original MATLAB program (`scenery.m` and supporting functions) and fractal data files are supplementary material from this open-access paper. The paper and its supplementary materials are freely available for educational and research purposes.

The original MATLAB program and fractal data files are the work of Professor Bandt. This web application maintains the same mathematical algorithms and visualization principles as the original MATLAB implementation.

**Original MATLAB Program:**  
- `scenery.m` - Main visualization function  
- `globa.m` - Point cloud generation  
- `nbmaps.m` - Neighbor map computation  
- `greedychoice.m` - Piece selection algorithm  
- Fractal data files (`.mat` format) in the `EFG7Program/` directory

All original files are provided with the original License.rtf file. This web conversion is provided for educational and research purposes.

## Features

- Interactive fractal visualization with virtual magnification
- Support for multiple fractal examples (A1-F4 series)
- Adjustable parameters:
  - Number of magnifications
  - Pause time between iterations
  - Weight parameter for piece selection
  - Window ratio
- Real-time status display (iteration count, neighbor count)
- Modern, responsive UI

## Setup

### ⚠️ Important: CORS Security Restriction

**You cannot open `index.html` directly from the file system** due to browser security restrictions (CORS policy). You must use a web server.

### Option 1: Using the Provided Server (Easiest)

1. **Start the web server:**
   ```bash
   python server.py
   ```
   Or double-click `server.bat` on Windows.

2. The server will automatically open your browser to `http://localhost:8000`
3. If it doesn't open automatically, navigate to `http://localhost:8000/index.html` in your browser

### Option 2: Using Python's Built-in Server

If you prefer not to use the provided server script:

```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000/index.html in your browser
```

### Option 3: Using Node.js http-server

```bash
npx http-server -p 8000
# Then open http://localhost:8000/index.html in your browser
```

### Option 4: Convert MATLAB Files

To use the original `.mat` files from the EFG7Program directory:

1. Install Python dependencies:
```bash
pip install scipy numpy
```

2. Run the converter script:
```bash
python convert_mat_to_json.py
```

This will convert all `.mat` files in the `EFG7Program/` directory to JSON format in the `data/` directory.

3. Open `index.html` in a web browser

## Usage

1. Select a fractal from the dropdown menu
2. Adjust parameters as desired:
   - **Number of Magnifications**: How many zoom iterations to perform (1-1000)
   - **Pause Time**: Delay between iterations in milliseconds
   - **Weight Parameter**: Controls piece selection (0 = uniform, 3 = good for dense neighborhoods)
   - **Window Ratio**: Ratio between large and small viewing windows
3. Click "Start Visualization" to begin
4. Watch as the fractal structure is magnified and explored
5. Use "Stop" to pause or "Reset" to clear the canvas

## File Structure

- `index.html` - Main HTML interface
- `styles.css` - Styling and layout
- `app.js` - Application logic and event handling
- `scenery.js` - Main visualization function
- `fractal-core.js` - Core fractal computation functions (converted from MATLAB)
- `math-utils.js` - Mathematical utility functions for matrix operations
- `convert_mat_to_json.py` - Script to convert MATLAB .mat files to JSON
- `data/` - Directory for JSON fractal data files (created after conversion)

## Technical Details

The application converts the MATLAB code to JavaScript:

- **globa.m** → `globa()` in `fractal-core.js` - Generates point cloud
- **scenery.m** → `scenery()` in `scenery.js` - Main visualization loop
- **nbmaps.m** → `nbmaps()` in `fractal-core.js` - Computes neighbor maps
- **greedychoice.m** → `greedychoice()` in `fractal-core.js` - Piece selection algorithm

The visualization uses HTML5 Canvas for rendering, with real-time updates as the fractal is explored.

## Browser Compatibility

Works best in modern browsers that support:
- ES6+ JavaScript
- HTML5 Canvas
- Async/await
- Fetch API

Tested on Chrome, Firefox, Edge, and Safari.

## Notes

- The original MATLAB program uses 1-based indexing; the JavaScript version uses 0-based indexing
- Matrix operations are implemented from scratch for compatibility
- The visualization may slow down with fractals that have many neighbors (>1000)
- Emergency stop is triggered automatically if neighbor count exceeds 1000

## License

This web application conversion maintains the same functionality as the original MATLAB program by Professor Christoph Bandt. 

**Original Work:**  
The MATLAB program, algorithms, and fractal data are the intellectual property of Professor Christoph Bandt. Please refer to the original `License.rtf` file in the `EFG7Program/` directory for licensing information regarding the original MATLAB code and data files.

**Web Conversion:**  
This JavaScript/web conversion is provided for educational and research purposes. The conversion maintains the mathematical algorithms and visualization principles of the original work while adapting the code for web browser execution.

## Citation

If you use this software in your research, please cite the original open-access paper:

```
Bandt, C. (2025). Elementary Fractal Geometry 7: An Algorithm Visualizing the Magnification Flow. 
Fractal and Fractional.
```

**Paper Source:**  
This web application is based on the open-access paper and its supplementary MATLAB code. The original paper is available through *Fractal and Fractional* journal. The MATLAB program files (`scenery.m`, `globa.m`, `nbmaps.m`, `greedychoice.m`) and fractal data files (`.mat` format) are provided as supplementary material with the paper.

## Acknowledgments

Special thanks to **Professor Christoph Bandt** for creating the original MATLAB program and for his contributions to fractal geometry research. This web application would not exist without his foundational work.

