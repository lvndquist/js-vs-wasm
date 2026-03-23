/* Quick sort testing */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "../utils/utils.h"

void quick_sort(int *arr, int n);

int main(int argc, char *argv[]) {
    const char *pathType = "small"; // default to small

    if (argc >= 2) pathType = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/sorting/%s.bin", pathType);

    int n;
    int *original = load_sort_data(path, &n);
    int *arr      = copy_array(original, n);

    printf("------------\n");
    printf("Quick sort\n");
    printf("------------\n");

    printf("Dataset: %s\n", path);
    printf("Input   (%d elements): ", n);
    print_array(original, n, 3);

    quick_sort(arr, n);

    printf("Output  (%d elements): ", n);
    print_array(arr, n, 3);

    printf("%s\n", is_sorted(arr, n) ? "OK" : "FAIL");

    free(original);
    free(arr);
    return 0;
}

int main_random_data(int argc, char *argv[]) {
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

    printf("------------\n");
    printf("Quick sort\n");
    printf("------------\n");

    printf("Input  (%d elements): ", n);
    print_array(arr, n, 3);

    quick_sort(arr, n);

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
