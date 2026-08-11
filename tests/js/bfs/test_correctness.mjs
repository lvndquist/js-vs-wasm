import { bfs } from '../../../src/js/graphs/bfs.mjs';
import { loadGraphData, loadExpectedGraphData } from '../test_loaders.mjs';
import { graphSummarize } from '../test_utils.mjs';

function runCase(label, inputPath, expectedPath) {
    const graphData = loadGraphData(inputPath);
    const expected = loadExpectedGraphData(expectedPath);

    console.log(`BFS (${label})`);
    console.log(`Loaded: ${graphData.numOfNodes} nodes, ${graphData.numOfEdges} edges`);
    const numOfNodes = graphData.numOfNodes;
    const numOfEdges = graphData.numOfEdges;

    const visited = new Int32Array(numOfNodes);
    const dist = new Int32Array(numOfNodes);
    dist.fill(-1);

    bfs(graphData, 0, visited, dist);

    const { reachable, maxDist } = graphSummarize({ visited, dist });

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

    console.log("RESULT", JSON.stringify({
        case: label,
        nodes: numOfNodes,
        num_edges: numOfEdges,
        reachable,
        max_dist: maxDist,
        dist: Array.from(dist),
        expected_result: expectedResult
    }));

}

runCase("connected", "../../../datasets/correctness/graphs/connected_input.bin", "../../../datasets/correctness/graphs/connected_expected.bin");
runCase("disconnected", "../../../datasets/correctness/graphs/disconnected_input.bin", "../../../datasets/correctness/graphs/disconnected_expected.bin");

