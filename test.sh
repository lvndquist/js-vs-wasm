#!/bin/bash
set -e
SIZE=${1:-small}

echo "Running all tests with dataset: $SIZE"

PASS=0
FAIL=0

extract_result() {
    echo "$1" | grep '^RESULT ' | head -n 1 | sed 's/^RESULT //'
}

results_match() {
    local a b
    a=$(echo "$1" | jq -S -c .)
    b=$(echo "$2" | jq -S -c .)
    [ "$a" == "$b" ]
}

run() {
    local name=$1
    local c_dir=$2
    local c_sources=$3
    local js_dir=$4
    local js_file=$5

    echo -n "$name: "

    if ! (cd "$c_dir" && gcc -O2 -o "test_$name" $c_sources ../utils/utils.c 2>/tmp/${name}_build_err); then
        echo "BUILD FAIL"
        cat "/tmp/${name}_build_err"
        FAIL=$((FAIL + 1))
        return
    fi

    local c_out js_out
    c_out=$(cd "$c_dir" && ./"test_$name" "$SIZE" 2>&1) || true
    js_out=$(cd "$js_dir" && node "$js_file" "$SIZE" 2>&1) || true

    local c_result js_result
    c_result=$(extract_result "$c_out")
    js_result=$(extract_result "$js_out")

    if [ -z "$c_result" ]; then
        echo "FAIL (no RESULT from C)"
        echo "$c_out" | tail -5
        FAIL=$((FAIL + 1))
        return
    fi

    if [ -z "$js_result" ]; then
        echo "FAIL (no RESULT from JS)"
        echo "$js_out" | tail -5
        FAIL=$((FAIL + 1))
        return
    fi

    if results_match "$c_result" "$js_result"; then
        echo "PASS ($c_result)"
        PASS=$((PASS + 1))
    else
        echo "FAIL (output mismatch)"
        echo "  C:  $c_result"
        echo "  JS: $js_result"
        FAIL=$((FAIL + 1))
    fi
}

run "mergesort" "src/c/sorting" "mergesort.c test_mergesort.c" "src/js/sorting" "test_mergesort.mjs"
run "quicksort" "src/c/sorting" "quicksort.c test_quicksort.c" "src/js/sorting" "test_quicksort.mjs"
run "bfs" "src/c/graphs" "bfs.c test_bfs.c" "src/js/graphs" "test_bfs.mjs"
run "dijkstra" "src/c/graphs" "dijkstra.c ../utils/min_heap.c test_dijkstra.c" "src/js/graphs" "test_dijkstra.mjs"
run "matrix_multiplication" "src/c/numeric" "matrix_multiplication.c test_matrix_multiplication.c" "src/js/numeric" "test_matrix_multiplication.mjs"

echo ""
echo "$PASS passed, $FAIL failed"

if [ $FAIL -ne 0 ]; then
    exit 1
fi