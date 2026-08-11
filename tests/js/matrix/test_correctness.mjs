import { matrix_multiplication } from '../../../src/js/numeric/matrix_multiplication.mjs';
import { loadMatrixData, loadExpectedMatrixData } from '../test_loaders.mjs';

function runCase(label, inputPath, expectedPath) {
    const matrixData = loadMatrixData(inputPath);
    const expected = loadExpectedMatrixData(expectedPath);

    console.log(`Matrix Multiplication (${label})`);
    console.log(`Loaded: ${matrixData.n}x${matrixData.n} matrices`);
    const n = matrixData.n;

    matrix_multiplication(matrixData.A, matrixData.B, matrixData.C, n);

    let expectedResult = matrixData.n === expected.n;

    if (expectedResult) {
        for (let i = 0; i < n * n; i++) {
            if (matrixData.C[i] !== expected.C[i]) {
                console.log(`mismatch at position ${i}: ` + `got ${matrixData.C[i]}, expected ${expected.C[i]}`);
                expectedResult = false;
                break;
            }
        }
    } else {
        console.log(`mismatch: size ${matrixData.n}/${expected.n}`);
    }

    console.log("RESULT", JSON.stringify({
        case: label,
        n,
        matrix: Array.from(matrixData.C),
        expected_result: expectedResult
    }));
}

runCase("basic", "../../../datasets/correctness/matrix/basic_input.bin", "../../../datasets/correctness/matrix/basic_expected.bin");
runCase("identity", "../../../datasets/correctness/matrix/identity_matrix_input.bin", "../../../datasets/correctness/matrix/identity_matrix_expected.bin");