import { mergesort } from '../../src/js/mergesort.js';
import { quicksort } from '../../src/js/quicksort.js';
import { bfs }       from '../../src/js/bfs.js';
import { dijkstra }  from '../../src/js/dijkstra.js';
import { matrixMultiplication }    from '../../src/js/matrix_multiplication.js';

/* -------------------------
 * Config
 * ------------------------- */

const WARMUP_RUNS  = 5;
const TIMED_RUNS   = 30;
const DATA_ROOT = '../../datasets';

const SIZES = ['small', 'medium', 'large', 'very_large'];

async function loadSortData(size) {
    const res    = await fetch(`${DATA_ROOT}/sorting/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view   = new DataView(buffer);
    const n      = view.getInt32(0, true);
    const arr    = new Int32Array(buffer, 4, n);
    return { n, arr };
}

async function loadGraphData(size) {
    const res         = await fetch(`${DATA_ROOT}/graphs/${size}.bin`);
    const buffer      = await res.arrayBuffer();
    const view        = new DataView(buffer);
    const numOfNodes  = view.getInt32(0, true);
    const numOfEdges  = view.getInt32(4, true);
    const from        = new Int32Array(buffer, 8, numOfEdges);
    const to          = new Int32Array(buffer, 8 + numOfEdges * 4, numOfEdges);
    return { numOfNodes, numOfEdges, from, to };
}

async function loadWeightedGraphData(size) {
    const res      = await fetch(`${DATA_ROOT}/graphs_weighted/${size}.bin`);
    const buffer   = await res.arrayBuffer();
    const view     = new DataView(buffer);
    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const from   = new Int32Array(numOfEdges);
    const to     = new Int32Array(numOfEdges);
    const weight = new Float64Array(numOfEdges);

    let offset = 8;
    for (let i = 0; i < numOfEdges; i++) {
        from[i]   = view.getInt32(offset,     true); offset += 4;
        to[i]     = view.getInt32(offset,     true); offset += 4;
        weight[i] = view.getFloat64(offset,   true); offset += 8;
    }

    return { numOfNodes, numOfEdges, from, to, weight };
}

async function loadMatrixData(size) {
    const res    = await fetch(`${DATA_ROOT}/matrix/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view   = new DataView(buffer);
    const n      = view.getInt32(0, true);
    const A      = new Float64Array(buffer, 4,              n * n);
    const B      = new Float64Array(buffer, 4 + n * n * 8, n * n);
    return { n, A, B };
}

function runBenchmark(func) {
    for (let i = 0; i < WARMUP_RUNS; i++) fn();

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
    const rows = ['algorithm,implementation,size,run,time_ms'];
    for (const { algorithm, implementation, size, times } of results) {
        times.forEach((t, i) => {
            rows.push(`${algorithm},${implementation},${size},${i + 1},${t.toFixed(6)}`);
        });
    }
    return rows.join('\n');
}

function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'js-results.csv';
    a.click();
    URL.revokeObjectURL(url);
}

export async function runAllBenchmarks(onProgress) {
    const results = [];

    // Sorting
    for (const size of SIZES) {
        onProgress(`Loading sorting data. Size: ${size}...`);
        const { _, arr } = await loadSortData(size);

        // run mergesort
        onProgress(`Running mergesort on ${size}...`);
        const mergesortTimes = runBenchmark(() => {
            const copy = arr.slice();
            mergesort(copy, 0, copy.length - 1);
        });
        results.push({ algorithm: 'mergesort', implementation: 'js', size, times: mergesortTimes });

        // run quicksort
        onProgress(`Running quicksort on ${size}...`);
        const quicksortTimes = runBenchmark(() => {
            const copy = arr.slice();
            quicksort(copy, 0, copy.length - 1);
        });
        results.push({ algorithm: 'quicksort', implementation: 'js', size, times: quicksortTimes });
    }

    // Graphing (BFS)
    for (const size of SIZES) {
        onProgress(`Loading graph data. Size: ${size}...`);
        const graphData = await loadGraphData(size);

        onProgress(`Running bfs on ${size}...`);
        const bfsTimes = runBenchmark(() => {
            bfs(graphData, 0);
        });
        results.push({ algorithm: 'bfs', implementation: 'js', size, times: bfsTimes });
    }

    // Graph (Dijkstra)
    for (const size of SIZES) {
        onProgress(`Loading weighted graph data. Size: ${size}...`);
        const weightedGraphData = await loadWeightedGraphData(size);

        onProgress(`Running dijkstra on ${size}...`);
        const dijkstraTimes = runBenchmark(() => {
            dijkstra(weightedGraphData, 0);
        });
        results.push({ algorithm: 'dijkstra', implementation: 'js', size, times: dijkstraTimes });
    }

    // Matrix multiplication
    for (const size of SIZES) {
        onProgress(`Loading matrix data. Size: ${size}...`);
        const { n, A, B } = await loadMatrixData(size);

        onProgress(`Running matrix multiplication on ${size}...`);
        const matrixMultiplicationTimes = runBenchmark(() => {
            matrixMultiplication(A, B, n);
        });
        results.push({ algorithm: 'matrix_multiplication', implementation: 'js', size, times: matrixMultiplicationTimes });
    }

    return results;

}

export function initBench() {
    const startButton  = document.getElementById('start-button');
    const exportButton = document.getElementById('export-button');
    const status    = document.getElementById('status');

    let csvData = null;

    startBtn.addEventListener('click', async () => {
        startButton.disabled  = true;
        exportButton.disabled = true;
        status.textContent = 'Starting...';

        const results = await runSuite((msg) => {
            status.textContent = msg;
        });

        csvData = buildCSV(results);
        status.textContent = 'Done.';
        exportButton.disabled = false;
    });

    exportButton.addEventListener('click', () => {
        if (csvData) downloadCSV(csvData);
    });
}
