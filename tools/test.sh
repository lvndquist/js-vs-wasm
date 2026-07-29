#!/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIZE=${1:-small}

INCLUDES="-I$ROOT/src/c/sorting -I$ROOT/src/c/graphs -I$ROOT/src/c/numeric -I$ROOT/src/c/utils"

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

run_with_bench_data() {
    local name=$1
    local tdir=$2
    shift 2

    local srcs=()
    for s in "$@"; do srcs+=("$ROOT/$s"); done
    srcs+=("$ROOT/src/c/utils/utils.c" "$ROOT/tests/c/$tdir/test_correctness.c")

    local c_dir="$ROOT/tests/c/$tdir"
    local js_dir="$ROOT/tests/js/$tdir"
    local bin="/tmp/test_$name"

    echo -n "$name: "

    if ! gcc -O2 $INCLUDES -o "$bin" "${srcs[@]}" -lm 2>/tmp/${name}_build_err; then
        echo "BUILD FAIL"
        cat "/tmp/${name}_build_err"
        FAIL=$((FAIL + 1))
        return
    fi

    local c_out js_out
    c_out=$(cd "$c_dir" && "$bin" "$SIZE" 2>&1) || true
    js_out=$(cd "$js_dir" && node test_correctness.mjs "$SIZE" 2>&1) || true

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

echo "Running all tests with dataset: $SIZE"
run_with_bench_data mergesort mergesort src/c/sorting/mergesort.c
run_with_bench_data quicksort quicksort src/c/sorting/quicksort.c
run_with_bench_data bfs bfs src/c/graphs/bfs.c
run_with_bench_data dijkstra dijkstra src/c/graphs/dijkstra.c src/c/utils/min_heap.c
run_with_bench_data matrix_multiplication matrix src/c/numeric/matrix_multiplication.c

echo ""
echo "$PASS passed, $FAIL failed"

if [ $FAIL -ne 0 ]; then
    exit 1
fi