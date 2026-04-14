import { readFileSync } from 'fs';
import { bfs } from './bfs.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/graphs/${size}.bin`;

const buffer = readFileSync(path);
const numOfNodes = buffer.readInt32LE(0);
const numOfEdges = buffer.readInt32LE(4);
const from = new Int32Array(buffer.buffer, buffer.byteOffset + 8, numOfEdges);
const to = new Int32Array(buffer.buffer, buffer.byteOffset + 8 + numOfEdges * 4, numOfEdges);
const heads = Array.from({ length: numOfNodes }, () => []);
for (let i = 0; i < numOfEdges; i++) {
    heads[from[i]].push(to[i]);
}


const graphData = { numOfNodes, numOfEdges, from, to, heads };

const { visited, dist } = bfs(graphData, 0);

const reachable = visited.reduce((acc, v) => acc + v, 0);
const maxDist = dist.reduce((acc, d) => d > acc ? d : acc, 0);

console.log('------------');
console.log('BFS');
console.log('------------');
console.log(`Dataset: ${path}`);
console.log(`Loaded: ${numOfNodes} nodes, ${numOfEdges} edges`);
console.log(`BFS from node 0:`);
console.log(`Reachable nodes : ${reachable} / ${numOfNodes}`);
console.log(`Max distance    : ${maxDist}`);
console.log(`dist[0]         : ${dist[0]}`);
console.log(`dist[1]         : ${dist[1]}`);
console.log(`dist[2]         : ${dist[2]}`);
console.log(`dist[3]         : ${dist[3]}`);