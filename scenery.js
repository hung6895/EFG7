// Main scenery visualization function

/**
 * Film of random magnifications of an IFS
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} g - 2x2 matrix
 * @param {Array} H - Array of transformation matrices
 * @param {number} nit - Number of magnifications
 * @param {number} np - Pause time in milliseconds
 * @param {number|Array} w - Weight parameter or deterministic choice vector
 * @param {Function} onUpdate - Callback for status updates
 * @param {Function} shouldStop - Function to check if should stop
 * @param {number} rat - Ratio of width of large and small window
 * @returns {Promise} Promise that resolves when visualization completes
 */
async function scenery(ctx, g, H, nit, np, w, onUpdate, shouldStop, rat = 3) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Generate point cloud
    const x = globa(g, H);
    const N = x[0].length;
    const m = H.length;
    
    console.log(`Generated ${N} points for fractal with ${m} transformations`);
    if (N === 0) {
        console.error('No points generated!');
        return [];
    }
    
    // Calculate radius and constants
    let maxDist = 0;
    for (let i = 0; i < N; i++) {
        const dist = x[0][i] * x[0][i] + x[1][i] * x[1][i];
        if (dist > maxDist) maxDist = dist;
    }
    let a = Math.sqrt(maxDist); // radius of small square
    if (a === 0 || !isFinite(a)) {
        // Fallback: calculate bounds from min/max coordinates
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < N; i++) {
            if (x[0][i] < minX) minX = x[0][i];
            if (x[0][i] > maxX) maxX = x[0][i];
            if (x[1][i] < minY) minY = x[1][i];
            if (x[1][i] > maxY) maxY = x[1][i];
        }
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        a = Math.max(rangeX, rangeY) / 2;
        if (a === 0) a = 1; // Default if still zero
    }
    const b = rat * a; // radius of large square
    const R = Math.sqrt(Math.abs(det2x2(g)));
    const S = matMul([[R, 0], [0, R]], inv2x2(g));
    
    // Subpiece colors
    const colors = [
        [255, 255, 0],    // yellow
        [255, 0, 255],    // magenta
        [204, 128, 128],  // light red
        [204, 179, 51],   // orange
        [204, 51, 179],   // pink
        [204, 204, 204]   // light gray
    ];
    
    // Scale and center for canvas
    const scale = Math.min(width, height) / (2 * b);
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate point size based on scale (declare once for entire function)
    const pointSize = Math.max(1, Math.min(3, scale / 10));
    
    console.log(`View bounds: a=${a.toFixed(3)}, b=${b.toFixed(3)}, scale=${scale.toFixed(3)}`);
    
    function toCanvasX(x) {
        return centerX + x * scale;
    }
    
    function toCanvasY(y) {
        return centerY - y * scale; // Flip Y axis
    }
    
    // Draw initial point cloud
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    for (let j = 0; j < m; j++) {
        ctx.fillStyle = `rgb(${colors[j % colors.length].join(',')})`;
        for (let i = j; i < N; i += m) {
            const px = toCanvasX(x[0][i]);
            const py = toCanvasY(x[1][i]);
            ctx.fillRect(px, py, pointSize, pointSize);
        }
    }
    
    // Draw squares
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
        toCanvasX(-a), toCanvasY(a),
        (2 * a) * scale, (2 * a) * scale
    );
    ctx.strokeRect(
        toCanvasX(-b), toCanvasY(b),
        (2 * b) * scale, (2 * b) * scale
    );
    
    await sleep(np);
    
    let D = eye2x2();
    let nb = [];
    let y = x;
    const Lw = Array.isArray(w) ? w.length : 0;
    let wArray = Array.isArray(w) ? [...w] : null;
    const wValue = Array.isArray(w) ? 3 : w;
    const z = [];
    
    for (let it = 0; it < nit; it++) {
        if (shouldStop && shouldStop()) {
            break;
        }
        
        // Choose subpiece
        let i;
        if (Lw > 1 && it < Lw) {
            i = wArray[it];
            if (it === Lw - 1) {
                wArray = null;
            }
        } else {
            i = greedychoice(g, H, nb, a, wValue);
        }
        
        // Draw selected piece in red
        ctx.fillStyle = '#ff0000';
        for (let idx = i; idx < N; idx += m) {
            if (idx < y[0].length) {
                const px = toCanvasX(y[0][idx]);
                const py = toCanvasY(y[1][idx]);
                ctx.fillRect(px, py, pointSize, pointSize);
            }
        }
        
        // Draw red square around a representative point of the piece
        const rr = b / R;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        // Use first point of piece i as reference
        const refIdx = i < N ? i : 0;
        if (refIdx < y[0].length) {
            ctx.strokeRect(
                toCanvasX(y[0][refIdx] - rr), toCanvasY(y[1][refIdx] + rr),
                (2 * rr) * scale, (2 * rr) * scale
            );
        }
        
        await sleep(np);
        
        // Update transformation
        // H[i] is 2x3: [[a, b, tx], [c, d, ty]]
        const Hi_matrix = [
            [H[i][0][0], H[i][0][1]],
            [H[i][1][0], H[i][1][1]]
        ];
        D = matMul(D, matMul(S, Hi_matrix));
        
        // Compute neighbors
        const na = nbmaps(g, H, i, nb, a + b);
        const n = na.length;
        const corr = [];
        
        // Clear and start new image
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw neighbors
        for (let k = 0; k < n; k++) {
            const nak = na[k];
            const yNeighbor = [[], []];
            let hasPoints = false;
            
            // MATLAB: y = D*(na(:,1:2,k)*x + na(:,3,k))
            for (let idx = 0; idx < N; idx++) {
                // First: na(:,1:2,k)*x + na(:,3,k)
                const temp = matVecMul(nak.matrix, [x[0][idx], x[1][idx]]);
                const tempX = temp[0] + nak.translation[0];
                const tempY = temp[1] + nak.translation[1];
                
                // Then: D * (result)
                const transformed = matVecMul(D, [tempX, tempY]);
                const yx = transformed[0];
                const yy = transformed[1];
                
                if (Math.abs(yx) < b && Math.abs(yy) < b) {
                    yNeighbor[0].push(yx);
                    yNeighbor[1].push(yy);
                    hasPoints = true;
                }
            }
            
            if (hasPoints) {
                corr[k] = 1;
                const color = [0, Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
                ctx.fillStyle = `rgb(${color.join(',')})`;
                for (let idx = 0; idx < yNeighbor[0].length; idx++) {
                    const px = toCanvasX(yNeighbor[0][idx]);
                    const py = toCanvasY(yNeighbor[1][idx]);
                    ctx.fillRect(px, py, pointSize, pointSize);
                }
            } else {
                corr[k] = 0;
            }
        }
        
        // Draw squares
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            toCanvasX(-b), toCanvasY(b),
            (2 * b) * scale, (2 * b) * scale
        );
        ctx.strokeRect(
            toCanvasX(-a), toCanvasY(a),
            (2 * a) * scale, (2 * a) * scale
        );
        
        // Draw central piece
        // MATLAB: y = D*x
        const yCentral = [[], []];
        for (let idx = 0; idx < N; idx++) {
            const transformed = matVecMul(D, [x[0][idx], x[1][idx]]);
            yCentral[0].push(transformed[0]);
            yCentral[1].push(transformed[1]);
        }
        
        for (let j = 0; j < m; j++) {
            ctx.fillStyle = `rgb(${colors[j % colors.length].join(',')})`;
            for (let idx = j; idx < N; idx += m) {
                const px = toCanvasX(yCentral[0][idx]);
                const py = toCanvasY(yCentral[1][idx]);
                ctx.fillRect(px, py, pointSize, pointSize);
            }
        }
        
        // Update neighbor list
        nb = na.filter((_, k) => corr[k] === 1);
        const numNeighbors = nb.length;
        
        z.push({ iteration: it + 1, piece: i, neighbors: numNeighbors });
        
        if (onUpdate) {
            onUpdate(it + 1, numNeighbors);
        }
        
        if (numNeighbors > 1000) {
            // Emergency stop
            break;
        }
        
        y = yCentral;
        await sleep(np);
    }
    
    return z;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

