export async function loadSortData(size, root) {
    const res = await fetch(`${root}/sorting/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const n = view.getInt32(0, true);
    const arr = new Int32Array(buffer.slice(4), 0, n);
    return { n, arr };
}

export async function loadGraphData(size, root) {
    const res = await fetch(`${root}/graphs/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);

    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const edgePairs = new Int32Array(buffer, 8, numOfEdges * 2);
    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);
    for (let i = 0; i < numOfEdges; i++) {
        from[i] = edgePairs[i * 2];
        to[i] = edgePairs[i * 2 + 1];
    }

    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);
    const counts = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        counts[from[i]]++;
    }

    offsets[0] = 0;
    for (let i = 0; i < numOfNodes; i++) {
        offsets[i + 1] = offsets[i] + counts[i];
    }

    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const startNode = from[i];
        neighbors[offsets[startNode] + cursor[startNode]++] = to[i];
    }

    return {
        numOfNodes,
        numOfEdges,
        from,
        to,
        offsets,
        neighbors
    };
}

export async function loadWeightedGraphData(size, root) {
    const res = await fetch(`${root}/graphs_weighted/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);

    const numOfNodes = view.getInt32(0, true);
    const numOfEdges = view.getInt32(4, true);

    const from = new Int32Array(numOfEdges);
    const to = new Int32Array(numOfEdges);
    const weight = new Float64Array(numOfEdges);

    const structSize = 16;
    let offset = 8;

    for (let i = 0; i < numOfEdges; i++) {
        from[i] = view.getInt32(offset, true);
        to[i]   = view.getInt32(offset + 4, true);
        weight[i] = view.getFloat64(offset + 8, true);
        offset += structSize;
    }

    const offsets = new Int32Array(numOfNodes + 1);
    const neighbors = new Int32Array(numOfEdges);
    const weights = new Float64Array(numOfEdges);
    const counts = new Int32Array(numOfNodes);

    for (let i = 0; i < numOfEdges; i++) counts[from[i]]++;
    for (let i = 0; i < numOfNodes; i++) offsets[i + 1] = offsets[i] + counts[i];

    const cursor = new Int32Array(numOfNodes);
    for (let i = 0; i < numOfEdges; i++) {
        const u = from[i];
        const pos = offsets[u] + cursor[u]++;
        neighbors[pos] = to[i];
        weights[pos] = weight[i];
    }

    return { numOfNodes, numOfEdges, from, to, weight, offsets, neighbors, weights };
}

export async function loadMatrixData(size, root) {
    const res = await fetch(`${root}/matrix/${size}.bin`);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    const n = view.getInt32(0, true);
    const A = new Float64Array(buffer.slice(4), 0, n * n);
    const B = new Float64Array(buffer.slice(4 + n * n * 8), 0, n * n);
    return { n, A, B};
}