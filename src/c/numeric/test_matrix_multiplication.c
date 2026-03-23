#include <stdio.h>
#include <stdlib.h>
#include "../utils/utils.h"

void matrix_multiplication(const double *A, const double *B, double *C, int n);

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

int main(int argc, char *argv[]) {
    const char *size = "small";
    if (argc >= 2) size = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/matrix/%s.bin", size);

    MatrixData *md = load_matrix_data(path);
    printf("Dataset : %s\n", path);
    printf("Size    : %dx%d\n", md->n, md->n);

    double *C = (double *)calloc(md->n * md->n, sizeof(double));
    if (C == NULL) { fprintf(stderr, "malloc failed\n"); return 1; }

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
    printf("C[0][0] check: %.4f (computed) vs %.4f (expected) \n%s\n",
           C[0], expected,
           (C[0] - expected < 1e-6 && C[0] - expected > -1e-6) ? "OK" : "FAIL");

    free(C);
    free_matrix_data(md);
    return 0;
}
