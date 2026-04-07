import { merge_sort } from "../../src/js/sorting/mergesort.mjs";
import { quick_sort } from "../../src/js/sorting/quicksort.mjs";
import { bfs } from "../../src/js/graphs/bfs.mjs";
import { dijkstra } from "../../src/js/graphs/dijkstra.mjs";
import { matrix_multiplication } from "../../src/js/numeric/matrix_multiplication.mjs";

import createMergeSortModule from "../../src/wasm/sorting/mergesort.mjs";
import createQuickSortModule from "../../src/wasm/sorting/quicksort.mjs";
import createBFSModule from "../../src/wasm/graphs/bfs.mjs";
import createDijkstraModule from "../../src/wasm/graphs/dijkstra.mjs";
import createMatrixModule from "../../src/wasm/numeric/matrix_multiplication.mjs";


/* -------------------------
 * Config
 * ------------------------- */

const WARMUP_RUNS = 5;
const TIMED_RUNS = 30;
const DATA_ROOT = '../../datasets';

const SIZES = ['small', 'medium', 'large', 'very_large'];

async function initWasm() {
    const [
        mergeSortModule,
        quickSortModule,
        bfsModule,
        dijkstraModule,
        matrixModule,
    ] = await Promise.all([
        createMergeSortModule(),
        createQuickSortModule(),
        createBFSModule(),
        createDijkstraModule(),
        createMatrixModule()
    ]);

    return {
        mergeSortModule,
        quickSortModule,
        bfsModule,
        dijkstraModule,
        matrixModule
    };
}

async function loadSortData(size) {
    const res = await fetch(`${DATA_ROOT}/sorting/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const n = view.getInt32(0, true);
    const arr = new Int32Array(buffer.slice(4), 0, n);
    return { n, arr };
}

async function loadGraphData(size) {
    const res = await fetch(`${DATA_ROOT}/graphs/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);
    const from = new Int32Array(buffer.slice(8), 0, numOfEdges);
    const to = new Int32Array(buffer.slice(8 + numOfEdges * 4), 0, numOfEdges);
    const heads = Array.from({ length: numOfNodes }, () => []);
    for (let i = 0; i < numOfEdges; i++) {
        heads[from[i]].push(to[i]);
    }

    return { numOfNodes, numOfEdges, from, to, heads };
}

async function loadWeightedGraphData(size) {
    const res = await fetch(`${DATA_ROOT}/graphs_weighted/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);
    const weight = new Float64Array(numOfEdges);

    let offset = 8;
    for (let i = 0; i < numOfEdges; i++) {
        from[i] = view.getInt32(offset, true); offset += 4;
        to[i] = view.getInt32(offset, true); offset += 4;
        weight[i] = view.getFloat64(offset, true); offset += 8;
    }

    const heads = Array.from({ length: numOfNodes }, () => []);
    for (let i = 0; i < numOfEdges; i++) {
        heads[from[i]].push({ to: to[i], weight: weight[i] });
    }

    return { numOfNodes, numOfEdges, from, to, weight, heads };
}

async function loadMatrixData(size) {
    const res = await fetch(`${DATA_ROOT}/matrix/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const n = view.getInt32(0, true);
    const A = new Float64Array(buffer.slice(4), 0, n * n);
    const B = new Float64Array(buffer.slice(4 + n * n * 8), 0, n * n);
    const C = new Float64Array(n * n);
    return { n, A, B, C };
}

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

function buildCSV(results) {
    const rows = ['algorithm,implementation,size,run,time_in_ms'];
    for (const {algorithm, implementation, size, times } of results) {
        times.forEach((t, i) => {
            rows.push(`${algorithm},${implementation},${size},${i + 1},${t.toFixed(3)}`);
        });
    }
    return rows.join('\n');
}

function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
}

export async function runAllBenchmarks() {
    const results = [];
    let startTotal = null;
    let endTotal = null;

    console.log("Loadin WASM modules");
    const wasm = await initWasm();

    // Sorting
    for (const size of SIZES) {
        console.log(`Loading sorting data. Size: ${size}...`);
        const {_, arr} = await loadSortData(size);

        // run mergesort
        console.log(`Running JS mergesort on ${size}...`);
        startTotal = performance.now();
        const mergesortJSTimes = runBenchmark(() => {
            const copy = arr.slice();
            merge_sort(copy, copy.length);
        });
        
        endTotal = performance.now();
        results.push({ algorithm: 'mergesort', implementation: 'js', size, times: mergesortJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`)

        const ptr = wasm.mergeSortModule._malloc(arr.length * 4);
        console.log(`Running WASM mergesort on ${size}...`);
        startTotal = performance.now();
        const mergesortWasmTimes = runBenchmark(() => {
            const copy = arr.slice();
            wasm.mergeSortModule.HEAP32.set(copy, ptr >> 2);
            wasm.mergeSortModule._merge_sort(ptr, arr.length);
        });
        endTotal = performance.now();
        wasm.mergeSortModule._free(ptr);
        results.push({ algorithm: 'mergesort', implementation: 'wasm', size, times: mergesortWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run quicksort
        console.log(`Running JS quicksort on ${size}...`);
        startTotal = performance.now();
        const quicksortTimes = runBenchmark(() => {
            const copy = arr.slice();
            quick_sort(copy, copy.length);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'quicksort', implementation: 'js', size, times: quicksortTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Graphing (BFS)
    for (const size of SIZES) {
        console.log(`Loading graph data. Size: ${size}...`);
        const graphData = await loadGraphData(size);

        console.log(`Running bfs on ${size}...`);
        startTotal = performance.now();
        const bfsTimes = runBenchmark(() => {
            bfs(graphData, 0);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'bfs', implementation: 'js', size, times: bfsTimes });
        console.log(`Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Graph (Dijkstra)
    for (const size of SIZES) {
        console.log(`Loading weighted graph data. Size: ${size}...`);
        const weightedGraphData = await loadWeightedGraphData(size);

        console.log(`Running dijkstra on ${size}...`);
        const dist = new Float64Array(weightedGraphData.numOfNodes);
        const visited = new Int32Array(weightedGraphData.numOfNodes);

        startTotal = performance.now();
        const dijkstraTimes = runBenchmark(() => {
            dijkstra(weightedGraphData, 0, dist, visited);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'dijkstra', implementation: 'js', size, times: dijkstraTimes });
        console.log(`Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }

    // Matrix multiplication
    for (const size of SIZES) {
        console.log(`Loading matrix data. Size: ${size}...`);
        const { n, A, B, C } = await loadMatrixData(size);

        console.log(`Running matrix multiplication on ${size}...`);
        startTotal = performance.now();
        const matrixMultiplicationTimes = runBenchmark(() => {
            matrix_multiplication(A, B, C, n);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'matrix_multiplication', implementation: 'js', size, times: matrixMultiplicationTimes });
        console.log(`Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);
    }
    
    console.log("Finished");
    return results;

}

export function initBench() {
    const startButton = document.getElementById('start-button');
    const exportButton = document.getElementById('export-button');
    const status = document.getElementById('status');

    let csvData = null;

    startButton.addEventListener('click', async () => {
        startButton.disabled = true;
        exportButton.disabled = true;
        status.textContent = 'Running...';

        const results = await runAllBenchmarks();

        csvData = buildCSV(results);
        status.textContent = 'Done.';
        exportButton.disabled = false;
    });

    exportButton.addEventListener('click', () => {
        if (csvData) downloadCSV(csvData);
    });
}
