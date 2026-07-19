function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pointButton(chart, point, content, className = "") {
  return `<button type="button" class="dashboard-point ${className} status-${escapeHtml(point.status)}" data-dashboard-point="${escapeHtml(chart.id)}|${escapeHtml(point.id)}" aria-label="查看${escapeHtml(point.label)}明細">${content}</button>`;
}

function renderBar(chart) {
  const maximum = Math.max(...chart.points.map((point) => Number(point.value) || 0), 1);
  return `<div class="dashboard-bar-chart">${chart.points.map((point) => pointButton(chart, point, `<span>${escapeHtml(point.label)}</span><i style="--bar:${Math.max(4, Number(point.value) / maximum * 100)}%"></i><strong>${escapeHtml(point.valueLabel)}</strong>`)).join("")}</div>`;
}

function renderLine(chart) {
  const values = chart.points.map((point) => Number(point.value) || 0);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = maximum - minimum || 1;
  const coordinates = chart.points.map((point, index) => {
    const x = chart.points.length === 1 ? 50 : 8 + index * (84 / (chart.points.length - 1));
    const y = 84 - ((Number(point.value) - minimum) / span * 62);
    return `${x},${y}`;
  }).join(" ");
  return `<div class="dashboard-line-chart"><svg viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(chart.title)}趨勢"><line x1="6" y1="84" x2="94" y2="84"/><polyline points="${coordinates}"/></svg><div class="dashboard-line-points">${chart.points.map((point) => pointButton(chart, point, `<span>${escapeHtml(point.label)}</span><strong>${escapeHtml(point.valueLabel)}</strong>`)).join("")}</div></div>`;
}

function renderDonut(chart) {
  const total = chart.points.reduce((sum, point) => sum + Number(point.value || 0), 0) || 1;
  let cursor = 0;
  const colors = ["#18b27f", "#f2b72b", "#eb6570", "#62a7e8", "#9b78d0"];
  const segments = chart.points.map((point, index) => {
    const start = cursor;
    cursor += Number(point.value || 0) / total * 360;
    return `${colors[index % colors.length]} ${start}deg ${cursor}deg`;
  }).join(",");
  return `<div class="dashboard-donut-layout"><div class="dashboard-donut" style="--segments:${segments}"><strong>${chart.points.length}</strong><span>狀態</span></div><div class="dashboard-donut-list">${chart.points.map((point) => pointButton(chart, point, `<span>${escapeHtml(point.label)}</span><strong>${escapeHtml(point.valueLabel)}</strong>`)).join("")}</div></div>`;
}

function renderFunnel(chart) {
  const maximum = Math.max(...chart.points.map((point) => Number(point.value) || 0), 1);
  return `<div class="dashboard-funnel">${chart.points.map((point) => pointButton(chart, point, `<span>${escapeHtml(point.label)}</span><i style="--width:${Math.max(28, Number(point.value) / maximum * 100)}%"></i><strong>${escapeHtml(point.valueLabel)}</strong>`)).join("")}</div>`;
}

function renderHeatmap(chart) {
  return `<div class="dashboard-heatmap">${chart.points.map((point) => pointButton(chart, point, `<span>${escapeHtml(point.label)}</span><strong>${escapeHtml(point.valueLabel)}</strong>`)).join("")}</div>`;
}

function renderChart(chart) {
  if (!chart.points.length) {
    return `<article class="dashboard-chart dashboard-chart-empty"><header><div><h3>${escapeHtml(chart.title)}</h3></div><span>${escapeHtml(chart.warehouseCode)}</span></header><div class="dashboard-empty-state">資料不足</div></article>`;
  }
  const body = chart.type === "line" ? renderLine(chart)
    : chart.type === "donut" ? renderDonut(chart)
      : chart.type === "funnel" ? renderFunnel(chart)
        : chart.type === "heatmap" ? renderHeatmap(chart)
          : renderBar(chart);
  return `<article class="dashboard-chart dashboard-chart-${escapeHtml(chart.type)}"><header><div><h3>${escapeHtml(chart.title)}</h3><p>${escapeHtml(chart.subtitle)}</p></div><span>可點擊下鑽</span></header>${body}</article>`;
}

function findSelectedPoint(model, selection) {
  if (!selection) return null;
  const chart = model.charts.find((item) => item.id === selection.chartId);
  const point = chart?.points.find((item) => item.id === selection.pointId);
  return point ? { chart, point } : null;
}

function renderDetail(selected) {
  if (!selected) return "";
  const { chart, point } = selected;
  return `<section class="dashboard-detail-view">
    <header><div><small>${escapeHtml(chart.title)}</small><h3>${escapeHtml(point.warehouseCode)}｜${escapeHtml(point.label)}｜${escapeHtml(point.valueLabel)}</h3></div><button type="button" data-dashboard-detail-close aria-label="關閉下鑽">×</button></header>
    <div class="dashboard-detail-grid">
      <div><span>現場狀況</span><strong>${escapeHtml(point.cause)}</strong></div>
      <div><span>營運影響</span><strong>${escapeHtml(point.impact)}</strong></div>
      <div><span>責任節點</span><strong>${escapeHtml(point.ownerNode)}｜${escapeHtml(point.owner)}</strong></div>
      <div><span>處理時效</span><strong>${escapeHtml(point.sla)}</strong></div>
    </div>
    <p><strong>回查路徑：</strong>${escapeHtml(point.drilldown)}</p>
  </section>`;
}

export function renderDashboardCharts(model, selection) {
  const selected = findSelectedPoint(model, selection);
  return `<div class="dashboard-data-strip"><span>${escapeHtml(model.dataStatus)}</span><span>資料期間 ${escapeHtml(model.period)}</span><span>更新 ${escapeHtml(model.updatedAt)}</span><span>公式版本 ${escapeHtml(model.formulaVersion)}</span></div>
    <div class="dashboard-kpi-strip">${model.kpis.map(([label, value, note]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`).join("")}</div>
    <div class="dashboard-chart-grid">${model.charts.map(renderChart).join("")}</div>
    ${renderDetail(selected)}`;
}
