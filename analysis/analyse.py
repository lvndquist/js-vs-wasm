import argparse
import os
import pandas
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

SIZES = ['small', 'medium', 'large', 'very_large']
SIZES_LABEL = {'small': 'Small', 'medium': 'Medium', 'large': 'Large', 'very_large': 'Very Large'}

def load_csv(paths):
    frames = []
    for p in paths:
        data_frame = pandas.read_csv(p)
        data_frame.columns = data_frame.columns.str.strip()
        frames.append(data_frame)
    return pandas.concat(frames, ignore_index=True)

def save_plot(figure, name):
    path = os.path.join("plots", name)
    figure.savefig(path, dpi=200)
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
 
    fig, ax = plt.subplots(figsize=(10, 6))
 
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
    save_plot(fig, f'{algorithm}_{browser}_by_size.png')

def plot_js_wasm_speedup(data_frame, algorithm, browser):
    sub = data_frame[data_frame['algorithm'] == algorithm].copy()
 
    sizes = ordered_by_size(sub)
    s = statistics(sub, ['size', 'implementation'])

    speedups = []
    for size in sizes:
        js_row = s[(s['size'] == size) & (s['implementation'] == 'js')]
        wasm_row = s[(s['size'] == size) & (s['implementation'] == 'wasm')]
        if len(js_row) and len(wasm_row):
            speedups.append(js_row['mean'].values[0] / wasm_row['mean'].values[0])
        else:
            speedups.append(None)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(
        [SIZES_LABEL[s] for s in sizes], speedups,
        marker='o', linewidth=2
    )

    ax.axhline(1.0, color='gray', linestyle='--', linewidth=1, label='No difference')
    ax.set_xlabel('Input Size')
    ax.set_ylabel('JS time / WASM time (Speedup)')
    title = f'{algorithm.replace("_", " ").title()} WASM Speedup over JS {browser.title()}'
    ax.set_title(title)
    ax.legend()
    fig.tight_layout()
 
    save_plot(fig, f'{algorithm}_{browser}_speedup.png')

def browser_comparison_plot(data_frame, algorithm):
    pass
 