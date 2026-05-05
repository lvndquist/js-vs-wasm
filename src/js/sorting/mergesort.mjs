function merge(arr, temp, left, mid, right) {
    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }

    while (i <= mid) {
        temp[k++] = arr[i++];
    }

    while (j <= right) {
        temp[k++] = arr[j++];
    }

    for (let p = left; p <= right; p++) {
        arr[p] = temp[p];
    }
}

function merge_sort_rec(arr, temp, left, right) {
    if (left >= right) return;
    const mid = left + Math.floor((right - left) / 2);

    merge_sort_rec(arr, temp, left, mid);
    merge_sort_rec(arr, temp, mid + 1, right);
    merge(arr, temp, left, mid, right);
}

export function merge_sort(arr, n) {
    if (n <= 1 || !arr) return;
    const temp = new Int32Array(n);
    merge_sort_rec(arr, temp, 0, n - 1);
}

// function merge(arr, left, mid, right) {
//     const leftLen  = mid - left + 1;
//     const rightLen = right - mid;

//     const leftBuf  = new Int32Array(leftLen);
//     const rightBuf = new Int32Array(rightLen);

//     for (let i = 0; i < leftLen; i++) {
//         leftBuf[i]  = arr[left + i];
//     }

//     for (let i = 0; i < rightLen; i++) {
//         rightBuf[i] = arr[mid + 1 + i];
//     }

//     let i = 0
//     let j = 0
//     let k = left;
//     while (i < leftLen && j < rightLen) {
//         if (leftBuf[i] <= rightBuf[j]) {
//             arr[k++] = leftBuf[i++];
//         } else {
//             arr[k++] = rightBuf[j++];
//         }
//     }

//     while (i < leftLen) {
//         arr[k++] = leftBuf[i++];
//     }

//     while (j < rightLen) {
//         arr[k++] = rightBuf[j++];
//     }
// }

// function merge_sort_rec(arr, left, right) {
//     if (left >= right) return;

//     const mid = left + Math.floor((right - left) / 2);
//     merge_sort_rec(arr, left, mid);
//     merge_sort_rec(arr, mid + 1, right);
//     merge(arr, left, mid, right);
// }

// export function merge_sort(arr, n) {
//     if (n <= 1 || arr === undefined) {
//         return;
//     }
//     merge_sort_rec(arr, 0, n - 1);
// }
