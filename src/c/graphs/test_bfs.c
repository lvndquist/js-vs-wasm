#include <stdio.h>
#include <stdlib.h>
#include "bfs.h"
#include "../utils/utils.h"

static Graph *build_graph(const GraphData *gd) {
    Graph *g = graph_create(gd->num_nodes);
    graph_build(g, gd->num_edges, gd->from, gd->to);
    return g;
}

int main(int argc, char *argv[]) {
    const char *pathType = "small";
    if (argc >= 2) pathType = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/graphs/%s.bin", pathType);

    GraphData *gd = load_graph_data(path);
    printf("Dataset: %s\n", path);
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

    Graph *g = build_graph(gd);

    int *visited = (int *)malloc(g->num_nodes * sizeof(int));
    int *dist    = (int *)malloc(g->num_nodes * sizeof(int));

    bfs(g, 0, visited, dist);

    int reachable = 0, max_dist = 0;
    for (int i = 0; i < g->num_nodes; i++) {
        if (visited[i]) {
            reachable++;
            if (dist[i] > max_dist) max_dist = dist[i];
        }
    }

    printf("BFS from node 0:\n");
    printf("  Reachable nodes : %d / %d\n", reachable, g->num_nodes);
    printf("  Max distance    : %d\n", max_dist);
    printf("  dist[0]         : %d\n", dist[0]);
    printf("  dist[1]         : %d\n", dist[1]);
    printf("  dist[2]         : %d\n", dist[2]);
    printf("  dist[3]         : %d\n", dist[3]);

    free(visited);
    free(dist);
    graph_free(g);
    free_graph(gd);
    return 0;
}
