// https://en.wikipedia.org/wiki/Quicksort

// Swaps two integers
function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

// Sorts (a portion of) an array, divides it into partitions, then sorts those
function quicksort(A, lo, hi) {
    // Ensure indices are in correct order
    if (lo >= hi || lo < 0) {
        return;
    }

    // Partition array and get the pivot index
    const p = partition(A, lo, hi);

    // Sort the two partitions
    quicksort(A, lo, p - 1); // Left side of pivot
    quicksort(A, p + 1, hi); // Right side of pivot
}

// Divides array into two partitions
function partition(A, lo, hi) {
    const pivot = A[hi]; // Choose the last element as the pivot

    // Temporary pivot index
    let i = lo;

    for (let j = lo; j < hi; j++) {
        // If the current element is less than or equal to the pivot
        if (A[j] <= pivot) {
            // Swap the current element with the element at the temporary pivot index
            swap(A, i, j);
            // Move the temporary pivot index forward
            i++;
        }
    }

    // Swap the pivot with the last element
    swap(A, i, hi);

    return i; // the pivot index
}

// entry point
export function quick_sort(arr, n) {
    if (!arr || n <= 1) return;
    quicksort(arr, 0, n - 1);
}