#include <stdio.h>
#include <stdlib.h>
#include "../../../src/c/graphs/bfs.h"
#include "../../../src/c/utils/utils.h"

static Graph *build_graph(const GraphData *gd) {
    Graph *g = graph_create(gd->num_nodes);
    graph_build(g, gd->num_edges, gd->from, gd->to);
    return g;
}

int main(int argc, char *argv[]) {
    const char *pathType = "small";
    if (argc >= 2) pathType = argv[1];

    char path[256];
    snprintf(path, sizeof(path), "../../../datasets/benchmark/graphs/%s.bin", pathType);

    GraphData *gd = load_graph_data(path);
    printf("BFS\n");
    printf("Dataset: %s\n", path);
    printf("Loaded: %d nodes, %d edges\n", gd->num_nodes, gd->num_edges);

    // printf("from[0..4]: %d %d %d %d %d\n", gd->from[0], gd->from[1], gd->from[2], gd->from[3], gd->from[4]);
    // printf("to[0..4]: %d %d %d %d %d\n", gd->to[0], gd->to[1], gd->to[2], gd->to[3], gd->to[4]);

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

    // printf("BFS from node 0:\n");
    // printf("Reachable nodes : %d / %d\n", reachable, g->num_nodes);
    // printf("Max distance    : %d\n", max_dist);
    // printf("dist[0]         : %d\n", dist[0]);
    // printf("dist[1]         : %d\n", dist[1]);
    // printf("dist[2]         : %d\n", dist[2]);
    // printf("dist[3]         : %d\n", dist[3]);

    printf("RESULT {\"nodes\":%d,\"reachable\":%d,\"max_dist\":%d,\"dist0\":%d,\"dist1\":%d,\"dist2\":%d,\"dist3\":%d}\n",
    g->num_nodes, reachable, max_dist, dist[0], dist[1], dist[2], dist[3]);

    free(visited);
    free(dist);
    graph_free(g);
    free_graph(gd);
    return 0;
}
