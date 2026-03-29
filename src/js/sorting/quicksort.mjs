function partition(arr, left, right) {
    const pivot = arr[right];
    let i = left - 1;

    for (let j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }

    const tmp = arr[i + 1];
    arr[i + 1] = arr[right];
    arr[right] = tmp;

    return i + 1;
}

function quick_sort_rec(arr, left, right) {
    if (left >= right) return;

    const pivotIndex = partition(arr, left, right);
    quick_sort_rec(arr, left, pivotIndex - 1);
    quick_sort_rec(arr, pivotIndex + 1, right);
}

export function quick_sort(arr, n) {
    if (n <= 1 || arr === undefined) {
        return;
    }
    quick_sort_rec(arr, 0, n - 1);
}
