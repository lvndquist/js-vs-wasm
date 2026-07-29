#include <stdio.h>
#include <stdlib.h>
#include "../utils/utils.h"

void matrix_multiplication(const double *A, const double *B, double *C, int n);

int main(int argc, char *argv[]) {
    const char *size = "small";
    if (argc >= 2) size = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/benchmark/matrix/%s.bin", size);

    MatrixData *md = load_matrix_data(path);
    printf("Matrix Multiplication\n");
    printf("Dataset: %s\n", path);
    printf("Size: %dx%d\n", md->n, md->n);

    double *C = (double *)calloc(md->n * md->n, sizeof(double));
    if (C == NULL) {
        fprintf(stderr, "malloc failed\n");
        return 1;
    }

    matrix_multiplication(md->A, md->B, C, md->n);

    printf("A (top-left corner):\n");
    print_matrix(md->A, md->n);

    printf("B (top-left corner):\n");
    print_matrix(md->B, md->n);

    printf("C = A*B (top-left corner):\n");
    print_matrix(C, md->n);

    /* C[0][0] should equal dot product of row 0 of A and col 0 of B */
    double expected = 0.0;
    for (int k = 0; k < md->n; k++) {
        expected += md->A[k] * md->B[k * md->n];
    }
    printf("C[0][0] check: %.4f (computed) vs %.4f (expected) \n%s\n", C[0], expected,
    (C[0] - expected < 1e-6 && C[0] - expected > -1e-6) ? "OK" : "FAIL");

    double checksum = matrix_checksum(C, md->n);

    printf("RESULT {\"n\":%d,\"c00\":%.4f,\"checksum\":%.4f}\n", md->n, C[0], checksum);
    free(C);
    free_matrix_data(md);
    return 0;
}
