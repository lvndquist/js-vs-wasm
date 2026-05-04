#include <stdlib.h>

typedef struct {
    int node;
    double dist;
} HeapNode;

typedef struct {
    HeapNode *data;
    int size;
    int capacity;
} MinHeap;

MinHeap *heap_create(int capacity);
void heap_free(MinHeap *heap);
void heap_swap(MinHeap *heap, int i, int j);
void heap_push(MinHeap *heap, int node, double dist);
HeapNode heap_pop(MinHeap *heap);