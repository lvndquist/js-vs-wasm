import os
import pandas
import matplotlib.pyplot as plt
import numpy as np

SIZES = ['small', 'medium', 'large', 'very_large']
SIZES_LABEL = {'small': 'Small', 'medium': 'Medium', 'large': 'Large', 'very_large': 'Very Large'}

def save_plot(figure, name):
    path = os.path.join("plots", name)
    figure.savefig(path, dpi=200, bbox_inches='tight')
    print(f"saved: {path}")
    plt.close(figure)

def ordered_by_size(data_frame):
    return [s for s in SIZES if s in data_frame['size'].unique()]

def statistics(data_frame, group_cols):
    """Get mean and standard deviation"""
    return (
        data_frame.groupby(group_cols)['time_in_ms']
        .agg(mean='mean', std='std')
        .reset_index()
    )

def algorithm_plot_by_size(data_frame, algorithm, browser):

    sub = data_frame[data_frame['algorithm'] == algorithm].copy()
    sizes = ordered_by_size(sub)
    x = np.arange(len(sizes))
    width = 0.35

    s = statistics(sub, ['size', 'implementation'])
    figure, ax = plt.subplots(figsize=(12, 6))

    for index, implementation in enumerate(['js', 'wasm']):
        means, stds = [], []
        for size in sizes:
            row = s[(s['size'] == size) & (s['implementation'] == implementation)]
            means.append(row['mean'].values[0] if len(row) else 0)
            stds.append(row['std'].values[0] if len(row) else 0)

        ax.bar(
            x + index * width - width / 2,
            means, width,
            yerr=stds, capsize=4,
            label=implementation.upper()
        )

    ax.set_xticks(x)
    ax.set_xticklabels([SIZES_LABEL[s] for s in sizes])
    ax.set_xlabel('Input Size')
    ax.set_ylabel('Mean Execution Time (ms)')
    title = f'{algorithm.replace("_", " ").title()} JS vs WASM {browser.title()}'
    ax.set_title(title)
    ax.legend()
    save_plot(figure, f'{algorithm}_{browser}_by_size.png')

def js_wasm_speedup_plot(data_frame, algorithm, browser):
    """Plot the speedup of WASM over JS for a given algorithm and browser."""
    sub = data_frame[data_frame['algorithm'] == algorithm].copy()
 
    sizes = ordered_by_size(sub)
    s = statistics(sub, ['size', 'implementation'])

    speedups = []
    for size in sizes:
        js_row = s[(s['size'] == size) & (s['implementation'] == 'js')]
        wasm_row = s[(s['size'] == size) & (s['implementation'] == 'wasm')]
        if len(js_row) and len(wasm_row):
            js_mean = js_row['mean'].values[0]
            wasm_mean = wasm_row['mean'].values[0]
            if js_mean >= 0.1 and wasm_mean > 0:
                speedups.append(js_mean / wasm_mean)
            else:
                speedups.append(None)

    figure, ax = plt.subplots(figsize=(12, 6))
    ax.plot([SIZES_LABEL[s] for s in sizes], speedups, marker='o', linewidth=2)

    ax.axhline(1.0, color='gray', linestyle='--', linewidth=1, label='No difference')
    ax.set_xlabel('Input Size')
    ax.set_ylabel('JS time / WASM time (Speedup)')
    title = f'{algorithm.replace("_", " ").title()} WASM Speedup over JS {browser.title()}'
    ax.set_title(title)
    ax.legend()
    figure.text(0.01, -0.02,'Note: Data with means smaller than 0.1ms are omitted due to limitations of timer resolution.', fontsize=8, color='gray', style='italic')
    figure.tight_layout()
 
    save_plot(figure, f'{algorithm}_{browser}_speedup.png')

def browser_comparison_plot(data_frame, algorithm):
    """Plot a grouped bar chart comparing JS and WASM across browsers for a given algorithm."""
    sub = data_frame[data_frame['algorithm'] == algorithm].copy()

    sizes = ordered_by_size(sub)
    browsers = sorted(sub['browser'].unique())
    implementations = ['js', 'wasm']
    combinations = [(browser, implementation) for browser in browsers for implementation in implementations]

    s = statistics(sub, ['size', 'implementation', 'browser'])

    n_groups = len(sizes)
    n_bars = len(combinations)
    bar_width = 0.8 / n_bars
    x = np.arange(n_groups)

    figure, ax = plt.subplots(figsize=(12, 6))

    for i, (browser, implementation) in enumerate(combinations):
        means, stds = [], []

        for size in sizes:
            row = s[
                (s['size'] == size) &
                (s['implementation'] == implementation) &
                (s['browser'] == browser)
            ]
            if len(row):
                means.append(row['mean'].values[0])
                stds.append(row['std'].values[0])
            else:
                means.append(0)
                stds.append(0)

        offset = (i - n_bars / 2 + 0.5) * bar_width
        ax.bar(
            x + offset, means, bar_width,
            yerr=stds, capsize=3,
            label=f'{browser.title()} {implementation.upper()}'
        )

    ax.set_xticks(x)
    ax.set_xticklabels([SIZES_LABEL[s] for s in sizes])
    ax.set_xlabel('Input Size')
    ax.set_ylabel('Mean Execution Time (ms)')
    ax.set_title(f'{algorithm.replace("_", " ").title()} Browser Comparison')
    ax.legend()
    figure.tight_layout()
    save_plot(figure, f'{algorithm}_browser_comparison.png')

def all_algorithms_speedup_plot(data_frame):
    """Plot the speedup of WASM over JS for all algorithms in a single chart.
       A line above 1 means WASM is faster, below 1 means JS is faster.
    """
    algorithms = data_frame['algorithm'].unique()
    sizes = ordered_by_size(data_frame)

    figure, ax = plt.subplots(figsize=(12, 6))

    for algorithm in algorithms:
        sub = data_frame[data_frame['algorithm'] == algorithm]
        s = statistics(sub, ['size', 'implementation'])
        speedups = []
        present_sizes = []
        for size in sizes:
            js_row = s[(s['size'] == size) & (s['implementation'] == 'js')]
            wasm_row = s[(s['size'] == size) & (s['implementation'] == 'wasm')]
            if len(js_row) and len(wasm_row):
                js_mean = js_row['mean'].values[0]
                wasm_mean = wasm_row['mean'].values[0]
                if js_mean >= 0.1 and wasm_mean > 0:
                    speedups.append(js_mean / wasm_mean)
                else:
                    speedups.append(None)
                present_sizes.append(SIZES_LABEL[size])

        ax.plot(present_sizes, speedups, marker='o', linewidth=2,label=algorithm.replace('_', ' ').title())

    ax.axhline(1.0, color='gray', linestyle='--', linewidth=1, label='No difference')
    ax.set_xlabel('Input Size')
    ax.set_ylabel('Speedup (JS time / WASM time)')
    ax.set_title('WASM Speedup over JS (All Algorithms & browsers)')
    ax.legend()
    figure.text(0.01, -0.02,'Note: Data with means smaller than 0.1ms are omitted due to limitations of timer resolution.', fontsize=8, color='gray', style='italic')
    save_plot(figure, 'all_algorithms_speedup.png')

def no_op_overhead_plot(data_frame):
    """no op time vs call count in log scale"""
    sub = data_frame[data_frame['experiment'] == 'no-op'].copy()

    browsers = sub['browser'].unique()

    figure, ax = plt.subplots(figsize=(12, 6))

    for browser in browsers:
        bsub = sub[sub['browser'] == browser] if browser else sub
        s = bsub.groupby('call_count')['time_in_ms'].agg(mean='mean', std='std').reset_index()
        s = s.sort_values('call_count')

        label = browser.title() if browser else 'Result'
        ax.errorbar(
            s['call_count'], s['mean'],
            yerr=s['std'], marker='o', linewidth=2,
            capsize=4, label=label
        )

    ax.set_xscale('log')
    ax.set_xlabel('Number of WASM calls')
    ax.set_ylabel('Total Time (ms)')
    ax.set_title('No-op Overhead (JS WASM Boundary Crossing Cost)')
    ax.legend()
    ax.grid(True, which='both', alpha=0.3)
    figure.tight_layout()
    save_plot(figure, 'no_op_overhead.png')

def no_op_per_call_plot(data_frame):
    """no op time per call vs call count in log scale"""

    sub = data_frame[data_frame['experiment'] == 'no-op'].copy()

    browsers = sub['browser'].unique()

    figure, ax = plt.subplots(figsize=(12, 6))

    for browser in browsers:
        bsub = sub[sub['browser'] == browser] if browser else sub
        s = bsub.groupby('call_count')['time_in_ms'].agg(mean='mean').reset_index()
        s = s.sort_values('call_count')
        s['per_call_us'] = (s['mean'] / s['call_count']) * 1000

        label = browser.title() if browser else 'Result'
        ax.plot(s['call_count'], s['per_call_us'], marker='o', linewidth=2, label=label)

    ax.set_xscale('log')
    ax.set_xlabel('Number of WASM calls')
    ax.set_ylabel('Time per call (µs)')
    ax.set_title('Per-call Noop Overhead')
    ax.legend()
    ax.grid(True, which='both', alpha=0.3)
    figure.tight_layout()
    save_plot(figure, 'no_op_per_call.png')

def matrix_boundary_plot(data_frame):
    """full vs row vs cell matrix multiplication time per size."""

    experiments = ['full_matrix', 'row_matrix', 'cell_matrix']
    labels = {'full_matrix': '1 call', 'row_matrix': 'n calls', 'cell_matrix': 'n² calls'}
    sizes = [s for s in SIZES if s in data_frame['size'].unique() and s != '-']

    browsers = data_frame['browser'].unique()

    for browser in browsers:
        bdf = data_frame[data_frame['browser'] == browser] if browser else data_frame

        figure, axes = plt.subplots(1, len(sizes), figsize=(4 * len(sizes), 5))

        for ax, size in zip(axes, sizes):
            present = [e for e in experiments if not bdf[(bdf['experiment'] == e) & (bdf['size'] == size)].empty]
            means, stds = [], []
            for exp in present:
                sub = bdf[(bdf['experiment'] == exp) & (bdf['size'] == size)]['time_in_ms']
                means.append(sub.mean())
                stds.append(sub.std())

            bar_labels = [labels[e] for e in present]
            ax.bar(bar_labels, means, yerr=stds, capsize=4)
            ax.set_title(SIZES_LABEL[size])
            ax.set_ylabel('Mean Time (ms)' if size == sizes[0] else '')

        title = f'Matrix Boundary Overhead Effect {browser.title()}'
        figure.suptitle(title)

        save_plot(figure, f'matrix_boundary_{browser}.png')

def algorithm_summary(data_frame):
    """Print a summary of the results for a given algorithm."""
    group_cols = ['algorithm', 'implementation', 'size']

    stats = (
        data_frame.groupby(group_cols)['time_in_ms']
        .agg(mean='mean', std='std', median='median', min='min', max='max')
        .round(3)
    )
    print("--------------------------------")
    print("WASM vs JS Summary")
    print(stats.to_string())

def overhead_summary(data_frame):
    group_cols = ['experiment', 'size', 'call_count']

    stats = (
        data_frame.groupby(group_cols)['time_in_ms']
        .agg(mean='mean', std='std', median='median')
        .round(3)
    )
    print("--------------------------------")
    print("Overhead Summary")
    print(stats.to_string())

def speedup_table(data_frame):
    """Create a table showing the speedup of WASM over JS for each algorithm, browser and size."""
    rows = []
    for browser in data_frame['browser'].unique():
        for algorithm in data_frame['algorithm'].unique():
            sub = data_frame[(data_frame['browser'] == browser) & (data_frame['algorithm'] == algorithm)]
            stats = statistics(sub, ['size', 'implementation'])
            for size in SIZES:
                js_row = stats[(stats['size'] == size) & (stats['implementation'] == 'js')]
                wasm_row = stats[(stats['size'] == size) & (stats['implementation'] == 'wasm')]
                if len(js_row) and len(wasm_row):
                    js_mean = js_row['mean'].values[0]
                    wasm_mean = wasm_row['mean'].values[0]
                    if js_mean > 0 and wasm_mean > 0:
                        speedup = round(js_mean / wasm_mean, 3)
                    else:
                        speedup = None
                    rows.append({
                        'browser': browser,
                        'algorithm': algorithm,
                        'size': size,
                        'js mean (ms)': round(js_mean, 3) if len(js_row) else None,
                        'wasm mean (ms)': round(wasm_mean, 3) if len(wasm_row) else None,
                        'speedup': speedup
                    })

    return pandas.DataFrame(rows)

def table_color(data_frame):
    """Apply color formatting to a DataFrame based on speedup values.
       Green = WASM faster, Red = JS faster, no color = equal or omitted.
    """
    styled = data_frame.style.map(
        lambda val: 'background-color: #d4edda' if pandas.notna(val) and val > 1.0
            else 'background-color: #f8d7da' if pandas.notna(val) and val < 1.0
            else '',
        subset=['speedup']
    ).format({'speedup': lambda val: f'{val:.3f}' if pandas.notna(val) else 'N/A'})
    return styled

def create_summary_table(algorithm_data_frame, overhead_data_frame):
    """Create a summary table combining algorithm performance and overhead results."""

    group_cols_algorithm = ['browser', 'algorithm', 'implementation', 'size']
    algorithm_statistics = (
        algorithm_data_frame.groupby(group_cols_algorithm)['time_in_ms']
        .agg(mean='mean', std='std', median='median', min='min', max='max')
        .round(3)
        .reset_index()
    )

    size_order = {s: i for i, s in enumerate(SIZES)}
    algorithm_statistics['size_order'] = algorithm_statistics['size'].map(size_order)
    algorithm_statistics = algorithm_statistics.sort_values(
        ['browser', 'algorithm', 'implementation', 'size_order']
    ).drop(columns='size_order')

    group_cols_overhead = ['browser', 'experiment', 'size', 'call_count']
    overhead_statistics = (
        overhead_data_frame.groupby(group_cols_overhead)['time_in_ms']
        .agg(mean='mean', std='std', median='median', min='min', max='max')
        .round(3)
        .reset_index()
    )

    overhead_statistics['size_order'] = overhead_statistics['size'].map(size_order)
    overhead_statistics = overhead_statistics.sort_values(
        ['browser', 'experiment', 'size_order', 'call_count']
    ).drop(columns='size_order')

    algorithm_statistics = algorithm_statistics.rename(columns={
        'mean': 'mean (ms)',
        'std': 'std (ms)',
        'median': 'median (ms)',
        'min': 'min (ms)',
        'max': 'max (ms)'
    })

    overhead_statistics = overhead_statistics.rename(columns={
        'mean': 'mean (ms)',
        'std': 'std (ms)',
        'median': 'median (ms)',
        'min': 'min (ms)',
        'max': 'max (ms)'
    })

    speedup_statistics = speedup_table(algorithm_data_frame)

    html = f"""
        <html>
        <head>
            <title>Benchmark Summary</title>
            <style>
                body {{ font-family: arial; padding: 2rem; }}
                h2 {{ margin-top: 2rem; }}
                table {{ border-collapse: collapse; width: 100%; margin-bottom: 2rem; }}
                th, td {{ border: 1px solid #ccc; padding: 0.45rem 0.65rem; text-align: left; }}
                th {{ background: #f3f3f3; }}
                tr:nth-child(even) {{ background: #fafafa; }}
            </style>
        </head>
        <body>
            <h1>Benchmark Summary</h1>
            <h2>JS vs WASM</h2>
            {algorithm_statistics.to_html(index=False)}
            <h2>Overhead</h2>
            {overhead_statistics.to_html(index=False)}
            <h2>WASM Speedup over JS</h2>
            <p>Note: A value above 1.0 indicates WASM is faster than JS. Green = WASM faster, Red = JS faster, no color = equal or omitted.</p>
            {table_color(speedup_statistics).to_html(index=False)}
        </body>
        </html>
    """

    path = 'summary/summary.html'
    os.makedirs('summary', exist_ok=True)
    with open(path, 'w') as f:
        f.write(html)
    print(f"saved: {path}")

def get_browser(p):
    if 'chrome' in p.lower():
        return 'chrome'
    elif 'firefox' in p.lower():
        return 'firefox'
    else:
        return None
    
def create_data_frame(paths):
    frames = []
    for p in paths:
        data_frame = pandas.read_csv(p)
        data_frame.columns = data_frame.columns.str.strip()
        browser = get_browser(p)
        if browser and 'browser' not in data_frame.columns:
            data_frame['browser'] = browser
        frames.append(data_frame)
    return pandas.concat(frames, ignore_index=True)

def main():
    print("Loading data and generating plots...")
    os.makedirs('plots', exist_ok=True)

    algorithm_files = [
        'result_data/js_wasm_results_chrome.csv',
        'result_data/js_wasm_results_firefox.csv',
    ]

    overhead_files = [
        'result_data/overhead_results_chrome.csv',
        'result_data/overhead_results_firefox.csv',
    ]

    algorithm_data_frame = create_data_frame(algorithm_files)

    algorithms = algorithm_data_frame['algorithm'].unique()
    browsers = algorithm_data_frame['browser'].unique()

    for algorithm in algorithms:
        for browser in browsers:
            sub = algorithm_data_frame[algorithm_data_frame['browser'] == browser]
            algorithm_plot_by_size(sub, algorithm, browser)
            js_wasm_speedup_plot(sub, algorithm, browser)
        browser_comparison_plot(algorithm_data_frame, algorithm)

    all_algorithms_speedup_plot(algorithm_data_frame)

    overhead_data_frame = create_data_frame(overhead_files)
    no_op_overhead_plot(overhead_data_frame)
    no_op_per_call_plot(overhead_data_frame)
    matrix_boundary_plot(overhead_data_frame)

    #overhead_summary(overhead_data_frame)
    #algorithm_summary(algorithm_data_frame)

    print("All plots generated and saved in the 'plots' directory.")

    create_summary_table(algorithm_data_frame, overhead_data_frame)

if __name__ == '__main__':
    main()