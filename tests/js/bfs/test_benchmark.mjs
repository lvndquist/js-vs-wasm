import { bfs } from '../../../src/js/graphs/bfs.mjs';
import { loadGraphData } from '../test_loaders.mjs';
import { graphSummarize } from '../test_utils.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/benchmark/graphs_weighted/${size}.bin`;

const graphData = loadGraphData(path);
const numOfNodes = graphData.numOfNodes;
const numOfEdges = graphData.numOfEdges;

const visited = new Int32Array(numOfNodes);
const dist = new Int32Array(numOfNodes);
dist.fill(-1);

bfs(graphData, 0, visited, dist);

const { reachable, maxDist, checksum } = graphSummarize({ visited, dist });

console.log("BFS");
console.log("RESULT", JSON.stringify({
    nodes: numOfNodes,
    reachable,
    max_dist: maxDist,
    checksum: checksum
}));