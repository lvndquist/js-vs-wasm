#include <stdlib.h>
#include <string.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    Edge **heads;
    int num_nodes;
    int num_edges;
} Graph;

Graph *graph_create(int num_nodes) {
    Graph *g = (Graph *)malloc(sizeof(Graph));
    g->heads = (Edge **)calloc(num_nodes, sizeof(Edge *));
    g->num_nodes = num_nodes;
    g->num_edges = 0;
    return g;
}

void add_edge(Graph *g, int from, int to) {
    Edge *e = (Edge *)malloc(sizeof(Edge));
    e->to = to;
    e->next = g->heads[from];
    g->heads[from] = e;
    g->num_edges++;
}

void graph_free(Graph *g) {
    for (int i = 0; i < g->num_nodes; i++) {
        Edge *e = g->heads[i];
        while (e != NULL) {
            Edge *tmp = e->next;
            free(e);
            e = tmp;
        }
    }
    free(g->heads);
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

        for (Edge *e = g->heads[node]; e != NULL; e = e->next) {
            if (!visited[e->to]) {
                visited[e->to] = 1;
                dist[e->to] = dist[node] + 1;
                queue[tail++] = e->to;
            }
        }
    }

    free(queue);
}
