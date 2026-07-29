#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/graphs/bfs.h"
#include "../../../src/c/utils/utils.h"

typedef struct {
    int n;
    int reachable;
    int max_dist;
    int *dist;
} ExpectedBFS;

static Graph *build_graph(const GraphData *gd) {
    Graph *g = graph_create(gd->num_nodes);
    graph_build(g, gd->num_edges, gd->from, gd->to);
    return g;
}

static ExpectedBFS *load_expected(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        return NULL;
    }

    ExpectedBFS *expected = (ExpectedBFS *)malloc(sizeof(ExpectedBFS));
    fread(&expected->n, sizeof(int), 1, f);
    fread(&expected->reachable, sizeof(int), 1, f);
    fread(&expected->max_dist, sizeof(int), 1, f);
    
    expected->dist = (int *)malloc(expected->n * sizeof(int));
    fread(expected->dist, sizeof(int), expected->n, f);

    fclose(f);
    return expected;
}

int main() {

    char input_path[256];
    snprintf(input_path, sizeof(input_path), "../../../datasets/correctness/graphs/basic_input.bin");
    GraphData *gd = load_graph_data(input_path);
    printf("BFS\n");
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

    char expected_path[256];
    snprintf(expected_path, sizeof(expected_path), "../../../datasets/correctness/graphs/basic_expected.bin");
    ExpectedBFS *expected = load_expected(expected_path);

    if (expected == NULL) {
        fprintf(stderr, "Failed to load expected results\n");
        free_graph(gd);
        return 1;
    }

    Graph *g = build_graph(gd);

    int *visited = (int *)malloc(g->num_nodes * sizeof(int));
    int *dist = (int *)malloc(g->num_nodes * sizeof(int));

    bfs(g, 0, visited, dist);

    int reachable = 0, max_dist = 0;
    for (int i = 0; i < g->num_nodes; i++) {
        if (visited[i]) {
            reachable++;
            if (dist[i] > max_dist) max_dist = dist[i];
        }
    }

    int expected_result = (g->num_nodes == expected->n) && (reachable == expected->reachable) && (max_dist == expected->max_dist);

    if (expected_result) {
        for (int i = 0; i < expected->n; i++) {
            if (dist[i] != expected->dist[i]) {
                printf("mismatch at node %d: got %d, expected %d\n", i, dist[i], expected->dist[i]);
                expected_result = 0;
                break;
            }
        }
    } else {
        printf("mismatch: nodes %d/%d, reachable %d/%d, max_dist %d/%d\n", g->num_nodes, expected->n, reachable, expected->reachable, max_dist, expected->max_dist);
    }

    printf("RESULT {\"nodes\":%d,\"reachable\":%d,\"max_dist\":%d,\"dist\":", g->num_nodes, reachable, max_dist);
    printf("[");
    for (int i = 0; i < g->num_nodes; i++) {
        printf("%d", dist[i]);
        if (i < g->num_nodes - 1) {
            printf(",");
        }
    }
    printf("]");
    printf(",\"expected_result\":%s}\n", expected_result ? "true" : "false");

    free(visited);
    free(dist);
    graph_free(g);
    free_graph(gd);
    free(expected->dist);
    free(expected);
    return 0;
}
