const WAREHOUSE_OPTIONS = [
  ["ALL", "全倉"],
  ["WH01", "WH01 大豐一般倉"],
  ["WH02", "WH02 大豐採品倉"],
  ["WH03", "WH03 新屋西藥倉(GDP)"],
  ["WH04", "WH04 內壢成章倉"],
  ["WH05", "WH05 大園新倉電商倉"],
  ["WH06", "WH06 高邊退貨倉"],
  ["WH07", "WH07 帳務及庶務倉"],
  ["WH08", "WH08 後送中心倉"]
];

export function renderDailyReportCenter(model) {
  return `
    <section class="report-center report-center--daily" data-report-page="daily">
      ${renderDailyFilters(model.filters)}
      ${renderDataStatus(model.dataStatus)}
      ${
        model.mode === "ALL_WAREHOUSES"
          ? renderWarehouseDailySummaries(model.warehouseSummaries)
          : `
            ${renderDimensionStrip(model.dimensions, model.filters.dimension)}
            ${renderDailyReportList(model.reports, model.selectedReport)}
            ${renderFormalReportTable(model.selectedReport, model.rows)}
          `
      }
    </section>
  `;
}

export function renderMonthlyReport(model, uiState) {
  const selectedDimension =
    model.dimensions.find((item) => item.name === uiState.selectedDimension) ||
    model.dimensions[0];
  const selectedMetric =
    selectedDimension.metrics.find(
      (item) => item.metricId === uiState.selectedMetricId
    ) || selectedDimension.metrics[0];
  return `
    <section class="report-center report-center--monthly" data-report-page="monthly">
      ${renderMonthlyFilters(model.filters)}
      ${renderDataStatus(model.dataStatus)}
      <div class="report-monthly-grid">
        ${model.dimensions
          .map((dimension) => renderMonthlyDimensionButton(dimension, selectedDimension.name))
          .join("")}
      </div>
      ${renderMonthlyDimensionDetail(selectedDimension, selectedMetric)}
      ${renderFormalTable(model.detailColumns, model.detailRows, "倉月報明細")}
    </section>
  `;
}

export function renderKeyNumbers(model, uiState) {
  const selectedDimension =
    model.dimensionSummaries.find(
      (item) => item.name === uiState.selectedDimension
    ) || model.dimensionSummaries[0];
  return `
    <section class="report-center report-center--key-numbers" data-report-page="key-numbers">
      ${renderKeyNumberFilters(model.filters)}
      ${renderDataStatus(model.dataStatus)}
      <div class="key-dimension-list">
        ${model.dimensionSummaries
          .map((dimension) => renderKeyDimensionButton(dimension, selectedDimension.name))
          .join("")}
      </div>
      ${
        selectedDimension.name === "成本費用／人效"
          ? renderExpenseEntry(model.expenseEntry)
          : renderKeyMetricGrid(selectedDimension, uiState.selectedMetricId)
      }
    </section>
  `;
}

export function renderMetricDrilldown(model) {
  if (!model) return renderEmptyState("找不到指定KPI");
  return `
    <section class="metric-drilldown" data-metric-drilldown="${escapeHtml(model.metricId)}">
      <header class="metric-drilldown__header">
        <div><span>${escapeHtml(model.dimension)}</span><h3>${escapeHtml(model.name)}</h3></div>
        <strong>${escapeHtml(model.actualLabel)}</strong>
      </header>
      <dl class="metric-facts">
        <div><dt>目標</dt><dd>${escapeHtml(model.targetLabel)}</dd></div>
        <div><dt>差距</dt><dd>${escapeHtml(model.gapLabel)}</dd></div>
        <div><dt>原因</dt><dd>${escapeHtml(model.cause)}</dd></div>
        <div><dt>影響</dt><dd>${escapeHtml(model.impact)}</dd></div>
        <div><dt>責任</dt><dd>${escapeHtml(model.owner)}</dd></div>
        <div><dt>SLA</dt><dd>${escapeHtml(model.sla)}</dd></div>
      </dl>
      <div class="source-document-strip"><strong>來源單據</strong>${model.sourceDocuments.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      ${renderFormalTable(model.dailyColumns, model.dailyRows, "每日明細")}
      ${renderOperationalNotes(model.notes, {
        entityType: "metric",
        entityId: model.metricId
      })}
    </section>
  `;
}

export function renderExpenseHierarchy(model, uiState) {
  const selectedCategory = uiState.selectedExpenseCategory || model.filters.categoryId;
  const showDetails = uiState.expenseLevel === "detail";
  return `
    <section class="expense-hierarchy" data-expense-level="${escapeHtml(uiState.expenseLevel || "summary")}">
      <nav class="expense-breadcrumb" aria-label="費用下鑽層級">
        ${model.levels.map((level) => `<span>${escapeHtml(level)}</span>`).join("<b>→</b>")}
      </nav>
      ${renderExpenseCategoryGrid(model.categories, selectedCategory)}
      ${showDetails ? renderExpenseGroupButtons(model.accounts, "account") : ""}
      ${showDetails ? renderExpenseGroupButtons(model.items, "item") : ""}
      ${showDetails ? renderFormalTable(
          model.detailColumns,
          model.detailRows.map(expenseToRow),
          "全部費用科目與原始單據"
        ) : ""}
    </section>
  `;
}

export function buildDailyExportSheets(model) {
  const selectedReport = model.selectedReport;
  return [
    {
      name: "Daily查詢結果",
      columns:
        selectedReport?.columns || ["倉別", "報表數", "P1件數", "資料狀態"],
      rows:
        model.mode === "WAREHOUSE"
          ? model.rows
          : model.warehouseSummaries.map((item) => [
              item.warehouseCode,
              item.reportCount,
              item.p1Count,
              item.dataStatus
            ])
    },
    {
      name: "報表與欄位口徑",
      columns: ["報表ID", "正式報表名稱", "管理方向", "主要KPI", "正式欄位"],
      rows: (model.mode === "WAREHOUSE" && selectedReport ? [selectedReport] : (model.reports || [])).map((item) => [
        item.id,
        item.name,
        item.dimension,
        item.primaryMetricId,
        item.columns.join("、")
      ])
    }
  ];
}

export function buildMonthlyExportSheets(model) {
  return [
    {
      name: "六大方向月報",
      columns: ["管理方向", "KPI", "本月實績", "目標", "狀態", "異常件數", "責任單位", "SLA"],
      rows: model.dimensions.flatMap((dimension) =>
        dimension.metrics.map((metric) => [
          dimension.name,
          metric.name,
          metric.actualLabel,
          metric.targetLabel,
          metric.status,
          metric.anomalyCount,
          metric.owner,
          metric.sla
        ])
      )
    },
    {
      name: "倉月報明細",
      columns: model.detailColumns,
      rows: model.detailRows
    },
    {
      name: "月報成本對帳",
      columns: ["營運總成本", "八類費用合計", "是否對帳", "單位成本／單", "單位成本／PCS"],
      rows: [[
        model.cost.total,
        model.cost.reconciliation.categoryTotal,
        model.cost.reconciliation.isBalanced ? "一致" : "不一致",
        model.cost.unitPerOrder,
        model.cost.unitPerPcs
      ]]
    }
  ];
}

export function buildKeyNumbersExportSheets(model, expenseModel) {
  return [
    {
      name: "營運關鍵數字",
      columns: ["管理方向", "KPI ID", "KPI", "實績", "目標", "狀態", "異常件數"],
      rows: model.dimensionSummaries.flatMap((dimension) =>
        dimension.metrics.map((metric) => [
          dimension.name,
          metric.metricId,
          metric.name,
          metric.actualLabel,
          metric.targetLabel,
          metric.status,
          metric.anomalyCount
        ])
      )
    },
    {
      name: "八類費用",
      columns: ["費用大類", "金額"],
      rows: expenseModel.categories.map((item) => [item.categoryId, item.amount])
    },
    {
      name: "全部費用明細",
      columns: expenseModel.detailColumns,
      rows: expenseModel.detailRows.map(expenseToRow)
    }
  ];
}

function renderDailyFilters(filters) {
  return `
    <form class="report-filter-bar" data-report-filter-form="daily">
      <label>營運日期<input type="date" value="${escapeHtml(filters.businessDate)}" data-daily-filter="businessDate"></label>
      <label>倉別<select data-daily-filter="warehouseCode">${renderWarehouseOptions(filters.warehouseCode)}</select></label>
      <label>管理方向<select data-daily-filter="dimension">${renderOptions(["全部方向", "進貨", "庫存", "訂單", "出貨", "物流", "成本費用／人效"], filters.dimension)}</select></label>
      <label>狀態<select data-daily-filter="status">${renderOptions(["全部狀態", "完成", "進行中", "待判定", "追蹤中"], filters.status)}</select></label>
      <label>單據／商品<input type="search" value="${escapeHtml(filters.keyword)}" data-daily-filter="keyword" placeholder="單據、SKU、LPN、責任人"></label>
      <div class="report-filter-actions"><button type="button" data-action="query-daily-report">查詢</button><button type="button" data-action="export-report-center">匯出Excel</button></div>
    </form>
  `;
}

function renderMonthlyFilters(filters) {
  return `
    <form class="report-filter-bar" data-report-filter-form="monthly">
      <label>年月<input type="month" value="${escapeHtml(filters.yearMonth)}" data-monthly-filter="yearMonth"></label>
      <label>倉別<select data-monthly-filter="warehouseCode">${renderWarehouseOptions(filters.warehouseCode)}</select></label>
      <label>比較<select data-monthly-filter="compareMode">${renderOptions(["上月", "去年同月"], filters.compareMode)}</select></label>
      <label>管理方向<select data-monthly-filter="dimension">${renderOptions(["全部方向", "進貨", "庫存", "訂單", "出貨", "物流", "成本費用／人效"], filters.dimension)}</select></label>
      <label>KPI／異常<input type="search" value="${escapeHtml(filters.keyword)}" data-monthly-filter="keyword"></label>
      <div class="report-filter-actions"><button type="button" data-action="query-monthly-report">查詢</button><button type="button" data-action="export-report-center">匯出Excel</button></div>
    </form>
  `;
}

function renderKeyNumberFilters(filters) {
  return `
    <form class="report-filter-bar" data-report-filter-form="key-numbers">
      <label>年月<input type="month" value="${escapeHtml(filters.yearMonth)}" data-key-filter="yearMonth"></label>
      <label>倉別<select data-key-filter="warehouseCode">${renderWarehouseOptions(filters.warehouseCode)}</select></label>
      <label>比較<select data-key-filter="compareMode">${renderOptions(["上月", "去年同月"], filters.compareMode)}</select></label>
      <label>管理方向<select data-key-filter="dimension">${renderOptions(["全部方向", "進貨", "庫存", "訂單", "出貨", "物流", "成本費用／人效"], filters.dimension)}</select></label>
      <label>KPI／責任單位<input type="search" value="${escapeHtml(filters.keyword)}" data-key-filter="keyword"></label>
      <div class="report-filter-actions"><button type="button" data-action="query-key-numbers">查詢</button><button type="button" data-action="export-report-center">匯出Excel</button></div>
    </form>
  `;
}

function renderDimensionStrip(dimensions, selected) {
  return `<div class="report-dimension-strip">${dimensions
    .map(
      (item) => `
        <button type="button" class="report-dimension-button ${item.name === selected ? "is-active" : ""}" data-report-dimension="${escapeHtml(item.name)}">
          <strong>${escapeHtml(item.name)}</strong><span>${item.updatedCount}/${item.reportCount}份已更新</span><small>P1 ${item.p1Count}件</small>
        </button>`
    )
    .join("")}</div>`;
}

function renderDailyReportList(reports, selectedReport) {
  return `<section class="daily-report-list" aria-label="每日必看報表">${reports
    .map(
      (item) => `
        <button type="button" class="report-list-button ${item.id === selectedReport?.id ? "is-active" : ""}" data-daily-report="${escapeHtml(item.id)}">
          <strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.primaryMetricId)}</span>
        </button>`
    )
    .join("")}</section>`;
}

function renderFormalReportTable(report, rows) {
  if (!report) return renderEmptyState("此倉目前沒有適用報表");
  return renderFormalTable(report.columns, rows, report.name);
}

function renderWarehouseDailySummaries(rows) {
  return `<section class="daily-warehouse-grid">${rows
    .map(
      (item) => `
        <button type="button" data-daily-warehouse="${escapeHtml(item.warehouseCode)}">
          <strong>${escapeHtml(item.warehouseCode)} ${escapeHtml(item.warehouseName)}</strong>
          <span>${item.reportCount}份報表</span><span>P1 ${item.p1Count}件</span><small>${escapeHtml(item.dataStatus)}</small>
        </button>`
    )
    .join("")}</section>`;
}

function renderMonthlyDimensionButton(dimension, selectedName) {
  const representative = dimension.metrics[0];
  return `
    <button type="button" class="monthly-dimension ${dimension.name === selectedName ? "is-active" : ""}" data-monthly-dimension="${escapeHtml(dimension.name)}">
      <span>${escapeHtml(dimension.name)}</span><strong>${escapeHtml(representative.actualLabel)}</strong><small>${dimension.anomalyCount}件異常</small>
    </button>`;
}

function renderMonthlyDimensionDetail(dimension, selectedMetric) {
  return `
    <section class="monthly-dimension-detail">
      <div class="monthly-metric-list">${dimension.metrics
        .map(
          (metric) => `
            <button type="button" class="monthly-metric ${metric.metricId === selectedMetric?.metricId ? "is-active" : ""}" data-monthly-metric="${escapeHtml(metric.metricId)}">
              <span>${escapeHtml(metric.name)}</span><strong>${escapeHtml(metric.actualLabel)}</strong><small>目標 ${escapeHtml(metric.targetLabel)}｜${escapeHtml(metric.status)}</small>
            </button>`
        )
        .join("")}</div>
      ${selectedMetric ? `<div class="monthly-analysis-grid">
        <section><h3>月內每日趨勢</h3>${renderTrendChart(selectedMetric.dailyTrend, `${selectedMetric.name}月內每日趨勢`)}</section>
        <section><h3>各倉分布</h3>${renderWarehouseDistribution(selectedMetric.warehouseDistribution)}</section>
        <section><h3>異常與責任</h3><dl><div><dt>原因</dt><dd>${escapeHtml(selectedMetric.cause)}</dd></div><div><dt>影響</dt><dd>${escapeHtml(selectedMetric.impact)}</dd></div><div><dt>責任</dt><dd>${escapeHtml(selectedMetric.owner)}</dd></div><div><dt>SLA</dt><dd>${escapeHtml(selectedMetric.sla)}</dd></div></dl></section>
      </div>` : ""}
    </section>`;
}

function renderKeyDimensionButton(dimension, selectedName) {
  const metric = dimension.representativeMetric;
  return `
    <button type="button" class="key-dimension ${dimension.name === selectedName ? "is-active" : ""}" data-key-dimension="${escapeHtml(dimension.name)}">
      <span>${escapeHtml(dimension.name)}</span><strong>${escapeHtml(metric?.actualLabel || "資料不足")}</strong><small>未達${dimension.missedCount}｜異常${dimension.anomalyCount}</small>
    </button>`;
}

function renderKeyMetricGrid(dimension, selectedMetricId) {
  return `<section class="key-metric-grid">${dimension.metrics
    .map(
      (metric) => `
        <button type="button" class="key-metric ${metric.metricId === selectedMetricId ? "is-active" : ""}" data-key-metric="${escapeHtml(metric.metricId)}">
          <header><strong>${escapeHtml(metric.name)}</strong><span>${escapeHtml(metric.status)}</span></header>
          <b>${escapeHtml(metric.actualLabel)}</b><small>目標 ${escapeHtml(metric.targetLabel)}｜差距 ${escapeHtml(metric.gapLabel)}</small>
          ${renderTrendChart(metric.dailyTrend, `${metric.name}趨勢`)}
        </button>`
    )
    .join("")}</section>`;
}

function renderExpenseEntry(summary) {
  return `
    <section class="expense-entry">
      <button type="button" class="expense-entry-summary" data-expense-entry>
        <span>重點費用</span><strong>${formatMoney(summary.total)}</strong><small>預算差異 ${formatSignedMoney(summary.budgetVariance)}｜異常${summary.anomalyCount}筆</small>
      </button>
    </section>`;
}

function renderExpenseCategoryGrid(categories, selectedCategory) {
  return `<div class="expense-category-grid">${categories
    .map(
      (item) => `
        <button type="button" class="expense-category ${item.categoryId === selectedCategory ? "is-active" : ""}" data-expense-category="${escapeHtml(item.categoryId)}">
          <span>${escapeHtml(item.categoryId)}</span><strong>${formatMoney(item.amount)}</strong>
        </button>`
    )
    .join("")}</div>`;
}

function renderExpenseGroupButtons(groups, type) {
  if (!groups.length) return "";
  const attribute = type === "account" ? "data-expense-account" : "data-expense-item";
  return `<div class="expense-group-list">${groups.map((item) => `<button type="button" ${attribute}="${escapeHtml(item.key)}"><span>${escapeHtml(item.key)}</span><strong>${formatMoney(item.amount)}</strong><small>${item.count}筆</small></button>`).join("")}</div>`;
}

function renderOperationalNotes(notes, entity) {
  return `
    <section class="operational-note-panel">
      <header><h3>營運註記</h3><span>${notes.length}筆</span></header>
      <div class="operational-note-list">${notes.map((note) => `<article><strong>${escapeHtml(note.responsibleUnit)}／${escapeHtml(note.responsiblePerson)}</strong><p>${escapeHtml(note.text)}</p><small>${escapeHtml(note.createdAt)}｜v${note.version}｜${escapeHtml(note.status)}</small></article>`).join("")}</div>
      <div class="operational-note-form" data-note-entity-type="${escapeHtml(entity.entityType)}" data-note-entity-id="${escapeHtml(entity.entityId)}">
        <input type="text" data-note-field="responsibleUnit" placeholder="責任單位">
        <input type="text" data-note-field="responsiblePerson" placeholder="責任人">
        <input type="date" data-note-field="dueDate">
        <textarea data-note-field="text" placeholder="原因、影響與後續處理"></textarea>
        <button type="button" data-action="save-operational-note">新增註記</button>
      </div>
    </section>`;
}

function renderFormalTable(columns, rows, title) {
  return `
    <section class="formal-report-table">
      <header><h3>${escapeHtml(title)}</h3><span>${rows.length}筆</span></header>
      <div class="report-table-scroll"><table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length}">資料不足</td></tr>`}</tbody></table></div>
    </section>`;
}

function renderTrendChart(points, label) {
  if (!points?.length) return `<div class="report-chart-empty">資料不足</div>`;
  const finite = points.map((point) => Number(point.value)).filter(Number.isFinite);
  if (!finite.length) return `<div class="report-chart-empty">資料不足</div>`;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const path = points.map((point, index) => {
    const x = points.length === 1 ? 50 : 5 + (index / (points.length - 1)) * 90;
    const y = max === min ? 50 : 90 - ((Number(point.value) - min) / (max - min)) * 75;
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg class="report-trend-chart" viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(label)}"><path d="${path}" fill="none" stroke="currentColor" stroke-width="3"></path></svg>`;
}

function renderWarehouseDistribution(rows) {
  const max = Math.max(...rows.map((row) => Number(row.value) || 0), 1);
  return `<div class="warehouse-distribution">${rows.map((row) => `<div><span>${escapeHtml(row.warehouseCode)}</span><i style="--bar:${Math.max((Number(row.value) || 0) / max, 0.04)}"></i><strong>${escapeHtml(row.valueLabel)}</strong></div>`).join("")}</div>`;
}

function renderDataStatus(status) {
  return `<div class="report-data-status" data-status="${escapeHtml(status)}">${escapeHtml(status)}</div>`;
}

function renderEmptyState(message) {
  return `<section class="report-empty"><strong>資料不足</strong><span>${escapeHtml(message)}</span></section>`;
}

function renderWarehouseOptions(selected) {
  return WAREHOUSE_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function renderOptions(options, selected) {
  return options.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function expenseToRow(row) {
  return [
    row.businessDate,
    row.warehouseCode,
    row.categoryId,
    row.accountName,
    row.expenseItem,
    row.purpose,
    row.amount,
    row.vendor,
    row.sourceDocumentId,
    row.responsibleUnit,
    row.applicantId,
    row.approvalStatus,
    row.note
  ];
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("zh-TW")} 元`;
}

function formatSignedMoney(value) {
  const amount = Number(value || 0);
  return `${amount >= 0 ? "+" : ""}${amount.toLocaleString("zh-TW")} 元`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
