import { WAREHOUSES } from "./wms-domain.mjs";
import { getWarehouseDataStatus } from "./wms-warehouse-profiles.mjs";
import {
  aggregateQuarter,
  evaluateQuarterTarget,
  calculateQuarterPace,
  forecastQuarter,
  calculateMilestoneProgress,
  evaluateProjectEffect
} from "./wms-quarterly.mjs";

export const QUARTER_WEEKS = Array.from({ length: 13 }, (_, index) => ({
  week: index + 1,
  id: `W${String(index + 1).padStart(2, "0")}`,
  label: `W${String(index + 1).padStart(2, "0")}`,
  month: index < 4 ? "7月" : index < 8 ? "8月" : "9月"
}));

const ALL_WAREHOUSES = WAREHOUSES
  .map((warehouse) => warehouse.code)
  .filter((warehouseCode) => getWarehouseDataStatus(warehouseCode) !== "待確認");
const AGING_WAREHOUSES = ["WH01", "WH04", "WH06"];

const METRIC_CONFIGS = [
  ratioMetric("inbound_receipt_rate", "到貨達成率", "進貨", 0.98, [0.965, 0.971, 0.974, 0.979, 0.981, 0.976, 0.969, 0.973, 0.978], ALL_WAREHOUSES, "INBOUND-1.0"),
  ratioMetric("gdp_acceptance_rate", "GDP允收完成率", "進貨", 0.97, [0.95, 0.956, 0.962, 0.958, 0.967, 0.971, 0.965, 0.968, 0.972], ["WH03"], "GDP-1.0"),
  ratioMetric("available_inventory_rate", "可用庫存率", "庫存", 0.93, [0.918, 0.921, 0.924, 0.928, 0.926, 0.929, 0.931, 0.932, 0.934], ALL_WAREHOUSES, "INV-1.0"),
  snapshotMetric("aging_90d_pcs", "90天未異動PCS", "庫存", 1000, [1460, 1435, 1410, 1392, 1374, 1350, 1326, 1304, 1280], AGING_WAREHOUSES, "AGING-1.0"),
  ratioMetric("order_fulfillment_rate", "訂單履約率", "訂單", 0.98, [0.972, 0.974, 0.976, 0.973, 0.977, 0.979, 0.981, 0.978, 0.975], ALL_WAREHOUSES, "ORDER-1.0"),
  ratioMetric("commitment_ship_rate", "出貨時效達成率", "出貨", 0.98, [0.968, 0.971, 0.975, 0.978, 0.976, 0.972, 0.969, 0.971, 0.974], ALL_WAREHOUSES, "SHIP-1.0"),
  ratioMetric("ontime_handoff_rate", "準時交接率", "物流", 0.97, [0.961, 0.964, 0.969, 0.971, 0.967, 0.965, 0.968, 0.972, 0.969], ALL_WAREHOUSES, "LOGISTICS-1.0"),
  weightedMetric("weighted_productivity", "標準工時加權效率", "成本費用／人效", 1, [0.91, 0.925, 0.94, 0.952, 0.948, 0.955, 0.963, 0.971, 0.968], ALL_WAREHOUSES, "LABOR-1.0"),
  ratioMetric("reporting_completeness", "報工完整率", "成本費用／人效", 0.98, [0.95, 0.958, 0.963, 0.969, 0.972, 0.975, 0.979, 0.981, 0.982], ALL_WAREHOUSES, "LABOR-1.0"),
  ratioMetric("return_disposition_rate", "退貨處置完成率", "庫存", 0.95, [0.88, 0.892, 0.901, 0.91, 0.918, 0.925, 0.932, 0.938, 0.942], ["WH06"], "RETURN-1.0")
];

function ratioMetric(metricId, metricName, dimension, target, series, applicableWarehouses, formulaVersion) {
  return {
    metricId, metricName, dimension, aggregationMode: "RATIO_RECALCULATE", direction: "HIGHER_IS_BETTER",
    unit: "%", target: approvedTarget(target, "HIGHER_IS_BETTER"), series, applicableWarehouses, formulaVersion,
    source: "Daily_DB月結快照", cohortId: `${metricId}-2026Q3`, dataStatus: "原型資料"
  };
}

function snapshotMetric(metricId, metricName, dimension, target, series, applicableWarehouses, formulaVersion) {
  return {
    metricId, metricName, dimension, aggregationMode: "PERIOD_END_SNAPSHOT", forecastMethod: "LAST_VALID_SNAPSHOT",
    direction: "LOWER_IS_BETTER", unit: "PCS", target: approvedTarget(target, "LOWER_IS_BETTER"), series,
    applicableWarehouses, formulaVersion, source: "WMS庫存快照", cohortId: `${metricId}-2026Q3`, dataStatus: "原型資料"
  };
}

function weightedMetric(metricId, metricName, dimension, target, series, applicableWarehouses, formulaVersion) {
  return {
    metricId, metricName, dimension, aggregationMode: "WEIGHTED_AVERAGE", direction: "HIGHER_IS_BETTER",
    unit: "%", target: approvedTarget(target, "HIGHER_IS_BETTER"), series, applicableWarehouses, formulaVersion,
    source: "PDA任務／報工事件", cohortId: `${metricId}-2026Q3`, dataStatus: "原型資料"
  };
}

function approvedTarget(value, direction) {
  return {
    approved: true,
    source: "主管核定",
    value,
    direction,
    version: "2026Q3-1",
    approvedBy: "物流部主管",
    approvedAt: "2026-06-25"
  };
}

const CAUSES = [
  { metricId: "commitment_ship_rate", warehouseCode: "WH05", operation: "電商包裝", firstWeek: "W06", condition: "EXSD前仍有待包裝訂單", impact: "68筆訂單、420PCS存在逾時風險", owner: "包裝組", sla: "當日13:00前", sourceRecord: "SO260716001", businessDate: "2026-07-16", dailyReport: "每日出貨總表", sku: "DP-C001", lpn: "BX260716-001", batchExpiry: "B260702／2028-07-01", location: "PK-A03", pdaEvent: "包裝完成09:18", person: "EC-024", responsibilityNode: "包裝交接" },
  { metricId: "gdp_acceptance_rate", warehouseCode: "WH03", operation: "GDP進貨允收", firstWeek: "W03", condition: "進貨效期早於庫內最短效期", impact: "980PCS暫不可上架", owner: "採購／GDP窗口", sla: "4小時", sourceRecord: "ASN260716001", businessDate: "2026-07-16", dailyReport: "每日進貨總表", sku: "GDP-001", lpn: "LPN-WH03-001", batchExpiry: "B260701／2027-08-20", location: "GDP-QC", pdaEvent: "QC待確認09:42", person: "GDP-011", responsibilityNode: "採購允收" },
  { metricId: "return_disposition_rate", warehouseCode: "WH06", operation: "退貨處置", firstWeek: "W02", condition: "不可退廠清冊未完成判定", impact: "24筆、312PCS無法結清", owner: "退貨判定組", sla: "2個工作日", sourceRecord: "RT260716001", businessDate: "2026-07-16", dailyReport: "不可退廠清冊", sku: "RT-991", lpn: "LPN-WH06-031", batchExpiry: "B260701／2028-01-01", location: "ISO-01", pdaEvent: "判定待複核11:08", person: "RT-008", responsibilityNode: "管理核准" },
  { metricId: "aging_90d_pcs", warehouseCode: "WH01", operation: "庫存健康", firstWeek: "W01", condition: "良品庫存90天未有效異動", impact: "1,280PCS占用可用儲位", owner: "庫存管理組", sla: "本季降至1,000PCS", sourceRecord: "INV-WH01-090D", businessDate: "2026-07-16", dailyReport: "每日效期／庫存健康表", sku: "DF-209", lpn: "LPN-WH01-001", batchExpiry: "B260101／2028-01-01", location: "A01-01-01", pdaEvent: "最後移庫2026-04-01", person: "INV-016", responsibilityNode: "庫存去化" }
];

const PROJECTS = [
  project("PRJ-Q3-001", "WH05包裝站量能改善", "commitment_ship_rate", ["WH05"], "包裝組", "EC-MGR", 0.965, 0.976, 0.02, "HIGHER_IS_BETTER", 4, [
    milestone("現況盤點", 20, 1, 2, true, "站點量能盤點表"),
    milestone("人力與站點調整", 40, 3, 6, true, "排班與站點配置驗收"),
    milestone("尖峰驗證", 40, 7, 10, false, "EXSD尖峰壓測紀錄")
  ]),
  project("PRJ-Q3-002", "WH03 GDP允收規則介接", "gdp_acceptance_rate", ["WH03"], "GDP窗口", "GDP-011", 0.95, 0.972, 0.015, "HIGHER_IS_BETTER", 4, [
    milestone("規則確認", 30, 1, 3, true, "允收規則核定單"),
    milestone("系統驗證", 40, 4, 7, true, "測試案例與結果"),
    milestone("正式複核", 30, 8, 11, true, "GDP複核紀錄")
  ]),
  project("PRJ-Q3-003", "WH06不可退廠清冊閉環", "return_disposition_rate", ["WH06"], "退貨判定組", "RT-008", 0.88, 0.942, 0.08, "HIGHER_IS_BETTER", 3, [
    milestone("清冊清查", 25, 1, 3, true, "不可退廠清冊"),
    milestone("責任分派", 25, 4, 5, true, "責任指派紀錄"),
    milestone("處置複核", 50, 6, 10, true, "處置與複核紀錄")
  ]),
  project("PRJ-Q3-004", "WH01庫齡去化", "aging_90d_pcs", ["WH01", "WH04"], "庫存管理組", "INV-016", 1460, 1280, 300, "LOWER_IS_BETTER", 4, [
    milestone("庫齡分類", 25, 1, 2, true, "庫齡分類清單"),
    milestone("去化方案", 35, 3, 6, true, "採購與營運核定"),
    milestone("成效複核", 40, 7, 12, false, "季末庫存快照")
  ])
];

function milestone(name, weight, startWeek, endWeek, accepted, evidence) {
  return { name, weight, startWeek, endWeek, accepted, evidence };
}

function project(projectId, projectName, metricId, warehouseCodes, ownerUnit, ownerName, baseline, observed, expectedImprovement, direction, completeObservationWeeks, milestones) {
  return { projectId, projectName, metricId, warehouseCodes, ownerUnit, ownerName, baseline, observed, expectedImprovement, direction, completeObservationWeeks, milestones, dueDate: "2026-09-30" };
}

function selectedWarehouseCodes(config, warehouseCode) {
  return warehouseCode === "ALL"
    ? config.applicableWarehouses
    : config.applicableWarehouses.includes(warehouseCode) ? [warehouseCode] : [];
}

function buildRecords(config, warehouseCodes) {
  return config.series.map((baseValue, index) => {
    const week = index + 1;
    const scopeFactor = warehouseCodes.reduce((sum, code) => sum + Number(code.slice(2)), 0) / Math.max(warehouseCodes.length, 1);
    const adjusted = config.unit === "%" ? Math.max(0, baseValue - scopeFactor * 0.0005) : Math.round(baseValue * warehouseCodes.length);
    if (config.aggregationMode === "RATIO_RECALCULATE") {
      const denominator = 1000 * warehouseCodes.length + week * 20;
      return { week, numerator: Math.round(denominator * adjusted), denominator, value: adjusted, complete: true, eligible: true };
    }
    if (config.aggregationMode === "WEIGHTED_AVERAGE") {
      return { week, value: adjusted, weight: 480 * warehouseCodes.length + week * 10, complete: true, eligible: true };
    }
    return { week, value: adjusted, complete: true, eligible: true };
  });
}

function projectedWeekValues(config, records) {
  const actualValues = records.map((record) => weeklyValue(config, record));
  const recentAverage = actualValues.slice(-4).reduce((sum, value) => sum + value, 0) / Math.min(actualValues.length, 4);
  return QUARTER_WEEKS.map((week) => {
    const projected = week.week > records.length;
    const value = projected ? recentAverage : actualValues[week.week - 1];
    return { ...week, value, valueLabel: formatValue(value, config.unit), projected };
  });
}

function weeklyValue(config, record) {
  if (config.aggregationMode === "RATIO_RECALCULATE") return record.numerator / record.denominator;
  return record.value;
}

function normalizePoints(points) {
  const values = points.map((point) => point.value).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return points.map((point) => ({ ...point, normalizedHeight: max === min ? 55 : 20 + ((point.value - min) / (max - min)) * 70 }));
}

function buildMonthPoints(config, records) {
  const groups = [records.filter((row) => row.week <= 4), records.filter((row) => row.week >= 5 && row.week <= 8), records.filter((row) => row.week >= 9)];
  return ["7月", "8月", "9月"].map((label, index) => {
    const result = groups[index].length ? aggregateQuarter(groups[index], config) : { actual: null };
    const value = result.actual;
    return { id: `M${index + 1}`, label, value, valueLabel: formatValue(value, config.unit), projected: index === 2 };
  });
}

function formatValue(value, unit) {
  if (!Number.isFinite(value)) return "資料不足";
  if (unit === "%") return `${(value * 100).toFixed(1)}%`;
  return `${Math.round(value).toLocaleString("zh-TW")} ${unit}`;
}

function buildTargetAllocations(config) {
  if (config.aggregationMode !== "PERIOD_END_SNAPSHOT") {
    return config.applicableWarehouses.map((warehouseCode) => ({ warehouseCode, approvedTarget: config.target.value, source: "主管逐倉核定" }));
  }
  const allocated = config.applicableWarehouses.map((warehouseCode, index) => ({ warehouseCode, basis: [42, 31, 27][index] || 1 }));
  const total = allocated.reduce((sum, item) => sum + item.basis, 0);
  return allocated.map((item, index) => ({
    warehouseCode: item.warehouseCode,
    approvedTarget: index === allocated.length - 1
      ? config.target.value - allocated.slice(0, -1).reduce((sum, prior) => sum + Math.round(config.target.value * prior.basis / total), 0)
      : Math.round(config.target.value * item.basis / total),
    source: "量體初算＋主管核定"
  }));
}

export function getQuarterlyKpiModel(filters) {
  const dataStatus = filters.warehouseCode !== "ALL" && getWarehouseDataStatus(filters.warehouseCode) === "待確認"
    ? "待確認"
    : "原型資料";
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  const metrics = METRIC_CONFIGS
    .filter((config) => filters.dimension === "全部面向" || config.dimension === filters.dimension)
    .filter((config) => selectedWarehouseCodes(config, filters.warehouseCode).length > 0)
    .filter((config) => !keyword || `${config.metricName} ${config.dimension}`.toLowerCase().includes(keyword))
    .map((config) => {
      const warehouseCodes = selectedWarehouseCodes(config, filters.warehouseCode);
      const targetAllocations = buildTargetAllocations(config);
      const warehouseAllocation = filters.warehouseCode === "ALL"
        ? null
        : targetAllocations.find((item) => item.warehouseCode === filters.warehouseCode);
      const effectiveTarget = warehouseAllocation
        ? { ...config.target, value: warehouseAllocation.approvedTarget, source: warehouseAllocation.source }
        : config.target;
      const records = buildRecords(config, warehouseCodes);
      const actualResult = aggregateQuarter(records, config);
      const forecastResult = forecastQuarter(records, config, 4);
      const targetResult = evaluateQuarterTarget(actualResult.actual, effectiveTarget);
      const forecastTarget = evaluateQuarterTarget(forecastResult.forecast, effectiveTarget);
      const pace = calculateQuarterPace(actualResult.actual, effectiveTarget, 4, config);
      const weekPoints = normalizePoints(projectedWeekValues(config, records));
      const monthPoints = normalizePoints(buildMonthPoints(config, records));
      return {
        ...config,
        target: effectiveTarget,
        warehouseCodes,
        yearQuarter: `${filters.year}${filters.quarter}`,
        actual: actualResult.actual,
        actualLabel: formatValue(actualResult.actual, config.unit),
        targetLabel: formatValue(effectiveTarget.value, config.unit),
        forecast: forecastResult.forecast,
        forecastLabel: formatValue(forecastResult.forecast, config.unit),
        gap: forecastTarget.gap,
        gapLabel: formatValue(forecastTarget.gap, config.unit),
        status: targetResult.status,
        forecastStatus: forecastTarget.status,
        paceLabel: pace.status === "可用" ? `${pace.label} ${formatValue(pace.value, config.unit)}` : pace.label,
        remainingWeeks: 4,
        weekPoints,
        monthPoints,
        causes: CAUSES.filter((cause) => cause.metricId === config.metricId && warehouseCodes.includes(cause.warehouseCode)),
        targetAllocations,
        updatedAt: "2026-07-17 18:30",
        drilldownDimensions: ["月份", "營運日期", "每日必看報表", "單據", "SKU", "LPN", "批號／效期", "儲位", "PDA事件", "人員", "責任節點"]
      };
    })
    .filter((metric) => filters.status === "全部狀態" || metric.status === filters.status || metric.forecastStatus === filters.status);

  const dimensions = ["進貨", "庫存", "訂單", "出貨", "物流", "成本費用／人效"];
  const dimensionSummaries = dimensions.map((dimension) => {
    const items = metrics.filter((metric) => metric.dimension === dimension);
    return {
      dimension,
      metricId: items[0]?.metricId || "",
      achievedCount: items.filter((metric) => metric.status === "達標").length,
      evaluableCount: items.length,
      forecastRiskCount: items.filter((metric) => metric.forecastStatus === "未達").length
    };
  });
  return {
    dataStatus,
    filters,
    weeks: QUARTER_WEEKS,
    metrics,
    dimensionSummaries,
    forecastRiskCount: metrics.filter((metric) => metric.forecastStatus === "未達").length,
    insufficientCount: metrics.filter((metric) => metric.status === "資料不足").length
  };
}

export function getQuarterlyMilestoneModel(filters) {
  if (filters.warehouseCode !== "ALL" && getWarehouseDataStatus(filters.warehouseCode) === "待確認") {
    return { dataStatus: "待確認", filters, groups: [] };
  }
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  const selected = PROJECTS
    .filter((item) => filters.warehouseCode === "ALL" || item.warehouseCodes.includes(filters.warehouseCode))
    .filter((item) => !keyword || `${item.projectName} ${item.ownerUnit}`.toLowerCase().includes(keyword))
    .map((item) => {
      const deliveryProgress = calculateMilestoneProgress(item.milestones);
      const effect = evaluateProjectEffect({ ...item, deliveryProgress });
      return {
        ...item,
        deliveryProgress,
        deliveryProgressLabel: `${(deliveryProgress * 100).toFixed(0)}%`,
        deliveryStatus: effect.deliveryStatus,
        effectStatus: effect.effectStatus,
        effectClass: effect.effectStatus === "已改善" ? "is-ok" : effect.effectStatus === "未達預期" ? "is-danger" : "is-warning",
        baselineLabel: formatValue(item.baseline, item.baseline <= 1 ? "%" : "PCS"),
        observedLabel: formatValue(item.observed, item.observed <= 1 ? "%" : "PCS"),
        expectedLabel: formatValue(item.expectedImprovement, item.expectedImprovement <= 1 ? "%" : "PCS"),
        improvementLabel: effect.improvement === null ? "觀察中" : formatValue(effect.improvement, Math.abs(effect.improvement) <= 1 ? "%" : "PCS"),
        evidenceCount: item.milestones.filter((milestoneItem) => milestoneItem.accepted && milestoneItem.evidence).length,
        observationWindow: "改善前4個完整週／上線後4個完整週",
        excludedPeriods: "停機、休息、換線及系統中斷",
        approvalMetadata: `責任人 ${item.ownerName}｜期限 ${item.dueDate}`,
        ganttWeeks: QUARTER_WEEKS.map((week) => {
          const active = item.milestones.find((milestoneItem) => week.week >= milestoneItem.startWeek && week.week <= milestoneItem.endWeek);
          return { ...week, state: active ? active.accepted ? "is-accepted" : week.week < 10 ? "is-overdue" : "is-planned" : "is-empty" };
        })
      };
    });

  const groups = [...new Set(selected.map((item) => item.metricId))].map((metricId) => {
    const metric = METRIC_CONFIGS.find((item) => item.metricId === metricId);
    const metricModel = getQuarterlyKpiModel({ ...filters, dimension: "全部面向", status: "全部狀態", keyword: "" }).metrics.find((item) => item.metricId === metricId);
    return {
      metricId,
      metricName: metric.metricName,
      actualLabel: metricModel?.actualLabel || "資料不足",
      targetLabel: metricModel?.targetLabel || "資料不足",
      forecastLabel: metricModel?.forecastLabel || "資料不足",
      gapLabel: metricModel?.gapLabel || "資料不足",
      forecastStatus: metricModel?.forecastStatus || "資料不足",
      projects: selected.filter((item) => item.metricId === metricId)
    };
  });
  return { dataStatus: "原型資料", filters, groups };
}

export function getQuarterlyMetricConfigs() {
  return METRIC_CONFIGS.map((config) => ({ ...config, applicableWarehouses: [...config.applicableWarehouses], target: { ...config.target } }));
}
