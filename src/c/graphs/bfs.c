#include <stdlib.h>
#include <string.h>
#include "bfs.h"

/* 
 * Creates an empty graph with the given number of nodes.
 * The graph is represented in a compressed sparse row (CSR) format
 */
Graph *graph_create(int num_nodes) {
    Graph *g = (Graph *)malloc(sizeof(Graph));
    g->offsets = (int *)calloc(num_nodes + 1, sizeof(int));
    g->counts = (int *)calloc(num_nodes, sizeof(int));
    g->neighbors = NULL;
    g->num_nodes = num_nodes;
    g->num_edges = 0;
    return g;
}

/**
 * Builds the graph from edge lists "from" and "to"
 */
void graph_build(Graph *g, int num_edges, int *from, int *to) {
    g->num_edges = num_edges;

    // Count edges for each node
    for (int i = 0; i < num_edges; i++) {
        g->counts[from[i]]++;
    }

    // Prefix sum to get offsets
    g->offsets[0] = 0;
    for (int i = 0; i < g->num_nodes; i++) {
        g->offsets[i + 1] = g->offsets[i] + g->counts[i];
    }

    g->neighbors = (int *)malloc(num_edges * sizeof(int));

    // Fill neighbors using offsets and counts
    int *cursor = (int *)calloc(g->num_nodes, sizeof(int));
    for (int i = 0; i < num_edges; i++) {
        int f = from[i];
        g->neighbors[g->offsets[f] + cursor[f]++] = to[i];
    }
    free(cursor);
}

/**
 * Frees the memory allocated for the graph
 */
void graph_free(Graph *g) {
    free(g->neighbors);
    free(g->offsets);
    free(g->counts);
    free(g);
}

/**
 * Performs breadth-first search (BFS) on the graph starting from the source node
 */
void bfs(const Graph *g, int source, int *visited, int *dist) {

    // init visited and dist arrays to default values
    int n = g->num_nodes;
    memset(visited, 0, n * sizeof(int));
    for (int i = 0; i < n; i++) dist[i] = -1;

    // queue for BFS
    int *queue = (int *)malloc(n * sizeof(int));
    int head = 0, tail = 0;

    visited[source] = 1;
    dist[source] = 0;
    queue[tail++] = source;

    // BFS loop
    while (head < tail) {
        int node = queue[head++];
        int start = g->offsets[node];
        int end = g->offsets[node + 1];
        for (int i = start; i < end; i++) {
            int neighbor = g->neighbors[i];
            if (!visited[neighbor]) {
                visited[neighbor] = 1;
                dist[neighbor] = dist[node] + 1;
                queue[tail++] = neighbor;
            }
        }
    }
    free(queue);
}
