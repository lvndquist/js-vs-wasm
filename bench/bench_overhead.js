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
    const rows = ['experiment,size,run, call_count, time_in_ms'];
    for (const {experiment, size, call_count, times} of results) {
        times.forEach((t, i) => {
            rows.push(`${experiment},${size},${i + 1},${call_count},${t.toFixed(6)}`);
        });
    }
    return rows.join('\n');
}

function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_overhead.csv';
    a.click();
    URL.revokeObjectURL(url);
}

export async function runAllBenchmarks() {

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
        console.log("Requesting to cancel.")
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
