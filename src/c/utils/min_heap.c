#include "min_heap.h"

MinHeap *heap_create(int capacity) {
    MinHeap *heap = (MinHeap *)malloc(sizeof(MinHeap));
    heap->data = (HeapNode *)malloc(capacity * sizeof(HeapNode));
    heap->size = 0;
    heap->capacity = capacity;
    return heap;
}

void heap_free(MinHeap *heap) {
    free(heap->data);
    free(heap);
}

void heap_swap(MinHeap *heap, int i, int j) {
    HeapNode tmp = heap->data[i];
    heap->data[i] = heap->data[j];
    heap->data[j] = tmp;
}

void heap_push(MinHeap *heap, int node, double dist) {
    int i = heap->size++;
    heap->data[i].node = node;
    heap->data[i].dist = dist;

    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap->data[parent].dist <= heap->data[i].dist) break;
        heap_swap(heap, parent, i);
        i = parent;
    }
}

HeapNode heap_pop(MinHeap *heap) {
    HeapNode min = heap->data[0];
    heap->data[0] = heap->data[--heap->size];

    int i = 0;
    while (1) {
        int left  = 2 * i + 1;
        int right = 2 * i + 2;
        int smallest = i;

        if (left < heap->size && heap->data[left].dist < heap->data[smallest].dist) { smallest = left; }
        if (right < heap->size && heap->data[right].dist < heap->data[smallest].dist) { smallest = right; }
        if (smallest == i) break;

        heap_swap(heap, i, smallest);
        i = smallest;
    }

    return min;
}