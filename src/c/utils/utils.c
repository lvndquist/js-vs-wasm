#include "utils.h"

int *load_sort_data(const char *path, int *n) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "Could not open %s\n", path);
        exit(1);
    }

    fread(n, sizeof(int), 1, f);

    int *arr = (int *)malloc(*n * sizeof(int));
    if (arr == NULL) { fprintf(stderr, "malloc failed\n"); exit(1); }

    fread(arr, sizeof(int), *n, f);
    fclose(f);
    return arr;
}

int *copy_array(const int *arr, int n) {
    int *copy = (int *)malloc(n * sizeof(int));
    if (copy == NULL) { fprintf(stderr, "malloc failed\n"); exit(1); }
    memcpy(copy, arr, n * sizeof(int));
    return copy;
}

int is_sorted(const int *arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return 0;
        }
    }
    return 1;
}

void print_array(const int *arr, int n, int edge) {
    if (n <= edge * 2) {
        printf("[");
        for (int i = 0; i < n; i++) {
            printf("%d%s", arr[i], i < n - 1 ? ", " : "");
        }
        printf("]\n");
        return;
    }

    int hidden = n - edge * 2;
    printf("[");
    for (int i = 0; i < edge; i++) {
        printf("%d, ", arr[i]);
    }
    printf("... %d more ..., ", hidden);
    for (int i = n - edge; i < n; i++) {
        printf("%d%s", arr[i], i < n - 1 ? ", " : "");
    }
    printf("]\n");
}

GraphData *load_graph_data(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        exit(1);
    }

    GraphData *gd = (GraphData *)malloc(sizeof(GraphData));
    fread(&gd->num_nodes, sizeof(int), 1, f);
    fread(&gd->num_edges, sizeof(int), 1, f);

    gd->from = (int *)malloc(gd->num_edges * sizeof(int));
    gd->to   = (int *)malloc(gd->num_edges * sizeof(int));
    if (gd->from == NULL || gd->to == NULL) { fprintf(stderr, "malloc failed\n"); exit(1); }

    for (int i = 0; i < gd->num_edges; i++) {
        fread(&gd->from[i], sizeof(int), 1, f);
        fread(&gd->to[i],   sizeof(int), 1, f);
    }

    fclose(f);
    return gd;
}

void free_graph(GraphData *gd) {
    free(gd->from);
    free(gd->to);
    free(gd);
}

WeightedGraphData *load_weighted_graph_data(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) { fprintf(stderr, "could not open %s\n", path); exit(1); }

    WeightedGraphData *gd = (WeightedGraphData *)malloc(sizeof(WeightedGraphData));
    fread(&gd->num_nodes, sizeof(int), 1, f);
    fread(&gd->num_edges, sizeof(int), 1, f);

    gd->from   = (int *)malloc(gd->num_edges * sizeof(int));
    gd->to     = (int *)malloc(gd->num_edges * sizeof(int));
    gd->weight = (double *)malloc(gd->num_edges * sizeof(double));

    for (int i = 0; i < gd->num_edges; i++) {
        fread(&gd->from[i],   sizeof(int),    1, f);
        fread(&gd->to[i],     sizeof(int),    1, f);
        fread(&gd->weight[i], sizeof(double), 1, f);
    }

    fclose(f);
    return gd;
}

void free_weighted_graph(WeightedGraphData *gd) {
    free(gd->from);
    free(gd->to);
    free(gd->weight);
    free(gd);
}

MatrixData *load_matrix_data(const char *path) {
    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        fprintf(stderr, "could not open %s\n", path);
        exit(1);
    }

    MatrixData *md = (MatrixData *)malloc(sizeof(MatrixData));
    fread(&md->n, sizeof(int), 1, f);

    int elements = md->n * md->n;
    md->A = (double *)malloc(elements * sizeof(double));
    md->B = (double *)malloc(elements * sizeof(double));
    if (md->A == NULL || md->B == NULL) {
        fprintf(stderr, "malloc failed\n"); exit(1);
    }

    fread(md->A, sizeof(double), elements, f);
    fread(md->B, sizeof(double), elements, f);

    fclose(f);
    return md;
}

void free_matrix_data(MatrixData *md) {
    free(md->A);
    free(md->B);
    free(md);
}