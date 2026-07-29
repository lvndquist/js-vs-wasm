#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/utils/utils.h"

void merge_sort(int *arr, int n);

typedef struct {
    int n;
    int *arr;
} ExpectedSorting;

static ExpectedSorting *load_expected(const char *path) {
    FILE *f = fopen(path, "rb");

    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        return NULL;
    }

    ExpectedSorting *expected = (ExpectedSorting *)malloc(sizeof(ExpectedSorting));
    fread(&expected->n, sizeof(int), 1, f);
    expected->arr = (int *)malloc(expected->n * sizeof(int));

    fread(expected->arr, sizeof(int), expected->n, f);

    fclose(f);
    return expected;
}

static void run_case(const char *label, const char *input_path, const char *expected_path) {
    int n;
    int *input_array = load_sort_data(input_path, &n);
    printf("Mergesort (%s)\n", label);
    printf("Loaded: %d elements\n", n);

    ExpectedSorting *expected = load_expected(expected_path);

    if (expected == NULL) {
        fprintf(stderr, "Failed to load expected results\n");
        free(input_array);
        return;
    }

    merge_sort(input_array, n);
    int expected_result = n == expected->n;

    if (expected_result) {
        for (int i = 0; i < expected->n; i++) {
            if (input_array[i] != expected->arr[i]) {
                printf("mismatch (%s) at index %d: got %d, expected %d\n", label, i, input_array[i], expected->arr[i]);
                expected_result = 0;
                break;
            }
        }
    } else {
        printf("mismatch (%s): length %d/%d\n", label, n, expected->n);
    }

    printf("RESULT {\"case\":\"%s\",\"n\":%d,\"array\":", label, n);
    printf("[");
    for (int i = 0; i < n; i++) {
        printf("%d", input_array[i]);
        if (i < n - 1) {
            printf(",");
        }
    }
    printf("]");
    printf(",\"expected_result\":%s}\n", expected_result ? "true" : "false");

    free(input_array);
    free(expected->arr);
    free(expected);
}

int main() {
    char basic_input_path[256];
    char basic_expected_path[256];

    char sorted_input_path[256];
    char sorted_expected_path[256];

    char reverse_input_path[256];
    char reverse_expected_path[256];

    char duplicates_input_path[256];
    char duplicates_expected_path[256];

    snprintf(basic_input_path, sizeof(basic_input_path), "../../../datasets/correctness/sorting/basic_input.bin");
    snprintf(basic_expected_path, sizeof(basic_expected_path), "../../../datasets/correctness/sorting/basic_expected.bin");
    snprintf(sorted_input_path, sizeof(sorted_input_path), "../../../datasets/correctness/sorting/sorted_input.bin");
    snprintf(sorted_expected_path, sizeof(sorted_expected_path), "../../../datasets/correctness/sorting/sorted_expected.bin");
    snprintf(reverse_input_path, sizeof(reverse_input_path), "../../../datasets/correctness/sorting/reverse_input.bin");
    snprintf(reverse_expected_path, sizeof(reverse_expected_path), "../../../datasets/correctness/sorting/reverse_expected.bin");
    snprintf(duplicates_input_path, sizeof(duplicates_input_path), "../../../datasets/correctness/sorting/duplicates_input.bin");
    snprintf(duplicates_expected_path, sizeof(duplicates_expected_path), "../../../datasets/correctness/sorting/duplicates_expected.bin");

    run_case("basic", basic_input_path, basic_expected_path);
    run_case("sorted", sorted_input_path, sorted_expected_path);
    run_case("reverse", reverse_input_path, reverse_expected_path);
    run_case("duplicates", duplicates_input_path, duplicates_expected_path);

    return 0;
}