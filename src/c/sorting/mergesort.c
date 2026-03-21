/* Merge Sort */

#include <stdlib.h>
#include <string.h>

static void merge(int *arr, int left, int mid, int right) {
    int left_length = mid - left + 1;
    int right_length = right - mid;

    int *left_buffer = (int *)malloc(left_length * sizeof(int));
    int *right_buffer = (int *)malloc(right_length * sizeof(int));

    memcpy(left_buffer, arr + left, left_length * sizeof(int));
    memcpy(right_buffer, arr + mid + 1, right_length * sizeof(int));

    int i = 0;
    int j = 0;
    int k = left;
    while (i < left_length && j < right_length) {
        if (left_buffer[i] <= right_buffer[j]) {
            arr[k++] = left_buffer[i++];
        } else {
            arr[k++] = right_buffer[j++];
        }
    }

    while(i < left_length) {
        arr[k++] = left_buffer[i++];
    }

    while(j < right_length) {
        arr[k++] = right_buffer[j++];
    }

    free(left_buffer);
    free(right_buffer);
}

static void merge_sort_rec(int *arr, int left, int right) {
    if (left >= right) return;

    int mid = left + (right - left) / 2;
    merge_sort_rec(arr, left, mid);
    merge_sort_rec(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

/*
 * Merge sort entrypoint
 */
void merge_sort(int *arr, int n) {
    if (n <= 1 || arr == NULL) return;
    merge_sort_rec(arr, 0, n - 1);
}
