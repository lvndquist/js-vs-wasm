#include <stdio.h>
#include <stdlib.h>
#include "../utils/utils.h"

typedef struct WeightedEdge {
    int to;
    double weight;
    struct WEdge *next;
} WeightedEdge;

typedef struct {
    WeightedEdge **heads;
    int num_nodes;
    int num_edges;
} WeightedGraph;

WeightedGraph *weighted_graph_create(int num_nodes);
void    weighted_graph_add_edge(WeightedGraph *g, int from, int to, double weight);
void    weighted_graph_free(WeightedGraph *g);
void    dijkstra(const WeightedGraph *g, int source, double *dist, int *visited);

static WeightedGraph *build_graph(const WeightedGraphData *gd) {
    WeightedGraph *g = weighted_graph_create(gd->num_nodes);
    for (int i = 0; i < gd->num_edges; i++) {
        weighted_graph_add_edge(g, gd->from[i], gd->to[i], gd->weight[i]);
    }
    return g;
}

int main(int argc, char *argv[]) {
    const char *size = "small";
    if (argc >= 2) size = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/graphs_weighted/%s.bin", size);

    WeightedGraphData *gd = load_weighted_graph_data(path);
    printf("Dataset: %s\n", path);
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

    WeightedGraph *g = build_graph(gd);

    double *dist    = (double *)malloc(g->num_nodes * sizeof(double));
    int    *visited = (int *)malloc(g->num_nodes * sizeof(int));

    dijkstra(g, 0, dist, visited);

    /* Count reachable nodes and find max distance */
    int reachable = 0;
    double max_dist = 0.0;
    for (int i = 0; i < g->num_nodes; i++) {
        if (dist[i] < 1e18) {
            reachable++;
            if (dist[i] > max_dist) max_dist = dist[i];
        }
    }

    printf("Dijkstra from node 0:\n");
    printf("  Reachable nodes : %d / %d\n", reachable, g->num_nodes);
    printf("  Max distance    : %.2f\n", max_dist);
    printf("  dist[0]         : %.2f\n", dist[0]);
    printf("  dist[1]         : %.2f\n", dist[1]);
    printf("  dist[2]         : %.2f\n", dist[2]);
    printf("  dist[3]         : %.2f\n", dist[3]);

    free(dist);
    free(visited);
    weighted_graph_free(g);
    free_weighted_graph(gd);
    return 0;
}
