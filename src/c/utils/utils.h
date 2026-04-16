#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* -------------------------
 * Sorting
 * ------------------------- */

int *load_sort_data(const char *path, int *n);

// Returns a copy of arr
int *copy_array(const int *arr, int n);

//Check if an array is sorted (acending)
int is_sorted(const int *arr, int n);

//Print result of array sorting
void print_array(const int *arr, int n, int edge);

/* -------------------------
 * Graph data
 * ------------------------- */

typedef struct GraphEdge {
    int from;
    int to;
} GraphEdge;

typedef struct GraphData {
    int  num_nodes;
    int  num_edges;
    int *from;
    int *to;
} GraphData;

GraphData *load_graph_data(const char *path);

void free_graph(GraphData *gd);

/* -------------------------
 * Weighted graph data
 * ------------------------- */

typedef struct WeightedGraphData {
    int     num_nodes;
    int     num_edges;
    int    *from;
    int    *to;
    double *weight;
} WeightedGraphData;

WeightedGraphData *load_weighted_graph_data(const char *path);

void free_weighted_graph(WeightedGraphData *gd);

/* -------------------------
 * Matrix datasets
 * ------------------------- */

typedef struct MatrixData {
    int     n;
    double *A;
    double *B;
} MatrixData;

static MatrixData *load_matrix_data(const char *path);

void free_matrix_data(MatrixData *md);