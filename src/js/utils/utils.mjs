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