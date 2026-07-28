import { readFileSync } from 'fs';
import { dijkstra } from './dijkstra.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/graphs_weighted/${size}.bin`;

const buffer = readFileSync(path);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const numOfNodes = view.getInt32(0, true);
const numOfEdges = view.getInt32(4, true);

const from = new Int32Array(numOfEdges);
const to = new Int32Array(numOfEdges);
const weight = new Float64Array(numOfEdges);

let offset = 8;
for (let i = 0; i < numOfEdges; i++) {
    from[i] = view.getInt32(offset, true); offset += 4;
    to[i] = view.getInt32(offset, true); offset += 4;
    weight[i] = view.getFloat64(offset, true); offset += 8;
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

const graphData = { numOfNodes, numOfEdges, offsets, neighbors, weights };

const dist = new Float64Array(graphData.numOfNodes);
const visited = new Int32Array(graphData.numOfNodes);

dijkstra(graphData, 0, dist, visited);

const reachable = Array.from(dist).filter(d => d < 1e18).length;
const maxDist = Array.from(dist).filter(d => d < 1e18).reduce((a, b) => Math.max(a, b), 0);

// console.log('------------');
// console.log('Dijkstra');
// console.log('------------');
// console.log(`Dataset: ${path}`);
// console.log(`Loaded: ${numOfNodes} nodes, ${numOfEdges} edges`);
// console.log(`Dijkstra from node 0: `);
// console.log(`Reachable nodes : ${reachable} / ${numOfNodes}`);
// console.log(`Max distance    : ${maxDist.toFixed(2)}`);
// console.log(`dist[0]         : ${dist[0].toFixed(2)}`);
// console.log(`dist[1]         : ${dist[1].toFixed(2)}`);
// console.log(`dist[2]         : ${dist[2].toFixed(2)}`);
// console.log(`dist[3]         : ${dist[3].toFixed(2)}`);

console.log('Dijkstra');
console.log('RESULT', JSON.stringify({
    nodes: numOfNodes,
    reachable,
    max_dist: maxDist.toFixed(2),
    dist0: dist[0].toFixed(2),
    dist1: dist[1].toFixed(2),
    dist2: dist[2].toFixed(2),
    dist3: dist[3].toFixed(2)
}));