#include <stdio.h>
#include <stdlib.h>
#include "../utils/utils.h"

void matrix_multiplication_full(const double *A, const double *B, double *C, int n);
void matrix_multiplication_row(const double *A, const double *B, double *C, int row, int n);
void matrix_multiplication_cell(const double *A, const double *B, double *C, int i, int j, int n);

/* Print a corner of the matrix.. top-left 3x3 */
static void print_matrix(const double *M, int n) {
    int edge = 3;
    int show = n < edge ? n : edge;

    for (int i = 0; i < show; i++) {
        printf("  [");
        for (int j = 0; j < show; j++) {
            printf("%8.2f", M[i * n + j]);
            if (j < show - 1) printf(", ");
        }
        if (n > edge) {
            printf(",  ...");
        }
        printf("]\n");
    }
    if (n > edge) printf("  ...\n");
}

static int matrices_equal(const double *X, const double *Y, int n, double tol) {
    for (int i = 0; i < n * n; i++) {
        double diff = X[i] - Y[i];
        if (diff > tol || diff < -tol) return 0;
    }
    return 1;
}

int main(int argc, char *argv[]) {
    const char *size = "small";
    if (argc >= 2) size = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/matrix/%s.bin", size);

    MatrixData *md = load_matrix_data(path);
    printf("Dataset: %s\n", path);
    printf("Size: %dx%d\n", md->n, md->n);

    int n = md->n;
    double *C_full = (double *)calloc(n * n, sizeof(double));
    double *C_row  = (double *)calloc(n * n, sizeof(double));
    double *C_cell = (double *)calloc(n * n, sizeof(double));
    if (C_full == NULL || C_row == NULL || C_cell == NULL) {
        fprintf(stderr, "malloc failed\n");
        return 1;
    }

    /* full: single call */
    matrix_multiplication_full(md->A, md->B, C_full, n);

    /* row: one call per row */
    for (int row = 0; row < n; row++) {
        matrix_multiplication_row(md->A, md->B, C_row, row, n);
    }

    /* cell: one call per cell */
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            matrix_multiplication_cell(md->A, md->B, C_cell, i, j, n);
        }
    }

    printf("A (top-left corner):\n");
    print_matrix(md->A, n);

    printf("B (top-left corner):\n");
    print_matrix(md->B, n);

    printf("C_full (top-left corner):\n");
    print_matrix(C_full, n);

    printf("C_row (top-left corner):\n");
    print_matrix(C_row, n);

    printf("C_cell (top-left corner):\n");
    print_matrix(C_cell, n);

    /* C[0][0] should equal dot product of row 0 of A and col 0 of B */
    double expected = 0.0;
    for (int k = 0; k < n; k++) {
        expected += md->A[k] * md->B[k * n];
    }
    printf("C[0][0] check: \nfull=%.4f \nrow=%.4f \ncell=%.4f \nexpected=%.4f\n", C_full[0], C_row[0], C_cell[0], expected);

    int full_ok = (C_full[0] - expected < 1e-6 && C_full[0] - expected > -1e-6);
    int row_vs_full = matrices_equal(C_row, C_full, n, 1e-6);
    int cell_vs_full = matrices_equal(C_cell, C_full, n, 1e-6);

    printf("full[0][0] matches expected : %s\n", full_ok ? "OK" : "FAIL");
    printf("row  matches full (all n*n) : %s\n", row_vs_full ? "OK" : "FAIL");
    printf("cell matches full (all n*n) : %s\n", cell_vs_full ? "OK" : "FAIL");

    int all_ok = full_ok && row_vs_full && cell_vs_full;
    printf("\nOverall: %s\n", all_ok ? "OK" : "FAIL");

    free(C_full);
    free(C_row);
    free(C_cell);
    free_matrix_data(md);
    return all_ok ? 0 : 1;
}