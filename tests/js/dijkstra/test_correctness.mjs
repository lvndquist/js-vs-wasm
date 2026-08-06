import { readFileSync } from 'fs';
import { dijkstra } from '../../../src/js/graphs/dijkstra.mjs';

const INFINITY = 1e18;

function loadGraphData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);
    const weight = new Float64Array(numOfEdges);

    let offset = 8;
    for (let i = 0; i < numOfEdges; i++) {
        from[i] = view.getInt32(offset, true);
        offset += 4;
        to[i] = view.getInt32(offset, true);
        offset += 4;
        weight[i] = view.getFloat64(offset, true);
        offset += 8;
    }

    // CSR structure
    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);
    const weights = new Float64Array(numOfEdges);
    const counts = new Int32Array(numOfNodes);

    for (let i = 0; i < numOfEdges; i++) {
        counts[from[i]]++;
    }

    for (let i = 0; i < numOfNodes; i++) {
        offsets[i + 1] = offsets[i] + counts[i];
    }

    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const u = from[i];
        const pos = offsets[u] + cursor[u]++;
        neighbors[pos] = to[i];
        weights[pos] = weight[i];
    }

    return  { numOfNodes, numOfEdges, offsets, neighbors, weights};
}

function loadExpected(path) {
    const buffer = readFileSync(path);
    const view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength
    );

    const n = view.getInt32(0, true);
    const numEdges = view.getInt32(4, true);
    const reachable = view.getInt32(8, true);
    const maxDist = view.getFloat64(12, true);
    const dist = new Float64Array(n);
    let offset = 20;
    for (let i = 0; i < n; i++) {
        dist[i] = view.getFloat64(offset, true);
        offset += 8;
    }

    return {
        n,
        numEdges,
        reachable,
        maxDist,
        dist
    };
}

function runCase(label, inputPath, expectedPath) {
    const graphData = loadGraphData(inputPath);
    const expected = loadExpected(expectedPath);

    console.log(`Dijkstra (${label})`);
    console.log(`Loaded: ${graphData.numOfNodes} nodes, ${graphData.numOfEdges} edges`);
    const numOfNodes = graphData.numOfNodes;
    const numOfEdges = graphData.numOfEdges;

    const visited = new Int32Array(numOfNodes);
    const dist = new Float64Array(numOfNodes);
    dist.fill(-1);

    dijkstra(graphData, 0, dist, visited);

    let reachable = 0;
    let maxDist = 0;
    for (let i = 0; i < numOfNodes; i++) {
        if (visited[i]) {
            reachable++;

            if (dist[i] > maxDist) {
                maxDist = dist[i];
            }
        }
    }
    
    let expectedResult = false;
    expectedResult = ((numOfNodes === expected.n) && (numOfEdges === expected.numEdges) && (reachable === expected.reachable) && (maxDist === expected.maxDist) && (maxDist === expected.maxDist));

    if (expectedResult) {
        for (let i = 0; i < expected.n; i++) {
            if (dist[i] !== expected.dist[i]) {
                console.log(`mismatch at node ${i}: ` + `got ${dist[i]}, expected ${expected.dist[i]}`);
                expectedResult = false;
                break;
            }
        }
    } else {
        console.log(`mismatch: nodes ${numOfNodes}/${expected.n}, ` + `num_edges ${numOfEdges}/${expected.numEdges}, ` + `reachable ${reachable}/${expected.reachable}, ` + `max_dist ${maxDist}/${expected.maxDist}`);
    }

    console.log(
        "RESULT",
        JSON.stringify({
            case: label,
            nodes: numOfNodes,
            num_edges: numOfEdges,
            reachable,
            max_dist: maxDist,
            dist: Array.from(dist),
            expected_result: expectedResult
        })
    );

}

runCase("connected", "../../../datasets/correctness/graphs_weighted/connected_input.bin", "../../../datasets/correctness/graphs_weighted/connected_expected.bin");
runCase("disconnected", "../../../datasets/correctness/graphs_weighted/disconnected_input.bin", "../../../datasets/correctness/graphs_weighted/disconnected_expected.bin");

