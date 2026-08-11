import { dijkstra } from '../../../src/js/graphs/dijkstra.mjs';
import { loadWeightedGraphData } from '../test_loaders.mjs';
import { graphSummarize } from '../test_utils.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/benchmark/graphs_weighted/${size}.bin`;

const graphData = loadWeightedGraphData(path);
const numOfNodes = graphData.numOfNodes;
const numOfEdges = graphData.numOfEdges;

const visited = new Int32Array(numOfNodes);
const dist = new Float64Array(numOfNodes);
dist.fill(-1);

dijkstra(graphData, 0, dist, visited);

const { reachable, maxDist, checksum } = graphSummarize({ visited, dist });

console.log("Dijkstra");
console.log("RESULT", JSON.stringify({
    nodes: numOfNodes,
    reachable,
    max_dist: maxDist.toFixed(4),
    checksum: checksum.toFixed(4)
}));