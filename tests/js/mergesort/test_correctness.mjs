import { merge_sort } from '../../../src/js/sorting/mergesort.mjs';
import { loadSortData } from '../test_loaders.mjs';

function runCase(label, inputPath, expectedPath) {
    const sortData = loadSortData(inputPath);
    const expected = loadSortData(expectedPath);

    console.log(`Merge Sort (${label})`);
    console.log(`Loaded: ${sortData.n} elements`);
    const n = sortData.n;

    merge_sort(sortData.arr, n);

    let expectedResult = sortData.n === expected.n;

    if (expectedResult) {
        for (let i = 0; i < expected.n; i++) {
            if (sortData.arr[i] !== expected.arr[i]) {
                console.log(
                    `mismatch (${label}) at index ${i}: ` + `got ${sortData.arr[i]}, expected ${expected.arr[i]}`
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

    console.log("RESULT", JSON.stringify({
        case: label,
        n: sortData.n,
        array: Array.from(sortData.arr),
        expected_result: expectedResult
    }));
}

runCase("basic", "../../../datasets/correctness/sorting/basic_input.bin", "../../../datasets/correctness/sorting/basic_expected.bin");
runCase("sorted", "../../../datasets/correctness/sorting/sorted_input.bin", "../../../datasets/correctness/sorting/sorted_expected.bin");
runCase("reverse", "../../../datasets/correctness/sorting/reverse_input.bin", "../../../datasets/correctness/sorting/reverse_expected.bin");
runCase("duplicate", "../../../datasets/correctness/sorting/duplicate_input.bin", "../../../datasets/correctness/sorting/duplicate_expected.bin");
