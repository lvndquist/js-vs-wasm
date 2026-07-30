#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/graphs/bfs.h"
#include "../../../src/c/utils/utils.h"

typedef struct {
    int n;
    int num_edges;
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
    fread(&expected->num_edges, sizeof(int), 1, f);
    fread(&expected->reachable, sizeof(int), 1, f);
    fread(&expected->max_dist, sizeof(int), 1, f);
    
    expected->dist = (int *)malloc(expected->n * sizeof(int));
    fread(expected->dist, sizeof(int), expected->n, f);

    fclose(f);
    return expected;
}

static void run_case(const char *label, const char *input_path, const char *expected_path) {
    GraphData *gd = load_graph_data(input_path);
    printf("BFS\n");
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

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

    int reachable = 0;
    int max_dist = 0;
    for (int i = 0; i < g->num_nodes; i++) {
        if (visited[i]) {
            reachable++;
            if (dist[i] > max_dist) {
                max_dist = dist[i];
            }
        }
    }

    int expected_result = (g->num_nodes == expected->n) && (gd->num_edges == expected->num_edges) && (reachable == expected->reachable) && (max_dist == expected->max_dist);

    if (expected_result) {
        for (int i = 0; i < expected->n; i++) {
            if (dist[i] != expected->dist[i]) {
                printf("mismatch at node %d: got %d, expected %d\n", i, dist[i], expected->dist[i]);
                expected_result = 0;
                break;
            }
        }
    } else {
        printf("mismatch: nodes %d/%d, num_edges %d/%d, reachable %d/%d, max_dist %d/%d\n", g->num_nodes, expected->n, gd->num_edges, expected->num_edges, reachable, expected->reachable, max_dist, expected->max_dist);
    }

    printf("RESULT {\"nodes\":%d,\"num_edges\":%d,\"reachable\":%d,\"max_dist\":%d,\"dist\":", g->num_nodes, gd->num_edges, reachable, max_dist);
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

int main() {

    char connected_input_path[256];
    char connected_expected_path[256];
    char disconnected_input_path[256];
    char disconnected_expected_path[256];
    snprintf(connected_input_path, sizeof(connected_input_path), "../../../datasets/correctness/graphs/connected_input.bin");
    snprintf(connected_expected_path, sizeof(connected_expected_path), "../../../datasets/correctness/graphs/connected_expected.bin");
    snprintf(disconnected_input_path, sizeof(disconnected_input_path), "../../../datasets/correctness/graphs/disconnected_input.bin");
    snprintf(disconnected_expected_path, sizeof(disconnected_expected_path), "../../../datasets/correctness/graphs/disconnected_expected.bin");
    
    run_case("connected", connected_input_path, connected_expected_path);
    run_case("disconnected", disconnected_input_path, disconnected_expected_path);
    
    return 0;
}