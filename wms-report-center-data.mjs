import { WAREHOUSES } from "./wms-domain.mjs";
import { getWarehouseDataStatus } from "./wms-warehouse-profiles.mjs";
import {
  aggregateReportMetric,
  buildExpenseReconciliation,
  getMetricAvailability
} from "./wms-report-center.mjs";

export const REPORT_CENTER_DIMENSIONS = [
  "進貨",
  "庫存",
  "訂單",
  "出貨",
  "物流",
  "成本費用／人效"
];

const INBOUND_COLUMNS = [
  "營運日期",
  "倉別",
  "ASN／採購單",
  "收貨單",
  "供應商",
  "SKU ID",
  "品名",
  "批號",
  "效期",
  "應到PCS",
  "實到PCS",
  "卸貨PCS",
  "驗收PCS",
  "QC PCS",
  "已上架PCS",
  "到貨差異PCS",
  "驗收差異PCS",
  "目前節點",
  "異常原因",
  "責任人",
  "最後PDA事件時間"
];

const WH01_DAILY_INBOUND_COLUMNS = [
  "營運日期",
  "倉別",
  "ASN／採購單",
  "收貨單",
  "供應商",
  "SKU ID",
  "品名",
  "批號",
  "效期",
  "應收PCS",
  "實收PCS",
  "已上架PCS",
  "收貨差異PCS",
  "目前節點",
  "異常原因",
  "責任人",
  "最後PDA事件時間"
];

const INVENTORY_COLUMNS = [
  "營運日期",
  "倉別",
  "SKU ID",
  "品名",
  "LPN",
  "批號",
  "效期",
  "儲位",
  "庫存狀態",
  "帳上PCS",
  "現場PCS",
  "差異PCS",
  "最後有效異動日",
  "未異動天數",
  "責任單位",
  "最後PDA事件時間"
];

const ORDER_COLUMNS = [
  "營運日期",
  "倉別",
  "通路",
  "訂單編號",
  "出貨時效規則",
  "最晚應出貨時間",
  "SKU ID",
  "需求PCS",
  "配庫PCS",
  "可用PCS",
  "已揀PCS",
  "已包PCS",
  "已出PCS",
  "目前節點",
  "未出原因",
  "責任單位"
];

const OUTBOUND_COLUMNS = [
  "營運日期",
  "倉別",
  "波次",
  "訂單",
  "通路",
  "SKU ID",
  "應出PCS",
  "已釋放PCS",
  "已揀PCS",
  "已包PCS",
  "已覆核PCS",
  "已交接PCS",
  "已出貨PCS",
  "最久等待分鐘",
  "責任組別",
  "作業人員"
];

const LOGISTICS_COLUMNS = [
  "營運日期",
  "倉別",
  "車次／調撥單",
  "路線",
  "門市／目的倉",
  "箱數",
  "PCS",
  "裝車時間",
  "發車時間",
  "送達時間",
  "交接狀態",
  "配送狀態",
  "異常原因",
  "責任人"
];

const LABOR_COLUMNS = [
  "營運日期",
  "倉別",
  "作業",
  "班別",
  "組別",
  "作業人員ID",
  "標準工時",
  "實際有效工時",
  "完成量",
  "標準工時加權效率",
  "報工完整率",
  "異常工時",
  "責任主管"
];

const COST_COLUMNS = [
  "營運日期",
  "倉別",
  "管理方向",
  "費用大類",
  "會計科目",
  "費用項目",
  "用途說明",
  "金額",
  "預算歸屬",
  "廠商",
  "憑證／申請單",
  "責任單位",
  "申請人",
  "核准狀態",
  "備註"
];

export const REPORT_CATALOG = [
  report("daily_inbound", "進貨", "每日進貨總表", "ALL", INBOUND_COLUMNS, "arrival_rate"),
  report("inbound_not_arrived", "進貨", "每日未到貨表", "ALL", INBOUND_COLUMNS, "not_arrived_pcs"),
  report("acceptance_putaway", "進貨", "每日驗收上架表", "ALL", INBOUND_COLUMNS, "putaway_rate"),
  report("return_receipt_daily", "進貨", "每日退貨收貨表", ["WH06"], [
    ...INBOUND_COLUMNS,
    "退貨來源",
    "公告／退貨單",
    "退貨原因",
    "商品狀態",
    "判定結果",
    "處置狀態",
    "不可退廠狀態",
    "報廢銷毀狀態",
    "銷毀批次"
  ], "return_receipt_rate"),
  report("gdp_acceptance_qc", "進貨", "GDP效期允收／QC表", ["WH03"], [
    ...INBOUND_COLUMNS,
    "GDP屬性",
    "剩餘效期天數",
    "保存天數",
    "允收天數",
    "庫內最短效期",
    "效期差異天數",
    "允收判定",
    "溫層",
    "QC狀態",
    "效期規則版本"
  ], "gdp_acceptance_rate"),
  report("inventory_health", "庫存", "每日效期／庫存健康表", "ALL", INVENTORY_COLUMNS, "inventory_availability"),
  report("inventory_transfer_trace", "庫存", "庫存移交路徑表", "ALL", [
    ...INVENTORY_COLUMNS,
    "移交單",
    "來源倉／儲位",
    "目的倉／儲位",
    "移交節點",
    "交接人"
  ], "inventory_transfer_open"),
  report("inventory_90_day", "庫存", "90天未異動表", ["WH01", "WH04", "WH06"], [
    "營運日期",
    "倉別",
    "SKU ID",
    "品名",
    "LPN",
    "庫存狀態",
    "帳上PCS",
    "最後有效異動日",
    "未異動天數",
    "責任單位"
  ], "inactive_90_pcs"),
  report("inventory_expiry_audit", "庫存", "效期清查", ["WH04"], [
    "營運日期",
    "倉別",
    "SKU ID",
    "品名",
    "批號",
    "效期",
    "剩餘效期天數",
    "LPN",
    "儲位",
    "帳上PCS",
    "效期規則",
    "下架狀態",
    "鎖庫狀態",
    "責任單位"
  ], "expiry_audit_open"),
  report("non_returnable_register", "庫存", "不可退廠清冊", ["WH06"], [
    ...INVENTORY_COLUMNS,
    "退貨單",
    "不可退廠原因",
    "處置期限",
    "處置狀態",
    "核准人"
  ], "non_returnable_open"),
  report("inventory_difference", "庫存", "每日盤點差異表", "ALL", INVENTORY_COLUMNS, "inventory_accuracy"),
  report("order_daily", "訂單", "每日訂單統計表", "ALL", ORDER_COLUMNS, "order_fulfillment"),
  report("unshipped_orders", "訂單", "應出未出表", "ALL", ORDER_COLUMNS, "unshipped_orders"),
  report("stock_unshipped_compare", "訂單", "有庫未出二次比對", "ALL", [
    ...ORDER_COLUMNS,
    "二次比對時間",
    "二次比對結果"
  ], "stock_unshipped_orders"),
  report("shortage_compare", "訂單", "缺貨二次比對", "ALL", [
    ...ORDER_COLUMNS,
    "缺貨PCS",
    "補貨狀態",
    "二次比對時間"
  ], "shortage_orders"),
  report("exsd_backlog", "訂單", "EXSD／Backlog", ["WH05"], [
    ...ORDER_COLUMNS,
    "EXSD",
    "Backlog時數",
    "電商站別"
  ], "exsd_backlog_orders"),
  report("picking_daily", "出貨", "揀貨總表", "ALL", OUTBOUND_COLUMNS, "picking_rate"),
  report("packing_sorting_daily", "出貨", "裝箱包貨分貨表", "ALL", [
    ...OUTBOUND_COLUMNS,
    "包裝站",
    "分揀線",
    "覆核結果"
  ], "packing_rate"),
  report("outbound_daily", "出貨", "每日出貨量能統計表", "ALL", OUTBOUND_COLUMNS, "commitment_ship_rate"),
  report("loading_daily", "出貨", "裝車載貨表", "ALL", [
    ...OUTBOUND_COLUMNS,
    "車次",
    "月台",
    "裝車完成時間"
  ], "loading_rate"),
  report("delivery_daily", "物流", "配送表", "ALL", LOGISTICS_COLUMNS, "delivery_rate"),
  report("transfer_status", "物流", "調撥狀態表", "ALL", LOGISTICS_COLUMNS, "transfer_on_time_rate"),
  report("exception_audit", "物流", "異常稽核表", "ALL", [
    ...LOGISTICS_COLUMNS,
    "異常編號",
    "責任節點",
    "SLA期限",
    "結案時間"
  ], "logistics_exception_open"),
  report("wcs_status", "物流", "設備／WCS狀態表", "ALL", [
    "營運日期",
    "倉別",
    "設備ID",
    "設備名稱",
    "開始時間",
    "結束時間",
    "狀態",
    "停機分鐘",
    "影響PCS",
    "異常原因",
    "責任人"
  ], "wcs_availability"),
  report("daily_cost", "成本費用／人效", "每日成本費用表", "ALL", COST_COLUMNS, "operating_cost"),
  report("labor_reporting", "成本費用／人效", "報工稼動表", "ALL", LABOR_COLUMNS, "reporting_completeness"),
  report("work_efficiency", "成本費用／人效", "作業效率表", "ALL", LABOR_COLUMNS, "weighted_efficiency"),
  report("team_capacity", "成本費用／人效", "班別／組別量能表", "ALL", LABOR_COLUMNS, "team_capacity_rate")
];

export function getReportColumnsForWarehouse(reportDefinition, warehouseCode) {
  if (reportDefinition?.id === "daily_inbound" && warehouseCode === "WH01") {
    return [...WH01_DAILY_INBOUND_COLUMNS];
  }
  return [...(reportDefinition?.columns || [])];
}

const DAILY_ROWS = [
  dailyRow("daily_inbound", "WH01", "待上架", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH01",
    "ASN／採購單": "ASN-DF-071601",
    "收貨單": "RCV-DF-071601",
    "供應商": "大豐供應商A",
    "SKU ID": "DF-209",
    "品名": "大豐一般商品",
    "批號": "LOT-DF-0716",
    "效期": "2028-07-16",
    "應到PCS": 1200,
    "實到PCS": 1100,
    "卸貨PCS": 1100,
    "驗收PCS": 1100,
    "QC PCS": 1100,
    "已上架PCS": 0,
    "到貨差異PCS": 100,
    "驗收差異PCS": 0,
    "目前節點": "待上架",
    "異常原因": "短收100PCS；儲位待確認",
    "責任人": "張組長",
    "最後PDA事件時間": "2026-07-16 10:20"
  }),
  dailyRow("daily_inbound", "WH05", "進行中", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH05",
    "ASN／採購單": "ASN-EC-071601",
    "收貨單": "RCV-071601",
    "供應商": "電商供應商A",
    "SKU ID": "EC-1001",
    "品名": "原型商品A",
    "批號": "LOT-0716A",
    "效期": "2027-12-31",
    "應到PCS": 1200,
    "實到PCS": 1160,
    "卸貨PCS": 1160,
    "驗收PCS": 1100,
    "QC PCS": 1100,
    "已上架PCS": 980,
    "到貨差異PCS": 40,
    "驗收差異PCS": 60,
    "目前節點": "待上架",
    "異常原因": "到貨短少40PCS",
    "責任人": "EC-024",
    "最後PDA事件時間": "2026-07-16 10:42"
  }),
  dailyRow("daily_inbound", "WH03", "完成", "P2", {
    "營運日期": "2026-07-16",
    "倉別": "WH03",
    "ASN／採購單": "ASN-GDP-071601",
    "收貨單": "RCV-GDP-071601",
    "供應商": "西藥供應商B",
    "SKU ID": "GDP-2001",
    "品名": "原型西藥B",
    "批號": "GDPLOT-716",
    "效期": "2028-06-30",
    "應到PCS": 800,
    "實到PCS": 800,
    "卸貨PCS": 800,
    "驗收PCS": 800,
    "QC PCS": 800,
    "已上架PCS": 800,
    "到貨差異PCS": 0,
    "驗收差異PCS": 0,
    "目前節點": "完成",
    "異常原因": "",
    "責任人": "GDP-018",
    "最後PDA事件時間": "2026-07-16 09:18"
  }),
  dailyRow("gdp_acceptance_qc", "WH03", "待GDP確認", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH03",
    "ASN／採購單": "ASN-GDP-071602",
    "收貨單": "RCV-GDP-071602",
    "供應商": "西藥供應商C",
    "SKU ID": "GDP-2002",
    "品名": "原型西藥C",
    "批號": "GDPLOT-717",
    "效期": "2027-04-30",
    "應到PCS": 420,
    "實到PCS": 420,
    "卸貨PCS": 420,
    "驗收PCS": 0,
    "QC PCS": 0,
    "已上架PCS": 0,
    "到貨差異PCS": 0,
    "驗收差異PCS": 0,
    "目前節點": "採購／GDP確認",
    "異常原因": "進貨效期短於庫內最短效期",
    "責任人": "GDP-021",
    "最後PDA事件時間": "2026-07-16 11:20",
    "GDP屬性": "西藥",
    "剩餘效期天數": 288,
    "保存天數": 730,
    "允收天數": 270,
    "庫內最短效期": "2027-06-30",
    "效期差異天數": -61,
    "允收判定": "待GDP確認",
    "溫層": "常溫",
    "QC狀態": "待判定",
    "效期規則版本": "GDP-1.0"
  }),
  dailyRow("return_receipt_daily", "WH06", "待判定", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH06",
    "ASN／採購單": "RET-071601",
    "收貨單": "RRCV-071601",
    "供應商": "門市退回",
    "SKU ID": "RET-3001",
    "品名": "原型退貨商品",
    "批號": "RLOT-716",
    "效期": "2026-10-31",
    "應到PCS": 60,
    "實到PCS": 60,
    "卸貨PCS": 60,
    "驗收PCS": 40,
    "QC PCS": 0,
    "已上架PCS": 0,
    "到貨差異PCS": 0,
    "驗收差異PCS": 20,
    "目前節點": "待判定",
    "異常原因": "外觀待複驗",
    "責任人": "RET-006",
    "最後PDA事件時間": "2026-07-16 11:05",
    "退貨來源": "門市",
    "公告／退貨單": "RET-071601",
    "退貨原因": "公司公告回收",
    "商品狀態": "待判定",
    "判定結果": "待判定",
    "處置狀態": "未處置",
    "不可退廠狀態": "待確認",
    "報廢銷毀狀態": "不適用",
    "銷毀批次": ""
  }),
  dailyRow("inventory_90_day", "WH06", "追蹤中", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH06",
    "SKU ID": "RET-3100",
    "品名": "可再利用原型商品",
    "LPN": "LPN-WH06-3100",
    "庫存狀態": "可再利用",
    "帳上PCS": 1280,
    "最後有效異動日": "2026-04-10",
    "未異動天數": 97,
    "責任單位": "退貨課"
  }),
  dailyRow("inventory_90_day", "WH04", "追蹤中", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH04",
    "SKU ID": "RX-MAT-01",
    "品名": "調劑耗材原型商品",
    "LPN": "LPN-WH04-011",
    "庫存狀態": "鎖庫",
    "帳上PCS": 80,
    "最後有效異動日": "2026-03-20",
    "未異動天數": 118,
    "責任單位": "庫存組"
  }),
  dailyRow("inventory_expiry_audit", "WH04", "待確認", "P1", {
    "營運日期": "2026-07-16",
    "倉別": "WH04",
    "SKU ID": "RX-MAT-02",
    "品名": "調劑耗材原型商品B",
    "批號": "B250901",
    "效期": "2026-09-15",
    "剩餘效期天數": 61,
    "LPN": "LPN-WH04-012",
    "儲位": "M02-03-02",
    "帳上PCS": 40,
    "效期規則": "資料不足",
    "下架狀態": "待確認",
    "鎖庫狀態": "未鎖庫",
    "責任單位": "庫存組"
  })
];

const MONTHLY_DETAIL_COLUMNS = [
  "年月",
  "倉別",
  "管理方向",
  "KPI ID",
  "KPI名稱",
  "單位",
  "本月實績",
  "目標值",
  "達成狀態",
  "上月實績",
  "月差",
  "去年同月實績",
  "年差",
  "異常件數",
  "來源每日必看報表",
  "公式版本",
  "資料完整率",
  "責任單位",
  "下鑽入口"
];

const MONTHLY_METRICS = [
  metricContract("arrival_rate", "到貨達成率", "進貨", "expectedPcs", "arrivedPcs", "daily_inbound", 0.98, "INBOUND-1.0"),
  metricContract("acceptance_rate", "驗收完成率", "進貨", "arrivedPcs", "acceptedPcs", "daily_inbound", 0.98, "INBOUND-1.0"),
  metricContract("putaway_rate", "上架完成率", "進貨", "acceptedPcs", "putawayPcs", "acceptance_putaway", 0.98, "INBOUND-1.0"),
  flowContract("pending_putaway_pcs", "待上架PCS", "進貨", "acceptance_putaway", 0, "PCS", "INBOUND-1.0", "LOWER_IS_BETTER"),
  metricContract("inventory_availability", "庫存可用率", "庫存", "onHandPcs", "availablePcs", "inventory_health", 0.95, "INV-1.0"),
  flowContract("inactive_90_pcs", "90天未異動PCS", "庫存", "inventory_90_day", 0, "PCS", "AGING-1.0", "LOWER_IS_BETTER"),
  flowContract("expiry_risk_sku", "效期風險SKU", "庫存", "inventory_health", 0, "SKU", "INV-1.0", "LOWER_IS_BETTER"),
  flowContract("inventory_difference_count", "盤點差異件數", "庫存", "inventory_difference", 0, "件", "INV-1.0", "LOWER_IS_BETTER"),
  flowContract("eligible_order_count", "有效訂單數", "訂單", "order_daily", 700, "筆", "ORDER-1.0"),
  metricContract("order_fulfillment", "訂單履約率", "訂單", "eligibleOrders", "fulfilledOrders", "order_daily", 0.98, "ORDER-1.0"),
  flowContract("unshipped_order_count", "應出未出訂單", "訂單", "unshipped_orders", 0, "筆", "ORDER-1.0", "LOWER_IS_BETTER"),
  flowContract("shortage_order_count", "缺貨訂單", "訂單", "shortage_compare", 0, "筆", "ORDER-1.0", "LOWER_IS_BETTER"),
  flowContract("shipped_pcs", "完成出貨PCS", "出貨", "outbound_daily", 7000, "PCS", "SHIP-2.0"),
  metricContract("picking_rate", "揀貨完成率", "出貨", "releasedPcs", "pickedPcs", "picking_daily", 0.98, "SHIP-2.0"),
  metricContract("packing_rate", "包裝完成率", "出貨", "pickedPcs", "packedPcs", "packing_sorting_daily", 0.98, "SHIP-2.0"),
  metricContract("commitment_ship_rate", "出貨時效達成率", "出貨", "eligibleShipOrders", "shippedInCommitment", "outbound_daily", 0.98, "SHIP-2.0"),
  metricContract("handoff_rate", "交接完成率", "物流", "eligibleHandoffs", "completedHandoffs", "loading_daily", 0.98, "LOG-1.0"),
  metricContract("loading_rate", "裝車完成率", "物流", "eligibleLoads", "completedLoads", "loading_daily", 0.98, "LOG-1.0"),
  metricContract("delivery_rate", "配送準時率", "物流", "eligibleDeliveries", "onTimeDeliveries", "delivery_daily", 0.98, "LOG-1.0"),
  flowContract("transfer_overdue_count", "調撥逾時件數", "物流", "transfer_status", 0, "件", "LOG-1.0", "LOWER_IS_BETTER"),
  {
    metricId: "operating_cost",
    name: "營運總成本",
    dimension: "成本費用／人效",
    aggregationMode: "FLOW_SUM",
    valueField: "amount",
    sourceReportId: "daily_cost",
    unit: "元",
    target: 1900000,
    direction: "LOWER_IS_BETTER",
    formulaVersion: "COST-1.0"
  },
  flowContract("cost_per_order", "每單作業成本", "成本費用／人效", "daily_cost", 55, "元/單", "COST-1.0", "LOWER_IS_BETTER"),
  metricContract("weighted_efficiency", "標準工時加權效率", "成本費用／人效", "effectiveMinutes", "standardMinutes", "work_efficiency", 1, "LABOR-1.0"),
  metricContract("reporting_completeness", "報工完整率", "成本費用／人效", "expectedTasks", "reportedTasks", "labor_reporting", 0.95, "LABOR-1.0")
];

const METRIC_DAILY_ROWS = [
  ratioMetric("arrival_rate", "WH05", "2026-07-01", "expectedPcs", 1000, "arrivedPcs", 960, "INBOUND-1.0", "供應商預約延遲", "月台等待增加", "進貨課", "2小時", 1, 1),
  ratioMetric("arrival_rate", "WH05", "2026-07-16", "expectedPcs", 1200, "arrivedPcs", 1160, "INBOUND-1.0", "到貨短少40PCS", "驗收與上架延後", "進貨課", "2小時", 1, 0),
  ratioMetric("arrival_rate", "WH03", "2026-07-16", "expectedPcs", 800, "arrivedPcs", 800, "INBOUND-1.0", "無未結異常", "無營運影響", "進貨課", "不適用", 0, 2),
  ratioMetric("acceptance_rate", "WH05", "2026-07-16", "arrivedPcs", 1160, "acceptedPcs", 1100, "INBOUND-1.0", "60PCS待驗收結案", "上架母集合尚未完成", "驗收組", "2小時", 1, 0),
  ratioMetric("putaway_rate", "WH05", "2026-07-16", "acceptedPcs", 1100, "putawayPcs", 980, "INBOUND-1.0", "上架區等待", "120PCS尚未可用", "上架組", "2小時", 1, 0),
  flowMetric("pending_putaway_pcs", "WH05", "2026-07-16", 120, "INBOUND-1.0", "上架區等待", "可用庫存延後", "上架組", "2小時", 1, 0),
  ratioMetric("inventory_availability", "WH01", "2026-07-01", "onHandPcs", 8000, "availablePcs", 7800, "INV-1.0", "鎖庫200PCS", "可用庫存下降", "庫存課", "4小時", 1, 1),
  ratioMetric("inventory_availability", "WH01", "2026-07-16", "onHandPcs", 8200, "availablePcs", 7900, "INV-1.0", "盤點差異待確認", "補貨決策延後", "庫存課", "4小時", 1, 0),
  ratioMetric("inventory_availability", "WH06", "2026-07-16", "onHandPcs", 1800, "availablePcs", 1500, "INV-1.0", "待判定退貨隔離", "可再利用庫存下降", "退貨課", "當日", 2, 0),
  flowMetric("inactive_90_pcs", "WH06", "2026-07-16", 1280, "AGING-1.0", "良品庫存90天未有效異動", "占用儲位並增加呆滯風險", "退貨課", "本週", 1, 0),
  flowMetric("expiry_risk_sku", "WH03", "2026-07-16", 5, "INV-1.0", "效期低於門檻", "允收與出貨順序需確認", "GDP窗口", "當日", 2, 0),
  flowMetric("inventory_difference_count", "WH01", "2026-07-16", 2, "INV-1.0", "盤點帳實差異", "可用量暫停釋放", "庫存課", "4小時", 1, 0),
  flowMetric("eligible_order_count", "WH05", "2026-07-16", 520, "ORDER-1.0", "訂單量低於月均目標", "排班量能需調整", "電商出貨課", "當日", 0, 1),
  ratioMetric("order_fulfillment", "WH05", "2026-07-01", "eligibleOrders", 500, "fulfilledOrders", 480, "ORDER-1.0", "EXSD Backlog", "訂單延後出貨", "電商出貨課", "2小時", 2, 0, { shippedPcs: 4200 }),
  ratioMetric("order_fulfillment", "WH05", "2026-07-16", "eligibleOrders", 520, "fulfilledOrders", 505, "ORDER-1.0", "包裝站等待", "履約率低於目標", "電商出貨課", "2小時", 1, 1, { shippedPcs: 4520 }),
  ratioMetric("order_fulfillment", "WH01", "2026-07-16", "eligibleOrders", 300, "fulfilledOrders", 295, "ORDER-1.0", "無未結異常", "無營運影響", "出貨課", "不適用", 0, 2, { shippedPcs: 2800 }),
  flowMetric("unshipped_order_count", "WH05", "2026-07-16", 15, "ORDER-1.0", "包裝站等待", "訂單未完成出貨", "電商出貨課", "2小時", 1, 0),
  flowMetric("shortage_order_count", "WH05", "2026-07-16", 7, "ORDER-1.0", "揀貨缺庫", "訂單需二次比對", "庫存課", "2小時", 1, 0),
  flowMetric("shipped_pcs", "WH05", "2026-07-16", 4520, "SHIP-2.0", "低於日目標", "待出量增加", "電商出貨課", "當日", 1, 0),
  ratioMetric("picking_rate", "WH05", "2026-07-16", "releasedPcs", 5000, "pickedPcs", 4780, "SHIP-2.0", "分揀線壅塞", "後段包裝供料不足", "揀貨組", "1小時", 1, 0),
  ratioMetric("packing_rate", "WH05", "2026-07-16", "pickedPcs", 4780, "packedPcs", 4600, "SHIP-2.0", "包材等待", "出貨交接延後", "包裝組", "1小時", 1, 0),
  ratioMetric("commitment_ship_rate", "WH05", "2026-07-01", "eligibleShipOrders", 500, "shippedInCommitment", 465, "SHIP-2.0", "包裝人力不足", "出貨時效未達", "電商出貨課", "1小時", 3, 0, { shippedPcs: 4200 }),
  ratioMetric("commitment_ship_rate", "WH05", "2026-07-16", "eligibleShipOrders", 520, "shippedInCommitment", 490, "SHIP-2.0", "分揀線壅塞", "最久等待3.1小時", "電商出貨課", "1小時", 2, 0, { shippedPcs: 4520 }),
  ratioMetric("commitment_ship_rate", "WH01", "2026-07-16", "eligibleShipOrders", 300, "shippedInCommitment", 295, "SHIP-2.0", "無未結異常", "無營運影響", "出貨課", "不適用", 0, 2, { shippedPcs: 2800 }),
  ratioMetric("handoff_rate", "WH05", "2026-07-16", "eligibleHandoffs", 110, "completedHandoffs", 106, "LOG-1.0", "點交差異4件", "車次延後封車", "物流課", "1小時", 1, 0),
  ratioMetric("loading_rate", "WH05", "2026-07-16", "eligibleLoads", 110, "completedLoads", 108, "LOG-1.0", "2件待補標", "裝車未完成", "物流課", "1小時", 1, 0),
  ratioMetric("delivery_rate", "WH05", "2026-07-01", "eligibleDeliveries", 100, "onTimeDeliveries", 92, "LOG-1.0", "車次晚發", "門市到貨延遲", "物流課", "2小時", 2, 0),
  ratioMetric("delivery_rate", "WH05", "2026-07-16", "eligibleDeliveries", 110, "onTimeDeliveries", 104, "LOG-1.0", "配送路線異常", "7件配送異常", "物流課", "2小時", 1, 1),
  ratioMetric("delivery_rate", "WH01", "2026-07-16", "eligibleDeliveries", 100, "onTimeDeliveries", 98, "LOG-1.0", "無未結異常", "無營運影響", "物流課", "不適用", 0, 2),
  flowMetric("transfer_overdue_count", "WH05", "2026-07-16", 2, "LOG-1.0", "跨倉交接未回寫", "目的倉可用量延後", "物流課", "2小時", 1, 0),
  flowMetric("operating_cost", "WH05", "2026-07-05", 1458040, "COST-1.0", "加班與配送費高於預算", "單位成本增加", "管理課", "本月", 2, 0),
  flowMetric("operating_cost", "WH01", "2026-07-14", 96600, "COST-1.0", "設備維修", "停機45分鐘", "設備組", "當日", 1, 1),
  flowMetric("operating_cost", "WH03", "2026-07-12", 164000, "COST-1.0", "冷鏈用電增加", "營運成本增加", "管理課", "本月", 1, 1),
  flowMetric("operating_cost", "WH06", "2026-07-15", 9200, "COST-1.0", "報廢清運", "其他費用增加", "退貨課", "本月", 1, 1),
  flowMetric("cost_per_order", "WH05", "2026-07-16", 59.2, "COST-1.0", "加班與包材成本增加", "單位成本高於目標", "管理課", "本月", 2, 0),
  ratioMetric("weighted_efficiency", "WH05", "2026-07-01", "effectiveMinutes", 1000, "standardMinutes", 910, "LABOR-1.0", "包裝等待", "有效工時損失", "電商出貨課", "當班", 2, 0),
  ratioMetric("weighted_efficiency", "WH05", "2026-07-16", "effectiveMinutes", 1000, "standardMinutes", 940, "LABOR-1.0", "分揀線等待", "效率未達標", "電商出貨課", "當班", 1, 1),
  ratioMetric("weighted_efficiency", "WH01", "2026-07-16", "effectiveMinutes", 900, "standardMinutes", 930, "LABOR-1.0", "無未結異常", "無營運影響", "出貨課", "不適用", 0, 2),
  ratioMetric("reporting_completeness", "WH05", "2026-07-01", "expectedTasks", 500, "reportedTasks", 470, "LABOR-1.0", "漏報30件", "效率暫停排名", "管理課", "當日", 2, 0),
  ratioMetric("reporting_completeness", "WH05", "2026-07-16", "expectedTasks", 520, "reportedTasks", 510, "LABOR-1.0", "漏報10件", "個人效率需複核", "管理課", "當日", 1, 1),
  ratioMetric("reporting_completeness", "WH01", "2026-07-16", "expectedTasks", 300, "reportedTasks", 300, "LABOR-1.0", "無未結異常", "無營運影響", "管理課", "不適用", 0, 2)
];

const EXPENSE_ROWS = [
  expense("EXP-001", "2026-07-05", "WH05", "人力薪資", "薪資費用", "正職薪資", "電商倉七月薪資", 980000, 960000, "內部薪資", "PAY-202607-WH05", "管理課", "HR-001", false, 12000),
  expense("EXP-002", "2026-07-08", "WH05", "加班OT", "加班費", "出貨加班", "促銷檔期加班", 126000, 90000, "內部薪資", "OT-202607-WH05", "出貨課", "OUT-003", true, 28000),
  expense("EXP-003", "2026-07-09", "WH01", "委外作業", "委外作業費", "臨時理貨", "到貨高峰支援", 78000, 80000, "原型人力公司", "PO-OUTSOURCE-071", "進貨課", "IN-011", false, -5000),
  expense("EXP-004", "2026-07-10", "WH05", "配送物流", "運費", "宅配費", "電商訂單配送", 352000, 340000, "原型物流商", "FREIGHT-0710", "物流課", "LOG-005", false, 9000),
  expense("EXP-005", "2026-07-12", "WH03", "租金／水電", "水電費", "冷鏈用電", "GDP溫控設備用電", 164000, 150000, "電力公司", "UTILITY-0712", "管理課", "ADM-003", true, 14000),
  expense("EXP-006", "2026-07-13", "WH05", "包材耗材", "包材費", "膠帶", "包裝站補充", 40, 1000, "原型文具行", "PETTY-0713", "包裝組", "PK-018", false, -20),
  expense("EXP-007", "2026-07-14", "WH01", "設備維修", "設備修理費", "輸送帶零件", "更換磨損滾輪", 18600, 12000, "原型設備商", "REPAIR-0714", "設備組", "EQ-002", true, 8600),
  expense("EXP-008", "2026-07-15", "WH06", "異常與其他費用", "其他費用", "報廢清運", "不可退廠商品清運", 9200, 8000, "原型清運商", "DISPOSAL-0715", "退貨課", "RET-006", true, 1200)
];

const EXPENSE_DETAIL_COLUMNS = [
  "日期",
  "倉別",
  "費用大類",
  "會計科目",
  "費用項目",
  "用途說明",
  "金額",
  "廠商",
  "憑證／申請單",
  "責任單位",
  "申請人",
  "核准狀態",
  "備註"
];

const NOTE_ROWS = [
  {
    noteId: "NOTE-0001",
    entityType: "metric",
    entityId: "arrival_rate",
    authorId: "MGR001",
    responsibleUnit: "進貨課",
    responsiblePerson: "IN-011",
    dueDate: "2026-07-20",
    text: "WH05到貨短少40PCS，已要求採購追蹤供應商。",
    createdAt: "2026-07-17T09:00:00+08:00",
    version: 1,
    status: "追蹤中"
  }
];

export function getApplicableDailyReports(warehouseCode, dimension) {
  return REPORT_CATALOG.filter(
    (item) =>
      (dimension === "全部方向" || item.dimension === dimension) &&
      (item.warehouses === "ALL" || item.warehouses.includes(warehouseCode))
  );
}

export function getDailyReportCenterModel(filters) {
  const warehouseCode = filters.warehouseCode || "ALL";
  if (warehouseCode === "ALL") {
    return buildAllWarehouseDailyModel(filters);
  }

  const reports = getApplicableDailyReports(
    warehouseCode,
    filters.dimension || "全部方向"
  ).map((reportDefinition) => ({
    ...reportDefinition,
    name: reportDefinition.id === "inventory_90_day" && warehouseCode === "WH04"
      ? "90天未異動資料"
      : reportDefinition.name,
    columns: getReportColumnsForWarehouse(reportDefinition, warehouseCode)
  }));
  const selectedReport =
    reports.find((item) => item.id === filters.reportId) || reports[0] || null;
  const warehouseDataStatus = getWarehouseDataStatus(warehouseCode);
  const rows = selectedReport && warehouseDataStatus !== "待確認"
    ? filterDailyRows(
        DAILY_ROWS.filter((row) => row.reportId === selectedReport.id),
        { ...filters, warehouseCode }
      ).map((row) => selectedReport.columns.map((column) =>
        getDailyCellValue(row.values, selectedReport.id, warehouseCode, column)
      ))
    : [];

  return {
    mode: "WAREHOUSE",
    filters: { ...filters, warehouseCode },
    dimensions: buildDailyDimensionSummaries(
      warehouseCode,
      filters.businessDate
    ),
    reports,
    selectedReport,
    rows,
    dataStatus: warehouseDataStatus === "待確認"
      ? "待確認"
      : rows.length ? "原型資料" : "資料不足"
  };
}

function getDailyCellValue(values, reportId, warehouseCode, column) {
  if (reportId === "daily_inbound" && warehouseCode === "WH01") {
    if (column === "應收PCS") return values["應到PCS"] ?? "";
    if (column === "實收PCS") return values["實到PCS"] ?? "";
    if (column === "收貨差異PCS") {
      return Number(values["應到PCS"] || 0) - Number(values["實到PCS"] || 0);
    }
  }
  return values[column] ?? "";
}

function report(id, dimension, name, warehouses, columns, primaryMetricId) {
  return Object.freeze({
    id,
    dimension,
    name,
    warehouses,
    columns: Object.freeze([...columns]),
    primaryMetricId
  });
}

function dailyRow(reportId, warehouseCode, status, priority, values) {
  return {
    reportId,
    businessDate: values["營運日期"],
    warehouseCode,
    status,
    priority,
    values
  };
}

function filterDailyRows(rows, filters) {
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.businessDate === filters.businessDate &&
      row.warehouseCode === filters.warehouseCode &&
      (filters.status === "全部狀態" || row.status === filters.status) &&
      (!keyword ||
        Object.values(row.values).join(" ").toLowerCase().includes(keyword))
  );
}

function buildDailyDimensionSummaries(warehouseCode, businessDate) {
  return REPORT_CENTER_DIMENSIONS.map((name) => {
    const reports = getApplicableDailyReports(warehouseCode, name);
    const rows = DAILY_ROWS.filter(
      (row) =>
        row.warehouseCode === warehouseCode &&
        row.businessDate === businessDate &&
        reports.some((item) => item.id === row.reportId)
    );
    return {
      name,
      reportCount: reports.length,
      updatedCount: new Set(rows.map((row) => row.reportId)).size,
      p1Count: rows.filter((row) => row.priority === "P1").length,
      status: rows.length ? "原型資料" : "資料不足"
    };
  });
}

function buildAllWarehouseDailyModel(filters) {
  const warehouseSummaries = WAREHOUSES.map((warehouse) => {
    const rows = DAILY_ROWS.filter(
      (row) =>
        row.warehouseCode === warehouse.code &&
        row.businessDate === filters.businessDate
    );
    return {
      warehouseCode: warehouse.code,
      warehouseName: warehouse.name,
      reportCount: new Set(rows.map((row) => row.reportId)).size,
      p1Count: rows.filter((row) => row.priority === "P1").length,
      dataStatus: rows.length ? "原型資料" : "資料不足"
    };
  });
  return {
    mode: "ALL_WAREHOUSES",
    filters: { ...filters, warehouseCode: "ALL" },
    dimensions: [...REPORT_CENTER_DIMENSIONS],
    warehouseSummaries,
    dataStatus: warehouseSummaries.some(
      (row) => row.dataStatus === "原型資料"
    )
      ? "原型資料"
      : "資料不足"
  };
}

export function getMonthlyReportModel(filters) {
  const normalizedFilters = {
    yearMonth: filters.yearMonth || "2026-07",
    warehouseCode: filters.warehouseCode || "ALL",
    compareMode: filters.compareMode || "上月",
    dimension: filters.dimension || "全部方向",
    keyword: filters.keyword || ""
  };
  const metrics = MONTHLY_METRICS.map((contract) =>
    buildMonthlyMetric(contract, normalizedFilters)
  );
  const expenses = filterExpenseRows(EXPENSE_ROWS, normalizedFilters);
  const reconciliation = buildExpenseReconciliation(expenses);
  return {
    filters: normalizedFilters,
    dimensions: REPORT_CENTER_DIMENSIONS.map((name) =>
      buildMonthlyDimension(name, metrics)
    ),
    cost: {
      total: reconciliation.total,
      reconciliation,
      unitPerOrder:
        reconciliation.total / getEligibleOrderCount(normalizedFilters),
      unitPerPcs:
        reconciliation.total / getEligibleOutboundPcs(normalizedFilters)
    },
    detailColumns: [...MONTHLY_DETAIL_COLUMNS],
    detailRows: buildMonthlyDetailRows(metrics, normalizedFilters),
    dataStatus: "原型資料"
  };
}

export function getDailyDrilldownTarget(monthlyFilters, metric) {
  return {
    child: "Daily報表中心",
    businessDate: metric.worstBusinessDate,
    warehouseCode: metric.worstWarehouseCode,
    dimension: metric.dimension,
    reportId: metric.sourceReportId,
    status: "全部狀態",
    keyword: ""
  };
}

export function getKeyNumbersModel(filters) {
  const monthly = getMonthlyReportModel(filters);
  return {
    filters: monthly.filters,
    dimensionSummaries: monthly.dimensions.map((dimension) => ({
      name: dimension.name,
      representativeMetric: selectRepresentativeMetric(dimension.metrics),
      missedCount: dimension.metrics.filter((metric) => metric.status === "未達")
        .length,
      anomalyCount: dimension.metrics.reduce(
        (sum, metric) => sum + metric.anomalyCount,
        0
      ),
      metrics: dimension.metrics
    })),
    expenseEntry: buildExpenseEntry(monthly.cost.reconciliation, monthly.filters),
    expenseCategories: monthly.cost.reconciliation.categories,
    dataStatus: monthly.dataStatus
  };
}

export function getExpenseHierarchyModel(filters) {
  const normalizedFilters = {
    yearMonth: filters.yearMonth || "2026-07",
    warehouseCode: filters.warehouseCode || "ALL",
    categoryId: filters.categoryId || "",
    accountName: filters.accountName || "",
    expenseItem: filters.expenseItem || ""
  };
  const rows = filterExpenseRows(EXPENSE_ROWS, normalizedFilters);
  const reconciliation = buildExpenseReconciliation(rows);
  const categoryRows = normalizedFilters.categoryId
    ? rows.filter((row) => row.categoryId === normalizedFilters.categoryId)
    : rows;
  const accountRows = normalizedFilters.accountName
    ? categoryRows.filter(
        (row) => row.accountName === normalizedFilters.accountName
      )
    : categoryRows;
  const detailRows = normalizedFilters.expenseItem
    ? accountRows.filter(
        (row) => row.expenseItem === normalizedFilters.expenseItem
      )
    : accountRows;
  return {
    filters: normalizedFilters,
    levels: [
      "成本費用／人效",
      "重點費用",
      "八類費用",
      "全部費用科目與原始單據"
    ],
    summary: buildExpenseEntry(reconciliation, normalizedFilters),
    categories: reconciliation.categories,
    accounts: groupExpenses(categoryRows, "accountName"),
    items: groupExpenses(accountRows, "expenseItem"),
    detailColumns: [...EXPENSE_DETAIL_COLUMNS],
    detailRows,
    reconciliation,
    dataStatus: rows.length ? "原型資料" : "資料不足"
  };
}

export function getMetricDrilldownModel(filters, metricId) {
  const monthly = getMonthlyReportModel(filters);
  const metric = monthly.dimensions
    .flatMap((item) => item.metrics)
    .find((item) => item.metricId === metricId);
  if (!metric) return null;
  const dailySource = getMetricDailyRows(metric, monthly.filters);
  return {
    ...metric,
    dailyColumns: dailySource.columns,
    dailyRows: dailySource.rows,
    sourceDocuments: getMetricSourceDocuments(metric, monthly.filters),
    notes: NOTE_ROWS.filter(
      (note) => note.entityType === "metric" && note.entityId === metricId
    )
  };
}

function buildMonthlyMetric(contract, filters) {
  const rows = metricRows(contract, filters);
  const aggregateRows = rows.map((row) => toAggregateRow(row, contract));
  const result = aggregateReportMetric(aggregateRows, contract);
  const availability = getMetricAvailability(aggregateRows, {
    denominator: result.denominator
  });
  const warehouseDistribution = [...new Set(rows.map((row) => row.warehouseCode))]
    .map((warehouseCode) => {
      const warehouseRows = rows
        .filter((row) => row.warehouseCode === warehouseCode)
        .map((row) => toAggregateRow(row, contract));
      const warehouseResult = aggregateReportMetric(warehouseRows, contract);
      return {
        warehouseCode,
        value: warehouseResult.value,
        valueLabel: formatMetricValue(warehouseResult.value, contract.unit),
        status: evaluateMetricStatus(warehouseResult.value, contract)
      };
    });
  const worst = [...rows].sort(
    (a, b) => Number(a.statusWeight || 0) - Number(b.statusWeight || 0)
  )[0] || {};
  const actual = result.value;

  return {
    ...contract,
    actual,
    numerator: result.numerator,
    denominator: result.denominator,
    actualLabel: formatMetricValue(actual, contract.unit),
    targetLabel: formatMetricValue(contract.target, contract.unit),
    gapLabel: Number.isFinite(actual)
      ? formatMetricValue(actual - contract.target, contract.unit)
      : "資料不足",
    status:
      availability.status === "資料不足"
        ? "資料不足"
        : evaluateMetricStatus(actual, contract),
    dataStatus: availability.status,
    rankable: availability.rankable,
    anomalyCount: rows.reduce(
      (sum, row) => sum + Number(row.anomalyCount || 0),
      0
    ),
    cause: worst.cause || "無未結異常",
    impact: worst.impact || "無營運影響",
    owner: worst.owner || "無待辦責任",
    sla: worst.sla || "不適用",
    worstBusinessDate: worst.businessDate || `${filters.yearMonth}-01`,
    worstWarehouseCode: worst.warehouseCode || filters.warehouseCode,
    dailyTrend: groupMetricRows(rows, "businessDate", contract),
    warehouseDistribution,
    comparisonValueLabel: "原型比較值",
    monthDeltaLabel: "原型月差",
    lastYearValueLabel: "原型去年同月",
    yearDeltaLabel: "原型年差",
    dataCompletenessLabel: "100%"
  };
}

function selectRepresentativeMetric(metrics) {
  const priority = { "未達": 0, "資料不足": 1, "達標": 2 };
  return [...metrics].sort(
    (a, b) => priority[a.status] - priority[b.status]
  )[0] || null;
}

function buildExpenseEntry(reconciliation, filters) {
  const currentRows = filterExpenseRows(EXPENSE_ROWS, filters);
  const budget = currentRows.reduce(
    (sum, row) => sum + Number(row.budgetAmount || 0),
    0
  );
  const warehouseTotals = groupExpenses(currentRows, "warehouseCode");
  const highestWarehouse = [...warehouseTotals].sort(
    (a, b) => b.amount - a.amount
  )[0] || { key: "資料不足", amount: 0, count: 0 };
  return {
    total: reconciliation.total,
    budgetVariance: reconciliation.total - budget,
    priorMonthVariance: currentRows.reduce(
      (sum, row) => sum + Number(row.priorMonthDelta || 0),
      0
    ),
    anomalyCount: currentRows.filter((row) => row.isAnomaly).length,
    highestWarehouse
  };
}

function groupExpenses(rows, key) {
  return [...new Set(rows.map((row) => row[key]))].map((value) => {
    const grouped = rows.filter((row) => row[key] === value);
    return {
      key: value,
      amount: grouped.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      count: grouped.length
    };
  });
}

function getMetricDailyRows(metric, filters) {
  const reportDefinition = REPORT_CATALOG.find(
    (item) => item.id === metric.sourceReportId
  );
  if (!reportDefinition) return { columns: [], rows: [] };
  const sourceRows = DAILY_ROWS.filter(
    (row) =>
      row.reportId === metric.sourceReportId &&
      row.businessDate.startsWith(filters.yearMonth) &&
      (filters.warehouseCode === "ALL" ||
        row.warehouseCode === filters.warehouseCode)
  );
  return {
    columns: reportDefinition.columns,
    rows: sourceRows.map((row) =>
      reportDefinition.columns.map((column) => row.values[column] ?? "")
    )
  };
}

function getMetricSourceDocuments(metric, filters) {
  return METRIC_DAILY_ROWS.filter(
    (row) =>
      row.metricId === metric.metricId &&
      row.yearMonth === filters.yearMonth &&
      (filters.warehouseCode === "ALL" ||
        row.warehouseCode === filters.warehouseCode)
  ).flatMap((row) => row.sourceDocumentIds || []);
}

function buildMonthlyDimension(name, metrics) {
  const dimensionMetrics = metrics.filter((metric) => metric.dimension === name);
  const representative = dimensionMetrics[0];
  return {
    name,
    metrics: dimensionMetrics,
    dailyTrend: representative?.dailyTrend || [],
    warehouseDistribution: representative?.warehouseDistribution || [],
    anomalyCount: dimensionMetrics.reduce(
      (sum, metric) => sum + metric.anomalyCount,
      0
    )
  };
}

function buildMonthlyDetailRows(metrics, filters) {
  return metrics.flatMap((metric) =>
    metric.warehouseDistribution.map((warehouse) => [
      filters.yearMonth,
      warehouse.warehouseCode,
      metric.dimension,
      metric.metricId,
      metric.name,
      metric.unit,
      warehouse.valueLabel,
      metric.targetLabel,
      warehouse.status,
      metric.comparisonValueLabel,
      metric.monthDeltaLabel,
      metric.lastYearValueLabel,
      metric.yearDeltaLabel,
      metric.anomalyCount,
      metric.sourceReportId,
      metric.formulaVersion,
      metric.dataCompletenessLabel,
      metric.owner,
      `${metric.sourceReportId}:${metric.worstBusinessDate}`
    ])
  );
}

function metricRows(contract, filters) {
  return METRIC_DAILY_ROWS.filter(
    (row) =>
      row.metricId === contract.metricId &&
      row.yearMonth === filters.yearMonth &&
      (filters.warehouseCode === "ALL" ||
        row.warehouseCode === filters.warehouseCode)
  );
}

function toAggregateRow(row, contract) {
  return {
    businessDate: row.businessDate,
    numerator: row[contract.numeratorField],
    denominator: row[contract.denominatorField],
    value: row[contract.valueField],
    formulaVersion: row.formulaVersion,
    dataStatus: row.dataStatus,
    eligible: row.eligible
  };
}

function groupMetricRows(rows, key, contract) {
  return [...new Set(rows.map((row) => row[key]))]
    .sort()
    .map((groupKey) => {
      const result = aggregateReportMetric(
        rows.filter((row) => row[key] === groupKey).map((row) => toAggregateRow(row, contract)),
        contract
      );
      return {
        key: groupKey,
        value: result.value,
        label: formatMetricValue(result.value, contract.unit)
      };
    });
}

function filterExpenseRows(rows, filters) {
  return rows.filter(
    (row) =>
      row.yearMonth === filters.yearMonth &&
      (filters.warehouseCode === "ALL" ||
        row.warehouseCode === filters.warehouseCode)
  );
}

function getEligibleOrderCount(filters) {
  return (
    METRIC_DAILY_ROWS.filter(
      (row) =>
        row.metricId === "order_fulfillment" &&
        row.yearMonth === filters.yearMonth &&
        (filters.warehouseCode === "ALL" ||
          row.warehouseCode === filters.warehouseCode)
    ).reduce((sum, row) => sum + Number(row.eligibleOrders || 0), 0) || 1
  );
}

function getEligibleOutboundPcs(filters) {
  return (
    METRIC_DAILY_ROWS.filter(
      (row) =>
        row.metricId === "commitment_ship_rate" &&
        row.yearMonth === filters.yearMonth &&
        (filters.warehouseCode === "ALL" ||
          row.warehouseCode === filters.warehouseCode)
    ).reduce((sum, row) => sum + Number(row.shippedPcs || 0), 0) || 1
  );
}

function metricContract(
  metricId,
  name,
  dimension,
  denominatorField,
  numeratorField,
  sourceReportId,
  target,
  formulaVersion
) {
  return {
    metricId,
    name,
    dimension,
    aggregationMode: "RATIO_RECALCULATE",
    numeratorField,
    denominatorField,
    sourceReportId,
    unit: "%",
    target,
    direction: "HIGHER_IS_BETTER",
    formulaVersion
  };
}

function flowContract(
  metricId,
  name,
  dimension,
  sourceReportId,
  target,
  unit,
  formulaVersion,
  direction = "HIGHER_IS_BETTER"
) {
  return {
    metricId,
    name,
    dimension,
    aggregationMode: "FLOW_SUM",
    valueField: "amount",
    sourceReportId,
    unit,
    target,
    direction,
    formulaVersion
  };
}

function ratioMetric(
  metricId,
  warehouseCode,
  businessDate,
  denominatorField,
  denominator,
  numeratorField,
  numerator,
  formulaVersion,
  cause,
  impact,
  owner,
  sla,
  anomalyCount,
  statusWeight,
  extra = {}
) {
  return {
    metricId,
    warehouseCode,
    businessDate,
    yearMonth: businessDate.slice(0, 7),
    [denominatorField]: denominator,
    [numeratorField]: numerator,
    formulaVersion,
    dataStatus: "原型資料",
    eligible: true,
    cause,
    impact,
    owner,
    sla,
    anomalyCount,
    statusWeight,
    sourceDocumentIds: [`DOC-${metricId}-${warehouseCode}-${businessDate}`],
    ...extra
  };
}

function flowMetric(
  metricId,
  warehouseCode,
  businessDate,
  amount,
  formulaVersion,
  cause,
  impact,
  owner,
  sla,
  anomalyCount,
  statusWeight
) {
  return {
    metricId,
    warehouseCode,
    businessDate,
    yearMonth: businessDate.slice(0, 7),
    amount,
    formulaVersion,
    dataStatus: "原型資料",
    eligible: true,
    cause,
    impact,
    owner,
    sla,
    anomalyCount,
    statusWeight,
    sourceDocumentIds: [`DOC-${metricId}-${warehouseCode}-${businessDate}`]
  };
}

function expense(
  expenseId,
  businessDate,
  warehouseCode,
  categoryId,
  accountName,
  expenseItem,
  purpose,
  amount,
  budgetAmount,
  vendor,
  sourceDocumentId,
  responsibleUnit,
  applicantId,
  isAnomaly,
  priorMonthDelta
) {
  return {
    expenseId,
    businessDate,
    yearMonth: businessDate.slice(0, 7),
    warehouseCode,
    categoryId,
    accountName,
    expenseItem,
    purpose,
    amount,
    budgetAmount,
    vendor,
    sourceDocumentId,
    responsibleUnit,
    applicantId,
    approvalStatus: expenseId === "EXP-008" ? "待覆核" : "已核准",
    note: expenseId === "EXP-006" ? "小額費用不得省略" : "原型資料",
    isAnomaly,
    priorMonthDelta,
    dataStatus: "原型資料"
  };
}

function evaluateMetricStatus(value, contract) {
  if (!Number.isFinite(value)) return "資料不足";
  return contract.direction === "LOWER_IS_BETTER"
    ? value <= contract.target
      ? "達標"
      : "未達"
    : value >= contract.target
      ? "達標"
      : "未達";
}

function formatMetricValue(value, unit) {
  if (!Number.isFinite(value)) return "資料不足";
  if (unit === "%") return `${(value * 100).toFixed(1)}%`;
  if (unit === "元") return `${Math.round(value).toLocaleString("zh-TW")} 元`;
  if (unit === "元/單") return `${value.toFixed(1)} 元/單`;
  return `${Math.round(value).toLocaleString("zh-TW")} ${unit}`.trim();
}
