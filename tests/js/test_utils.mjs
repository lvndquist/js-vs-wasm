export function printArray(arr, edge) {
    if (arr.length <= edge * 2) {
        return `[${Array.from(arr).join(', ')}]`;
    }
    const left   = Array.from(arr.slice(0, edge)).join(', ');
    const right  = Array.from(arr.slice(arr.length - edge)).join(', ');
    const hidden = arr.length - edge * 2;
    return `[${left}, ... ${hidden} more ..., ${right}]`;
}

export function isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1])
        {
            return false;
        }
    }
    return true;
}

export function matrixChecksum(matrix, n) {
    let checksum = 0.0;
    for (let i = 0; i < n * n; i++) {
        checksum += matrix[i];
    }
    return checksum;
}

export function arrayChecksum(a) {
  let checksum = 0n;
  for (let i = 0; i < a.length; i++) {
    checksum += BigInt(a[i]);
  }
  return checksum;
}

export function intArrayEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

export function floatArrayEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > 1e-9) {
            return false;
        }
    }

    return true;
}

export function graphSummarize(data) {
    let reachable = 0;
    let maxDist = 0;
    let checksum = 0;

    for (let i = 0; i < data.visited.length; i++) {
        if (data.visited[i]) {
            reachable++;

            if (data.dist[i] > maxDist) {
                maxDist = data.dist[i];
            }

            checksum += data.dist[i];
        }
    }

    return { reachable, maxDist, checksum };
}