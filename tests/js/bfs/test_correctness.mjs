import { readFileSync } from 'fs';
import { bfs } from '../../../src/js/graphs/bfs.mjs';

function loadGraphData(path) {
    const buffer = readFileSync(path);
    const numOfNodes = buffer.readInt32LE(0);
    const numOfEdges = buffer.readInt32LE(4);

    const edgePairs = new Int32Array(buffer.buffer, buffer.byteOffset + 8, numOfEdges * 2);
    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);

    for (let i = 0; i < numOfEdges; i++) {
        from[i] = edgePairs[i * 2];
        to[i] = edgePairs[i * 2 + 1];
    }

    // Build CSR structure
    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);

    // Count edges for each node to determine offset sizes
    const counts = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        counts[from[i]]++;
    }

    // Prefix sum to calculate offsets
    offsets[0] = 0;
    for (let i = 0; i < numOfNodes; i++) {
        offsets[i + 1] = offsets[i] + counts[i];
    }

    // Fill the neighbors array using the offsets
    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const startNode = from[i];
        const destinationNode = to[i];
        const writePos = offsets[startNode] + cursor[startNode];
        neighbors[writePos] = destinationNode;
        cursor[startNode]++;
    }

    return  { numOfNodes, numOfEdges, offsets, neighbors};
}

function loadExpected(path) {
    const buffer = readFileSync(path);
    const n = buffer.readInt32LE(0);
    const numEdges = buffer.readInt32LE(4);
    const reachable = buffer.readInt32LE(8);
    const maxDist = buffer.readInt32LE(12);
    const dist = new Int32Array(n);
    let offset = 16;
    for (let i = 0; i < n; i++) {
        dist[i] = buffer.readInt32LE(offset);
        offset += 4;
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

    console.log(`BFS (${label})`);
    console.log(`Loaded: ${graphData.numOfNodes} nodes, ${graphData.numOfEdges} edges`);
    const numOfNodes = graphData.numOfNodes;
    const numOfEdges = graphData.numOfEdges;

    const visited = new Int32Array(numOfNodes);
    const dist = new Int32Array(numOfNodes);
    dist.fill(-1);

    bfs(graphData, 0, visited, dist);

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
    expectedResult = (numOfNodes === expected.n) && (numOfEdges === expected.numEdges) && (reachable === expected.reachable) && (maxDist === expected.maxDist);

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

runCase("connected", "../../../datasets/correctness/graphs/connected_input.bin", "../../../datasets/correctness/graphs/connected_expected.bin");
runCase("disconnected", "../../../datasets/correctness/graphs/disconnected_input.bin", "../../../datasets/correctness/graphs/disconnected_expected.bin");

