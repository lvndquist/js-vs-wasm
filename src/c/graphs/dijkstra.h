#define INFINITY 1e18

typedef struct {
    int *neighbors;
    double *weights;
    int *offsets;
    int *counts;
    int num_nodes;
    int num_edges;
} WeightedGraph;

WeightedGraph *weighted_graph_create(int num_nodes);
void weighted_graph_build(WeightedGraph *g, int num_edges, int *from, int *to, double *weight);
void weighted_graph_free(WeightedGraph *g);
void dijkstra(const WeightedGraph *g, int source, double *dist, int *visited);