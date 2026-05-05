export function bfs(graphData, source, visited, dist) {
    const { offsets, neighbors, numOfNodes } = graphData;

    visited.fill(0);
    dist.fill(-1);

    const queue = new Int32Array(numOfNodes);
    let head = 0, tail = 0;

    visited[source] = 1;
    dist[source] = 0;
    queue[tail++] = source;

    while (head < tail) {
        const node = queue[head++];
        const start = offsets[node];
        const end = offsets[node + 1];

        for (let i = start; i < end; i++) {
            const neighbour = neighbors[i];
            if (!visited[neighbour]) {
                visited[neighbour] = 1;
                dist[neighbour] = dist[node] + 1;
                queue[tail++] = neighbour;
            }
        }
    }
}