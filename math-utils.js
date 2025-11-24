// Mathematical utility functions for matrix operations

// Matrix inversion for 2x2 matrices
function inv2x2(matrix) {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular');
    }
    const invDet = 1 / det;
    return [
        [d * invDet, -b * invDet],
        [-c * invDet, a * invDet]
    ];
}

// Matrix multiplication
function matMul(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    
    if (colsA !== rowsB) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }
    
    const result = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
    
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return result;
}

// Matrix-vector multiplication (2D)
function matVecMul(matrix, vector) {
    const [a, b] = vector;
    const [[m00, m01], [m10, m11]] = matrix;
    return [m00 * a + m01 * b, m10 * a + m11 * b];
}

// Matrix addition
function matAdd(A, B) {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

// Matrix subtraction
function matSub(A, B) {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

// Determinant of 2x2 matrix
function det2x2(matrix) {
    const [[a, b], [c, d]] = matrix;
    return a * d - b * c;
}

// Vector dot product
function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

// Vector norm squared
function normSq(v) {
    return v[0] * v[0] + v[1] * v[1];
}

// Create identity matrix
function eye2x2() {
    return [[1, 0], [0, 1]];
}

// Convert MATLAB-style 3x3 matrix to 2x2 + translation
function extractTransform(H) {
    // H is 3x3 matrix, extract 2x2 rotation/scaling and 2x1 translation
    return {
        matrix: [[H[0][0], H[0][1]], [H[1][0], H[1][1]]],
        translation: [H[0][2], H[1][2]]
    };
}

