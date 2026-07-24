// Merge sort Top-down implementation
// https://en.wikipedia.org/wiki/Merge_sort

#include <stdlib.h>

// Copy a section of array a into array b (from begin to end - 1)
void copyArray(int *a, int begin, int end, int *b) {
    for (int k = begin; k < end; ++k) {
        b[k] = a[k];
    }
}

// Merge two sorted halves (from a) into a single sorted run (into b)
void topDownMerge(int *a, int begin, int middle, int end, int *b) {
    int i = begin;
    int j = middle;

    // Merge the two sorted runs into b
    for (int k = begin; k < end; ++k) {
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
void topDownSplitMerge(int *a, int begin, int end, int *b) {
    if (end - begin <= 1) {
        return; // Base case: Run size is 1, so it's already sorted
    }

    int middle = (begin + end) / 2; // Find the midpoint to split the array

    // Recursively sort the left and right halves into b
    topDownSplitMerge(b, begin, middle, a);
    topDownSplitMerge(b, middle, end, a);

    // Merge the sorted halves back into a
    topDownMerge(b, begin, middle, end, a);
}

void merge_sort(int *arr, int n) {
    if (arr == NULL || n <= 1) return;

    int *temp = (int *)malloc(n * sizeof(int));
    if (temp == NULL) return;
    
    // Copy the entire array into temp initially
    copyArray(arr, 0, n, temp);
    // Recursively split and merge the array temp into arr
    topDownSplitMerge(arr, 0, n, temp);

    free(temp);
}