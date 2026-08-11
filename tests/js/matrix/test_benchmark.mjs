import { loadMatrixData } from '../test_loaders.mjs';
import { matrix_multiplication } from '../../../src/js/numeric/matrix_multiplication.mjs';
import { matrixChecksum } from '../../../src/js/utils/utils.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/benchmark/matrix/${size}.bin`;
const matrixData = loadMatrixData(inputPath);

const n = matrixData.n;

matrix_multiplication(matrixData.A, matrixData.B, matrixData.C, n);

let expected = 0.0;
for (let k = 0; k < n; k++) {
    expected += matrixData.A[k] * matrixData.B[k * n];
}

const diff = Math.abs(matrixData.C[0] - expected);

console.log('Matrix multiplication');
console.log(`Dataset: ${path}`);
console.log(`Size: ${n}x${n}`);
console.log(`C[0][0] check: ${matrixData.C[0].toFixed(4)} (computed) vs ${expected.toFixed(4)} (expected)`);
console.log(diff < 1e-6 ? 'OK' : 'FAIL');

console.log("RESULT", JSON.stringify({
    n,
    c00: Number(matrixData.C[0].toFixed(4)),
    checksum: Number(matrixChecksum(matrixData.C, n).toFixed(4))
}));