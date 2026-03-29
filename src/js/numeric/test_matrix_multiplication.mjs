import { readFileSync } from 'fs';
import { matrix_multiplication } from './matrix_multiplication.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/matrix/${size}.bin`;

const buffer   = readFileSync(path);
const view     = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const n        = view.getInt32(0, true);
const elements = n * n;

const A = new Float64Array(elements);
const B = new Float64Array(elements);

for (let i = 0; i < elements; i++) {
    A[i] = view.getFloat64(4 + i * 8, true);
    B[i] = view.getFloat64(4 + elements * 8 + i * 8, true);
}

const C = new Float64Array(n * n);

matrix_multiplication(A, B, C, n);

let expected = 0.0;
for (let k = 0; k < n; k++) {
    expected += A[k] * B[k * n];
}

const diff = Math.abs(C[0] - expected);

console.log('------------');
console.log('Matrix multiplication');
console.log('------------');
console.log(`Dataset : ${path}`);
console.log(`Size    : ${n}x${n}`);
console.log(`C[0][0] check: ${C[0].toFixed(4)} (computed) vs ${expected.toFixed(4)} (expected)`);
console.log(diff < 1e-6 ? 'OK' : 'FAIL');