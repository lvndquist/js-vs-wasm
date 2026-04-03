#include <stdlib.h>

#define INFINITY 1e18

typedef struct WeightedEdge {
    int to;
    double weight;
    struct WeightedEdge *next;
} WeightedEdge;

typedef struct {
    WeightedEdge **heads;
    int num_nodes;
    int num_edges;
} WeightedGraph;

WeightedGraph *weighted_graph_create(int num_nodes) {
    WeightedGraph *g = (WeightedGraph *)malloc(sizeof(WeightedGraph));
    g->heads = (WeightedEdge **)calloc(num_nodes, sizeof(WeightedEdge *));
    g->num_nodes = num_nodes;
    g->num_edges = 0;
    return g;
}

void weighted_graph_add_edge(WeightedGraph *g, int from, int to, double weight) {
    WeightedEdge *e = (WeightedEdge *)malloc(sizeof(WeightedEdge));
    e->to     = to;
    e->weight = weight;
    e->next   = g->heads[from];
    g->heads[from] = e;
    g->num_edges++;
}

void weighted_graph_free(WeightedGraph *g) {
    for (int i = 0; i < g->num_nodes; i++) {
        WeightedEdge *e = g->heads[i];
        while (e != NULL) {
            WeightedEdge *tmp = e->next;
            free(e);
            e = tmp;
        }
    }
    free(g->heads);
    free(g);
}

/* -------------------------
 * priority queue (min heap)
 * ------------------------- */

typedef struct {
    int    node;
    double dist;
} HeapNode;

typedef struct {
    HeapNode *data;
    int       size;
    int       capacity;
} MinHeap;

static MinHeap *heap_create(int capacity) {
    MinHeap *h = (MinHeap *)malloc(sizeof(MinHeap));
    h->data     = (HeapNode *)malloc(capacity * sizeof(HeapNode));
    h->size     = 0;
    h->capacity = capacity;
    return h;
}

static void heap_free(MinHeap *h) {
    free(h->data);
    free(h);
}

static void heap_swap(MinHeap *h, int i, int j) {
    HeapNode tmp = h->data[i];
    h->data[i]   = h->data[j];
    h->data[j]   = tmp;
}

static void heap_push(MinHeap *h, int node, double dist) {
    int i = h->size++;
    h->data[i].node = node;
    h->data[i].dist = dist;

    while (i > 0) {
        int parent = (i - 1) / 2;
        if (h->data[parent].dist <= h->data[i].dist) break;
        heap_swap(h, parent, i);
        i = parent;
    }
}

static HeapNode heap_pop(MinHeap *h) {
    HeapNode min = h->data[0];
    h->data[0]   = h->data[--h->size];

    int i = 0;
    while (1) {
        int left  = 2 * i + 1;
        int right = 2 * i + 2;
        int smallest = i;

        if (left  < h->size && h->data[left].dist  < h->data[smallest].dist) smallest = left;
        if (right < h->size && h->data[right].dist < h->data[smallest].dist) smallest = right;
        if (smallest == i) break;

        heap_swap(h, i, smallest);
        i = smallest;
    }

    return min;
}

/* -------------------------
 * Dijkstra
 * ------------------------- */

/*
 * Computes shortest paths from source to all nodes.
 *   dist[x] = shortest distance from source to node x
 *   visited[x] = 1 if node x is finalized
 *
 */
void dijkstra(const WeightedGraph *g, int source, double *dist, int *visited) {
    int n = g->num_nodes;

    for (int i = 0; i < n; i++) {
        dist[i]    = INFINITY;
        visited[i] = 0;
    }

    dist[source] = 0.0;

    MinHeap *heap = heap_create(g->num_edges + 1);
    heap_push(heap, source, 0.0);

    while (heap->size > 0) {
        HeapNode cur = heap_pop(heap);
        int u        = cur.node;

        if (visited[u]) continue;
        visited[u] = 1;

        for (WeightedEdge *e = g->heads[u]; e != NULL; e = e->next) {
            int v          = e->to;
            double new_dist = dist[u] + e->weight;
            if (new_dist < dist[v]) {
                dist[v] = new_dist;
                heap_push(heap, v, new_dist);
            }
        }
    }

    heap_free(heap);
}
