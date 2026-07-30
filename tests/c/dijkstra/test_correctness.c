#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/graphs/dijkstra.h"
#include "../../../src/c/utils/utils.h"

typedef struct {
    int n;
    int num_edges;
    int reachable;
    double max_dist;
    double *dist;
} ExpectedDijkstra;

WeightedGraph *build_graph(const WeightedGraphData *gd) {
    WeightedGraph *g = weighted_graph_create(gd->num_nodes);
    weighted_graph_build(g, gd->num_edges, gd->from, gd->to, gd->weight);
    return g;
}

static int dist_equal(double a, double b) {
    if ((a >= INFINITY) && (b >= INFINITY)) {
        return 1;
    }

    if ((a >= INFINITY) || (b >= INFINITY)) {
        return 0;
    }

    return a == b;
}

static ExpectedDijkstra *load_expected(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        return NULL;
    }

    ExpectedDijkstra *expected = (ExpectedDijkstra *)malloc(sizeof(ExpectedDijkstra));
    fread(&expected->n, sizeof(int), 1, f);
    fread(&expected->num_edges, sizeof(int), 1, f);
    fread(&expected->reachable, sizeof(int), 1, f);
    fread(&expected->max_dist, sizeof(double), 1, f);
    expected->dist = (double *)malloc(expected->n * sizeof(double));
    fread(expected->dist, sizeof(double), expected->n, f);

    fclose(f);
    return expected;
}

static void run_case(const char *label, const char *input_path, const char *expected_path) {
    WeightedGraphData *gd = load_weighted_graph_data(input_path);
    printf("Dijkstra (%s)\n", label);
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

    ExpectedDijkstra *expected = load_expected(expected_path);

    if (expected == NULL) {
        fprintf(stderr, "Failed to load expected results\n");
        free_weighted_graph(gd);
        return;
    }

    WeightedGraph *g = build_graph(gd);

    double *dist = (double *)malloc(g->num_nodes * sizeof(double));
    int *visited = (int *)malloc(g->num_nodes * sizeof(int));
    dijkstra(g, 0, dist, visited);

    int reachable = 0;
    double max_dist = 0.0;
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
            if (!dist_equal(dist[i], expected->dist[i])) {
                printf("mismatch (%s) at node %d: got %f, expected %f\n", label, i, dist[i], expected->dist[i]);
                expected_result = 0;
                break;
            }
        }
    } else {
        printf("mismatch (%s): nodes %d/%d, num_edges %d/%d, reachable %d/%d, max_dist %f/%f\n", label, g->num_nodes, expected->n, gd->num_edges, expected->num_edges, reachable, expected->reachable, max_dist, expected->max_dist);
    }

    printf("RESULT {\"nodes\":%d,\"num_edges\":%d,\"reachable\":%d,\"max_dist\":%.4f,\"dist\":",g->num_nodes, gd->num_edges, reachable, max_dist);
    printf("[");
    for (int i = 0; i < g->num_nodes; i++) {
        if (dist[i] >= INFINITY) {
            printf("%.1f", -1.0);
        } else {
            printf("%.4f", dist[i]);
        }
        if (i < g->num_nodes - 1) {
            printf(",");
        }
    }
    printf("]");
    printf(",\"expected_result\":%s}\n", expected_result ? "true" : "false");

    free(dist);
    free(visited);
    weighted_graph_free(g);
    free_weighted_graph(gd);
    free(expected->dist);
    free(expected);
}

int main() {

    char connected_input_path[256];
    char connected_expected_path[256];
    char disconnected_input_path[256];
    char disconnected_expected_path[256];
    snprintf(connected_input_path, sizeof(connected_input_path), "../../../datasets/correctness/graphs_weighted/connected_input.bin");
    snprintf(connected_expected_path, sizeof(connected_expected_path), "../../../datasets/correctness/graphs_weighted/connected_expected.bin");
    snprintf(disconnected_input_path, sizeof(disconnected_input_path), "../../../datasets/correctness/graphs_weighted/disconnected_input.bin");
    snprintf(disconnected_expected_path, sizeof(disconnected_expected_path), "../../../datasets/correctness/graphs_weighted/disconnected_expected.bin");
    
    run_case("connected", connected_input_path, connected_expected_path);
    run_case("disconnected", disconnected_input_path, disconnected_expected_path);
    
    return 0;
}
