typedef struct {
    int *neighbors;
    int *offsets;
    int *counts;
    int num_nodes;
    int num_edges;
} Graph;

Graph *graph_create(int num_nodes);
void graph_build(Graph *g, int num_edges, int *from, int *to);
void graph_free(Graph *g);
void bfs(const Graph *g, int source, int *visited, int *dist);