export function bfs(graphData, source) {
    const { numOfNodes, numOfEdges, from, to } = graphData;

    const heads = new Array(numOfNodes);
    for (let i = 0; i < numOfNodes; i++) heads[i] = [];

    for (let i = 0; i < numOfEdges; i++) {
        heads[from[i]].push(to[i]);
    }

    const visited = new Int32Array(numOfNodes);
    const dist    = new Int32Array(numOfNodes).fill(-1);
    const queue   = new Int32Array(numOfNodes);

    let head = 0, tail = 0;

    visited[source] = 1;
    dist[source]    = 0;
    queue[tail++]   = source;

    while (head < tail) {
        const node = queue[head++];
        const neighbours = heads[node];

        for (let i = 0; i < neighbours.length; i++) {
            const neighbour = neighbours[i];
            if (!visited[neighbour]) {
                visited[neighbour] = 1;
                dist[neighbour]    = dist[node] + 1;
                queue[tail++]      = neighbour;
            }
        }
    }

    return { visited, dist };
}
