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

function runJSBenchmark(runner, algo, size, results) {
    const startTotal = performance.now();
    const times = runBenchmark(() => {
        runner.run();
    });
    const endTotal = performance.now();

    results.push({ algorithm: algo, implementation: 'js', size, times: times });
    console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`)
}

function runWASMBenchmark(runner, algo, size, results) {
    let total;
    let times;
    try {
        const start = performance.now();
        times = runBenchmark(() => {
            runner.run();
        });
        total = start - performance.now();
    } finally {
        runner.free();
    }

    results.push({ algorithm: algo, implementation: 'wasm', size, times: times });
    console.log(`WASM. Size: ${size}. Total time: ${total.toFixed(1)}ms`);
}

async function runAllBenchmarks() {
    const results = [];
    cancel = false;

    console.log("Loadin WASM modules");
    const wasm = await initWasm();

    // Mergesort
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
        runJSBenchmark(jsMergesort(arr, n), 'mergesort', size, results);

        // run mergesort wasm
        console.log(`Running WASM mergesort on ${size}...`);
        runWASMBenchmark(wasmMergesort(wasm.mergeSortModule, arr, n), 'mergesort', size, results);
    }

    // Quicksort
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }

        console.log(`Loading sorting data. Size: ${size}...`);
        const {n, arr} = await loadSortData(size, DATA_ROOT);

        // validate quicksort
        console.log(`Validating quicksort for size: ${size}...`);
        validateQuicksort(wasm, arr, n, size);

        // run quicksort js
        console.log(`Running JS quicksort on ${size}...`);
        runJSBenchmark(jsQuicksort(arr, n), 'quicksort', size, results);

        // run quicksort wasm
        console.log(`Running WASM quicksort on ${size}...`);
        runWASMBenchmark(wasmQuicksort(wasm.quickSortModule, arr, n), 'quicksort', size, results);
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
        runJSBenchmark(jsBFS(graphData), 'bfs', size, results);

        // run BFS wasm
        console.log(`Running WASM bfs on ${size}...`);
        runWASMBenchmark(wasmBFS(wasm.bfsModule, graphData), 'bfs', size, results);
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
        runJSBenchmark(jsDijkstra(weightedGraphData), 'dijkstra', size, results);

        // run Dijkstra wasm
        console.log(`Running WASM dijkstra on ${size}...`);
        runWASMBenchmark(wasmDijkstra(wasm.dijkstraModule, weightedGraphData), 'dijkstra', size, results);
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
        runJSBenchmark(jsMatrixMultiplication(A, B, n), 'matrix_multiplication', size, results);

        // run matrix multiplication wasm
        console.log(`Running WASM matrix multiplication on ${size}...`);
        runWASMBenchmark(wasmMatrixMultiplication(wasm.matrixModule, A, B, n), 'matrix_multiplication', size, results);
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