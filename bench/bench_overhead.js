import createMatrixModule from "../src/wasm/numeric/matrix_multiplication.mjs";
import createOverheadModule from "../src/wasm/overhead/overhead.mjs";

/* -------------------------
 * Config
 * ------------------------- */

const WARMUP_RUNS = 5;
const TIMED_RUNS = 30;
const DATA_ROOT = '../datasets';

const SIZES = ['small', 'medium', 'large', 'very_large'];
const CALL_COUNT = [1, 10, 100, 1000, 10000, 100000];

let cancel = false;

async function initWasm() {
    const [
        matrixModule,
        overheadModule
    ] = await Promise.all([
        createMatrixModule(),
        createOverheadModule()
    ]);

    return {
        matrixModule,
        overheadModule,
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

function noop(overheadModule, c) {
    return runBenchmark(() => {
        for (let i = 0; i < c; i++) {
            overheadModule._noop();
        }
    });
}

function fullMatrix(matrixModule, a, b, c, n) {
    return runBenchmark(() => {
        matrixModule._matrix_multiplication(a, b, c, n);
    });
}

function rowMatrix(overheadModule, a, b, c, n) {
    return runBenchmark(() => {
        for (let i = 0; i < n; i++) {
            overheadModule._matrix_multiplication_row(a, b, c, i, n);
        }
    });
}

function cellMatrix(overheadModule, a, b, c, n) {
    return runBenchmark(() => {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                overheadModule._matrix_multiplication_cell(a, b, c, i, j, n);
            }
        }
    });
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
    const results = [];
    cancel = false;

    console.log("Loading WASM modules.");
    const wasm = await initWasm();

    console.log("Running no-op");
    for (const c of CALL_COUNT) {
        if (cancel) {
            console.log("Cancelling..");
            return results; 
        }

        console.log(`Running no-op count: ${c}`);
        const times = noop(wasm.overheadModule, c);
        results.push({ experiment: 'no-op', size: '-', call_count: c, times });
        console.log("Done.");
    }

    for (const size of SIZES) {
        if (cancel) { console.log("Cancelling."); return results; }

        console.log(`Loading matrix data. Size: ${size}`);
        const { n, A, B, C} = await loadMatrixData(size);

        const a = wasm.matrixModule._malloc(n * n * 8);
        const b = wasm.matrixModule._malloc(n * n * 8);
        const c = wasm.matrixModule._malloc(n * n * 8);
        wasm.matrixModule.HEAPF64.set(A, a >> 3);
        wasm.matrixModule.HEAPF64.set(B, b >> 3);

        if (!cancel) {
            console.log(`Running full matrix multiplication on ${size}`);
            const times = fullMatrix(wasm.matrixModule, a, b, c, n);
            results.push({ experiment: 'full_matrix', size, call_count: 1, times});
            console.log("Done.");
        } else {
            console.log("Cancelling..");
            return results;
        }

        if (!cancel) {
            console.log(`Running matrix multiplication by row (${n} calls) on ${size}`);
            const times = rowMatrix(wasm.overheadModule, a, b, c, n);
            results.push({ experiment: 'row_matrix', size, call_count: n, times});
            console.log("Done.");
        } else {
            console.log("Cancelling..");
            return results;
        }

        if (!cancel && (size === 'small' || size === 'medium')) {
            console.log(`Running matrix multiplication by cell (${n * n} calls) on ${size}`);
            const times = cellMatrix(wasm.overheadModule, a, b, c, n);
            results.push({ experiment: 'cell_matrix', size, call_count: n * n, times});
            console.log("Done.");
        } else {
            console.log("Cancelling..");
            return results;
        }
        
        wasm.matrixModule._free(a);
        wasm.matrixModule._free(b);
    }

    console.log("Overhead benchmarks finished.");
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
