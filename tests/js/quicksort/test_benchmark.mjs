import { quick_sort } from '../../../src/js/sorting/quicksort.mjs';
import { printArray } from '../test_utils.mjs';
import { isSorted } from '../test_utils.mjs';
import { arrayChecksum } from '../../../src/js/utils/utils.mjs';
import { loadSortData } from '../test_loaders.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/benchmark/sorting/${size}.bin`;
const sortData = loadSortData(inputPath);

const n = sortData.n;
const original = sortData.arr.slice();
const sorted = sortData.arr.slice();

quick_sort(sorted, sorted.length);

console.log(`Output (${n} elements):`);
console.log(printArray(sorted, 3));

const arraySorted = isSorted(sorted);
const sumIn = arrayChecksum(original);
const sumOut = arrayChecksum(sorted);
const sameSum = sumIn === sumOut;

console.log('RESULT', JSON.stringify({
    n,
    sorted: arraySorted,
    same_sum: sameSum,
    first: sorted[0],
    last: sorted[n - 1],
    checksum: sumOut.toString()
}));
