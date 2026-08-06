export function buildCSV(results) {
    const rows = ['algorithm,implementation,size,run,time_in_ms'];
    for (const {algorithm, implementation, size, times } of results) {
        times.forEach((t, i) => {
            rows.push(`${algorithm},${implementation},${size},${i + 1},${t.toFixed(6)}`);
        });
    }
    return rows.join('\n');
}

export function downloadCSV(csv) {
    const browser = detectBrowser();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `js_wasm_results_${browser}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Chrome')) return 'chrome';
    return 'unknown';
}

function intArrayEqual(a, b) {
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

function floatArrayEqual(a, b) {
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