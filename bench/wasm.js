import createMergeSortModule from "../src/wasm/sorting/mergesort.mjs";
import createQuickSortModule from "../src/wasm/sorting/quicksort.mjs";
import createBFSModule from "../src/wasm/graphs/bfs.mjs";
import createDijkstraModule from "../src/wasm/graphs/dijkstra.mjs";
import createMatrixModule from "../src/wasm/numeric/matrix_multiplication.mjs";

export async function initWasm() {
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