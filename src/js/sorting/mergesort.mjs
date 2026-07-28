// Merge sort Top-down implementation
// https://en.wikipedia.org/wiki/Merge_sort

// Copy a section of the array a into array b (from begin to end - 1)
function copyArray(a, begin, end, b) {
    for (let k = begin; k < end; ++k) {
        b[k] = a[k];
    }
}

// Merge two sorted halves (from a) into a single sorted run (into b)
function topDownMerge(a, begin, middle, end, b) {
    let i = begin;
    let j = middle;

    // Merge the two sorted runs into b
    for (let k = begin; k < end; ++k) {
        if (i < middle && (j >= end || a[i] <= a[j])) {
            b[k] = a[i]; // Take element from the left run
            i++;
        } else {
            b[k] = a[j]; // Take element from the right run
            j++;
        }
    }
}

// Split the array a into two halves, sort both halves into b,
// and merge the sorted halves back into a
function topDownSplitMerge(a, begin, end, b) {
    if (end - begin <= 1) {
        return; // Base case: Run size is 1, so it's already sorted
    }

    const middle = Math.floor((begin + end) / 2); // Find the midpoint to split the array

    // Recursively sort the left and right halves into b
    topDownSplitMerge(b, begin, middle, a);
    topDownSplitMerge(b, middle, end, a);

    // Merge the sorted halves back into a
    topDownMerge(b, begin, middle, end, a);
}

export function merge_sort(arr, n) {
    if (!arr || n <= 1) return;

    const temp = new Array(n);
    // Copy the entire array into temp initially
    copyArray(arr, 0, n, temp);
    // Recursively split and merge the array temp into arr
    topDownSplitMerge(arr, 0, n, temp);
}