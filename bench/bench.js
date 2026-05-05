import { merge_sort } from "../src/js/sorting/mergesort.mjs"
import { quick_sort } from "../src/js/sorting/quicksort.mjs";
import { bfs } from "../src/js/graphs/bfs.mjs";
import { dijkstra } from "../src/js/graphs/dijkstra.mjs";
import { matrix_multiplication } from "../src/js/numeric/matrix_multiplication.mjs";

import createMergeSortModule from "../src/wasm/sorting/mergesort.mjs";
import createQuickSortModule from "../src/wasm/sorting/quicksort.mjs";
import createBFSModule from "../src/wasm/graphs/bfs.mjs";
import createDijkstraModule from "../src/wasm/graphs/dijkstra.mjs";
import createMatrixModule from "../src/wasm/numeric/matrix_multiplication.mjs";

/* -------------------------
 * Config
 * ------------------------- */

const WARMUP_RUNS = 5;
const TIMED_RUNS = 30;
const DATA_ROOT = '../datasets';

const SIZES = ['small', 'medium', 'large', 'very_large'];

let cancel = false;

function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Chrome')) return 'chrome';
    return 'unknown';
}

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

    const from = new Int32Array(buffer, 8, numOfEdges);
    const to = new Int32Array(buffer, 8 + numOfEdges * 4, numOfEdges);

    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);
    const counts = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        counts[from[i]]++;
    }

    offsets[0] = 0;

    for (let i = 0; i < numOfNodes; i++) {
        offsets[i + 1] = offsets[i] + counts[i];
    }

    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const startNode = from[i];
        neighbors[offsets[startNode] + cursor[startNode]++] = to[i];
    }

    return {
        numOfNodes,
        numOfEdges,
        from,
        to,
        offsets,
        neighbors
    };
}

async function loadWeightedGraphData(size) {
    const res = await fetch(`${DATA_ROOT}/graphs_weighted/${size}.bin`); // Fixed path naming
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);

    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);
    const weight = new Float64Array(numOfEdges);

    const structSize = 16;
    let offset = 8;

    for (let i = 0; i < numOfEdges; i++) {
        from[i] = view.getInt32(offset, true);
        to[i]   = view.getInt32(offset + 4, true);
        weight[i] = view.getFloat64(offset + 8, true);
        offset += structSize;
    }

    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);
    const weights = new Float64Array(numOfEdges);
    const counts = new Int32Array(numOfNodes);

    for (let i = 0; i < numOfEdges; i++) counts[from[i]]++;
    for (let i = 0; i < numOfNodes; i++) offsets[i + 1] = offsets[i] + counts[i];

    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const u = from[i];
        const pos = offsets[u] + cursor[u]++;
        neighbors[pos] = to[i];
        weights[pos] = weight[i];
    }

    return { numOfNodes, numOfEdges, from, to, weight, offsets, neighbors, weights };
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
            rows.push(`${algorithm},${implementation},${size},${i + 1},${t.toFixed(6)}`);
        });
    }
    return rows.join('\n');
}

function downloadCSV(csv) {
    const browser = detectBrowser();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `js_wasm_results_${browser}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

async function checkMergeSort(wasm, dataset) {
    const { n, arr } = await loadSortData(dataset);

    const jsCopy = arr.slice();
    merge_sort(jsCopy, n);

    const pointer = wasm.mergeSortModule._malloc(arr.length * 4);
    wasm.mergeSortModule.HEAP32.set(arr, pointer >> 2);
    wasm.mergeSortModule._merge_sort(pointer, n);
    const wasmResult = wasm.mergeSortModule.HEAP32.subarray(pointer >> 2, (pointer >> 2) + n);

    let match = true;
    for (let i = 0; i < n; i++) {
        if (jsCopy[i] !== wasmResult[i]) {
            match = false;
            break;
        }
    }
    // console.log(arr);
    // console.log(jsCopy);
    // console.log(wasmResult);
    wasm.mergeSortModule._free(pointer);
    return match;
}

async function checkQuickSort(wasm, dataset) {
    const { n, arr } = await loadSortData(dataset);

    const jsCopy = arr.slice();
    quick_sort(jsCopy, n);

    const pointer = wasm.quickSortModule._malloc(arr.length * 4);
    const wasmCopy = arr.slice();
    wasm.quickSortModule.HEAP32.set(wasmCopy, pointer >> 2);
    wasm.quickSortModule._quick_sort(pointer, n);
    const wasmResult = new Int32Array(wasm.quickSortModule.HEAP32.buffer, pointer, n);

    let match = true;
    for (let i = 0; i < n; i++) {
        if (jsCopy[i] !== wasmResult[i]) { match = false; break; }
    }
    // console.log(arr);
    // console.log(jsCopy);
    // console.log(wasmResult);
    wasm.quickSortModule._free(pointer);
    return match;
}

async function checkBFS(wasm, dataset) {
    const graphData = await loadGraphData(dataset);
    const { numOfNodes, numOfEdges, from, to } = graphData;

    const visited = new Int32Array(numOfNodes);
    const dist = new Int32Array(numOfNodes);

    bfs(graphData, 0, visited, dist);

    const fromPointer = wasm.bfsModule._malloc(numOfEdges * 4);
    const toPointer = wasm.bfsModule._malloc(numOfEdges * 4);
    wasm.bfsModule.HEAP32.set(from, fromPointer >> 2);
    wasm.bfsModule.HEAP32.set(to, toPointer >> 2);

    const g = wasm.bfsModule._graph_create(numOfNodes);
    wasm.bfsModule._graph_build(g, numOfEdges, fromPointer, toPointer);

    const visitedPointer = wasm.bfsModule._malloc(numOfNodes * 4);
    const distPointer = wasm.bfsModule._malloc(numOfNodes * 4);

    wasm.bfsModule._bfs(g, 0, visitedPointer, distPointer);

    const wasmDist = wasm.bfsModule.HEAP32.subarray(distPointer >> 2, (distPointer >> 2) + numOfNodes);

    let match = true;
    for (let i = 0; i < numOfNodes; i++) {
        if (dist[i] !== wasmDist[i]) {
            console.log(`Mismatch node ${i}: JS=${dist[i]}, WASM=${wasmDist[i]}`);
            match = false;
            break;
        }
    }

    wasm.bfsModule._graph_free(g);
    wasm.bfsModule._free(fromPointer);
    wasm.bfsModule._free(toPointer);
    wasm.bfsModule._free(visitedPointer);
    wasm.bfsModule._free(distPointer);

    return match;
}

async function checkDijkstra(wasm, dataset) {
    const graphData = await loadWeightedGraphData(dataset);
    const { numOfNodes, numOfEdges, from, to, weight } = graphData;

    const dist = new Float64Array(numOfNodes);
    const visited = new Int32Array(numOfNodes);
    dijkstra(graphData, 0, dist, visited);

    const fromPointer = wasm.dijkstraModule._malloc(numOfEdges * 4);
    const toPointer = wasm.dijkstraModule._malloc(numOfEdges * 4);
    const weightPointer = wasm.dijkstraModule._malloc(numOfEdges * 8);
    
    wasm.dijkstraModule.HEAP32.set(from, fromPointer >> 2);
    wasm.dijkstraModule.HEAP32.set(to, toPointer >> 2);
    wasm.dijkstraModule.HEAPF64.set(weight, weightPointer >> 3);

    const weightedGraph = wasm.dijkstraModule._weighted_graph_create(numOfNodes);
    wasm.dijkstraModule._weighted_graph_build(weightedGraph, numOfEdges, fromPointer, toPointer, weightPointer);

    const wasmVisitedPointer = wasm.dijkstraModule._malloc(numOfNodes * 4);
    const wasmDistPointer = wasm.dijkstraModule._malloc(numOfNodes * 8);

    wasm.dijkstraModule._dijkstra(weightedGraph, 0, wasmDistPointer, wasmVisitedPointer);

    const wasmDistView = wasm.dijkstraModule.HEAPF64.subarray(wasmDistPointer >> 3, (wasmDistPointer >> 3) + numOfNodes);

    let match = true;
    for (let i = 0; i < numOfNodes; i++) {
        const d1 = dist[i];
        const d2 = wasmDistView[i];

        if (d1 === d2) continue;
        if (Math.abs(d1 - d2) > 1e-9) {
            console.error(`Mismatch node ${i}: JS=${d1}, WASM=${d2}`);
            match = false;
            break;
        }
    }

    wasm.dijkstraModule._weighted_graph_free(weightedGraph);
    wasm.dijkstraModule._free(fromPointer);
    wasm.dijkstraModule._free(toPointer);
    wasm.dijkstraModule._free(weightPointer);
    wasm.dijkstraModule._free(wasmVisitedPointer);
    wasm.dijkstraModule._free(wasmDistPointer);

    return match;
}

async function checkMatrixMultiplication(wasm, dataset) {
    const { n, A, B, C } = await loadMatrixData(dataset);

    matrix_multiplication(A, B, C, n);

    const aPointer = wasm.matrixModule._malloc(n * n * 8);
    const bPointer = wasm.matrixModule._malloc(n * n * 8);
    const cPointer = wasm.matrixModule._malloc(n * n * 8);
    wasm.matrixModule.HEAPF64.set(A, aPointer >> 3);
    wasm.matrixModule.HEAPF64.set(B, bPointer >> 3);
    wasm.matrixModule._matrix_multiplication(aPointer, bPointer, cPointer, n);
    const wasmC = new Float64Array(wasm.matrixModule.HEAPF64.buffer, cPointer, n * n);

    let match = true;
    for (let i = 0; i < n * n; i++) {
        if (Math.abs(C[i] - wasmC[i]) > 1e-9) { match = false; break; }
    }

    wasm.matrixModule._free(aPointer);
    wasm.matrixModule._free(bPointer);
    wasm.matrixModule._free(cPointer);
    return match;
}

async function validateAlgorithms(wasm) {
    console.log("---------------------------");
    console.log("Validating algorithms");

    const dataset = "small";

    const mergeMatch = await checkMergeSort(wasm, dataset);
    if (mergeMatch) { 
        console.log("Merge sort: OK")
    } else {
        console.log("Merge sort: NOT MATCHING")
    }

    const quickMatch = await checkQuickSort(wasm, dataset);
    if (quickMatch) {
        console.log("Quick sort: OK")
    } else {
        console.log("Quick sort: NOT MATCHING")
    }

    const bfsMatch = await checkBFS(wasm, dataset);
    if (bfsMatch) {
        console.log("BFS: OK")
    } else {
        console.log("BFS: NOT MATCHING")
    }
    
    const dijkstraMatch = await checkDijkstra(wasm, dataset);
    if (dijkstraMatch) {
        console.log("Dijkstra: OK")
    } else {
        console.log("Dijkstra: NOT MATCHING")
    }

    const matrixMultiplicationMatch = await checkMatrixMultiplication(wasm, dataset);
    if (matrixMultiplicationMatch) {
        console.log("Matrix multiplication: OK")
    } else {
        console.log("Matrix multiplication: NOT MATCHING")
    }

    console.log("Validation done");
    console.log("---------------------------");
}

async function runAllBenchmarks() {
    const results = [];
    let startTotal = null;
    let endTotal = null;
    cancel = false;

    console.log("Loadin WASM modules");
    const wasm = await initWasm();
    await validateAlgorithms(wasm);

    // Sorting
    for (const size of SIZES) {
        if (cancel) {
            console.log("Cancelling...");
            return results;
        }
        console.log(`Loading sorting data. Size: ${size}...`);
        const {n, arr} = await loadSortData(size);

        // run mergesort
        console.log(`Running JS mergesort on ${size}...`);
        const mergeCopy = arr.slice();
        startTotal = performance.now();
        const mergesortJSTimes = runBenchmark(() => {
            mergeCopy.set(arr);
            merge_sort(mergeCopy, n);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'mergesort', implementation: 'js', size, times: mergesortJSTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`)

        let pointer = wasm.mergeSortModule._malloc(n * 4);
        const wasmMergeCopy = wasm.mergeSortModule.HEAP32.subarray(pointer >> 2, (pointer >> 2) + n);
        
        console.log(`Running WASM mergesort on ${size}...`);
        startTotal = performance.now();
        const mergesortWasmTimes = runBenchmark(() => {
            wasmMergeCopy.set(arr);
            wasm.mergeSortModule._merge_sort(pointer, n);
        });
        endTotal = performance.now();
        wasm.mergeSortModule._free(pointer);
        results.push({ algorithm: 'mergesort', implementation: 'wasm', size, times: mergesortWasmTimes });
        console.log(`WASM. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        // run quicksort
        console.log(`Running JS quicksort on ${size}...`);
        startTotal = performance.now();
        const quickCopy = arr.slice();
        const quicksortTimes = runBenchmark(() => {
            quickCopy.set(arr);
            quick_sort(quickCopy, n);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'quicksort', implementation: 'js', size, times: quicksortTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        pointer = wasm.quickSortModule._malloc(arr.length * 4);
        const wasmQuickCopy = wasm.quickSortModule.HEAP32.subarray(pointer >> 2, (pointer >> 2) + arr.length);

        console.log(`Running WASM quicksort on ${size}...`);
        startTotal = performance.now();
        const quicksortWasmTimes = runBenchmark(() => {
            wasmQuickCopy.set(arr);
            wasm.quickSortModule._quick_sort(pointer, n);
        });
        endTotal = performance.now();
        wasm.quickSortModule._free(pointer);
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
        const graphData = await loadGraphData(size);

        const visited = new Int32Array(graphData.numOfNodes);
        const dist = new Int32Array(graphData.numOfNodes);

        console.log(`Running JS bfs on ${size}...`);
        startTotal = performance.now();
        const bfsTimes = runBenchmark(() => {
            bfs(graphData, 0, visited, dist);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'bfs', implementation: 'js', size, times: bfsTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        console.log(`Running WASM bfs on ${size}...`);
        const { numOfNodes, numOfEdges, from, to } = graphData;
        const fromPointer = wasm.bfsModule._malloc(numOfEdges * 4);
        const toPointer = wasm.bfsModule._malloc(numOfEdges * 4);
        wasm.bfsModule.HEAP32.set(from, fromPointer >> 2);
        wasm.bfsModule.HEAP32.set(to, toPointer >> 2);

        const g = wasm.bfsModule._graph_create(numOfNodes);
        wasm.bfsModule._graph_build(g, numOfEdges, fromPointer, toPointer);

        const visitedPointer = wasm.bfsModule._malloc(numOfNodes * 4);
        const distPointer = wasm.bfsModule._malloc(numOfNodes * 4);

        startTotal = performance.now();
        const bfsWasmTimes = runBenchmark(() => {
            wasm.bfsModule._bfs(g, 0, visitedPointer, distPointer);
        });
        endTotal = performance.now();
        
        wasm.bfsModule._free(visitedPointer);
        wasm.bfsModule._free(distPointer);
        wasm.bfsModule._graph_free(g);
        wasm.bfsModule._free(fromPointer);
        wasm.bfsModule._free(toPointer);
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
        const weightedGraphData = await loadWeightedGraphData(size);

        console.log(`Running JS dijkstra on ${size}...`);
        const dist = new Float64Array(weightedGraphData.numOfNodes);
        const visited = new Int32Array(weightedGraphData.numOfNodes);

        startTotal = performance.now();
        const dijkstraTimes = runBenchmark(() => {
            dijkstra(weightedGraphData, 0, dist, visited);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'dijkstra', implementation: 'js', size, times: dijkstraTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        console.log(`Running WASM dijkstra on ${size}...`);
        const { numOfNodes, numOfEdges, from, to, weight } = weightedGraphData;
        const fromPointer = wasm.dijkstraModule._malloc(numOfEdges * 4);
        const toPointer = wasm.dijkstraModule._malloc(numOfEdges * 4);
        const weightPointer = wasm.dijkstraModule._malloc(numOfEdges * 8);
        const visitedPointer = wasm.dijkstraModule._malloc(numOfNodes * 4);
        const distPointer = wasm.dijkstraModule._malloc(numOfNodes * 8);

        wasm.dijkstraModule.HEAP32.set(from, fromPointer >> 2);
        wasm.dijkstraModule.HEAP32.set(to, toPointer >> 2);
        wasm.dijkstraModule.HEAPF64.set(weight, weightPointer >> 3);

        const g = wasm.dijkstraModule._weighted_graph_create(numOfNodes);
        wasm.dijkstraModule._weighted_graph_build(g, numOfEdges, fromPointer, toPointer, weightPointer);

        startTotal = performance.now();
        const dijkstraWasmTimes = runBenchmark(() => {
            wasm.dijkstraModule._dijkstra(g, 0, distPointer, visitedPointer);
        });
        endTotal = performance.now();

        wasm.dijkstraModule._free(visitedPointer);
        wasm.dijkstraModule._free(distPointer);
        wasm.dijkstraModule._weighted_graph_free(g);
        wasm.dijkstraModule._free(fromPointer);
        wasm.dijkstraModule._free(toPointer);
        wasm.dijkstraModule._free(weightPointer);
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
        const { n, A, B, C } = await loadMatrixData(size);

        console.log(`Running JS matrix multiplication on ${size}...`);
        startTotal = performance.now();
        const matrixMultiplicationTimes = runBenchmark(() => {
            matrix_multiplication(A, B, C, n);
        });
        endTotal = performance.now();
        results.push({ algorithm: 'matrix_multiplication', implementation: 'js', size, times: matrixMultiplicationTimes });
        console.log(`JS. Size: ${size}. Total time: ${(endTotal - startTotal).toFixed(1)}ms`);

        console.log(`Running WASM matrix multiplication on ${size}...`);
        const aPointer = wasm.matrixModule._malloc(n * n * 8);
        const bPointer = wasm.matrixModule._malloc(n * n * 8);
        const cPointer = wasm.matrixModule._malloc(n * n * 8);
        wasm.matrixModule.HEAPF64.set(A, aPointer >> 3);
        wasm.matrixModule.HEAPF64.set(B, bPointer >> 3);

        startTotal = performance.now();
        const matrixMultiplicationWasmTimes = runBenchmark(() => {
            wasm.matrixModule._matrix_multiplication(aPointer, bPointer, cPointer, n);
        });
        endTotal = performance.now();

        wasm.matrixModule._free(aPointer);
        wasm.matrixModule._free(bPointer);
        wasm.matrixModule._free(cPointer);
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
