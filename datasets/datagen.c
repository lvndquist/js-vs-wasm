#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/stat.h>

/* ---------------------------
 * Config
 * --------------------------- */

static const unsigned int SEED = 10;

/* Sorting sizes (number of ints) */
static const int SORT_SIZES[]   = { 1000, 100000, 1000000, 10000000 };
static const char *SORT_NAMES[] = { "small", "medium", "large", "very_large" };
static const int SORT_COUNT     = 4;

/* Graph sizes (nodes, edges per node) */
static const int GRAPH_NODES[]     = { 500, 5000, 50000, 500000 };
static const int GRAPH_EDGES_PER[] = { 10,  10,   10,    10     };
static const char *GRAPH_NAMES[]   = { "small", "medium", "large", "very_large" };
static const int GRAPH_COUNT       = 4;

/* Matrix sizes (n x n matrix) */
static const int MATRIX_SIZES[]   = { 64, 256, 512, 1024 };
static const char *MATRIX_NAMES[] = { "small", "medium", "large", "very_large" };
static const int MATRIX_COUNT     = 4;

/* ---------------------------
 * Utils
 * --------------------------- */

static void make_dir(const char *path) {
    mkdir(path, 0755);
}

static FILE *open_file(const char *path) {
    FILE *f = fopen(path, "wb");
    if (f == NULL) {
        fprintf(stderr, "Error: could not open %s\n", path);
        exit(1);
    }
    return f;
}

/* ---------------------------
 * Sorting datasets
 * --------------------------- */

static void generate_sorting(unsigned int seed) {
    make_dir("sorting");

    for (int s = 0; s < SORT_COUNT; s++) {
        int n = SORT_SIZES[s];

        char path[256];
        snprintf(path, sizeof(path), "sorting/%s.bin", SORT_NAMES[s]);

        printf("Generating sorting/%s.bin (%d elements)...\n", SORT_NAMES[s], n);

        int *arr = (int *)malloc(n * sizeof(int));
        if (arr == NULL) {
            fprintf(stderr, "malloc failed\n");
            exit(1);
        }

        srand(seed + s);
        for (int i = 0; i < n; i++) {
            arr[i] = rand();
        }

        FILE *f = open_file(path);
        fwrite(&n, sizeof(int), 1, f);
        fwrite(arr, sizeof(int), n, f);
        fclose(f);
        free(arr);
    }
}

/* ---------------------------
 * Graph datasets
 * --------------------------- */

typedef struct {
    int from;
    int to;
} Edge;

static void generate_graphs(unsigned int seed) {
    make_dir("graphs");

    for (int s = 0; s < GRAPH_COUNT; s++) {
        int n         = GRAPH_NODES[s];
        int per_node  = GRAPH_EDGES_PER[s];
        int num_edges = n * per_node;

        char path[256];
        snprintf(path, sizeof(path), "graphs/%s.bin", GRAPH_NAMES[s]);

        printf("Generating graphs/%s.bin (%d nodes, %d edges)...\n", GRAPH_NAMES[s], n, num_edges);

        Edge *edges = (Edge *)malloc(num_edges * sizeof(Edge));
        if (edges == NULL) {
            fprintf(stderr, "malloc failed\n");
            exit(1);
        }

        srand(seed + 100 + s);

        int index = 0;
        for (int i = 0; i < n - 1 && index < num_edges; i++) {
            edges[index].from = i;
            edges[index].to   = i + 1;
            index++;
        }

        /* fill randomly */
        while (index < num_edges) {
            edges[index].from = rand() % n;
            edges[index].to   = rand() % n;
            index++;
        }

        FILE *f = open_file(path);
        fwrite(&n,         sizeof(int),  1,         f);
        fwrite(&num_edges, sizeof(int),  1,         f);
        fwrite(edges,      sizeof(Edge), num_edges, f);
        fclose(f);
        free(edges);
    }
}

/* ---------------------------
 * Weighted graph datasets
 * --------------------------- */

typedef struct {
    int    from;
    int    to;
    double weight;
} WeightedEdge;

static void generate_weighted_graphs(unsigned int seed) {
    make_dir("graphs_weighted");

    for (int s = 0; s < GRAPH_COUNT; s++) {
        int n         = GRAPH_NODES[s];
        int per_node  = GRAPH_EDGES_PER[s];
        int num_edges = n * per_node;

        char path[256];
        snprintf(path, sizeof(path), "graphs_weighted/%s.bin", GRAPH_NAMES[s]);

        printf("Generating graphs_weighted/%s.bin (%d nodes, %d edges)...\n",
               GRAPH_NAMES[s], n, num_edges);

        WeightedEdge *edges = (WeightedEdge *)malloc(num_edges * sizeof(WeightedEdge));
        if (edges == NULL) { fprintf(stderr, "malloc failed\n"); exit(1); }

        srand(seed + 300 + s);

        int index = 0;
        for (int i = 0; i < n - 1 && index < num_edges; i++) {
            edges[index].from   = i;
            edges[index].to     = i + 1;
            edges[index].weight = 1.0;
            index++;
        }

        while (index < num_edges) {
            edges[index].from   = rand() % n;
            edges[index].to     = rand() % n;
            edges[index].weight = 1.0 + ((double)rand() / RAND_MAX) * 99.0;
            index++;
        }

        FILE *f = open_file(path);
        fwrite(&n,         sizeof(int),          1,         f);
        fwrite(&num_edges, sizeof(int),          1,         f);
        fwrite(edges,      sizeof(WeightedEdge), num_edges, f);
        fclose(f);
        free(edges);
    }
}

/* ---------------------------
 * Matrix datasets
 * --------------------------- */

static void generate_matrix(unsigned int seed) {
    make_dir("matrix");

    for (int s = 0; s < MATRIX_COUNT; s++) {
        int n        = MATRIX_SIZES[s];
        int elements = n * n;

        char path[256];
        snprintf(path, sizeof(path), "matrix/%s.bin", MATRIX_NAMES[s]);

        printf("Generating matrix/%s.bin (%dx%d matrices)...\n",
               MATRIX_NAMES[s], n, n);

        double *mat = (double *)malloc(2 * elements * sizeof(double));
        if (mat == NULL) { fprintf(stderr, "malloc failed\n"); exit(1); }

        srand(seed + 200 + s);
        for (int i = 0; i < 2 * elements; i++) {
            mat[i] = (double)rand() / RAND_MAX * 100.0;
        }

        FILE *f = open_file(path);
        fwrite(&n,   sizeof(int),    1,            f);
        fwrite(mat,  sizeof(double), 2 * elements, f);
        fclose(f);
        free(mat);
    }
}

int main(void) {

    printf("Generating datasets with seed %u...\n\n", SEED);

    printf("Sorting datasets:\n");
    generate_sorting(SEED);

    printf("\nGraph datasets:\n");
    generate_graphs(SEED);

    printf("\nWeighted graph datasets:\n");
    generate_weighted_graphs(SEED);

    printf("\nMatrix datasets:\n");
    generate_matrix(SEED);

    printf("\nDone. All datasets written/\n");
    return 0;
}
