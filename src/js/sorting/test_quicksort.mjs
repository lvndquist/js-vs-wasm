import { readFileSync } from 'fs';
import { quick_sort } from './quicksort.mjs';
import { printArray } from '../utils/utils.mjs';
import { isSorted } from '../utils/utils.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/sorting/${size}.bin`;

const buffer = readFileSync(path);
const n = buffer.readInt32LE(0);
const arr = new Int32Array(buffer.buffer, buffer.byteOffset + 4, n);

const original = arr.slice();
const sorted = arr.slice();

quick_sort(sorted, sorted.length);

console.log('------------');
console.log('Quick sort');
console.log('------------');
console.log(`Dataset: ${path}`);
console.log(`Input (${n} elements):`);
console.log(printArray(original, 3));

console.log(`Output (${n} elements):`);
console.log(printArray(sorted, 3));

console.log(isSorted(sorted) ? 'OK' : 'FAIL');