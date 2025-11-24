// Main application logic

let currentVisualization = null;
let shouldStopFlag = false;

// Sample fractal data structure
// In a real implementation, these would be loaded from JSON files converted from .mat files
const fractalData = {
    // Placeholder - actual data would be loaded from JSON files
};

// Load fractal data from JSON file
async function loadFractalData(filename) {
    try {
        const response = await fetch(`data/${filename}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading fractal data:', error);
        // Return a simple example for testing
        return {
            g: [[2, 0], [0, 2]],
            H: [
                [[0.5, 0, 0], [0, 0.5, 0], [0, 0, 1]],
                [[0.5, 0, 0.5], [0, 0.5, 0], [0, 0, 1]],
                [[0.5, 0, 0], [0, 0.5, 0.5], [0, 0, 1]]
            ]
        };
    }
}

// Convert 3x3 matrices to 2x3 format if needed
function normalizeH(H) {
    return H.map(h => {
        if (h.length === 3 && h[0].length === 3) {
            // 3x3 format, convert to 2x3
            return [
                [h[0][0], h[0][1], h[0][2]],
                [h[1][0], h[1][1], h[1][2]]
            ];
        }
        return h;
    });
}

// Initialize canvas
function initCanvas() {
    const canvas = document.getElementById('fractal-canvas');
    const container = canvas.parentElement;
    
    // Set canvas size
    const size = Math.min(800, window.innerWidth - 40, window.innerHeight - 400);
    canvas.width = size;
    canvas.height = size;
    
    // Get context and configure for crisp pixel rendering
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Crisp pixels for fractal
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newSize = Math.min(800, window.innerWidth - 40, window.innerHeight - 400);
        canvas.width = newSize;
        canvas.height = newSize;
        ctx.imageSmoothingEnabled = false;
    });
    
    return ctx;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fractal-canvas');
    const ctx = initCanvas();
    
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const fractalSelect = document.getElementById('fractal-select');
    const iterationsInput = document.getElementById('iterations');
    const pauseTimeInput = document.getElementById('pause-time');
    const weightInput = document.getElementById('weight');
    const ratioInput = document.getElementById('ratio');
    const iterationCount = document.getElementById('iteration-count');
    const neighborCount = document.getElementById('neighbor-count');
    
    // Reset canvas
    function resetCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        iterationCount.textContent = '0';
        neighborCount.textContent = '0';
    }
    
    resetBtn.addEventListener('click', () => {
        if (currentVisualization) {
            shouldStopFlag = true;
        }
        resetCanvas();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
    
    stopBtn.addEventListener('click', () => {
        shouldStopFlag = true;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
    
    startBtn.addEventListener('click', async () => {
        const fractalName = fractalSelect.value;
        if (!fractalName) {
            alert('Please select a fractal first');
            return;
        }
        
        shouldStopFlag = false;
        startBtn.disabled = true;
        stopBtn.disabled = true;
        
        try {
            // Load fractal data
            const data = await loadFractalData(fractalName);
            
            if (!data || !data.g || !data.H) {
                throw new Error('Invalid fractal data format');
            }
            
            // Normalize H matrices
            const H = normalizeH(data.H);
            const g = data.g;
            
            console.log('Loaded fractal:', { 
                name: fractalName, 
                g, 
                H_count: H.length,
                H_format: H[0] ? `${H[0].length}x${H[0][0]?.length || 0}` : 'unknown'
            });
            
            // Get parameters
            const nit = parseInt(iterationsInput.value);
            const np = parseInt(pauseTimeInput.value);
            const w = parseFloat(weightInput.value);
            const rat = parseFloat(ratioInput.value);
            
            // Update status callback
            const onUpdate = (iteration, neighbors) => {
                iterationCount.textContent = iteration;
                neighborCount.textContent = neighbors;
            };
            
            // Should stop callback
            const shouldStop = () => shouldStopFlag;
            
            // Start visualization
            stopBtn.disabled = false;
            currentVisualization = scenery(ctx, g, H, nit, np, w, onUpdate, shouldStop, rat);
            
            await currentVisualization;
            
        } catch (error) {
            console.error('Error during visualization:', error);
            alert('Error during visualization: ' + error.message);
        } finally {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            currentVisualization = null;
        }
    });
    
    // Initial canvas setup
    resetCanvas();
});

