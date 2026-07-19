const DIMENSIONS = ["進貨", "庫存", "訂單", "出貨", "物流", "成本費用／人效"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function option(value, current, label = value) {
  return `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

export function renderQuarterlyFilters(filters, warehouses) {
  return `<section class="quarter-filter-bar">
    <select data-quarter-filter="year" aria-label="年度">${option(2026, filters.year, "2026年")}</select>
    <select data-quarter-filter="quarter" aria-label="季度">${["Q1", "Q2", "Q3", "Q4"].map((item) => option(item, filters.quarter)).join("")}</select>
    <select data-quarter-filter="warehouseCode" aria-label="倉別">${option("ALL", filters.warehouseCode, "全倉")}${warehouses.map((item) => option(item.code, filters.warehouseCode, `${item.code} ${item.name}`)).join("")}</select>
    <select data-quarter-filter="dimension" aria-label="管理方向">${option("全部面向", filters.dimension)}${DIMENSIONS.map((item) => option(item, filters.dimension)).join("")}</select>
    <select data-quarter-filter="status" aria-label="季度狀態">${["全部狀態", "達標", "未達", "資料不足"].map((item) => option(item, filters.status)).join("")}</select>
    <input data-quarter-filter="keyword" value="${escapeHtml(filters.keyword)}" aria-label="KPI或專案關鍵字" placeholder="KPI／專案／責任單位" />
    <button type="button" class="action-button primary" data-action="query-quarter">查詢</button>
  </section>`;
}

export function renderQuarterlyKpiTab(model, uiState) {
  if (!model.metrics.length) return `<section class="quarter-empty"><strong>資料不足</strong><span>目前條件沒有可評估的季度KPI。</span></section>`;
  const metric = model.metrics.find((item) => item.metricId === uiState.selectedMetricId) || model.metrics[0];
  return `<section class="quarter-kpi-tab">
    <div class="quarter-summary-strip">
      ${model.dimensionSummaries.map((item) => `<button type="button" ${item.metricId ? `data-quarter-metric="${item.metricId}"` : "disabled"} class="${item.metricId === metric.metricId ? "is-active" : ""}">
        <strong>${item.dimension}</strong>
        <span>${item.achievedCount}/${item.evaluableCount}項達標</span>
        <small>${item.forecastRiskCount}項預估未達</small>
      </button>`).join("")}
    </div>
    <div class="quarter-metric-selector" role="list" aria-label="季度KPI">
      ${model.metrics.map((item) => `<button type="button" data-quarter-metric="${item.metricId}" class="${item.metricId === metric.metricId ? "is-active" : ""}"><span>${item.dimension}</span><strong>${item.metricName}</strong><em class="quarter-status ${statusClass(item.forecastStatus)}">${item.forecastStatus}</em></button>`).join("")}
    </div>
    <div class="quarter-main-grid">
      <section class="quarter-trend-panel" aria-label="${escapeHtml(metric.metricName)}十三週趨勢">${renderQuarterTrend(metric, uiState.granularity)}</section>
      <aside class="quarter-gap-panel">
        <span class="prototype-badge">${metric.dataStatus}</span>
        <h3>${metric.metricName}</h3>
        <dl>
          <div><dt>季度目標</dt><dd>${metric.targetLabel}</dd></div>
          <div><dt>累計實績</dt><dd>${metric.actualLabel}</dd></div>
          <div><dt>季末預估</dt><dd>${metric.forecastLabel}</dd></div>
          <div><dt>剩餘差距</dt><dd>${metric.gapLabel}</dd></div>
          <div><dt>後續節奏</dt><dd>${metric.paceLabel}</dd></div>
        </dl>
        <p>目標來源：${metric.target.source}｜版本 ${metric.target.version}</p>
        <p>公式版本：${metric.formulaVersion}｜更新 ${metric.updatedAt}</p>
      </aside>
    </div>
    <section class="quarter-cause-panel">
      <div class="panel-heading"><h3>未達原因</h3><span>原因、影響、責任與SLA必須同時存在</span></div>
      ${renderCauseTable(metric.causes)}
    </section>
    ${uiState.selectedPoint ? renderQuarterDrilldown(metric, uiState.selectedPoint) : ""}
  </section>`;
}

export function renderQuarterlyMilestoneTab(model) {
  if (!model.groups.length) return `<section class="quarter-empty"><strong>資料不足</strong><span>目前條件沒有符合的季度改善專案。</span></section>`;
  return `<section class="quarter-milestone-tab" data-quarter-view="milestones">
    ${model.groups.map((group) => `<article class="quarter-milestone-group">
      <header class="quarter-milestone-heading">
        <div><span>影響 KPI</span><h3>${escapeHtml(group.metricName)}</h3></div>
        <dl>
          <div><dt>累計實績</dt><dd>${escapeHtml(group.actualLabel)}</dd></div>
          <div><dt>季度目標</dt><dd>${escapeHtml(group.targetLabel)}</dd></div>
          <div><dt>季末預估</dt><dd>${escapeHtml(group.forecastLabel)}</dd></div>
          <div><dt>剩餘差距</dt><dd>${escapeHtml(group.gapLabel)}</dd></div>
        </dl>
        <em class="quarter-status ${statusClass(group.forecastStatus)}">${escapeHtml(group.forecastStatus)}</em>
      </header>
      ${group.projects.map((project) => `<section class="quarter-project">
        <div class="quarter-project-summary">
          <div><span>${escapeHtml(project.projectId)}</span><h4>${escapeHtml(project.projectName)}</h4></div>
          <dl>
            <div><dt>適用倉別</dt><dd>${escapeHtml(project.warehouseCodes.join("／"))}</dd></div>
            <div><dt>責任單位／人員</dt><dd>${escapeHtml(project.ownerUnit)}／${escapeHtml(project.ownerName)}</dd></div>
            <div><dt>期限</dt><dd>${escapeHtml(project.dueDate)}</dd></div>
            <div><dt>驗收證據</dt><dd>${project.evidenceCount}項</dd></div>
          </dl>
          <div class="quarter-project-statuses">
            <span>交付進度 <strong>${escapeHtml(project.deliveryProgressLabel)}</strong></span>
            <em class="quarter-status ${project.deliveryStatus === "交付完成" ? "is-ok" : "is-warning"}">${escapeHtml(project.deliveryStatus)}</em>
            <span>成效驗證</span>
            <em class="quarter-status ${project.effectClass}">${escapeHtml(project.effectStatus)}</em>
          </div>
        </div>
        <div class="quarter-gantt-wrap">
          <div class="quarter-gantt-labels"><span>13週執行排程</span>${model.weeks ? model.weeks.map((week) => `<i>${week.label}</i>`).join("") : ""}</div>
          <div class="quarter-gantt" aria-label="${escapeHtml(project.projectName)}十三週甘特">
            ${project.ganttWeeks.map((week) => `<span data-gantt-week="${week.id}" class="${week.state}" title="${week.label}">${week.label}</span>`).join("")}
          </div>
          <div class="quarter-milestone-list">${project.milestones.map((milestoneItem) => `<span><i class="${milestoneItem.accepted ? "is-accepted" : "is-pending"}"></i>${escapeHtml(milestoneItem.name)} W${String(milestoneItem.startWeek).padStart(2, "0")}–W${String(milestoneItem.endWeek).padStart(2, "0")}｜${milestoneItem.accepted ? "已驗收" : "待驗收"}</span>`).join("")}</div>
        </div>
        <div class="quarter-effect-grid">
          <dl><dt>改善前基準</dt><dd>${escapeHtml(project.baselineLabel)}</dd></dl>
          <dl><dt>目前觀察值</dt><dd>${escapeHtml(project.observedLabel)}</dd></dl>
          <dl><dt>預期改善</dt><dd>${escapeHtml(project.expectedLabel)}</dd></dl>
          <dl><dt>實際改善</dt><dd>${escapeHtml(project.improvementLabel)}</dd></dl>
          <dl><dt>比較期間</dt><dd>${escapeHtml(project.observationWindow)}</dd></dl>
          <dl><dt>排除條件</dt><dd>${escapeHtml(project.excludedPeriods)}</dd></dl>
        </div>
        <div class="quarter-project-evidence">
          <span>${escapeHtml(project.approvalMetadata)}</span>
          <button type="button" class="action-button" data-project-evidence="${project.projectId}">驗收證據 ${project.evidenceCount}</button>
        </div>
      </section>`).join("")}
    </article>`).join("")}
  </section>`;
}

function renderQuarterTrend(metric, granularity) {
  const points = granularity === "month" ? metric.monthPoints : metric.weekPoints;
  const actualPoints = points.filter((point) => !point.projected).map((point, index) => `${pointX(index, points.length)},${250 - point.normalizedHeight * 2}`).join(" ");
  const forecastPoints = points.map((point, index) => point.projected || index === points.findIndex((item) => item.projected) - 1 ? `${pointX(index, points.length)},${250 - point.normalizedHeight * 2}` : null).filter(Boolean).join(" ");
  return `<div class="quarter-chart">
    <div class="quarter-chart-head">
      <div><span>${metric.yearQuarter}</span><h3>${metric.metricName}｜${granularity === "month" ? "三個月" : "13週"}趨勢</h3></div>
      <div class="quarter-chart-actions"><button type="button" class="${granularity === "week" ? "is-active" : ""}" data-quarter-granularity="week">13週</button><button type="button" class="${granularity === "month" ? "is-active" : ""}" data-quarter-granularity="month">月檢視</button></div>
    </div>
    <div class="quarter-svg-wrap">
      <svg viewBox="0 0 1040 280" role="img" aria-label="${escapeHtml(metric.metricName)}趨勢圖">
        <line class="quarter-target-line" x1="24" y1="72" x2="1016" y2="72"></line>
        <text x="28" y="62">目標 ${escapeHtml(metric.targetLabel)}</text>
        <polyline class="quarter-actual-line" points="${actualPoints}"></polyline>
        <polyline class="quarter-forecast-line" points="${forecastPoints}"></polyline>
      </svg>
      <div class="quarter-point-grid">${points.map((point) => `<button type="button" data-quarter-point="${point.id}" class="${point.projected ? "is-projected" : ""}" aria-label="${point.label} ${point.valueLabel}"><i style="height:${point.normalizedHeight}%"></i><strong>${point.valueLabel}</strong><span>${point.label}</span></button>`).join("")}</div>
    </div>
    <div class="quarter-chart-legend"><span><i class="actual"></i>實績</span><span><i class="target"></i>目標</span><span><i class="forecast"></i>季末預估</span></div>
  </div>`;
}

function pointX(index, length) {
  return 24 + index * (992 / Math.max(length - 1, 1));
}

function renderCauseTable(causes) {
  if (!causes.length) return `<div class="quarter-no-cause">目前條件無未結原因；仍可點擊趨勢資料點回查來源。</div>`;
  return `<div class="table-wrap quarter-cause-table"><table><thead><tr><th>倉別</th><th>作業</th><th>開始偏離</th><th>具體狀況</th><th>營運影響</th><th>責任單位</th><th>SLA</th><th>來源</th></tr></thead><tbody>${causes.map((cause) => `<tr><td>${cause.warehouseCode}</td><td>${cause.operation}</td><td>${cause.firstWeek}</td><td>${cause.condition}</td><td>${cause.impact}</td><td>${cause.owner}</td><td>${cause.sla}</td><td><button type="button" data-quarter-point="${cause.firstWeek}">${cause.sourceRecord}</button></td></tr>`).join("")}</tbody></table></div>`;
}

function renderQuarterDrilldown(metric, selectedPoint) {
  const point = [...metric.weekPoints, ...metric.monthPoints].find((item) => item.id === selectedPoint) || metric.weekPoints[0];
  const cause = metric.causes[0];
  return `<section class="quarter-drilldown">
    <div class="panel-heading"><div><span>稽核下鑽</span><h3>${metric.metricName}｜${point.label}</h3></div><em>${point.valueLabel}</em></div>
    <div class="quarter-drill-grid">
      <dl><dt>月份／營運日期</dt><dd>${point.month || point.label}／${cause?.businessDate || "依來源明細"}</dd></dl>
      <dl><dt>每日必看報表</dt><dd>${cause?.dailyReport || metric.source}</dd></dl>
      <dl><dt>單據／SKU</dt><dd>${cause?.sourceRecord || "依來源明細"}／${cause?.sku || "依來源明細"}</dd></dl>
      <dl><dt>LPN／批號效期</dt><dd>${cause?.lpn || "依來源明細"}／${cause?.batchExpiry || "依來源明細"}</dd></dl>
      <dl><dt>儲位／PDA事件</dt><dd>${cause?.location || "依來源明細"}／${cause?.pdaEvent || "依來源明細"}</dd></dl>
      <dl><dt>人員／責任節點</dt><dd>${cause?.person || "依來源明細"}／${cause?.responsibilityNode || "依來源明細"}</dd></dl>
    </div>
  </section>`;
}

function statusClass(status) {
  if (status === "達標") return "is-ok";
  if (status === "未達") return "is-danger";
  return "is-insufficient";
}

export function buildCurrentQuarterExport(model, selectedMetricId) {
  const selected = model.metrics.find((metric) => metric.metricId === selectedMetricId);
  const metrics = selected ? [selected] : model.metrics;
  return {
    title: `WMS季度報表_${model.filters.year}${model.filters.quarter}`,
    columns: ["季度", "倉別", "管理方向", "KPI ID", "KPI", "累計實績", "目標", "季末預估", "預估狀態", "公式版本", "資料狀態"],
    rows: metrics.map((metric) => [metric.yearQuarter, metric.warehouseCodes.join("／"), metric.dimension, metric.metricId, metric.metricName, metric.actualLabel, metric.targetLabel, metric.forecastLabel, metric.forecastStatus, metric.formulaVersion, metric.dataStatus])
  };
}

export function buildQuarterWorkbookSheets(kpiModel, milestoneModel) {
  const quarterLabel = `${kpiModel.filters.year}${kpiModel.filters.quarter}`;
  const metricById = new Map(kpiModel.metrics.map((metric) => [metric.metricId, metric]));
  const projectRows = milestoneModel.groups.flatMap((group) => group.projects.map((project) => {
    const metric = metricById.get(group.metricId);
    return [quarterLabel, project.warehouseCodes.join("／"), project.projectId, group.metricId, project.projectName, project.ownerUnit, project.ownerName, project.dueDate, project.deliveryProgressLabel, project.deliveryStatus, project.evidenceCount, milestoneModel.dataStatus, metric?.formulaVersion || "依KPI字典", metric?.target.version || "依KPI字典"];
  }));
  const effectRows = milestoneModel.groups.flatMap((group) => group.projects.map((project) => {
    const metric = metricById.get(group.metricId);
    return [quarterLabel, project.warehouseCodes.join("／"), project.projectId, group.metricId, project.baselineLabel, project.observedLabel, project.expectedLabel, project.improvementLabel, project.effectStatus, project.observationWindow, project.excludedPeriods, project.approvalMetadata, milestoneModel.dataStatus, metric?.formulaVersion || "依KPI字典", metric?.target.version || "依KPI字典"];
  }));
  return [
    {
      name: "季度營運KPI",
      columns: ["季度", "倉別範圍", "管理方向", "KPI ID", "KPI", "累計實績", "目標", "季末預估", "剩餘差距", "預估狀態", "資料狀態", "公式版本", "目標版本", "資料來源"],
      rows: kpiModel.metrics.map((metric) => [quarterLabel, metric.warehouseCodes.join("／"), metric.dimension, metric.metricId, metric.metricName, metric.actualLabel, metric.targetLabel, metric.forecastLabel, metric.gapLabel, metric.forecastStatus, metric.dataStatus, metric.formulaVersion, metric.target.version, metric.source])
    },
    {
      name: "13週趨勢明細",
      columns: ["季度", "倉別範圍", "KPI ID", "KPI", "週次", "月份", "實績／預估", "數值", "資料狀態", "公式版本", "資料來源"],
      rows: kpiModel.metrics.flatMap((metric) => metric.weekPoints.map((point) => [quarterLabel, metric.warehouseCodes.join("／"), metric.metricId, metric.metricName, point.id, point.month, point.projected ? "預估" : "實績", point.valueLabel, metric.dataStatus, metric.formulaVersion, metric.source]))
    },
    {
      name: "倉別目標分解",
      columns: ["季度", "KPI ID", "KPI", "倉別", "核定目標", "目標來源", "目標版本", "資料狀態", "公式版本"],
      rows: kpiModel.metrics.flatMap((metric) => metric.targetAllocations.map((allocation) => [quarterLabel, metric.metricId, metric.metricName, allocation.warehouseCode, allocation.approvedTarget, allocation.source, metric.target.version, metric.dataStatus, metric.formulaVersion]))
    },
    {
      name: "未達原因與責任",
      columns: ["季度", "KPI ID", "倉別", "作業", "開始偏離", "具體狀況", "營運影響", "責任單位", "SLA", "營運日期", "每日必看報表", "來源單據", "SKU", "LPN", "批號／效期", "儲位", "PDA事件", "人員", "責任節點", "資料狀態", "公式版本"],
      rows: kpiModel.metrics.flatMap((metric) => metric.causes.map((cause) => [quarterLabel, metric.metricId, cause.warehouseCode, cause.operation, cause.firstWeek, cause.condition, cause.impact, cause.owner, cause.sla, cause.businessDate, cause.dailyReport, cause.sourceRecord, cause.sku, cause.lpn, cause.batchExpiry, cause.location, cause.pdaEvent, cause.person, cause.responsibilityNode, metric.dataStatus, metric.formulaVersion]))
    },
    {
      name: "專案里程碑",
      columns: ["季度", "倉別範圍", "專案 ID", "影響 KPI ID", "專案", "責任單位", "責任人", "期限", "交付進度", "交付狀態", "驗收證據數", "資料狀態", "公式版本", "目標版本"],
      rows: projectRows
    },
    {
      name: "專案成效驗證",
      columns: ["季度", "倉別範圍", "專案 ID", "影響 KPI ID", "改善前基準", "目前觀察值", "預期改善", "實際改善", "成效狀態", "比較期間", "排除條件", "核定資訊", "資料狀態", "公式版本", "目標版本"],
      rows: effectRows
    },
    {
      name: "KPI與公式口徑",
      columns: ["季度", "KPI ID", "KPI", "管理方向", "彙總方式", "改善方向", "單位", "適用倉別", "資料狀態", "公式版本", "目標版本", "目標來源", "資料來源", "下鑽欄位"],
      rows: kpiModel.metrics.map((metric) => [quarterLabel, metric.metricId, metric.metricName, metric.dimension, metric.aggregationMode, metric.direction, metric.unit, metric.applicableWarehouses.join("／"), metric.dataStatus, metric.formulaVersion, metric.target.version, metric.target.source, metric.source, metric.drilldownDimensions.join("→")])
    }
  ];
}
