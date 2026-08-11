/* Quick sort testing with benchmark datasets */
#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/utils/utils.h"

void quick_sort(int *arr, int n);

int main(int argc, char *argv[]) {
    const char *pathType = "small"; // default to small

    if (argc >= 2) pathType = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/benchmark/sorting/%s.bin", pathType);

    int n;
    int *original = load_sort_data(path, &n);
    int *arr = copy_array(original, n);

    printf("Quick sort\n");
    printf("Dataset: %s\n", path);
    printf("Input (%d elements): ", n);
    print_array(original, n, 3);

    quick_sort(arr, n);

    printf("Output (%d elements): ", n);
    print_array(arr, n, 3);

    int sorted = is_sorted(arr, n);
    long long sum_in = array_checksum(original, n);
    long long sum_out = array_checksum(arr, n);
    int same_sum = (sum_in == sum_out);

    printf("RESULT {\"n\":%d,\"sorted\":%s,\"same_sum\":%s,\"first\":%d,\"last\":%d,\"checksum\":\"%lld\"}\n", n, sorted ? "true" : "false", same_sum ? "true" : "false", arr[0], arr[n - 1], sum_out);

    free(original);
    free(arr);
    return 0;
}