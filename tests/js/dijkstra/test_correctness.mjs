import { dijkstra } from '../../../src/js/graphs/dijkstra.mjs';
import { loadWeightedGraphData, loadExpectedWeightedGraph } from './test_loaders.mjs';
import { graphSummarize } from './test_utils.mjs';

const INFINITY = 1e18;

function runCase(label, inputPath, expectedPath) {
    const graphData = loadWeightedGraphData(inputPath);
    const expected = loadExpectedWeightedGraph(expectedPath);

    console.log(`Dijkstra (${label})`);
    console.log(`Loaded: ${graphData.numOfNodes} nodes, ${graphData.numOfEdges} edges`);
    const numOfNodes = graphData.numOfNodes;
    const numOfEdges = graphData.numOfEdges;

    const visited = new Int32Array(numOfNodes);
    const dist = new Float64Array(numOfNodes);
    dist.fill(-1);

    dijkstra(graphData, 0, dist, visited);

    const { reachable, maxDist } = graphSummarize({ visited, dist });

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

runCase("connected", "../../../datasets/correctness/graphs_weighted/connected_input.bin", "../../../datasets/correctness/graphs_weighted/connected_expected.bin");
runCase("disconnected", "../../../datasets/correctness/graphs_weighted/disconnected_input.bin", "../../../datasets/correctness/graphs_weighted/disconnected_expected.bin");

