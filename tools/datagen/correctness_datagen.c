#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ---------------------------
 * Utils
 * --------------------------- */

#define INFINITY 1e18

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

static void write_int_array(const char *path, int *arr, int n) {
    FILE *f = open_file(path);

    fwrite(&n, sizeof(int), 1, f);
    fwrite(arr, sizeof(int), n, f);

    fclose(f);
}

/* ---------------------------
 * Sorting datasets
 * Generate basic correctness datasets to validate sorting algorithm functionality.
 * --------------------------- */

// basic correctness dataset: unsorted array of 10 integers
static void generate_basic_sorting_correctness() {
    printf("Generating correctness/sorting/basic_input.bin...\n");

    make_dir("correctness/sorting");

    int input[] = {9,3,8,5,7,2,1,4,6,0};
    int expected[] = {0,1,2,3,4,5,6,7,8,9};

    int n = 10;

    write_int_array("correctness/sorting/basic_input.bin", input, n);
    write_int_array("correctness/sorting/basic_expected.bin", expected, n);
}

// basic correctness dataset: sorted array of 10 integers
static void generate_sorted_sorting_correctness() {
    printf("Generating correctness/sorting/sorted_input.bin...\n");
    make_dir("correctness/sorting");

    int input[] = {0,1,2,3,4,5,6,7,8,9};
    int expected[] = {0,1,2,3,4,5,6,7,8,9};

    int n = 10;

    write_int_array("correctness/sorting/sorted_input.bin", input, n);
    write_int_array("correctness/sorting/sorted_expected.bin", expected, n);
}

// basic correctness dataset: reverse sorted array of 10 integers
static void generate_reverse_sorted_sorting_correctness() {
    printf("Generating correctness/sorting/reverse_input.bin...\n");
    make_dir("correctness/sorting");

    int input[] = {9,8,7,6,5,4,3,2,1,0};
    int expected[] = {0,1,2,3,4,5,6,7,8,9};

    int n = 10;

    write_int_array("correctness/sorting/reverse_input.bin", input, n);
    write_int_array("correctness/sorting/reverse_expected.bin", expected, n);
}

// basic correctness dataset: array with duplicate integers
static void generate_duplicates_sorting_correctness() {
    printf("Generating correctness/sorting/duplicates_input.bin...\n");
    make_dir("correctness/sorting");

    int input[] = {5,2,5,1,3,2,5};
    int expected[] = {1,2,2,3,5,5,5};

    int n = 7;

    write_int_array("correctness/sorting/duplicates_input.bin", input, n);
    write_int_array("correctness/sorting/duplicates_expected.bin", expected, n);
}

/* ---------------------------
 * Graph datasets
 * Generate basic correctness datasets to validate graph algorithm functionality.
 * --------------------------- */

typedef struct {
    int from;
    int to;
} Edge;

/**
 * Input graph for BFS correctness test:
 * n = 6, num_edges = 5
 *
 *       0
 *      / \
 *     1   2
 *    /     \
 *   3       4
 *  /
 * 5
 *
 *
 * Expected output:
 * nodes = 6
 * reachable = 6
 * max_dist = 3
 *
 * Expected distances from source 0:
 * 0 -> 0
 * 1 -> 1
 * 2 -> 1
 * 3 -> 2
 * 4 -> 2
 * 5 -> 3
 **/
static void generate_connected_graph_correctness() {
    printf("Generating correctness/graphs/connected_input.bin...\n");
    make_dir("correctness/graphs");

    int n = 6;
    int num_edges = 5;

    Edge edges[] = {
        {0, 1},
        {0, 2},
        {1, 3},
        {2, 4},
        {3, 5}
    };

    FILE *f = open_file("correctness/graphs/connected_input.bin");

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&num_edges, sizeof(int), 1, f);
    fwrite(edges, sizeof(Edge), num_edges, f);

    fclose(f);

    int reachable = 6;
    int max_dist = 3;
    int dist[] = {0, 1, 1, 2, 2, 3};

    f = open_file("correctness/graphs/connected_expected.bin");

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&reachable, sizeof(int), 1, f);
    fwrite(&max_dist, sizeof(int), 1, f);
    fwrite(dist, sizeof(int), n, f);

    fclose(f);
}

/**
 * Input graph for BFS correctness test:
 * n = 6, num_edges = 3
 *
 * 0 ---> 1 ---> 2
 * 3 ---> 4
 * 5
 *
 * Expected output:
 * nodes = 6
 * reachable = 3
 * max_dist = 2
 *
 * Expected distances from source 0:
 * 0 -> 0
 * 1 -> 1
 * 2 -> 2
 * 3 -> -1
 * 4 -> -1
 * 5 -> -1
 **/
static void generate_disconnected_graph_correctness() {
    printf("Generating correctness/graphs/disconnected_input.bin...\n");
    make_dir("correctness/graphs");

    int n = 6;
    int num_edges = 3;

    Edge edges[] = {
        {0, 1},
        {1, 2},
        {3, 4}
    };

    FILE *f = open_file("correctness/graphs/disconnected_input.bin");

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&num_edges, sizeof(int), 1, f);
    fwrite(edges, sizeof(Edge), num_edges, f);

    fclose(f);

    int reachable = 3;
    int max_dist = 2;
    int dist[] = {0, 1, 2, -1, -1, -1};

    f = open_file("correctness/graphs/disconnected_expected.bin");

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&reachable, sizeof(int), 1, f);
    fwrite(&max_dist, sizeof(int), 1, f);
    fwrite(dist, sizeof(int), n, f);

    fclose(f);
}

typedef struct {
    int from;
    int to;
    double weight;
} WeightedEdge;

/**
 * Input connected weighted graph for Dijkstra correctness test:
 * n = 4
 *
 *     0 ---4---> 2
 *     |
 *     | 1
 *     |
 *     v
 *     1
 *     |
 *     | 2
 *     |
 *     v
 *     2
 *     |
 *     | 1
 *     |
 *     v
 *     3
 *
 * Expected output:
 * nodes = 4
 * reachable = 4
 * max_dist = 4.0
 * 
 * Expected distances from source 0:
 * 0 -> 0
 * 1 -> 1
 * 2 -> 3
 * 3 -> 4
 *
 **/
static void generate_weighted_graph_connected_correctness() {
    printf("Generating correctness/graphs_weighted/connected_input.bin...\n");
    make_dir("correctness/graphs_weighted");

    int n = 4;
    int num_edges = 4;

    WeightedEdge edges[] = {
        {0, 2, 4.0},
        {0, 1, 1.0},
        {1, 2, 2.0},
        {2, 3, 1.0}
    };

    int source = 0;

    FILE *f = open_file(
        "correctness/graphs_weighted/connected_input.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&num_edges, sizeof(int), 1, f);
    fwrite(edges, sizeof(WeightedEdge), num_edges, f);

    fclose(f);

    double dist[] = {
        0.0, // shortest distance to self
        1.0, // shortest distance to node 1
        3.0, // shortest distance to node 2 (instead of 4.0)
        4.0 // shortest distance to node 3 (via node 2)
    };

    int reachable = 4;
    double max_dist = 4.0;

    f = open_file(
        "correctness/graphs_weighted/connected_expected.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&reachable, sizeof(int), 1, f);
    fwrite(&max_dist, sizeof(double), 1, f);
    fwrite(dist, sizeof(double), n, f);

    fclose(f);
}

/**
 * Input disconnected weighted graph for Dijkstra correctness test:
 * n = 4
 *
 * 0 --1--> 1 --2--> 2
 *
 * 3
 * 
 * Expected output:
 * nodes = 4
 * reachable = 3
 * max_dist = 3.0
 * 
 * Expected distances from source 0:
 * 0 -> 0
 * 1 -> 1
 * 2 -> 3
 * 3 -> ∞
 *
 **/
static void generate_weighted_graph_disconnected_correctness() {
    printf("Generating correctness/graphs_weighted/disconnected_input.bin...\n");
    make_dir("correctness/graphs_weighted");

    int n = 4;
    int num_edges = 2;

    WeightedEdge edges[] = {
        {0, 1, 1.0},
        {1, 2, 2.0}
    };

    int source = 0;

    FILE *f = open_file(
        "correctness/graphs_weighted/disconnected_input.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&num_edges, sizeof(int), 1, f);
    fwrite(edges, sizeof(WeightedEdge), num_edges, f);

    fclose(f);

    double dist[] = {
        0.0,
        1.0,
        3.0,
        INFINITY
    };

    int reachable = 3;
    double max_dist = 3.0;

    f = open_file(
        "correctness/graphs_weighted/disconnected_expected.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(&reachable, sizeof(int), 1, f);
    fwrite(&max_dist, sizeof(double), 1, f);
    fwrite(dist, sizeof(double), n, f);

    fclose(f);
}

/* ---------------------------
 * Matrix datasets
 * Generate basic correctness datasets to validate matrix algorithm functionality.
 * --------------------------- */

/**
 * Matrix multiplication correctness test:
 *
 * A: 1 2
 *    3 4
 *
 * B: 5 6
 *    7 8
 *
 * C[0][0] = 1*5 + 2*7 = 19
 * C[0][1] = 1*6 + 2*8 = 22
 * C[1][0] = 3*5 + 4*7 = 43
 * C[1][1] = 3*6 + 4*8 = 50
 * 
 * Expected: 19 22
 *           43 50
 */
static void generate_matrix_correctness() {
    make_dir("correctness/matrix");

    int n = 2;

    double A[] = {
        1.0, 2.0,
        3.0, 4.0
    };

    double B[] = {
        5.0, 6.0,
        7.0, 8.0
    };

    FILE *f = open_file(
        "correctness/matrix/basic_input.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(A, sizeof(double), n * n, f);
    fwrite(B, sizeof(double), n * n, f);

    fclose(f);

    double expected[] = {
        19.0, 22.0,
        43.0, 50.0
    };

    f = open_file(
        "correctness/matrix/basic_expected.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(expected, sizeof(double), n * n, f);

    fclose(f);
}

/**
 * Matrix multiplication correctness test with identity matrix:
 *
 * A: 1 0
 *    0 1
 *
 * B: 5 6
 *    7 8
 *
 * C[0][0] = 1*5 + 0*7 = 5
 * C[0][1] = 1*6 + 0*8 = 6
 * C[1][0] = 0*5 + 1*7 = 7
 * C[1][1] = 0*6 + 1*8 = 8
 * 
 * Expected: 5 6
 *           7 8
 **/
static void generate_identity_matrix_correctness() {
    make_dir("correctness/matrix");

    int n = 2;

    double A[] = {
        1.0, 0.0,
        0.0, 1.0
    };

    double B[] = {
        5.0, 6.0,
        7.0, 8.0
    };

    FILE *f = open_file(
        "correctness/matrix/identity_matrix_input.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(A, sizeof(double), n * n, f);
    fwrite(B, sizeof(double), n * n, f);

    fclose(f);

    double expected[] = {
        5.0, 6.0,
        7.0, 8.0
    };

    f = open_file(
        "correctness/matrix/identity_matrix_expected.bin"
    );

    fwrite(&n, sizeof(int), 1, f);
    fwrite(expected, sizeof(double), n * n, f);

    fclose(f);
}

int main(void) {

    printf("Generating correctness datasets...\n");

    printf("Sorting datasets\n");
    generate_basic_sorting_correctness();
    generate_sorted_sorting_correctness();
    generate_reverse_sorted_sorting_correctness();
    generate_duplicates_sorting_correctness();

    printf("Graph datasets\n");
    generate_graph_connected_correctness();
    generate_graph_disconnected_correctness();
    generate_weighted_graph_connected_correctness();
    generate_weighted_graph_disconnected_correctness();

    printf("Matrix datasets\n");
    generate_matrix_correctness();
    generate_identity_matrix_correctness();

    printf("\nDone. All datasets written/\n");
    return 0;
}