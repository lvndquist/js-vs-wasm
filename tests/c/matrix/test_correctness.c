#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/utils/utils.h"

void matrix_multiplication(const double *A, const double *B, double *C, int n);

typedef struct {
    int n;
    double *matrix;
} ExpectedMatrix;

static ExpectedMatrix *load_expected(const char *path) {
    FILE *f = fopen(path, "rb");

    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        return NULL;
    }

    ExpectedMatrix *expected = (ExpectedMatrix *)malloc(sizeof(ExpectedMatrix));
    fread(&expected->n, sizeof(int), 1, f);
    expected->matrix = (double *)malloc(expected->n * expected->n * sizeof(double));
    fread(expected->matrix, sizeof(double), expected->n * expected->n, f);

    fclose(f);
    return expected;
}

static void run_case(const char *label, const char *input_path, const char *expected_path) {
    MatrixData *md = load_matrix_data(input_path);
    printf("Matrix Multiplication (%s)\n", label);
    printf("Loaded: %d nodes\n", md->n);

    ExpectedMatrix *expected = load_expected(expected_path);

    if (expected == NULL) {
        fprintf(stderr, "Failed to load expected results\n");
        free_matrix_data(md);
        return;
    }

    int count = md->n * md->n;
    double *result = (double *)calloc(count, sizeof(double));

    matrix_multiplication(md->A, md->B, result, md->n);

    int expected_result = md->n == expected->n;

    if (expected_result) {
        for (int i = 0; i < count; i++) {
            if (result[i] != expected->matrix[i]) {
                int row = i / md->n;
                int column = i % md->n;
                printf("mismatch (%s) at [%d][%d]: got %f, expected %f\n", label, row, column, result[i], expected->matrix[i]);
                expected_result = 0;
                break;
            }
        }
    } else {
        printf("mismatch (%s): size %d/%d\n", label, md->n, expected->n);
    }

    printf("RESULT {\"case\":\"%s\",\"n\":%d,\"matrix\":",  label, md->n);
    printf("[");
    for (int i = 0; i < count; i++) {
        printf("%g", result[i]);
        if (i < count - 1) {
            printf(",");
        }
    }
    printf("]");
    printf(",\"expected_result\":%s}\n",expected_result ? "true" : "false");

    free_matrix_data(md);
    free(result);
    free(expected->matrix);
    free(expected);
}

int main() {
    char basic_input_path[256];
    char basic_expected_path[256];
    char identity_input_path[256];
    char identity_expected_path[256];

    snprintf(basic_input_path,sizeof(basic_input_path), "../../../datasets/correctness/matrix/basic_input.bin");
    snprintf(basic_expected_path, sizeof(basic_expected_path), "../../../datasets/correctness/matrix/basic_expected.bin");
    snprintf(identity_input_path, sizeof(identity_input_path), "../../../datasets/correctness/matrix/identity_matrix_input.bin");
    snprintf(identity_expected_path, sizeof(identity_expected_path), "../../../datasets/correctness/matrix/identity_matrix_expected.bin");

    run_case("basic", basic_input_path, basic_expected_path);
    run_case("identity", identity_input_path, identity_expected_path);

    return 0;
}
