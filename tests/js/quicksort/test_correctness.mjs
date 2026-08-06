import { readFileSync } from 'fs';
import { quick_sort } from '../../../src/js/sorting/quicksort.mjs';

function loadSortData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength
    );

    const n = view.getInt32(0, true);
    const arr = new Int32Array(n);

    for (let i = 0; i < n; i++) {
        arr[i] = view.getInt32(4 + i *4, true);
    }

    return {
        n,
        arr
    };
}

function runCase(label, inputPath, expectedPath) {
    const sortData = loadSortData(inputPath);
    const expected = loadSortData(expectedPath);

    console.log(`Quick Sort (${label})`);
    console.log(`Loaded: ${sortData.n} elements`);
    const n = sortData.n;

    quick_sort(sortData.arr, n);

    let expectedResult = sortData.n === expected.n;

    if (expectedResult) {
        for (let i = 0; i < expected.n; i++) {
            if (sortData.arr[i] !== expected.arr[i]) {
                console.log(
                    `mismatch (${label}) at index ${i}: ` +`got ${sortData.arr[i]}, expected ${expected.arr[i]}`
                );

                expectedResult = false;
                break;
            }
        }
    } else {
        console.log(
            `mismatch (${label}): ${sortData.n}/${expected.n}`
        );
    }

    console.log(
        'RESULT',
        JSON.stringify({
            case: label,
            n: sortData.n,
            array: Array.from(sortData.arr),
            expected_result: expectedResult
        })
    );
}

runCase("basic", "../../../datasets/correctness/sorting/basic_input.bin", "../../../datasets/correctness/sorting/basic_expected.bin");
runCase("sorted", "../../../datasets/correctness/sorting/sorted_input.bin", "../../../datasets/correctness/sorting/sorted_expected.bin");
runCase("reverse", "../../../datasets/correctness/sorting/reverse_input.bin", "../../../datasets/correctness/sorting/reverse_expected.bin");
runCase("duplicate", "../../../datasets/correctness/sorting/duplicate_input.bin", "../../../datasets/correctness/sorting/duplicate_expected.bin");
