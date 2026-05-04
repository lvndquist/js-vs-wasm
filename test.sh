#!/bin/bash
set -e
FAIL=0
PASS=0
SIZE=${1:-small}

echo "Running all tests with dataset: $SIZE"

run_c_test() {
    local name=$1
    local dir=$2
    local sources=$3

    echo -n "Running $name in C: "
    cd "$dir"
    if gcc -O2 -o "test_$name" $sources ../utils/utils.c 2>/dev/null && ./"test_$name" "$SIZE" > /dev/null 2>&1; then
        echo "PASS"
        PASS=$((PASS + 1))
    else
        echo "FAIL"
        FAIL=$((FAIL + 1))
    fi
    cd - > /dev/null
}

run_js_test() {
    local name=$1
    local dir=$2
    local file=$3

    echo -n "Running $name in JS: "
    cd "$dir"
    if node "$file" "$SIZE" > /dev/null 2>&1; then
        echo "PASS"
        PASS=$((PASS + 1))
    else
        echo "FAIL"
        FAIL=$((FAIL + 1))
    fi
    cd - > /dev/null
}

# Sort
run_c_test  "mergesort" "src/c/sorting" "mergesort.c test_mergesort.c"
run_js_test "mergesort" "src/js/sorting" "test_mergesort.mjs"
run_c_test  "quicksort" "src/c/sorting" "quicksort.c test_quicksort.c"
run_js_test "quicksort" "src/js/sorting" "test_quicksort.mjs"

# Graph
run_c_test  "bfs" "src/c/graphs" "bfs.c test_bfs.c"
run_js_test "bfs" "src/js/graphs" "test_bfs.mjs"
run_c_test  "dijkstra" "src/c/graphs" "dijkstra.c ../utils/min_heap.c test_dijkstra.c"
run_js_test "dijkstra" "src/js/graphs" "test_dijkstra.mjs"

# Numeric
run_c_test "matrix_multiplication" "src/c/numeric" "matrix_multiplication.c test_matrix_multiplication.c"
run_js_test "matrix_multiplication" "src/js/numeric" "test_matrix_multiplication.mjs"

echo "$PASS passed, $FAIL failed"

if [ $FAIL -ne 0 ]; then
    exit 1
fi