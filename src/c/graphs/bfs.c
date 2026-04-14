#include <stdlib.h>
#include <string.h>

typedef struct {
    int *neighbors;
    int *offsets;
    int *counts;
    int num_nodes;
    int num_edges;
} Graph;

Graph *graph_create(int num_nodes) {
    Graph *g = (Graph *)malloc(sizeof(Graph));
    g->offsets = (int *)calloc(num_nodes + 1, sizeof(int));
    g->counts = (int *)calloc(num_nodes, sizeof(int));
    g->neighbors = NULL;
    g->num_nodes = num_nodes;
    g->num_edges = 0;
    return g;
}

void graph_build(Graph *g, int num_edges, int *from, int *to) {
    g->num_edges = num_edges;

    for (int i = 0; i < num_edges; i++)
        g->counts[from[i]]++;

    g->offsets[0] = 0;
    for (int i = 0; i < g->num_nodes; i++)
        g->offsets[i + 1] = g->offsets[i] + g->counts[i];

    g->neighbors = (int *)malloc(num_edges * sizeof(int));

    int *cursor = (int *)calloc(g->num_nodes, sizeof(int));
    for (int i = 0; i < num_edges; i++) {
        int f = from[i];
        g->neighbors[g->offsets[f] + cursor[f]++] = to[i];
    }
    free(cursor);
}

void graph_free(Graph *g) {
    free(g->neighbors);
    free(g->offsets);
    free(g->counts);
    free(g);
}

void bfs(const Graph *g, int source, int *visited, int *dist) {
    int n = g->num_nodes;
    memset(visited, 0, n * sizeof(int));
    for (int i = 0; i < n; i++) dist[i] = -1;

    int *queue = (int *)malloc(n * sizeof(int));
    int head = 0, tail = 0;

    visited[source] = 1;
    dist[source] = 0;
    queue[tail++] = source;

    while (head < tail) {
        int node = queue[head++];
        int start = g->offsets[node];
        int end = g->offsets[node + 1];
        for (int i = start; i < end; i++) {
            int nb = g->neighbors[i];
            if (!visited[nb]) {
                visited[nb] = 1;
                dist[nb] = dist[node] + 1;
                queue[tail++] = nb;
            }
        }
    }
    free(queue);
}
