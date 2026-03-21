#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    Edge **heads;
    int num_nodes;
    int num_edges;
} Graph;

Graph *graph_create(int num_nodes);
void   graph_add_edge(Graph *g, int from, int to);
void   graph_free(Graph *g);
void   bfs(const Graph *g, int source, int *visited, int *dist);

/* -------------------------
 * Load graph
 * ------------------------- */

static Graph *load_graph(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "Error: could not open %s\n", path);
        exit(1);
    }

    int num_nodes, num_edges;
    fread(&num_nodes, sizeof(int), 1, f);
    fread(&num_edges, sizeof(int), 1, f);

    printf("Loaded graph: %d nodes, %d edges\n", num_nodes, num_edges);

    Graph *g = graph_create(num_nodes);

    for (int i = 0; i < num_edges; i++) {
        int from, to;
        fread(&from, sizeof(int), 1, f);
        fread(&to,   sizeof(int), 1, f);
        graph_add_edge(g, from, to);
    }

    fclose(f);
    return g;
}

/* -------------------------
 * Main
 * ------------------------- */

int main(int argc, char *argv[]) {
    const char *path = "datasets/graphs/small.bin"; /* default */

    if (argc >= 2) {
        path = argv[1];
    }

    Graph *g = load_graph(path);

    int *visited = (int *)malloc(g->num_nodes * sizeof(int));
    int *dist    = (int *)malloc(g->num_nodes * sizeof(int));
    if (visited == NULL || dist == NULL) {
        fprintf(stderr, "malloc failed\n");
        return 1;
    }

    bfs(g, 0, visited, dist);

    /* reachable nodes */
    int reachable = 0;
    int max_dist  = 0;
    for (int i = 0; i < g->num_nodes; i++) {
        if (visited[i]) {
            reachable++;
            if (dist[i] > max_dist) max_dist = dist[i];
        }
    }

    printf("BFS from first node:\n");
    printf("  Reachable nodes : %d / %d\n", reachable, g->num_nodes);
    printf("  Max distance    : %d\n", max_dist);
    printf("  Node 0 dist     : %d\n", dist[0]);

    int checks[] = {1, 2, 3};
    for (int i = 0; i < 3; i++) {
        int node = checks[i];
        if (node < g->num_nodes) {
            printf("  dist[%d]         : %d\n", node, dist[node]);
        }
    }

    free(visited);
    free(dist);
    graph_free(g);
    return 0;
}
