#!/usr/bin/env bash

set -e
mkdir -p .build

echo "Compiling dataset generators..."
gcc -O2 bench_datagen.c -o ".build/bench_datagen"
gcc -O2 correctness_datagen.c -o ".build/correctness_datagen"

echo
echo "Generating benchmark datasets..."
cd ../datasets

../tools/.build/bench_datagen

echo
echo "Generating correctness datasets..."
../tools/.build/correctness_datagen

echo
echo "All datasets generated successfully."

rm -rf ../tools/.build