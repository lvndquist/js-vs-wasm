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

const graphData = { numOfNodes, numOfEdges, from, to, weight };

const { dist, visited } = dijkstra(graphData, 0);

const reachable = Array.from(dist).filter(d => d < 1e18).length;
const maxDist = Array.from(dist).filter(d => d < 1e18).reduce((a, b) => Math.max(a, b), 0);

console.log('------------');
console.log('Dijkstra');
console.log('------------');
console.log(`Dataset: ${path}`);
console.log(`Loaded: ${numOfNodes} nodes, ${numOfEdges} edges`);
console.log(`Dijkstra from node 0: `);
console.log(`Reachable nodes : ${reachable} / ${numOfNodes}`);
console.log(`Max distance    : ${maxDist.toFixed(2)}`);
console.log(`dist[0]         : ${dist[0].toFixed(2)}`);
console.log(`dist[1]         : ${dist[1].toFixed(2)}`);
console.log(`dist[2]         : ${dist[2].toFixed(2)}`);
console.log(`dist[3]         : ${dist[3].toFixed(2)}`);
