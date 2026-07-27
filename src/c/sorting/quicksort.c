// https://en.wikipedia.org/wiki/Quicksort
#include <stdlib.h>

// Swaps two integers
static void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

// Divides array into two partitions
static int partition(int *arr, int lo, int hi) {
    int pivot = arr[hi]; // Choose the last element as the pivot

    // Temporary pivot index
    int i = lo;

    for (int j = lo; j < hi; j++) {
        // If the current element is less than or equal to the pivot
        if (arr[j] <= pivot) {
            // Swap the current element with the element at the temporary pivot index
            swap(&arr[i], &arr[j]);
            // Move the temporary pivot index forward
            i++;
        }
    }

    // Swap the pivot with the last element
    swap(&arr[i], &arr[hi]);
    return i; // the pivot index
}

// Sorts (a portion of) an array, divides it into partitions, then sorts those
static void quicksort(int *arr, int lo, int hi) {
    // Ensure indices are in correct order
    if (lo >= hi || lo < 0) {
        return;
    }

    // Partition array and get the pivot index
    int p = partition(arr, lo, hi);

    // Sort the two partitions
    quicksort(arr, lo, p - 1); // Left side of pivot
    quicksort(arr, p + 1, hi); // Right side of pivot
}

/*
 * Quick sort entrypoint
 */
void quick_sort(int *arr, int n) {
    if (arr == NULL || n <= 1) return;
    quicksort(arr, 0, n - 1);
}