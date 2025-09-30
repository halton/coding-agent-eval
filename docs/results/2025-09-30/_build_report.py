import csv, statistics, os
from collections import defaultdict

base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "results.csv")
html_path = os.path.join(base_dir, "report.html")

rows = []
with open(csv_path, newline='') as f:
    r = csv.DictReader(f)
    for row in r:
        row["RunId"] = int(row["RunId"]) if row["RunId"].isdigit() else 0
        s = row["Success(Y/N)"].strip().upper()
        row["Skip"] = (s == "SKIP")
        row["Success"] = (s == "Y")
        try:
            row["TimeMin"] = float(row["Time(min)"])
        except:
            row["TimeMin"] = None
        rows.append(row)

agents = sorted(set(r["Agent"] for r in rows))
by_agent = defaultdict(list)
for row in rows:
    by_agent[row["Agent"]].append(row)

summary = []
for a in agents:
    data = [d for d in by_agent[a] if not d["Skip"]]
    total = len(data)
    succ = sum(1 for d in data if d["Success"])
    sr = (succ / total * 100.0) if total else 0.0
    times = [d["TimeMin"] for d in data if d["TimeMin"] is not None]
    med = statistics.median(times) if times else None
    summary.append({"agent": a, "pass": succ, "total": total, "success_rate": sr, "median_time": med})

def bar_chart_svg(values, labels, width=560, height=200, unit=""):
    if not values: return "<svg/>"
    maxv = max(values) or 1
    bar_h = max(12, int(height / (len(values)*1.5)))
    gap = bar_h // 2
    svg = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}">']
    y = gap
    for v, lab in zip(values, labels):
        w = int((v / maxv) * (width - 160))
        svg.append(f'<text x="6" y="{y+bar_h-4}" font-size="12" font-family="system-ui">{lab}</text>')
        svg.append(f'<rect x="120" y="{y}" width="{w}" height="{bar_h}" fill="#4F46E5" rx="4"></rect>')
        svg.append(f'<text x="{120+w+6}" y="{y+bar_h-4}" font-size="12" font-family="system-ui">{v:.1f}{unit}</text>')
        y += bar_h + gap
    svg.append('</svg>')
    return "\n".join(svg)

succ_values = [s["success_rate"] for s in summary]
time_values = [s["median_time"] or 0.0 for s in summary]
labels = [s["agent"] for s in summary]

succ_svg = bar_chart_svg(succ_values, labels, unit="%")
time_svg = bar_chart_svg(time_values, labels, unit="m")

def esc(x): return (str(x).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"))

table_rows = "\n".join(
    f"<tr><td>{esc(s['agent'])}</td>"
    f"<td>{s['pass']}/{s['total']}</td>"
    f"<td>{s['success_rate']:.1f}%</td>"
    f"<td>{'—' if s['median_time'] is None else f'{s['median_time']:.2f} m'}</td></tr>"
    for s in summary
)

run_rows = "\n".join(
    f"<tr><td>{esc(r['RunId'])}</td><td>{esc(r['Agent'])}</td>"
    f"<td>{'SKIP' if r['Skip'] else ('Y' if r['Success'] else 'N')}</td>"
    f"<td>{'—' if r['TimeMin'] is None else f'{r['TimeMin']:.2f}'}</td></tr>"
    for r in sorted(rows, key=lambda x: (x['RunId'], x['Agent']))
)

html = f"""<!doctype html>
<meta charset="utf-8">
<title>CLI Coding Agents — Evaluation Report</title>
<style>
  :root {{ --fg:#0f172a; --muted:#64748b; --card:#f8fafc; --accent:#4F46E5; }}
  body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:var(--fg); margin:24px; }}
  h1 {{ margin: 0 0 4px 0; }}
  .muted {{ color: var(--muted); }}
  .grid {{ display:grid; grid-template-columns: 1fr 1fr; gap: 24px; }}
  .card {{ background:var(--card); padding:16px; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.06); }}
  table {{ width:100%; border-collapse: collapse; }}
  th, td {{ padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }}
  th {{ font-weight:600; }}
  .mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }}
</style>

<h1>CLI Coding Agents — Evaluation Report</h1>
<p class="muted">Task: <b class="mono">{esc(os.environ.get('TASK','')) or 'n/a'}</b> • Runs per agent: <b>{len(set(r['RunId'] for r in rows))}</b></p>

<div class="grid">
  <div class="card">
    <h2>Success Rate</h2>
    {succ_svg}
  </div>
  <div class="card">
    <h2>Median Time (minutes)</h2>
    {time_svg}
  </div>
</div>

<div class="card" style="margin-top:24px">
  <h2>Per-agent Summary</h2>
  <table>
    <thead><tr><th>Agent</th><th>Pass</th><th>Success Rate</th><th>Median Time</th></tr></thead>
    <tbody>
      {table_rows}
    </tbody>
  </table>
</div>

<div class="card" style="margin-top:24px">
  <h2>All Runs</h2>
  <table class="mono">
    <thead><tr><th>RunId</th><th>Agent</th><th>Success</th><th>Time (min)</th></tr></thead>
    <tbody>
      {run_rows}
    </tbody>
  </table>
</div>
"""
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Wrote", html_path)
