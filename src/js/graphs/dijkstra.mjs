
const INFINITY = 1e18;

class MinHeap {
    constructor(capacity) {
        this.nodes  = new Int32Array(capacity);
        this.dists  = new Float64Array(capacity);
        this.size   = 0;
    }

    push(node, dist) {
        let i = this.size++;
        this.nodes[i] = node;
        this.dists[i] = dist;

        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.dists[parent] <= this.dists[i]) break;
            this._swap(parent, i);
            i = parent;
        }
    }

    pop() {
        const minNode = this.nodes[0];
        const minDist = this.dists[0];
        this.size--;
        this.nodes[0] = this.nodes[this.size];
        this.dists[0] = this.dists[this.size];

        let i = 0;
        while (true) {
            const left     = 2 * i + 1;
            const right    = 2 * i + 2;
            let smallest   = i;

            if (left  < this.size && this.dists[left]  < this.dists[smallest]) smallest = left;
            if (right < this.size && this.dists[right] < this.dists[smallest]) smallest = right;
            if (smallest === i) break;

            this._swap(i, smallest);
            i = smallest;
        }

        return { node: minNode, dist: minDist };
    }

    _swap(i, j) {
        const tmpNode  = this.nodes[i];
        const tmpDist  = this.dists[i];
        this.nodes[i]  = this.nodes[j];
        this.dists[i]  = this.dists[j];
        this.nodes[j]  = tmpNode;
        this.dists[j]  = tmpDist;
    }
}

export function dijkstra(graphData, source) {
    const { numOfNodes, numOfEdges, from, to, weight } = graphData;

    const heads = new Array(numOfNodes);
    for (let i = 0; i < numOfNodes; i++) heads[i] = [];

    for (let i = 0; i < numOfEdges; i++) {
        heads[from[i]].push({ to: to[i], weight: weight[i] });
    }

    const dist    = new Float64Array(numOfNodes).fill(INFINITY);
    const visited = new Int32Array(numOfNodes);

    dist[source] = 0.0;

    const heap = new MinHeap(numOfEdges + 1);
    heap.push(source, 0.0);

    while (heap.size > 0) {
        const { node: u, dist: d } = heap.pop();

        if (visited[u]) continue;
        visited[u] = 1;

        const neighbours = heads[u];
        for (let i = 0; i < neighbours.length; i++) {
            const { to: v, weight: w } = neighbours[i];
            const newDist = dist[u] + w;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                heap.push(v, newDist);
            }
        }
    }

    return { dist, visited };
}
