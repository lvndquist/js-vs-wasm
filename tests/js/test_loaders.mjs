// loaders using readFileSync instead of fetch, for node environment
import { readFileSync } from 'fs';

export function loadGraphData(path) {
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

    return { numOfNodes, numOfEdges, from, to, offsets, neighbors };
}

export function loadExpectedGraphData(path) {
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

    return { n, numEdges, reachable, maxDist, dist };
}

export function loadWeightedGraphData(path) {
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

    return  { numOfNodes, numOfEdges, from, to, weight, offsets, neighbors, weights};
}

export function loadExpectedWeightedGraphData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

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

    return { n, numEdges, reachable, maxDist, dist };
}

export function loadMatrixData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const n = view.getInt32(0, true);
    const elements = n * n;
    const A = new Float64Array(elements);
    const B = new Float64Array(elements);

    for (let i = 0; i < elements; i++) {
        A[i] = view.getFloat64(4 + i * 8, true);
        B[i] = view.getFloat64(4 + elements * 8 + i * 8, true);
    }

    const C = new Float64Array(n * n);

    return  { n, A, B, C};
}

export function loadExpectedMatrixData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const n = view.getInt32(0, true);
    const elements = n * n;
    const C = new Float64Array(elements);

    for (let i = 0; i < elements; i++) {
        C[i] = view.getFloat64(4 + i * 8, true);
    }

    return { n, C };
}

export function loadSortData(path) {
    const buffer = readFileSync(path);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const n = view.getInt32(0, true);
    const arr = new Int32Array(n);

    for (let i = 0; i < n; i++) {
        arr[i] = view.getInt32(4 + i *4, true);
    }

    return { n, arr };
}