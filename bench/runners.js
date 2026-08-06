import { merge_sort } from "../src/js/sorting/mergesort.mjs"
import { quick_sort } from "../src/js/sorting/quicksort.mjs";
import { bfs } from "../src/js/graphs/bfs.mjs";
import { dijkstra } from "../src/js/graphs/dijkstra.mjs";
import { matrix_multiplication } from "../src/js/numeric/matrix_multiplication.mjs";

/*******************************************************
 * 
 * MERGESORT
 * 
 ******************************************************/

export function wasmMergeSort(module, arr, n) {
    const pointer = module._malloc(n * 4);

    const view = module.HEAP32.subarray(pointer >> 2, (pointer >> 2) + n);

    return {
        run() {
            // copy array into wasm memory
            view.set(arr);
            module._merge_sort(pointer, n);
        },

        result() {
            return new Int32Array(view);
        },

        dispose() {
            module._free(pointer);
        }
    };
}

export function jsMergeSort(arr, n) {
    const view = arr.slice();

    return {
        run() {
            // restore the unsorted array before each run
            view.set(arr);
            merge_sort(view, n);
        },

        result() {
            return view.slice();
        }
    };
}

/*******************************************************
 * 
 * QUICKSORT
 * 
 ******************************************************/

export function wasmQuickSort(module, arr, n) {
    const pointer = module._malloc(n * 4);

    const view = module.HEAP32.subarray(pointer >> 2, (pointer >> 2) + n);

    return {
        run() {
            // copy array into wasm memory
            view.set(arr);
            module._quick_sort(pointer, n);
        },

        result() {
            return new Int32Array(view);
        },

        free() {
            module._free(pointer);
        }
    };
}

export function jsQuickSort(arr, n) {
    const view = arr.slice();

    return {
        run() {
            // restore the unsorted array before each run
            view.set(arr);
            quick_sort(view , n);
        },

        result() {
            return view.slice();
        }
    };
}

/*******************************************************
 * 
 * BFS
 * 
 ******************************************************/

export function wasmBFS(module, graphData) {
    const { numOfNodes, numOfEdges, from, to } = graphData;
    const fromPointer = module._malloc(numOfEdges * 4);
    const toPointer = module._malloc(numOfEdges * 4);
    module.HEAP32.set(from, fromPointer >> 2);
    module.HEAP32.set(to, toPointer >> 2);

    const g = module._graph_create(numOfNodes);
    module._graph_build(g, numOfEdges, fromPointer, toPointer);

    const visitedPointer = module._malloc(numOfNodes * 4);
    const distPointer = module._malloc(numOfNodes * 4);

    return {
        run() {
            module._bfs(g, 0, visitedPointer, distPointer);
        },

        result() {

        },

        free() {
            module._free(visitedPointer);
            module._free(distPointer);
            module._graph_free(g);
            module._free(fromPointer);
            module._free(toPointer);
        }
    }
}

export function jsBFS(graphData, source = 0) {
    const visited = new Int32Array(graphData.numOfNodes);
    const dist = new Int32Array(graphData.numOfNodes);

    return {
        run() {
            bfs(graphData, source, visited, dist);
        },

        result() {
            return { visited: new Int32Array(visited), dist: new Int32Array(dist) };
        }
    };
}