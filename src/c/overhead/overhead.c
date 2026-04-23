void matrix_multiplication_full(const double *A, const double *B, double *C, int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            double sum = 0.0;
            for (int k = 0; k < n; k++) {
                sum += A[i * n + k] * B[k * n + j];
            }
            C[i * n + j] = sum;
        }
    }
}

void matrix_multiplication_row(const double* A, const double* B, double* C, int row, int n) {
    for (int j = 0; j < n; j++)
        for (int k = 0; k < n; k++)
            C[row*n+j] += A[row*n+k] * B[k*n+j];
}

void matrix_multiplication_cell(const double* A, const double* B, double* C, int i, int j, int n) {
    for (int k = 0; k < n; k++)
        C[i*n+j] += A[i*n+k] * B[k*n+j];
}

void noop() {}