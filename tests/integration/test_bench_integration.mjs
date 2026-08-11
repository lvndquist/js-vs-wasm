import {loadSortData, loadGraphData, loadExpectedGraphData, loadWeightedGraphData, loadExpectedWeightedGraphData, loadMatrixData, loadExpectedMatrixData} from "../js/test_loaders.mjs";
import {jsMergesort, wasmMergesort} from "../../bench/runners.js";
import {jsQuicksort, wasmQuicksort} from "../../bench/runners.js";
import {jsBFS, wasmBFS} from "../../bench/runners.js";
import {jsDijkstra, wasmDijkstra} from "../../bench/runners.js";
import {jsMatrixMultiplication, wasmMatrixMultiplication} from "../../bench/runners.js";
import {initWasm} from "../../bench/wasm.js";
import {intArrayEqual, floatArrayEqual, graphSummarize } from "../js/test_utils.mjs";


async function testMergesort(wasm, label) {
    const input = loadSortData(`../../datasets/correctness/sorting/${label}_input.bin`);
    const expected = loadSortData(`../../datasets/correctness/sorting/${label}_expected.bin`);

    const jsRunner = jsMergesort(input.arr, input.n);
    const wasmRunner = wasmMergesort(wasm.mergeSortModule, input.arr, input.n);

    try {
        jsRunner.run();
        wasmRunner.run();
        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (verbose) {
            console.log(`Mergesort (${label})`);
            console.log(`JS Result: ${Array.from(jsResult)}`);
            console.log(`WASM Result: ${Array.from(wasmResult)}`);
            console.log(`Expected Result: ${Array.from(expected.arr)}`);
        }

        const success = intArrayEqual(jsResult, expected.arr) &&
                        intArrayEqual(wasmResult, expected.arr) &&
                        intArrayEqual(jsResult, wasmResult);

        console.log("RESULT", JSON.stringify({
            algorithm: "mergesort",
            case: label,
            expected_result: success
        }));
    } finally {
        wasmRunner.free();
    }
}

async function testQuicksort(wasm, label) {
    const input = loadSortData(`../../datasets/correctness/sorting/${label}_input.bin`);
    const expected = loadSortData(`../../datasets/correctness/sorting/${label}_expected.bin`);

    const jsRunner = jsQuicksort(input.arr, input.n);
    const wasmRunner = wasmQuicksort(wasm.quickSortModule, input.arr, input.n);

    try {
        jsRunner.run();
        wasmRunner.run();
        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (verbose) {
            console.log(`Quicksort (${label})`);
            console.log(`JS Result: ${Array.from(jsResult)}`);
            console.log(`WASM Result: ${Array.from(wasmResult)}`);
            console.log(`Expected Result: ${Array.from(expected.arr)}`);
        }

        const success = intArrayEqual(jsResult, expected.arr) &&
                        intArrayEqual(wasmResult, expected.arr) &&
                        intArrayEqual(jsResult, wasmResult);

        console.log("RESULT", JSON.stringify({
                algorithm: "quicksort",
                case: label,
                expected_result: success
        }));
    } finally {
        wasmRunner.free();
    }
}

async function testBFS(wasm, label) {

    const input = loadGraphData(`../../datasets/correctness/graphs/${label}_input.bin`);
    const expected = loadExpectedGraphData(`../../datasets/correctness/graphs/${label}_expected.bin`);

    const jsRunner = jsBFS(input);
    const wasmRunner = wasmBFS(wasm.bfsModule, input);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();
        const jsSummary = graphSummarize(jsResult);
        const wasmSummary = graphSummarize(wasmResult);

        if (verbose) {
            console.log(`BFS (${label})`);
            console.log(`JS Result: visited: ${jsResult.visited}, distances: ${jsResult.dist}`);
            console.log(`WASM Result: visited: ${wasmResult.visited}, distances: ${wasmResult.dist}`);
            console.log(`Expected Result: distances: ${expected.dist}`);
        }

        // JS & WASM reachable correct
        // JS & WASM max distance correct
        // JS & WASM full distance array correct
        // JS and WASM match each other
        const jsAsExpected = intArrayEqual(jsResult.dist, expected.dist) &&
                             input.numOfEdges === expected.numEdges &&
                             input.numOfNodes === expected.n &&
                             jsSummary.reachable === expected.reachable &&
                             jsSummary.maxDist === expected.maxDist;
        const wasmAsExpected = intArrayEqual(wasmResult.dist, expected.dist) &&
                               input.numOfEdges === expected.numEdges &&
                               input.numOfNodes === expected.n &&
                               wasmSummary.reachable === expected.reachable &&
                               wasmSummary.maxDist === expected.maxDist;
        const equal = intArrayEqual(jsResult.dist, wasmResult.dist) &&
                      intArrayEqual(jsResult.visited, wasmResult.visited) &&
                      jsSummary.reachable === wasmSummary.reachable &&
                      jsSummary.maxDist === wasmSummary.maxDist;

        const success = jsAsExpected && wasmAsExpected && equal;

        console.log("RESULT", JSON.stringify({
            algorithm: "bfs",
            case: label,
            expected_result: success
        }));
    } finally {
        wasmRunner.free();
    }
}

async function testDijkstra(wasm, label) {

    const input = loadWeightedGraphData(`../../datasets/correctness/graphs_weighted/${label}_input.bin`);
    const expected = loadExpectedWeightedGraphData(`../../datasets/correctness/graphs_weighted/${label}_expected.bin`);

    const jsRunner = jsDijkstra(input);
    const wasmRunner = wasmDijkstra(wasm.dijkstraModule, input);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();
        const jsSummary = graphSummarize(jsResult);
        const wasmSummary = graphSummarize(wasmResult);

        if (verbose) {
            console.log(`Dijkstra (${label})`);
            console.log(`JS Result: visited: ${jsResult.visited}, distances: ${jsResult.dist}`);
            console.log(`WASM Result: visited: ${wasmResult.visited}, distances: ${wasmResult.dist}`);
            console.log(`Expected Result: distances: ${expected.dist}`);
        }

        // JS & WASM reachable correct
        // JS & WASM max distance correct
        // JS & WASM full distance array correct
        // JS and WASM match each other
        const jsAsExpected = floatArrayEqual(jsResult.dist, expected.dist) &&
                             input.numOfEdges === expected.numEdges &&
                             input.numOfNodes === expected.n &&
                             jsSummary.reachable === expected.reachable &&
                             jsSummary.maxDist === expected.maxDist;
        const wasmAsExpected = floatArrayEqual(wasmResult.dist, expected.dist) &&
                               input.numOfEdges === expected.numEdges &&
                               input.numOfNodes === expected.n &&
                               wasmSummary.reachable === expected.reachable &&
                               wasmSummary.maxDist === expected.maxDist;
        const equal = floatArrayEqual(jsResult.dist, wasmResult.dist) &&
                      intArrayEqual(jsResult.visited, wasmResult.visited) &&
                      jsSummary.reachable === wasmSummary.reachable &&
                      jsSummary.maxDist === wasmSummary.maxDist;

        const success = jsAsExpected && wasmAsExpected && equal;

        console.log("RESULT", JSON.stringify({
            algorithm: "dijkstra",
            case: label,
            expected_result: success
        }));
    } finally {
        wasmRunner.free();
    }
}

async function testMatrixMultiplication(wasm, label) {

    const input = loadMatrixData(`../../datasets/correctness/matrix/${label}_input.bin`);
    const expected = loadExpectedMatrixData(`../../datasets/correctness/matrix/${label}_expected.bin`);

    const jsRunner = jsMatrixMultiplication(input.A, input.B, input.n);
    const wasmRunner = wasmMatrixMultiplication(wasm.matrixModule, input.A, input.B, input.n);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (verbose) {
            console.log(`Matrix Multiplication (${label})`);
            console.log(`JS Result: ${Array.from(jsResult)}`);
            console.log(`WASM Result: ${Array.from(wasmResult)}`);
            console.log(`Expected Result: ${Array.from(expected.C)}`);
        }

        const jsAsExpected = floatArrayEqual(jsResult, expected.C) && input.n === expected.n;
        const wasmAsExpected = floatArrayEqual(wasmResult, expected.C) && input.n === expected.n;
        const equal = floatArrayEqual(jsResult, wasmResult) && input.n === expected.n;
        const success = jsAsExpected && wasmAsExpected && equal;

        console.log("RESULT", JSON.stringify({
            algorithm: "matrix_multiplication",
            case: label,
            expected_result: success
        }));
    } finally {
        wasmRunner.free();
    }
}

const verbose = process.argv.includes("verbose=true") ? true : false;

async function main() {
    const wasm = await initWasm();

    await testMergesort(wasm, "basic");
    await testMergesort(wasm, "reverse");
    await testMergesort(wasm, "sorted");
    await testMergesort(wasm, "duplicate");

    await testQuicksort(wasm, "basic");
    await testQuicksort(wasm, "reverse");
    await testQuicksort(wasm, "sorted");
    await testQuicksort(wasm, "duplicate");

    await testBFS(wasm, "connected");
    await testBFS(wasm, "disconnected");
    
    await testDijkstra(wasm, "connected");
    await testDijkstra(wasm, "disconnected");

    await testMatrixMultiplication(wasm, "basic");
    await testMatrixMultiplication(wasm, "identity_matrix");
}

main();

