#!/bin/bash

set -e

echo "Compiling C to WASM..."

echo "Compiling mergesort..."
emcc "src/c/sorting/mergesort.c" -O2 -o "src/wasm/sorting/mergesort.mjs" \
  -s EXPORTED_FUNCTIONS='["_merge_sort","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAP32"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createMergeSortModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Compiling quicksort..."
emcc "src/c/sorting/quicksort.c" -O2 -o "src/wasm/sorting/quicksort.mjs" \
  -s EXPORTED_FUNCTIONS='["_quick_sort","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAP32"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createQuickSortModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Compiling bfs..."
emcc "src/c/graphs/bfs.c" -O2 -o "src/wasm/graphs/bfs.mjs" \
  -s EXPORTED_FUNCTIONS='["_bfs","_graph_create","_graph_build","_graph_free","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAP32"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createBFSModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Compiling dijkstra..."
emcc "src/c/graphs/dijkstra.c" "src/c/utils/min_heap.c" -O2 -o "src/wasm/graphs/dijkstra.mjs" \
  -s EXPORTED_FUNCTIONS='["_dijkstra","_weighted_graph_create","_weighted_graph_build","_weighted_graph_free","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAP32","HEAPF64"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createDijkstraModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Compiling matrix multiplication..."
emcc "src/c/numeric/matrix_multiplication.c" -O2 -o "src/wasm/numeric/matrix_multiplication.mjs" \
  -s EXPORTED_FUNCTIONS='["_matrix_multiplication","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAPF64"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createMatrixModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Compiling overhead..."
emcc "src/c/overhead/overhead.c" -O2 -o "src/wasm/overhead/overhead.mjs" \
  -s EXPORTED_FUNCTIONS='["_noop","_matrix_multiplication_full","_matrix_multiplication_row","_matrix_multiplication_cell","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAPF64"]' \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME='createOverheadModule' \
  -s ALLOW_MEMORY_GROWTH=1

echo "Done."