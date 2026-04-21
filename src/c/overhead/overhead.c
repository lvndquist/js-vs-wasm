void matrix_multiplication_row(double* A, double* B, double* C, int row, int n) {
    for (int j = 0; j < n; j++)
        for (int k = 0; k < n; k++)
            C[row*n+j] += A[row*n+k] * B[k*n+j];
}

void matrix_multiplication_cell(double* A, double* B, double* C, int i, int j, int n) {
    for (int k = 0; k < n; k++)
        C[i*n+j] += A[i*n+k] * B[k*n+j];
}

void noop() {}