/* Merge sort testing */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void merge_sort(int *arr, int n);

static int is_sorted(int *arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) return 0;
    }
    return 1;
}

static void print_array(int *arr, int n, int edge) {
    if (n <= edge * 2) {
        printf("[");
        for (int i = 0; i < n; i++) {
            printf("%d%s", arr[i], i < n - 1 ? ", " : "");
        }
        printf("]\n");
        return;
    }

    int hidden = n - edge * 2;
    printf("[");
    for (int i = 0; i < edge; i++) {
        printf("%d, ", arr[i]);
    }
    printf("... %d more ..., ", hidden);
    for (int i = n - edge; i < n; i++) {
        printf("%d%s", arr[i], i < n - 1 ? ", " : "");
    }
    printf("]\n");
}

int main(int argc, char *argv[]) {
    int n = 20;
    int range = 1000000;

    if (argc == 2) {
        n = atoi(argv[1]);
    } else if (argc == 3) {
        n = atoi(argv[1]);
        range = atoi(argv[2]);
    }

    int *arr = (int *)malloc(n * sizeof(int));
    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed.\n");
        return 1;
    }

    srand((unsigned int)time(NULL));
    for (int i = 0; i < n; i++) {
        arr[i] = rand() % range;
    }

    printf("Input  (%d elements): ", n);
    print_array(arr, n, 3);

    merge_sort(arr, n);

    printf("Output (%d elements): ", n);
    print_array(arr, n, 3);

    if (is_sorted(arr, n)) {
        printf("OK\n");
    } else {
        printf("FAIL\n");
    }

    free(arr);
    return 0;
}
