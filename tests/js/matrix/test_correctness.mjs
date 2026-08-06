import { readFileSync } from 'fs';
import { matrix_multiplication } from '../../../src/js/numeric/matrix_multiplication.mjs';


function loadMatrixData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const n = view.getInt32(0, true);
    const elements = n * n;
    const A = new Float64Array(elements);
    const B = new Float64Array(elements);

    for (let i = 0; i < elements; i++) {
        A[i] = view.getFloat64(4 + i * 8, true);
        B[i] = view.getFloat64(4 + elements * 8 + i * 8, true);
    }

    const C = new Float64Array(n * n);

    return  { n, A, B, C};
}

function loadExpected(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const n = view.getInt32(0, true);
    const elements = n * n;
    const C = new Float64Array(elements);

    for (let i = 0; i < elements; i++) {
        C[i] = view.getFloat64(4 + i * 8, true);
    }

    return { n, C };
}

function runCase(label, inputPath, expectedPath) {
    const matrixData = loadMatrixData(inputPath);
    const expected = loadExpected(expectedPath);

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

    console.log(
        "RESULT",
        JSON.stringify({
            case: label,
            n,
            matrix: Array.from(matrixData.C),
            expected_result: expectedResult
        })
    );
}

runCase("basic", "../../../datasets/correctness/matrix/basic_input.bin", "../../../datasets/correctness/matrix/basic_expected.bin");
runCase("identity", "../../../datasets/correctness/matrix/identity_matrix_input.bin", "../../../datasets/correctness/matrix/identity_matrix_expected.bin");