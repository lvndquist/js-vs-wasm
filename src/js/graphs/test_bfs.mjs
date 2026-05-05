import { readFileSync } from 'fs';
import { bfs } from './bfs.mjs';

const size = process.argv[2] || 'small';
const path = `../../../datasets/graphs/${size}.bin`;

const buffer = readFileSync(path);
const numOfNodes = buffer.readInt32LE(0);
const numOfEdges = buffer.readInt32LE(4);

const from = new Int32Array(buffer.buffer, buffer.byteOffset + 8, numOfEdges);
const to = new Int32Array(buffer.buffer, buffer.byteOffset + 8 + (numOfEdges * 4), numOfEdges);

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

const graphData = { numOfNodes, offsets, neighbors };
const visited = new Int32Array(numOfNodes);
const dist = new Int32Array(numOfNodes);

bfs(graphData, 0, visited, dist);

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