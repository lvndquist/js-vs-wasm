import {intArrayEqual, floatArrayEqual} from "./utils.js";
import {jsMergeSort, wasmMergeSort} from "./runners.js";
import {jsQuickSort, wasmQuickSort} from "./runners.js";
import {jsBFS, wasmBFS} from "./runners.js";
import {jsDijkstra, wasmDijkstra} from "./runners.js";
import {jsMatrixMultiplication, wasmMatrixMultiplication} from "./runners.js";

export function validateMergesort(wasm, arr, n, size) {
    const jsRunner = jsMergeSort(arr, n);
    const wasmRunner = wasmMergeSort(wasm.mergeSortModule, arr, n);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (!intArraysEqual(jsResult, wasmResult)) {
            throw new Error(`Merge sort integration failed for ${size}`);
        }
    } finally {
        wasmRunner.free();
    }
}

export function validateQuicksort(wasm, arr, n, size) {
    const jsRunner = jsQuicksort(arr, n);
    const wasmRunner = wasmQuicksort(wasm.quickSortModule, arr, n);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (!intArraysEqual(jsResult, wasmResult)) {
            throw new Error(`Quick sort integration failed for ${size}`);
        }
    } finally {
        wasmRunner.free();
    }
}

export function validateBFS(wasm, graphData, size) {
    const jsRunner = jsBFS(graphData);
    const wasmRunner = wasmBFS(wasm.bfsModule, graphData);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        const visitedMatch = intArraysEqual(jsResult.visited, wasmResult.visited);
        const distMatch = intArraysEqual(jsResult.dist, wasmResult.dist);

        if (!visitedMatch || !distMatch) {
            throw new Error(`BFS integration failed for ${size}, visitedMatch: ${visitedMatch}, distMatch: ${distMatch}`);
        }
    } finally {
        wasmRunner.free();
    }
}

export function validateDijkstra(wasm, graphData, size) {
    const jsRunner = jsDijkstra(graphData);
    const wasmRunner = wasmDijkstra(wasm.dijkstraModule, graphData);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        const visitedMatch = intArraysEqual(jsResult.visited, wasmResult.visited);
        const distMatch = floatArraysEqual(jsResult.dist, wasmResult.dist);

        if (!visitedMatch || !distMatch) {
            throw new Error(`Dijkstra integration failed for ${size}, visitedMatch: ${visitedMatch}, distMatch: ${distMatch}`);
        }
    } finally {
        wasmRunner.free();
    }
}

export function validateMatrixMultiplication(wasm, A, B, n, size) {
    const jsRunner = jsMatrixMultiplication(A, B, n);
    const wasmRunner = wasmMatrixMultiplication(wasm.matrixModule, A, B, n);

    try {
        jsRunner.run();
        wasmRunner.run();

        const jsResult = jsRunner.result();
        const wasmResult = wasmRunner.result();

        if (!floatArraysEqual(jsResult, wasmResult)) {
            throw new Error(`Matrix multiplication integration failed for ${size}`);
        }
    } finally {
        wasmRunner.free();
    }
}