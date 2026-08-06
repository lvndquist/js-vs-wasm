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

export function wasmMergesort(module, arr, n) {
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

        free() {
            module._free(pointer);
        }
    };
}

export function jsMergesort(arr, n) {
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

export function wasmQuicksort(module, arr, n) {
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

export function jsQuicksort(arr, n) {
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
            return {
                visited: new Int32Array(module.HEAP32.subarray(visitedPointer >> 2, (visitedPointer >> 2) + numOfNodes)),
                dist: new Int32Array(module.HEAP32.subarray(distPointer >> 2, (distPointer >> 2) + numOfNodes))
            };
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

export function jsBFS(graphData) {
    const visited = new Int32Array(graphData.numOfNodes);
    const dist = new Int32Array(graphData.numOfNodes);

    return {
        run() {
            bfs(graphData, 0, visited, dist);
        },

        result() {
            return { visited: new Int32Array(visited), dist: new Int32Array(dist) };
        }
    };
}

/*******************************************************
 * 
 * DIJKSTRA
 * 
 ******************************************************/

export function wasmDijkstra(module, graphData) {
        const { numOfNodes, numOfEdges, from, to, weight } = graphData;

        const fromPointer = module._malloc(numOfEdges * 4);
        const toPointer = module._malloc(numOfEdges * 4);
        const weightPointer = module._malloc(numOfEdges * 8);
        
        module.HEAP32.set(from, fromPointer >> 2);
        module.HEAP32.set(to, toPointer >> 2);
        module.HEAPF64.set(weight, weightPointer >> 3);
        
        const weightedGraph = module._weighted_graph_create(numOfNodes);
        module._weighted_graph_build(weightedGraph, numOfEdges, fromPointer, toPointer, weightPointer);
        
        const wasmVisitedPointer = module._malloc(numOfNodes * 4);
        const wasmDistPointer = module._malloc(numOfNodes * 8);

        return {
            run() {
                module._dijkstra(weightedGraph, 0, wasmDistPointer, wasmVisitedPointer);
            },

            result() {
                return {
                    visited: new Int32Array(module.HEAP32.subarray(wasmVisitedPointer >> 2, (wasmVisitedPointer >> 2) + numOfNodes)),
                    dist: new Float64Array(module.HEAPF64.subarray(wasmDistPointer >> 3, (wasmDistPointer >> 3) + numOfNodes))
                };
            },

            free() {
                module._free(wasmVisitedPointer);
                module._free(wasmDistPointer);
                module._weighted_graph_free(weightedGraph);
                module._free(fromPointer);
                module._free(toPointer);
                module._free(weightPointer);
            }
        };
    
}

export function jsDijkstra(graphData) {
    const dist = new Float64Array(graphData.numOfNodes);
    const visited = new Int32Array(graphData.numOfNodes);

    return {
        run() {
            dijkstra(graphData, 0, dist,visited);
        },

        result() {
            return {visited: new Int32Array(visited), dist: new Float64Array(dist)};
        }
    };
}

/*******************************************************
 * 
 * MATRIX
 * 
 ******************************************************/

export function wasmMatrixMultiplication(module, A, B, n) {
    const aPointer = module._malloc(n * n * 8);
    const bPointer = module._malloc(n * n * 8);
    const cPointer = module._malloc(n * n * 8);
    module.HEAPF64.set(A, aPointer >> 3);
    module.HEAPF64.set(B, bPointer >> 3);

    return {
        run() {
            module._matrix_multiplication(aPointer, bPointer, cPointer, n);
        },

        result() {
            return new Float64Array(module.HEAPF64.subarray(cPointer >> 3, (cPointer >> 3) + n * n));
        },

        free() {
            module._free(aPointer);
            module._free(bPointer);
            module._free(cPointer);
        }
    };
}

export function jsMatrixMultiplication(A, B, n) {
    const C = new Float64Array(n * n);

    return {
        run() {
            matrix_multiplication(A, B, C, n);
        },

        result() {
            return new Float64Array(C);
        }
    };
}