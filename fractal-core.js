// Core fractal functions converted from MATLAB

/**
 * Generate global point cloud of IFS
 * @param {Array} g - 2x2 matrix
 * @param {Array} H - Array of 3x3 matrices (or 2x3 matrices)
 * @returns {Array} 2xN array of points
 */
function globa(g, H) {
    const N = 40000; // lower bound for number of points
    const gi = inv2x2(g);
    const m = H.length;
    
    // Calculate IFS F: F_i = g^-1 * H_i
    const F = H.map(Hi => {
        // Handle both 3x3 and 2x3 formats
        const H_matrix = Hi.length === 3 ? 
            [[Hi[0][0], Hi[0][1]], [Hi[1][0], Hi[1][1]]] :
            [[Hi[0][0], Hi[0][1]], [Hi[1][0], Hi[1][1]]];
        const H_trans = Hi.length === 3 ? 
            [Hi[0][2], Hi[1][2]] :
            [Hi[0][2], Hi[1][2]];
        
        const F_matrix = matMul(gi, H_matrix);
        const F_trans = matVecMul(gi, H_trans);
        return { matrix: F_matrix, translation: F_trans };
    });
    
    if (m <= 1) {
        console.error('Invalid number of transformations:', m);
        return [[0], [0]];
    }
    
    const L = Math.ceil(Math.log(N) / Math.log(m)); // min level so that m^L > N
    
    // Calculate total points needed: we need space for levels 0 through L
    // Total = (m^(L+1) - 1) / (m - 1)
    const totalPoints = Math.floor((Math.pow(m, L + 1) - 1) / (m - 1));
    
    if (totalPoints <= 0 || !isFinite(totalPoints)) {
        console.error('Invalid totalPoints calculation:', { m, L, totalPoints, N });
        return [[0], [0]];
    }
    const x = Array(2).fill(0).map(() => Array(totalPoints).fill(0));
    x[0][0] = 0;  // Start at origin
    x[1][0] = 0;
    
    // Track level boundaries (0-based indexing)
    // Level 0: index 0
    // Level 1: indices 1 to m
    // Level 2: indices m+1 to m+m^2
    // Level k: indices start at (m^k-1)/(m-1), count is m^k
    let levelStart = 0;
    let levelCount = 1;
    
    // Generate points level by level
    for (let level = 1; level <= L; level++) {
        const prevLevelStart = levelStart;
        const prevLevelCount = levelCount;
        
        levelStart = prevLevelStart + prevLevelCount;
        levelCount = Math.pow(m, level);
        
        // For each point in previous level, generate m children
        for (let parentIdx = 0; parentIdx < prevLevelCount; parentIdx++) {
            const parentGlobalIdx = prevLevelStart + parentIdx;
            if (parentGlobalIdx >= totalPoints) break;
            
            const basePoint = [x[0][parentGlobalIdx], x[1][parentGlobalIdx]];
            
            // Generate m children using transformations F[0] through F[m-1]
            for (let j = 0; j < m; j++) {
                const childLocalIdx = parentIdx * m + j;
                const childGlobalIdx = levelStart + childLocalIdx;
                
                if (childGlobalIdx >= totalPoints) break;
                
                // Apply transformation F[j]
                const transformed = matVecMul(F[j].matrix, basePoint);
                x[0][childGlobalIdx] = transformed[0] + F[j].translation[0];
                x[1][childGlobalIdx] = transformed[1] + F[j].translation[1];
            }
        }
    }
    
    // Keep only last level points
    // After the loop, levelStart points to where level L+1 would start
    // So level L starts at levelStart - levelCount (where levelCount is for level L)
    // But we need to recalculate: level L starts at (m^L - 1) / (m - 1)
    const lastLevelStart = Math.floor((Math.pow(m, L) - 1) / (m - 1));
    const lastLevelCount = Math.pow(m, L);
    const actualLastLevelStart = lastLevelStart; // This is the start of level L
    
    // Make sure we don't go out of bounds
    const endIdx = Math.min(actualLastLevelStart + lastLevelCount, totalPoints);
    const lastLevelPoints = x[0].slice(actualLastLevelStart, endIdx);
    const lastLevelPointsY = x[1].slice(actualLastLevelStart, endIdx);
    
    console.log(`globa: m=${m}, L=${L}, totalPoints=${totalPoints}, lastLevelStart=${actualLastLevelStart}, lastLevelCount=${lastLevelCount}, actualPoints=${lastLevelPoints.length}`);
    
    return [lastLevelPoints, lastLevelPointsY];
}

/**
 * Compute neighbor maps of piece i of next level within bounding circle
 * @param {Array} g - 2x2 matrix
 * @param {Array} H - Array of transformation matrices
 * @param {number} i - Index of piece (0-based)
 * @param {Array} nb - Neighbor list
 * @param {number} rm - Radius
 * @returns {Array} Array of neighbor maps
 */
function nbmaps(g, H, i, nb, rm) {
    const m = H.length;
    const na = [];
    const bound = 2 * rm * rm;
    
    // Extract transformation for piece i
    const Hi_matrix = H[i].length === 3 ?
        [[H[i][0][0], H[i][0][1]], [H[i][1][0], H[i][1][1]]] :
        [[H[i][0][0], H[i][0][1]], [H[i][1][0], H[i][1][1]]];
    const Hi_trans = H[i].length === 3 ?
        [H[i][0][2], H[i][1][2]] :
        [H[i][0][2], H[i][1][2]];
    
    const Hi_inv = inv2x2(Hi_matrix);
    
    // Sibling neighbors
    for (let j = 0; j < m; j++) {
        if (j !== i) {
            const Hj_trans = H[j].length === 3 ?
                [H[j][0][2], H[j][1][2]] :
                [H[j][0][2], H[j][1][2]];
            
            const v = [Hj_trans[0] - Hi_trans[0], Hj_trans[1] - Hi_trans[1]];
            if (normSq(v) <= bound) {
                const Hj_matrix = H[j].length === 3 ?
                    [[H[j][0][0], H[j][0][1]], [H[j][1][0], H[j][1][1]]] :
                    [[H[j][0][0], H[j][0][1]], [H[j][1][0], H[j][1][1]]];
                
                const combined = matMul(Hi_inv, Hj_matrix);
                const trans = matVecMul(Hi_inv, v);
                na.push({
                    matrix: combined,
                    translation: trans
                });
            }
        }
    }
    
    // Neighbors from list
    if (nb && nb.length > 0) {
        for (let k = 0; k < nb.length; k++) {
            const nbk = nb[k];
            for (let j = 0; j < m; j++) {
                const Hj_matrix = H[j].length === 3 ?
                    [[H[j][0][0], H[j][0][1]], [H[j][1][0], H[j][1][1]]] :
                    [[H[j][0][0], H[j][0][1]], [H[j][1][0], H[j][1][1]]];
                const Hj_trans = H[j].length === 3 ?
                    [H[j][0][2], H[j][1][2]] :
                    [H[j][0][2], H[j][1][2]];
                
                const v1 = matVecMul(nbk.matrix, Hj_trans);
                const v2 = matVecMul(g, nbk.translation);
                const v = [v1[0] + v2[0] - Hi_trans[0], v1[1] + v2[1] - Hi_trans[1]];
                
                if (normSq(v) <= bound) {
                    const combined = matMul(Hi_inv, matMul(nbk.matrix, Hj_matrix));
                    const trans = matVecMul(Hi_inv, v);
                    na.push({
                        matrix: combined,
                        translation: trans
                    });
                }
            }
        }
    }
    
    return na;
}

/**
 * Random choice of pieces, preferring those with more neighbors
 * @param {Array} g - 2x2 matrix
 * @param {Array} H - Array of transformation matrices
 * @param {Array} nb - Neighbor list
 * @param {number} a - Radius
 * @param {number} w - Weight parameter
 * @returns {number} Index of chosen piece (0-based)
 */
function greedychoice(g, H, nb, a, w) {
    const m = H.length;
    const u = Array(m).fill(0);
    const bound = 4 * a * a;
    
    for (let i = 0; i < m; i++) {
        let n = 0;
        const Hi_trans = H[i].length === 3 ?
            [H[i][0][2], H[i][1][2]] :
            [H[i][0][2], H[i][1][2]];
        
        // Count neighbors
        for (let j = 0; j < m; j++) {
            if (j !== i) {
                const Hj_trans = H[j].length === 3 ?
                    [H[j][0][2], H[j][1][2]] :
                    [H[j][0][2], H[j][1][2]];
                
                const v = [Hj_trans[0] - Hi_trans[0], Hj_trans[1] - Hi_trans[1]];
                if (normSq(v) < bound) {
                    n++;
                }
            }
        }
        
        if (nb && nb.length > 0) {
            for (let k = 0; k < nb.length; k++) {
                const nbk = nb[k];
                for (let j = 0; j < m; j++) {
                    const Hj_trans = H[j].length === 3 ?
                        [H[j][0][2], H[j][1][2]] :
                        [H[j][0][2], H[j][1][2]];
                    
                    const v1 = matVecMul(nbk.matrix, Hj_trans);
                    const v2 = matVecMul(g, nbk.translation);
                    const v = [v1[0] + v2[0] - Hi_trans[0], v1[1] + v2[1] - Hi_trans[1]];
                    
                    if (normSq(v) < bound) {
                        n++;
                    }
                }
            }
        }
        
        u[i] = n;
    }
    
    // Weight and normalize
    const uWeighted = u.map(val => Math.pow(val, w));
    const sum = uWeighted.reduce((a, b) => a + b, 0);
    const uCumsum = [];
    let cumsum = 0;
    for (let i = 0; i < m; i++) {
        cumsum += uWeighted[i];
        uCumsum.push(cumsum / sum);
    }
    
    // Random choice
    const r = Math.random();
    for (let i = 0; i < m; i++) {
        if (uCumsum[i] > r) {
            return i;
        }
    }
    
    return m - 1;
}

