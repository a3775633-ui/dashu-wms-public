import { DASHBOARD_DEFINITIONS, WAREHOUSES, getMetricDefinition } from "./wms-domain.mjs";
import { getWarehouseDataStatus } from "./wms-warehouse-profiles.mjs";

const WAREHOUSE_VALUES = {
  WH01: [98.2, 96.8, 2], WH02: [94.8, 92.4, 3], WH03: [97.7, 95.6, 5], WH04: [99.7, 98.1, 1],
  WH05: [91.0, 86.0, 8], WH06: [88.0, 89.0, 9], WH07: [96.5, 93.2, 6], WH08: [93.4, 90.8, 4]
};

function point(id, label, value, warehouseCode, extra = {}) {
  const [complete, efficiency, exceptionCount] = WAREHOUSE_VALUES[warehouseCode] || [0, 0, 0];
  return {
    id,
    label,
    value,
    valueLabel: extra.valueLabel || (Number.isFinite(value) ? value.toLocaleString("zh-TW") : "資料不足"),
    warehouseCode,
    status: extra.status || (value >= 98 ? "ok" : value >= 95 ? "warn" : "danger"),
    cause: extra.cause || `${warehouseCode}目前節點有待處理作業`,
    impact: extra.impact || `可能影響當日作業達成；出貨${complete}%／效率${efficiency}%`,
    owner: extra.owner || "所屬作業課",
    ownerNode: extra.ownerNode || "當前作業節點",
    sla: extra.sla || (exceptionCount ? "2小時內" : "不適用"),
    drilldown: extra.drilldown || `${warehouseCode}→營運日期→單據→SKU／LPN→PDA事件→人員`,
    ...extra
  };
}

function warehousePoints(prefix, selector = 0, suffix = "%") {
  return WAREHOUSES.map((warehouse) => {
    const value = WAREHOUSE_VALUES[warehouse.code][selector];
    return point(`${prefix}-${warehouse.code}`, warehouse.code, value, warehouse.code, { valueLabel: `${value}${suffix}` });
  });
}

function chart(id, title, type, points, subtitle = "") {
  return { id, title, type, subtitle, points };
}

const MODELS = {
  "全倉營運達標總覽": {
    kpis: [["跨倉達標率", "94.7%", "同一母集合"], ["P1未結", "38件", "8倉合計"], ["資料完整率", "98.1%", "可比較"]],
    charts: [
      chart("warehouse-attainment", "各倉達標率", "bar", warehousePoints("attain", 0), "低於95%直接下鑽"),
      chart("warehouse-efficiency", "各倉標準工時加權效率", "bar", warehousePoints("eff", 1), "報工完整率未達者禁止排名"),
      chart("warehouse-risk", "各倉P1風險", "heatmap", warehousePoints("risk", 2, "件"), "顯示倉別、作業、影響與責任")
    ]
  },
  "入庫作業健康": {
    kpis: [["應到PCS", "3,020", "同批ASN"], ["驗收完成率", "92.4%", "驗收÷實到"], ["待上架PCS", "1,300", "驗收−上架"]],
    charts: [
      chart("inbound-funnel", "應到至上架進度", "funnel", [
        point("expected", "應到", 3020, "WH05", { valueLabel: "3,020 PCS" }), point("received", "實到", 2880, "WH05", { valueLabel: "2,880 PCS" }),
        point("inspected", "驗收", 2660, "WH05", { valueLabel: "2,660 PCS" }), point("putaway", "上架", 1360, "WH05", { valueLabel: "1,360 PCS", status: "danger", cause: "上架區等待", impact: "可用庫存延後" })
      ]),
      chart("inbound-gap", "各倉待上架PCS", "bar", [point("wh05", "WH05", 420, "WH05", { valueLabel: "420 PCS" }), point("wh03", "WH03", 980, "WH03", { valueLabel: "980 PCS", cause: "GDP允收待確認" }), point("wh06", "WH06", 20, "WH06", { valueLabel: "20 PCS" })]),
      chart("inbound-cycle", "入庫週期趨勢", "line", [point("d1", "7/12", 126, "WH05", { valueLabel: "126分鐘" }), point("d2", "7/14", 108, "WH05", { valueLabel: "108分鐘" }), point("d3", "7/16", 142, "WH05", { valueLabel: "142分鐘" })])
    ]
  },
  "出貨履約監控": {
    kpis: [["出貨時效達成率", "94.2%", "依各倉規則"], ["應出未出", "68筆", "同批訂單"], ["最久等待", "3.1小時", "WH05包裝"]],
    charts: [
      chart("outbound-funnel", "同批應出訂單漏斗", "funnel", [point("eligible", "應出", 520, "WH05", { valueLabel: "520單" }), point("picked", "已揀", 505, "WH05", { valueLabel: "505單" }), point("packed", "已包", 490, "WH05", { valueLabel: "490單" }), point("shipped", "已出貨", 490, "WH05", { valueLabel: "490單" })]),
      chart("outbound-alert", "待發貨預警", "bar", [point("wait-pack", "待包裝", 31, "WH05", { valueLabel: "31單", cause: "包材等待2.1小時", impact: "最晚應出貨時間可能逾時", owner: "包裝組" }), point("wait-check", "待覆核", 19, "WH05", { valueLabel: "19單" }), point("wait-ship", "待出貨", 18, "WH05", { valueLabel: "18單" })]),
      chart("ship-trend", "七日出貨時效達成率", "line", [point("s1", "7/12", 96.2, "WH05", { valueLabel: "96.2%" }), point("s2", "7/14", 95.4, "WH05", { valueLabel: "95.4%" }), point("s3", "7/16", 94.2, "WH05", { valueLabel: "94.2%" })])
    ]
  },
  "庫存健康與可用性": {
    kpis: [["可用率", "92.6%", "互斥庫存"], ["90天未異動", "1,280 PCS", "適用倉別"], ["帳料差異", "2件", "待複核"]],
    charts: [
      chart("inventory-state", "互斥庫存狀態", "donut", [point("available", "可用", 9260, "WH01", { valueLabel: "9,260 PCS" }), point("wh04-locked", "鎖庫", 80, "WH04", { valueLabel: "80 PCS", cause: "90天未異動庫存鎖庫追蹤", owner: "庫存組" }), point("locked", "鎖庫", 420, "WH05", { valueLabel: "420 PCS" }), point("isolated", "隔離", 220, "WH03", { valueLabel: "220 PCS" }), point("scrap", "待報廢", 100, "WH06", { valueLabel: "100 PCS" })]),
      chart("aging-risk", "90天未異動分布", "bar", [point("a1", "WH01", 320, "WH01", { valueLabel: "320 PCS" }), point("a4", "WH04", 80, "WH04", { valueLabel: "80 PCS", cause: "最後有效異動日已超過90天", owner: "庫存組" }), point("a6", "WH06", 1280, "WH06", { valueLabel: "1,280 PCS", cause: "良品／可再利用庫存未異動" })]),
      chart("availability-trend", "可用率趨勢", "line", [point("i4-1", "5月", 97.2, "WH04", { valueLabel: "97.2%" }), point("i4-2", "6月", 96.8, "WH04", { valueLabel: "96.8%" }), point("i4-3", "7月", 96.4, "WH04", { valueLabel: "96.4%" }), point("i1", "5月", 94.1, "WH05", { valueLabel: "94.1%" }), point("i2", "6月", 93.5, "WH05", { valueLabel: "93.5%" }), point("i3", "7月", 92.6, "WH05", { valueLabel: "92.6%" })])
    ]
  },
  "人效與稼動管理": {
    kpis: [["加權效率", "91.2%", "標準工時加權"], ["報工完整率", "98.1%", "獨立呈現"], ["有效工時", "7,420小時", "扣除核准停工"]],
    charts: [
      chart("labor-operation", "作業別加權效率", "bar", [point("pick", "電商揀貨", 94.6, "WH05", { valueLabel: "94.6%", owner: "揀貨組" }), point("pack", "電商包裝", 90.2, "WH05", { valueLabel: "90.2%", cause: "包材等待2.1小時", owner: "包裝組" }), point("check", "電商覆核", 97.3, "WH05", { valueLabel: "97.3%", owner: "覆核組" })]),
      chart("labor-hour", "工時稼動分布", "donut", [point("productive", "有效作業", 78, "WH05", { valueLabel: "78%" }), point("waiting", "等待", 12, "WH05", { valueLabel: "12%" }), point("training", "訓練／休息", 10, "WH05", { valueLabel: "10%" })]),
      chart("labor-trend", "班別效率趨勢", "line", [point("l1", "早班", 95.8, "WH05", { valueLabel: "95.8%" }), point("l2", "中班", 91.4, "WH05", { valueLabel: "91.4%" }), point("l3", "晚班", 88.6, "WH05", { valueLabel: "88.6%" })])
    ]
  },
  "異常責任與閉環": {
    kpis: [["P1未結", "8件", "今日"], ["SLA逾時", "2件", "需升級"], ["閉環率", "93.8%", "含複核"]],
    charts: [
      chart("exception-warehouse", "各倉未結異常", "bar", warehousePoints("exc", 2, "件")),
      chart("exception-cause", "異常原因分布", "donut", [point("expiry", "效期／GDP", 5, "WH03", { valueLabel: "5件", owner: "GDP窗口" }), point("ship", "出貨時效", 8, "WH05", { valueLabel: "8件", owner: "電商出貨課" }), point("return", "退貨處置", 9, "WH06", { valueLabel: "9件", owner: "退貨課" })]),
      chart("closure-trend", "七日閉環率", "line", [point("e1", "7/12", 90.1, "WH05", { valueLabel: "90.1%" }), point("e2", "7/14", 92.4, "WH05", { valueLabel: "92.4%" }), point("e3", "7/16", 93.8, "WH05", { valueLabel: "93.8%" })])
    ]
  },
  "營運成本與單位成本": {
    kpis: [["營運總成本", "3.14M", "本月"], ["每單成本", "59.2元", "目標55元"], ["異常費用", "5筆", "待覆核"]],
    charts: [
      chart("cost-mix", "八類費用結構", "donut", [point("labor", "人力薪資", 980000, "WH05", { valueLabel: "980K" }), point("ot", "加班OT", 126000, "WH05", { valueLabel: "126K" }), point("delivery", "配送物流", 352000, "WH05", { valueLabel: "352K" }), point("other", "其他", 182800, "WH06", { valueLabel: "182.8K" })]),
      chart("cost-warehouse", "各倉單位成本", "bar", [point("c1", "WH01", 43.8, "WH01", { valueLabel: "43.8元/單" }), point("c3", "WH03", 51.2, "WH03", { valueLabel: "51.2元/單" }), point("c5", "WH05", 59.2, "WH05", { valueLabel: "59.2元/單", cause: "OT與包材高於預算" })]),
      chart("cost-trend", "三月單位成本趨勢", "line", [point("c-may", "5月", 52.4, "WH05", { valueLabel: "52.4元/單" }), point("c-jun", "6月", 56.1, "WH05", { valueLabel: "56.1元/單" }), point("c-jul", "7月", 59.2, "WH05", { valueLabel: "59.2元/單" })])
    ]
  }
};

export function getDashboardModel(name, focusWarehouseCode = "WH05") {
  const definition = DASHBOARD_DEFINITIONS.find((item) => item.name === name);
  if (!definition || !MODELS[name]) throw new RangeError(`未知看板：${name}`);
  const model = MODELS[name];
  const isAllWarehouseOverview = name === "全倉營運達標總覽";
  const warehouseDataStatus = getWarehouseDataStatus(focusWarehouseCode);
  const decoratedCharts = model.charts.map((item, index) => {
    const metric = getMetricDefinition(definition.metricIds[index] || definition.metricIds[0]);
    const points = warehouseDataStatus === "待確認"
      ? []
      : item.points.filter((itemPoint) => isAllWarehouseOverview || itemPoint.warehouseCode === focusWarehouseCode);
    const drilldown = item.id === "aging-risk" && focusWarehouseCode === "WH04"
      ? { moduleId: "inventory", child: "90天未異動資料", filters: ["營運日期", "倉別", "SKU", "LPN", "儲位", "作業員ID"] }
      : { moduleId: definition.renderType, child: definition.drilldown, filters: ["營運日期", "倉別", "單據", "SKU", "LPN", "PDA事件", "作業員ID"] };
    return {
      ...item,
      warehouseCode: isAllWarehouseOverview ? "ALL" : focusWarehouseCode,
      numerator: metric?.numerator || "資料不足",
      denominator: metric?.denominator || "資料不足",
      period: metric?.period || "營運日",
      updatedAt: "2026-07-16 11:30",
      target: metric?.target || "資料不足",
      exclusions: metric?.exclusions ? [...metric.exclusions] : [],
      formulaVersion: metric?.formulaVersion || "資料不足",
      drilldown,
      points: points.map((itemPoint) => ({ ...itemPoint }))
    };
  });
  const charts = warehouseDataStatus === "待確認"
    ? decoratedCharts.slice(0, 1)
    : decoratedCharts.filter((item) => item.points.length > 0);
  const dataStatus = isAllWarehouseOverview
    ? "原型資料"
    : warehouseDataStatus === "待確認" ? "待確認" : charts.some((item) => item.points.length) ? "原型資料" : "資料不足";
  const focusPoints = charts.flatMap((item) => item.points);
  const kpis = isAllWarehouseOverview
    ? model.kpis.map((item) => [...item])
    : model.kpis.map(([label], index) => [label, focusPoints[index]?.valueLabel || "資料不足", dataStatus]);
  return {
    name,
    managementQuestion: definition.managementQuestion,
    focusWarehouseCode,
    period: "2026-07-16",
    updatedAt: "2026-07-16 11:30",
    dataStatus,
    formulaVersion: "DASH-3.0",
    kpis,
    charts
  };
}
