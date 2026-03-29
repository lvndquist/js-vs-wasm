function merge(arr, left, mid, right) {
    const leftLen  = mid - left + 1;
    const rightLen = right - mid;

    const leftBuf  = new Int32Array(leftLen);
    const rightBuf = new Int32Array(rightLen);

    for (let i = 0; i < leftLen; i++) {
        leftBuf[i]  = arr[left + i];
    }

    for (let i = 0; i < rightLen; i++) {
        rightBuf[i] = arr[mid + 1 + i];
    }

    let i = 0
    let j = 0
    let k = left;
    while (i < leftLen && j < rightLen) {
        if (leftBuf[i] <= rightBuf[j]) {
            arr[k++] = leftBuf[i++];
        } else {
            arr[k++] = rightBuf[j++];
        }
    }

    while (i < leftLen) {
        arr[k++] = leftBuf[i++];
    }

    while (j < rightLen) {
        arr[k++] = rightBuf[j++];
    }
}

function merge_sort_rec(arr, left, right) {
    if (left >= right) return;

    const mid = left + Math.floor((right - left) / 2);
    merge_sort_rec(arr, left, mid);
    merge_sort_rec(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

export function merge_sort(arr, n) {
    if (n <= 1 || arr === undefined) {
        return;
    }
    merge_sort_rec(arr, 0, n - 1);
}
