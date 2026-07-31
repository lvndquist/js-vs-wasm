#!/usr/bin/env bash

set -e
mkdir -p .build

echo "Compiling dataset generators..."
gcc -O2 datagen/benchmark_datagen.c -o ".build/benchmark_datagen"
gcc -O2 datagen/correctness_datagen.c -o ".build/correctness_datagen"

echo ""
echo "Generating benchmark datasets..."
cd ../datasets

../tools/.build/benchmark_datagen

echo ""
echo "Generating correctness datasets..."
echo ""
../tools/.build/correctness_datagen

echo ""
echo "All datasets generated successfully."

rm -rf ../tools/.build