#include <stdlib.h>
#include "dijkstra.h"
#include "../utils/min_heap.h"

/*
 * Creates an empty weighted graph with the given number of nodes.
 * The graph is represented in a compressed sparse row (CSR) format
 */
WeightedGraph *weighted_graph_create(int num_nodes) {
    WeightedGraph *graph = (WeightedGraph *)malloc(sizeof(WeightedGraph));
    graph->counts = (int *)calloc(num_nodes, sizeof(int));
    graph->offsets = (int *)calloc(num_nodes + 1, sizeof(int));
    graph->neighbors = NULL;
    graph->weights = NULL;
    graph->num_nodes = num_nodes;
    graph->num_edges = 0;
    return graph;
}

/**
 * Builds the weighted graph from edge lists "from", "to" and "weight"
 */
void weighted_graph_build(WeightedGraph *graph, int num_edges, int *from, int *to, double *weight) {
    graph->num_edges = num_edges;

    // Count edges for each node
    for (int i = 0; i < num_edges; i++) {
        graph->counts[from[i]]++;
    }

    // Prefix sum to get offsets
    graph->offsets[0] = 0;
    for (int i = 0; i < graph->num_nodes; i++) {
        graph->offsets[i + 1] = graph->offsets[i] + graph->counts[i];
    }

    graph->neighbors = (int *)malloc(num_edges * sizeof(int));
    graph->weights = (double *)malloc(num_edges * sizeof(double));

    // Fill neighbors and weights using offsets and counts
    int *cursor = (int *)calloc(graph->num_nodes, sizeof(int));
    for (int i = 0; i < num_edges; i++) {
        int f = from[i];
        int pos = graph->offsets[f] + cursor[f]++;
        graph->neighbors[pos] = to[i];
        graph->weights[pos] = weight[i];
    }
    free(cursor);
}

/**
 * Frees the memory allocated for the weighted graph.
 */
void weighted_graph_free(WeightedGraph *graph) {
    free(graph->neighbors);
    free(graph->weights);
    free(graph->offsets);
    free(graph->counts);
    free(graph);
}

/*
 * Computes shortest paths from source to all nodes.
 *   dist[x] = shortest distance from source to node x
 *   visited[x] = 1 if node x is finalized
 */
void dijkstra(const WeightedGraph *graph, int source, double *dist, int *visited) {
    int n = graph->num_nodes;
    for (int i = 0; i < n; i++) {
        dist[i] = INFINITY;
        visited[i] = 0;
    }
    dist[source] = 0.0;

    MinHeap *heap = heap_create(graph->num_edges + 1);
    heap_push(heap, source, 0.0);

    // Dijkstra main loop
    while (heap->size > 0) {
        HeapNode cur = heap_pop(heap);
        int u = cur.node;
        if (visited[u]) continue;
        visited[u] = 1;

        int start = graph->offsets[u];
        int end = graph->offsets[u + 1];
        for (int i = start; i < end; i++) {
            int v = graph->neighbors[i];
            double new_dist = dist[u] + graph->weights[i];
            if (new_dist < dist[v]) {
                dist[v] = new_dist;
                heap_push(heap, v, new_dist);
            }
        }
    }
    heap_free(heap);
}