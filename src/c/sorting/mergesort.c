#include <stdlib.h>
#include <string.h>

static void merge(int *arr, int *temp, int left, int mid, int right) {
    int i = left, j = mid + 1, k = left;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        }
        else {
            temp[k++] = arr[j++];
        }
    }
    
    while (i <= mid) {
        temp[k++] = arr[i++];
    }
    
    while (j <= right) {
        temp[k++] = arr[j++];
    }

    for (int p = left; p <= right; p++) {
        arr[p] = temp[p];
    }
}

static void merge_sort_rec(int *arr, int *temp, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    merge_sort_rec(arr, temp, left, mid);
    merge_sort_rec(arr, temp, mid + 1, right);
    merge(arr, temp, left, mid, right);
}

void merge_sort(int *arr, int n) {
    if (arr == NULL || n <= 1) return;
    int *temp = (int *)malloc(n * sizeof(int));
    if (temp == NULL) return;
    merge_sort_rec(arr, temp, 0, n - 1);
    free(temp);
}

// static void merge(int *arr, int left, int mid, int right) {
//     int left_length = mid - left + 1;
//     int right_length = right - mid;

//     int *left_buffer = (int *)malloc(left_length * sizeof(int));
//     int *right_buffer = (int *)malloc(right_length * sizeof(int));

//     if (left_buffer == NULL || right_buffer == NULL) {
//         free(left_buffer);
//         free(right_buffer);
//         return;
//     }

//     memcpy(left_buffer, arr + left, left_length * sizeof(int));
//     memcpy(right_buffer, arr + mid + 1, right_length * sizeof(int));

//     int i = 0, j = 0, k = left;
//     while (i < left_length && j < right_length) {
//         if (left_buffer[i] <= right_buffer[j]) {
//             arr[k++] = left_buffer[i++];
//         } else {
//             arr[k++] = right_buffer[j++];
//         }
//     }

//     while (i < left_length) {
//         arr[k++] = left_buffer[i++];
//     }

//     while (j < right_length) {
//         arr[k++] = right_buffer[j++];
//     }

//     free(left_buffer);
//     free(right_buffer);
// }

// static void merge_sort_rec(int *arr, int left, int right) {
//     if (left >= right) return;

//     int mid = left + (right - left) / 2;
//     merge_sort_rec(arr, left, mid);
//     merge_sort_rec(arr, mid + 1, right);
//     merge(arr, left, mid, right);
// }

// void merge_sort(int *arr, int n) {
//     if (arr == NULL || n <= 1) return;
//     merge_sort_rec(arr, 0, n - 1);
// }