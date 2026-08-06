import {loadSortData, loadGraphData, loadWeightedGraphData, loadMatrixData} from "./loaders.js";
import {jsMergesort, wasmMergesort} from "./runners.js";
import {jsQuicksort, wasmQuicksort} from "./runners.js";
import {jsBFS, wasmBFS} from "./runners.js";
import {jsDijkstra, wasmDijkstra} from "./runners.js";
import {jsMatrixMultiplication, wasmMatrixMultiplication} from "./runners.js";
import {downloadCSV, buildCSV} from "./utils.js";
import {initWasm} from "./wasm.js";
import {validateMergesort, validateQuicksort, validateBFS, validateDijkstra, validateMatrixMultiplication} from "./validators.js";

/* -------------------------
 * Config
 * ------------------------- */

const WARMUP_RUNS = 5;
const TIMED_RUNS = 30;
const DATA_ROOT = '../datasets/benchmark';

const SIZES = ['small', 'medium', 'large', 'very_large'];

let cancel = false;

function runBenchmark(func) {
    for (let i = 0; i < WARMUP_RUNS; i++) func();

    const times = [];
    for (let i = 0; i < TIMED_RUNS; i++) {
        const start = performance.now();
        func();
        const end = performance.now();
        times.push(end - start);
    }
    return times;
}

async function runAllBenchmarks() {
    const results = [];
    let startTotal = null;
    let endTotal = null;
    cancel = false;

    console.log("Loadin WASM modules");
    const wasm = await initWasm();

    // Sorting
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }

        console.log(`Loading sorting data. Size: ${size}...`);
        const {n, arr} = await loadSortData(size, DATA_ROOT);

        // validate mergesort
        console.log(`Validating mergesort for size: ${size}...`);
        validateMergesort(wasm, arr, n, size);

        // run mergesort js
        console.log(`Running JS mergesort on ${size}...`);
        const jsMergesortRunner = jsMergesort(arr, n);

        startTotal = performance.now();
        const mergesortJSTimes = runBenchmark(() => {
            jsMergesortRunner.run();
        });
        endTotal = performance.now();

        results.push({ algorithm: 'mergesort', implementation: 'js', size, times: mergesortJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`)

        // run mergesort wasm
        console.log(`Running WASM mergesort on ${size}...`);
        const wasmMergesortRunner = wasmMergesort(wasm.mergeSortModule, arr, n);

        let mergesortWasmTimes;
        startTotal = performance.now();
        try {
            mergesortWasmTimes = runBenchmark(() => {
                wasmMergesortRunner.run();
            });
        } finally {
            wasmMergesortRunner.free();
        }
        endTotal = performance.now();

        results.push({ algorithm: 'mergesort', implementation: 'wasm', size, times: mergesortWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // validate quicksort
        console.log(`Validating quicksort for size: ${size}...`);
        validateQuicksort(wasm, arr.slice(), n, size);

        // run quicksort js
        console.log(`Running JS quicksort on ${size}...`);
        const jsQuicksortRunner = jsQuicksort(arr, n);

        startTotal = performance.now();
        const quicksortJSTimes = runBenchmark(() => {
            jsQuicksortRunner.run();
        });
        endTotal = performance.now();

        results.push({ algorithm: 'quicksort', implementation: 'js', size, times: quicksortJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run quicksort wasm
        console.log(`Running WASM quicksort on ${size}...`);
        const wasmQuicksortRunner = wasmQuicksort(wasm.quickSortModule, arr, n);

        let quicksortWasmTimes;
        startTotal = performance.now();
        try {
            quicksortWasmTimes = runBenchmark(() => {
                wasmQuicksortRunner.run();
            });
        } finally {
            wasmQuicksortRunner.free();
        }
        endTotal = performance.now();
        results.push({ algorithm: 'quicksort', implementation: 'wasm', size, times: quicksortWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Graphing (BFS)
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }

        console.log(`Loading graph data. Size: ${size}...`);
        const graphData = await loadGraphData(size, DATA_ROOT);

        // validate BFS
        console.log(`Validating BFS for size: ${size}...`);
        validateBFS(wasm, graphData, size);

        // run BFS js
        console.log(`Running JS bfs on ${size}...`);
        const jsBFSRunner = jsBFS(graphData);

        startTotal = performance.now();
        const bfsJSTimes = runBenchmark(() => {
            jsBFSRunner.run();
        });
        endTotal = performance.now();

        results.push({ algorithm: 'bfs', implementation: 'js', size, times: bfsJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run BFS wasm
        console.log(`Running WASM bfs on ${size}...`);
        const wasmBFSRunner = wasmBFS(wasm.bfsModule, graphData);

        let bfsWasmTimes;
        startTotal = performance.now();
        try {
            bfsWasmTimes = runBenchmark(() => {
                wasmBFSRunner.run();
            });
        } finally {
            wasmBFSRunner.free();
        }
        endTotal = performance.now();

        results.push({ algorithm: 'bfs', implementation: 'wasm', size, times: bfsWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Graph (Dijkstra)
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }

        console.log(`Loading weighted graph data. Size: ${size}...`);
        const weightedGraphData = await loadWeightedGraphData(size, DATA_ROOT);

        // validate Dijkstra
        console.log(`Validating Dijkstra for size: ${size}...`);
        validateDijkstra(wasm, weightedGraphData, size);

        // run Dijkstra js
        console.log(`Running JS dijkstra on ${size}...`);
        const jsDijkstraRunner = jsDijkstra(weightedGraphData);

        startTotal = performance.now();
        const dijkstraJSTimes = runBenchmark(() => {
            jsDijkstraRunner.run();
        });
        endTotal = performance.now();

        results.push({ algorithm: 'dijkstra', implementation: 'js', size, times: dijkstraJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run Dijkstra wasm
        console.log(`Running WASM dijkstra on ${size}...`);
        const wasmDijkstraRunner = wasmDijkstra(wasm.dijkstraModule, weightedGraphData);

        let dijkstraWasmTimes;
        startTotal = performance.now();
        try {
            dijkstraWasmTimes = runBenchmark(() => {
                wasmDijkstraRunner.run();
            });
        } finally {
            wasmDijkstraRunner.free();
        }
        endTotal = performance.now();

        results.push({ algorithm: 'dijkstra', implementation: 'wasm', size, times: dijkstraWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Matrix multiplication
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }

        console.log(`Loading matrix data. Size: ${size}...`);
        const { n, A, B } = await loadMatrixData(size, DATA_ROOT);

        // validate matrix multiplication
        console.log(`Validating Matrix multiplication for size: ${size}...`);
        validateMatrixMultiplication(wasm, A, B, n, size);

        // run matrix multiplication js
        console.log(`Running JS matrix multiplication on ${size}...`);
        const jsMatrixMultiplicationRunner = jsMatrixMultiplication(A, B, n);

        startTotal = performance.now();
        const matrixMultiplicationJSTimes = runBenchmark(() => {
            jsMatrixMultiplicationRunner.run();
        });
        endTotal = performance.now();

        results.push({ algorithm: 'matrix_multiplication', implementation: 'js', size, times: matrixMultiplicationJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run matrix multiplication wasm
        console.log(`Running WASM matrix multiplication on ${size}...`);
        const wasmMatrixMultiplicationRunner = wasmMatrixMultiplication(wasm.matrixModule, A, B, n);
        
        let matrixMultiplicationWasmTimes;
        startTotal = performance.now();
        try {
            matrixMultiplicationWasmTimes = runBenchmark(() => {
                wasmMatrixMultiplicationRunner.run();
            });
        } finally {
            wasmMatrixMultiplicationRunner.free();
        }
        endTotal = performance.now();

        results.push({ algorithm: 'matrix_multiplication', implementation: 'wasm', size, times: matrixMultiplicationWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }
    
    console.log("Finished");
    return results;

}

export function initBench() {
    const startButton = document.getElementById('start-button');
    const exportButton = document.getElementById('export-button');
    const cancelButton = document.getElementById('cancel-button');
    const status = document.getElementById('status');

    let csvData = null;

    startButton.addEventListener('click', async () => {
        cancel = false;
        csvData = null;
        exportButton.disabled = true;
        status.textContent = 'Running...';
        cancelButton.style.display = 'inline';
        startButton.style.display = 'none';
        
        const results = await runAllBenchmarks();
        
        cancelButton.style.display = 'none';
        startButton.style.display = 'inline';
        startButton.disabled = false;

        if (cancel) {
            startButton.disabled = false;
            status.textContent = 'Cancelled.';
        } else {
            csvData = buildCSV(results);
            status.textContent = 'Done.';
            exportButton.disabled = false;
        }

    });

    cancelButton.addEventListener('click', () => {
        console.log("Attempting to cancel.")
        cancel = true;
        cancelButton.style.display = 'none';
        startButton.style.display = 'inline';
        startButton.disabled = true;
        status.textContent = 'Cancelling...';
    });

    exportButton.addEventListener('click', () => {
        if (csvData) downloadCSV(csvData);
    });
}