#!/bin/bash

set -e

MODE=${1:-all} # defualt to all
SIZE=${2:-small} # defualt to small

# validate benchmark dataset size
if [ "$MODE" = "benchmark" ] || [ "$MODE" = "all" ] || [ "$MODE" = "overhead" ]; then
    case "$SIZE" in
        small|medium|large|very_large)
            ;;
        *)
            echo "Invalid dataset size: $SIZE"
            echo "Use: small, medium, large, very_large"
            exit 1
            ;;
    esac
fi

PASS=0
FAIL=0

# tests producing one result
extract_first_result() {
    echo "$1" | grep '^RESULT ' | sed 's/^RESULT //'
}

# tests producing multiple results
extract_all_results() {
    echo "$1" | grep '^RESULT ' | sed 's/^RESULT //' | jq -S -c .
}

results_match() {
    local c_result
    local js_result

    c_result=$(echo "$1" | jq -S -c .)
    js_result=$(echo "$2" | jq -S -c .)

    [ "$c_result" = "$js_result" ]
}

run_test_benchmark() {
    local name=$1
    local c_dir=$2
    local js_dir=$3
    local exec=$4

    echo ""
    echo "$name benchmark ($SIZE): "

    local c_output
    local js_output

    c_output=$(cd "$c_dir" && "$exec" "$SIZE" 2>&1) || true
    js_output=$(cd "$js_dir" && node test_benchmark.mjs "$SIZE" 2>&1) || true

    local c_result
    local js_result
    c_result=$(extract_first_result "$c_output" || true)
    js_result=$(extract_first_result "$js_output" || true)

    # check if no result was produced by C
    if [ -z "$c_result" ]; then
        echo "FAIL (C produced no benchmark RESULT)"
        echo "$c_output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    # check if no result was produced by JS
    if [ -z "$js_result" ]; then
        echo "FAIL (JS produced no benchmark RESULT)"
        echo "$js_output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    # results match?
    if results_match "$c_result" "$js_result"; then
        echo "PASS"
        PASS=$((PASS + 1))
    else
        echo "FAIL (output mismatch)"
        echo "C: $c_result"
        echo "JS: $js_result"
        FAIL=$((FAIL + 1))
    fi
}

run_test_correctness() {
    local name=$1
    local c_dir=$2
    local js_dir=$3
    local exec=$4

    echo ""
    echo "$name correctness:"

    local c_output
    local js_output
    c_output=$(cd "$c_dir" && "$exec" 2>&1) || true
    js_output=$(cd "$js_dir" && node test_correctness.mjs 2>&1) || true

    local c_results
    local js_results
    c_results=$(extract_all_results "$c_output" || true)
    js_results=$(extract_all_results "$js_output" || true)

    if [ -z "$c_results" ]; then
        echo "FAIL (C produced no correctness RESULT)"
        echo "$c_output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    if [ -z "$js_results" ]; then
        echo "FAIL (JS produced no correctness RESULT)"
        echo "$js_output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    if [ "$c_results" != "$js_results" ]; then
        echo "FAIL (C and JavaScript outputs differ)"

        echo "  C results:"
        echo "$c_results"

        echo "  JS results:"
        echo "$js_results"

        FAIL=$((FAIL + 1))
        return
    fi

    if echo "$c_results" | jq -e 'select(.expected_result != true)' >/dev/null ; then
        echo "FAIL (result did not match expected data)"
        echo "$c_results"
        FAIL=$((FAIL + 1))
        return
    fi

    local number_of_cases
    number_of_cases=$(echo "$c_results" | wc -l | tr -d ' ')

    echo "PASS ($number_of_cases cases)"
    PASS=$((PASS + 1))
}

run_test_overhead() {
    compile_overhead_tests

    echo ""
    echo "Overhead test ($SIZE): "

    local output
    output=$(cd "../tests/c/overhead" && /tmp/overhead "$SIZE" 2>&1) || true

    local result
    result=$(extract_first_result "$output" || true)

    if [ -z "$result" ]; then
        echo "FAIL (C produced no overhead RESULT)"
        echo "$output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    local expected_result
    expected_result=$(echo "$result" | jq -r '.expected_result')

    if [ "$expected_result" = "true" ]; then
        echo "PASS"
        PASS=$((PASS + 1))
    else
        echo "FAIL"
        echo "$result"
        FAIL=$((FAIL + 1))
    fi

    echo "--------------------------------"
}

run_test_integration() {

    echo "Integration test"

    local output
    output=$(cd "../tests/integration" && node test_bench_integration.mjs 2>&1) || true

    local result
    result=$(extract_all_results "$output" || true)

    if [ -z "$result" ]; then
        echo "FAIL (Integration test produced no RESULT)"
        echo "$output" | tail -10
        FAIL=$((FAIL + 1))
        return
    fi

    if echo "$result" | jq -e 'select(.expected_result != true)' >/dev/null ; then
        echo "FAIL (integration result did not match expected data)"
        echo "$result"
        FAIL=$((FAIL + 1))
        return
    fi

    echo "PASS"
    PASS=$((PASS + 1))
}

compile_correctness_tests() {
    echo "Compiling correctness tests..."

    gcc -O2 -I../src/c/sorting ../src/c/sorting/mergesort.c ../src/c/utils/utils.c ../tests/c/mergesort/test_correctness.c -o /tmp/mergesort_correctness
    gcc -O2 -I../src/c/sorting ../src/c/sorting/quicksort.c ../src/c/utils/utils.c ../tests/c/quicksort/test_correctness.c -o /tmp/quicksort_correctness
    gcc -O2 -I../src/c/graphs ../src/c/graphs/bfs.c ../src/c/utils/utils.c ../tests/c/bfs/test_correctness.c -o /tmp/bfs_correctness
    gcc -O2 -I../src/c/graphs -I../src/c/utils ../src/c/graphs/dijkstra.c ../src/c/utils/min_heap.c ../src/c/utils/utils.c ../tests/c/dijkstra/test_correctness.c -o /tmp/dijkstra_correctness
    gcc -O2 -I../src/c/numeric ../src/c/numeric/matrix_multiplication.c ../src/c/utils/utils.c ../tests/c/matrix/test_correctness.c -o /tmp/matrix_correctness
}

compile_benchmark_tests() {
    echo "Compiling benchmark tests..."

    gcc -O2 -I../src/c/sorting ../src/c/sorting/mergesort.c ../src/c/utils/utils.c ../tests/c/mergesort/test_benchmark.c -o /tmp/mergesort_benchmark
    gcc -O2 -I../src/c/sorting ../src/c/sorting/quicksort.c ../src/c/utils/utils.c ../tests/c/quicksort/test_benchmark.c -o /tmp/quicksort_benchmark
    gcc -O2 -I../src/c/graphs ../src/c/graphs/bfs.c ../src/c/utils/utils.c ../tests/c/bfs/test_benchmark.c -o /tmp/bfs_benchmark
    gcc -O2 -I../src/c/graphs -I../src/c/utils ../src/c/graphs/dijkstra.c ../src/c/utils/min_heap.c ../src/c/utils/utils.c ../tests/c/dijkstra/test_benchmark.c -o /tmp/dijkstra_benchmark
    gcc -O2 -I../src/c/numeric ../src/c/numeric/matrix_multiplication.c ../src/c/utils/utils.c ../tests/c/matrix/test_benchmark.c -o /tmp/matrix_benchmark
}

compile_overhead_tests() {
    echo "Compiling overhead tests..."

    gcc -O2 -I../src/c/overhead -I../src/c/utils ../src/c/overhead/overhead.c ../src/c/utils/utils.c ../tests/c/overhead/test_overhead.c -o /tmp/overhead
}

run_correctness_tests() {
    compile_correctness_tests

    echo ""
    echo "Running correctness tests..."

    run_test_correctness "Merge Sort" "../tests/c/mergesort" "../tests/js/mergesort" "/tmp/mergesort_correctness"
    run_test_correctness "Quick Sort" "../tests/c/quicksort" "../tests/js/quicksort" "/tmp/quicksort_correctness"
    run_test_correctness "BFS" "../tests/c/bfs" "../tests/js/bfs" "/tmp/bfs_correctness"
    run_test_correctness "Dijkstra" "../tests/c/dijkstra" "../tests/js/dijkstra" "/tmp/dijkstra_correctness"
    run_test_correctness "Matrix Multiplication" "../tests/c/matrix" "../tests/js/matrix" "/tmp/matrix_correctness"

    echo "--------------------------------"
}

run_benchmark_tests() {
    compile_benchmark_tests

    echo ""
    echo "Running benchmark validation with dataset: $SIZE"

    run_test_benchmark "Merge Sort" "../tests/c/mergesort" "../tests/js/mergesort" "/tmp/mergesort_benchmark"
    run_test_benchmark "Quick Sort" "../tests/c/quicksort" "../tests/js/quicksort" "/tmp/quicksort_benchmark"
    run_test_benchmark "BFS" "../tests/c/bfs" "../tests/js/bfs" "/tmp/bfs_benchmark"
    run_test_benchmark "Dijkstra" "../tests/c/dijkstra" "../tests/js/dijkstra" "/tmp/dijkstra_benchmark"
    run_test_benchmark "Matrix Multiplication" "../tests/c/matrix" "../tests/js/matrix" "/tmp/matrix_benchmark"

    echo "--------------------------------"
}

clear() {
    rm -f /tmp/mergesort_correctness /tmp/quicksort_correctness /tmp/bfs_correctness /tmp/dijkstra_correctness /tmp/matrix_correctness \
        /tmp/mergesort_benchmark /tmp/quicksort_benchmark /tmp/bfs_benchmark /tmp/dijkstra_benchmark /tmp/matrix_benchmark /tmp/overhead
}
trap clear EXIT

case "$MODE" in
    correctness)
        run_correctness_tests
        ;;

    benchmark)
        run_benchmark_tests
        ;;

    overhead)
        run_test_overhead
        ;;

    integration)
        run_test_integration
        ;;

    all)
        run_correctness_tests
        run_benchmark_tests
        run_test_overhead
        run_test_integration
        ;;

    *)
        echo "Use: ./run_tests.sh all/integration/correctness/benchmark/overhead size"
        echo ""
        echo "./run_tests.sh"
        echo "./run_tests.sh integration"
        echo "./run_tests.sh correctness"
        echo "./run_tests.sh benchmark medium"
        echo "./run_tests.sh overhead large"
        echo "./run_tests.sh all small/medium/large/very_large"
        exit 1
        ;;
esac

echo "--------------------------------"
echo "$PASS passed, $FAIL failed"
echo "--------------------------------"

if [ "$FAIL" -ne 0 ]; then
    exit 1
fi