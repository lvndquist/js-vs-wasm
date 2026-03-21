#include <stdlib.h>

/*
 * Swaps two integers
 */
static void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

/*
 * Partitions arr[left .. right] around the last element.
 * Returns the final pivot index
 */
static int partition(int *arr, int left, int right) {
    int pivot = arr[right];
    int i = left - 1;

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            swap(&arr[i + 1], &arr[j]);
            i++;
        }
    }
    swap(&arr[i + 1], &arr[right]);
    return i + 1;
}

/*
 * Quick sort
 * Sorts arr[left .. right] ascending order
 */
static void quick_sort_recursive(int *arr, int left, int right) {
    if (left >= right) return;

    int pivot_index = partition(arr, left, right);
    quick_sort_recursive(arr, left, pivot_index - 1);
    quick_sort_recursive(arr, pivot_index + 1, right);
}

/*
 * Quick sort entrypoint
 */
void quick_sort(int *arr, int n) {
    if (arr == NULL || n <= 1) return;
    quick_sort_recursive(arr, 0, n - 1);
}
