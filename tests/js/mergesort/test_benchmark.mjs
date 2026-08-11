import { merge_sort } from '../../../src/js/sorting/mergesort.mjs';
import { printArray, isSorted, arrayChecksum } from '../test_utils.mjs';
import { loadSortData } from '../test_loaders.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/benchmark/sorting/${size}.bin`;
const sortData = loadSortData(path);

const n = sortData.n;
const original = sortData.arr.slice();
const sorted = sortData.arr.slice();

merge_sort(sorted, sorted.length);

// console.log('Merge sort');
// console.log(`Dataset: ${path}`);
// console.log(`Input (${n} elements):`);
// console.log(printArray(original, 3));

console.log(`Output (${n} elements):`);
console.log(printArray(sorted, 3));

// console.log(isSorted(sorted) ? 'OK' : 'FAIL');

const arraySorted = isSorted(sorted);
const sumIn = arrayChecksum(original);
const sumOut = arrayChecksum(sorted);
const sameSum = sumIn === sumOut;

console.log("RESULT", JSON.stringify({
    n,
    sorted: arraySorted,
    first: sorted[0],
    same_sum: sameSum,
    last: sorted[n - 1],
    checksum: sumOut.toString()
}));
