import { getWarehouseDataStatus, getWh04InventoryProfile, isChildApplicable } from "./wms-warehouse-profiles.mjs";

export const WAREHOUSES = [
  { code: "WH01", name: "大豐一般倉", type: "一般倉", focus: "門市配送、一般庫存、出貨達成" },
  { code: "WH02", name: "大豐採品倉(000112)", type: "採品倉", focus: "採品、管罐玩具、採購補貨" },
  { code: "WH03", name: "新屋西藥倉(GDP)", type: "GDP / 西藥", focus: "GDP效期、批號、可用庫存、未上架QC" },
  { code: "WH04", name: "內壢成章倉(調劑)", type: "調劑倉", focus: "調劑耗材、庫齡、庫存移動" },
  { code: "WH05", name: "大園新倉電商倉", type: "電商倉", focus: "EXSD、Backlog、有庫未出、包裝交接" },
  { code: "WH06", name: "高邊退貨倉", type: "退貨倉", focus: "退貨分類、報廢銷毀、不可退廠、90天未異動" },
  { code: "WH07", name: "帳務及庶務倉", type: "帳務庶務", focus: "未拋帳、帳實差異、TMS派車、費用與權限" },
  { code: "WH08", name: "後送中心倉", type: "處方籤 / 零散藥品", focus: "處方籤、零散藥品、缺藥與交接" }
];

export const DASHBOARD_DEFINITIONS = [
  { name: "全倉營運達標總覽", managementQuestion: "哪個倉未達標、卡在哪個節點？", metricIds: ["weighted_attainment_rate", "reporting_completeness", "commitment_ship_rate"], source: "Daily_DB／WMS／PDA", drilldown: "倉別→工作台", renderType: "warehouse-overview" },
  { name: "入庫作業健康", managementQuestion: "應到至上架卡在哪個節點？", metricIds: ["inbound_expected_pcs", "inbound_received_pcs", "inbound_putaway_pcs"], source: "WMS／PDA接收事件", drilldown: "供應商→ASN→收貨單→SKU→LPN→PDA事件", renderType: "inbound-health" },
  { name: "出貨履約監控", managementQuestion: "哪些訂單即將逾時？", metricIds: ["commitment_ship_rate", "backlog_pcs", "oldest_wait_minutes"], source: "WMS／PDA／TMS", drilldown: "訂單→SKU→LPN／箱號→責任組", renderType: "outbound-fulfillment" },
  { name: "庫存健康與可用性", managementQuestion: "庫存是否真的可用？", metricIds: ["available_pcs", "unavailable_pcs", "aging_90d_pcs"], source: "庫存快照／異動Log", drilldown: "SKU→批效→LPN→儲位", renderType: "inventory-health" },
  { name: "人效與稼動管理", managementQuestion: "各作業與人力是否達標？", metricIds: ["weighted_productivity", "labor_utilization", "reporting_completeness"], source: "PDA任務／報工事件", drilldown: "作業→組別→人員→任務", renderType: "labor-management" },
  { name: "異常責任與閉環", managementQuestion: "異常是否逾時並完成複核？", metricIds: ["p1_open_count", "sla_overdue_count", "closure_rate"], source: "異常事件主檔", drilldown: "異常單→來源單據→責任", renderType: "exception-closure" },
  { name: "營運成本與單位成本", managementQuestion: "成本差異來自哪裡？", metricIds: ["total_cost", "cost_per_order", "cost_per_pcs"], source: "ERP／TMS／工時／包材", drilldown: "作業→費用→來源單據→規則版本", renderType: "operating-cost" }
];

export const WH03_GDP_REPORT_NAMES = [
  "進貨效期低於庫內庫存效期｜每日",
  "每日驗收差異表",
  "每日收貨上架情況",
  "未上架QC明細表",
  "出貨明細／批號效期追溯表",
  "每日庫存明細／不可用庫存表",
  "每日訂單作業／配庫達成表"
];

export const MODULES = [
  { id: "home", label: "Home", icon: "layout-dashboard", title: "工作台", defaultChild: "今日工作台", children: ["今日工作台", "全倉總覽", "P1待處理", "需求追蹤", "各倉狀態"] },
  { id: "inbound", label: "接收", icon: "package-plus", title: "接收", defaultChild: "每日進貨總表", children: ["到貨通知總表", "每日進貨總表", "驗收作業", "驗收差異", "理貨上架", "未上架QC", "短效效期比對"] },
  { id: "transfer", label: "移交", icon: "shuffle", title: "移交", defaultChild: "調整庫存移交", children: ["商品可用化明細", "查詢搬運作業", "查詢搬運等待", "查詢搬運明細", "庫存移交計畫", "庫存移交現況", "調整庫存移交", "跨倉分配明細"] },
  { id: "location", label: "位置", icon: "map-pin", title: "位置", defaultChild: "儲位查詢", children: ["儲位查詢", "庫區查詢", "儲位使用率", "儲位滿載率", "平面儲位容量", "溫層區管理"] },
  { id: "inventoryMove", label: "庫存移動", icon: "move-3d", title: "庫存移動", defaultChild: "庫存異動總表", children: ["庫存異動總表", "鎖庫／解鎖", "補貨任務", "庫存移交路徑", "盤點調整", "轉倉在途"] },
  { id: "inventory", label: "管理庫存", icon: "boxes", title: "管理庫存", defaultChild: "庫存查詢", children: ["庫存查詢", "每日庫存總表", "每日庫存快照", "庫齡／90天未異動", "可用／暫用／已揀／不可用", "盤點稽核", "SN流水"] },
  { id: "outbound", label: "出貨管理", icon: "truck", title: "出貨管理", defaultChild: "每日出貨總表", children: ["訂單接收", "每日出貨總表", "應出未出", "有庫未出", "無庫未出", "出貨明細", "配送交接", "EXSD Miss"] },
  { id: "outboundWork", label: "出貨工作", icon: "scan-line", title: "出貨工作", defaultChild: "揀貨下架", children: ["揀貨下架", "波次任務", "補貨／缺庫", "裝箱包貨", "分貨疊貨", "裝車載貨", "PDA作業Log"] },
  { id: "gdp", label: "GDP效期", icon: "shield-check", title: "GDP效期", defaultChild: WH03_GDP_REPORT_NAMES[0], warehouses: ["WH03"], children: WH03_GDP_REPORT_NAMES },
  { id: "exception", label: "異常", icon: "circle-alert", title: "異常", defaultChild: "異常閉環", children: ["異常閉環", "Line異常", "SLA逾時", "責任單位矩陣", "重複異常", "異常原因碼"] },
  { id: "labor", label: "人效", icon: "users-round", title: "人效", defaultChild: "報工稼動", children: ["報工稼動", "作業效率", "班別組別量能", "人貨二次比對", "訓練與責任追蹤"] },
  { id: "reports", label: "報表中心", icon: "file-spreadsheet", title: "報表中心", defaultChild: "Daily報表中心", children: ["Daily報表中心", "全倉月報表", "WMS季度報表", "營運關鍵數字"] },
  { id: "dashboard", label: "Dashboard", icon: "chart-no-axes-combined", title: "Dashboard", defaultChild: DASHBOARD_DEFINITIONS[0].name, children: DASHBOARD_DEFINITIONS.map((definition) => definition.name) },
  { id: "settings", label: "權限", icon: "settings", title: "權限", defaultChild: "角色權限", children: ["角色權限", "倉別權限", "欄位權限", "操作紀錄", "主檔參數"] }
];

const AGING_WAREHOUSES = new Set(["WH01", "WH04", "WH06"]);

const DAILY_INBOUND_COMMON_COLUMNS = [
  "營運日期", "倉別", "ASN／採購單", "收貨單", "供應商", "SKU ID", "品名", "批號", "效期",
  "應到PCS", "實到PCS", "卸貨PCS", "驗收PCS", "QC PCS", "已上架PCS", "到貨差異PCS", "驗收差異PCS", "目前節點",
  "異常原因", "責任人", "最後PDA事件時間"
];

const WH01_DAILY_INBOUND_COLUMNS = [
  "營運日期", "倉別", "ASN／採購單", "收貨單", "供應商", "SKU ID", "品名", "批號", "效期",
  "應收PCS", "實收PCS", "已上架PCS", "收貨差異PCS", "目前節點", "異常原因", "責任人", "最後PDA事件時間"
];

const DAILY_INBOUND_WAREHOUSE_COLUMNS = {
  WH03: ["GDP屬性", "剩餘效期天數", "保存天數", "允收天數", "庫內最短效期", "效期差異天數", "允收判定", "溫層", "QC狀態", "效期規則版本"],
  WH05: ["通路", "預約到貨時段", "月台", "收貨逾時分鐘"],
  WH06: ["退貨來源門市", "退貨原因", "商品狀態", "處置判定", "不可退廠清冊狀態", "報廢銷毀狀態", "銷毀批次"]
};

export function getVisibleModules(warehouseCode) {
  return MODULES.filter((module) => !module.warehouses || module.warehouses.includes(warehouseCode));
}

export function getVisibleChildren(warehouseCode, moduleId) {
  const module = MODULES.find((item) => item.id === moduleId);
  if (!module || (module.warehouses && !module.warehouses.includes(warehouseCode))) return [];
  if (moduleId === "home") return ["今日工作台", "P1待處理", "需求追蹤"];
  if (moduleId === "inbound" && warehouseCode === "WH06") return ["退貨收貨總表", "退貨判定", "退貨處置"];
  if (moduleId === "inventory" && warehouseCode === "WH04") {
    return module.children
      .map((child) => child === "庫齡／90天未異動" ? "90天未異動資料" : child)
      .concat("效期清查")
      .filter((child) => isChildApplicable(warehouseCode, moduleId, child));
  }
  const children = moduleId === "location" && warehouseCode === "WH01"
    ? [...module.children, "儲位主檔批次建置"]
    : [...module.children];
  return children.filter((child) => isChildApplicable(warehouseCode, moduleId, child));
}

export function getDailyInboundReportProfile(warehouseCode) {
  const warehouse = WAREHOUSES.find((item) => item.code === warehouseCode);
  if (!warehouse) throw new RangeError(`未知倉別：${warehouseCode}`);
  return {
    warehouseCode,
    title: "每日進貨總表",
    purpose: warehouseCode === "WH01"
      ? "確認應收、實收、待上架與收貨差異，並由主管總表回查內部卸貨、驗收、QC、上架與責任PDA節點。"
      : "確認應到、實到、卸貨、驗收、QC與上架是否完成，並分開追查到貨差異、驗收差異、待上架、責任與最後PDA節點。",
    dateBasis: "營運日期",
    columns: warehouseCode === "WH01"
      ? [...WH01_DAILY_INBOUND_COLUMNS]
      : [...DAILY_INBOUND_COMMON_COLUMNS, ...(DAILY_INBOUND_WAREHOUSE_COLUMNS[warehouseCode] || [])]
  };
}

const WH03_GDP_SAMPLE_DECISION = evaluateGdpAcceptance({
  businessDate: "2026-07-16",
  expiryDate: "2027-08-20",
  allowedReceiptDays: 365,
  inventoryMinimumExpiry: "2027-09-01"
});

const RECEIVING_SAMPLE_ROWS = {
  WH01: [["2026-07-16", "WH01", "ASN260716011／PO26071611", "RE260716011", "供應商A", "DF-209", "大豐一般商品", "B260716", "2028-07-16", 1200, 1100, 1100, 1100, 1100, 0, 100, 0, "待上架", "短收100PCS；儲位待確認", "張組長", "2026-07-16 10:20"]],
  WH03: [["2026-07-16", "WH03", "ASN260716001／PO26071601", "RE260716001", "藥廠A", "GDP-001", "藥品A", "B260701", "2027-08-20", 1000, 980, 980, 980, 980, 0, 20, 0, "QC待確認", "進貨效期早於庫內", "GDP窗口", "2026-07-16 09:42", "西藥", WH03_GDP_SAMPLE_DECISION.remainingDays, 730, 365, "2027-09-01", WH03_GDP_SAMPLE_DECISION.expiryDifferenceDays, WH03_GDP_SAMPLE_DECISION.finalStatus, "常溫", "待判定", "GDP-2026-07"]],
  WH05: [["2026-07-16", "WH05", "ASN260716051／PO26071651", "RE260716051", "供應商B", "DP-C001", "保健組合包", "B260702", "2028-07-01", 500, 500, 500, 500, 0, 420, 0, 0, "上架中", "待上架80PCS", "欣琪", "2026-07-16 10:15", "OMO", "09:00-10:00", "D05", 15]],
  WH06: [["2026-07-16", "WH06", "退貨公告260716／RT26071601", "RR260716001", "門市0211", "RT-991", "退貨良品", "B260701", "2028-01-01", 92, 92, 92, 92, 0, 80, 0, 0, "判定完成", "不良12PCS", "退貨判定組", "2026-07-16 11:08", "門市0211", "公告品退回", "良品／不良品", "良品入庫／不良隔離", "未列入", "不適用", "—"]]
};

function genericReceivingRow(warehouseCode) {
  return ["2026-07-16", warehouseCode, `ASN260716${warehouseCode.slice(2)}／PO26071601`, `RE260716${warehouseCode.slice(2)}`, "供應商A", "SKU-001", "原型測試商品", "B260716", "2028-07-16", 100, 100, 100, 100, 0, 100, 0, 0, "已上架", "—", "收貨組", "2026-07-16 09:30"];
}

export function getDailyReportProfile(warehouseCode, moduleId, childName) {
  if (moduleId !== "inbound" || childName !== "每日進貨總表") return null;
  const schema = getDailyInboundReportProfile(warehouseCode);
  const internalColumns = [...DAILY_INBOUND_COMMON_COLUMNS, ...(DAILY_INBOUND_WAREHOUSE_COLUMNS[warehouseCode] || [])];
  const rawRows = RECEIVING_SAMPLE_ROWS[warehouseCode] || [genericReceivingRow(warehouseCode)];
  const records = rawRows.map((row) => Object.fromEntries(internalColumns.map((column, index) => [column, row[index]])));
  const total = (column) => records.reduce((sum, record) => sum + Number(record[column] || 0), 0);
  const expectedPcs = total("應到PCS");
  const actualPcs = total("實到PCS");
  const inspectedPcs = total("驗收PCS");
  const putawayPcs = total("已上架PCS");
  const rows = records.map((record) => {
    const visibleRecord = warehouseCode === "WH01"
      ? {
          ...record,
          "應收PCS": record["應到PCS"],
          "實收PCS": record["實到PCS"],
          "收貨差異PCS": Number(record["應到PCS"] || 0) - Number(record["實到PCS"] || 0)
        }
      : record;
    return schema.columns.map((column) => visibleRecord[column]);
  });
  const kpis = warehouseCode === "WH01"
    ? [
        ["應收PCS", expectedPcs.toLocaleString("zh-TW"), "依營運日期有效ASN彙總"],
        ["收貨達成率", expectedPcs ? `${(actualPcs / expectedPcs * 100).toFixed(1)}%` : "資料不足", "實收PCS ÷ 應收PCS"],
        ["待上架PCS", (inspectedPcs - putawayPcs).toLocaleString("zh-TW"), "內部已驗收可上架PCS − 已上架PCS"],
        ["收貨差異PCS", (expectedPcs - actualPcs).toLocaleString("zh-TW"), "應收PCS − 實收PCS"]
      ]
    : [
        ["應到PCS", expectedPcs.toLocaleString("zh-TW"), "依營運日期彙總"],
        ["驗收完成率", actualPcs ? `${(inspectedPcs / actualPcs * 100).toFixed(1)}%` : "資料不足", "驗收PCS ÷ 實到PCS"],
        ["待上架PCS", (inspectedPcs - putawayPcs).toLocaleString("zh-TW"), "驗收PCS − 已上架PCS"],
        ["驗收差異PCS", total("驗收差異PCS").toLocaleString("zh-TW"), "實到PCS − 驗收PCS"]
      ];
  return {
    ...schema,
    subtitle: schema.purpose,
    source: "各倉每日必看報表／WMS單據／PDA事件",
    dataStatus: "原型資料",
    rows,
    kpis,
    pdaEvents: ["到倉", "卸貨", "驗收", "QC", "上架", "異常"],
    fieldNotes: [
      ["日期口徑", "營運日期為主管日報歸屬日；最後PDA事件時間保留實際時間戳。"],
      ["PDA狀態鏈", "到倉→卸貨→驗收→QC→上架；異常必須保留單據、SKU、批號／效期、人員與時間。"],
      ["資料狀態", "目前為原型資料；正式數字必須由WMS單據與PDA事件介接後取代。"]
    ]
  };
}

function wh01OperationalProfile(title, businessDate, columns, rows, kpis, source) {
  return {
    title,
    subtitle: "",
    source,
    dataStatus: "原型資料",
    columns,
    rows: rows.map((row) => [businessDate, "WH01", ...row]),
    kpis,
    fieldNotes: []
  };
}

const WH01_OPERATIONAL_PROFILES = {
  inbound: {
    "驗收作業": (businessDate) => wh01OperationalProfile(
      "驗收作業",
      businessDate,
      ["營運日期", "倉別", "收貨單", "SKU ID", "應驗PCS", "已驗PCS", "差異PCS", "驗收結果", "異常原因", "作業員ID", "最後PDA事件時間"],
      [["RE260716011", "DF-209", 1100, 1100, 0, "完成", "—", "OP-018", `${businessDate} 10:05`]],
      [["待驗PCS", "0", "應驗PCS − 已驗PCS"], ["驗收差異PCS", "0", "應驗PCS − 已驗PCS"]],
      "WMS收貨單／PDA驗收事件"
    ),
    "理貨上架": (businessDate) => wh01OperationalProfile(
      "理貨上架",
      businessDate,
      ["營運日期", "倉別", "上架單", "收貨單", "SKU ID", "來源儲位", "目的儲位", "應上架PCS", "已上架PCS", "上架時間", "作業員ID", "目前節點"],
      [["PA260716011", "RE260716011", "WH01-TEMP-01", "WH01-A01-01-43", 1100, 0, "—", "OP-026", "待上架"]],
      [["待上架PCS", "1,100", "應上架PCS − 已上架PCS"], ["已完成任務", "0", "以上架完成事件判定"]],
      "WMS上架單／PDA上架事件"
    )
  },
  outboundWork: {
    "波次任務": (businessDate) => wh01OperationalProfile(
      "波次任務",
      businessDate,
      ["營運日期", "倉別", "波次單", "出貨單", "SKU ID", "需求PCS", "最小單位PCS", "計量單位PCS", "已分派PCS", "班別／組別", "作業員ID", "目前節點"],
      [["WV260716001", "SO260716101", "DF-209", 480, 1, "PCS", 480, "A班／揀貨一組", "OP-031", "已分派"]],
      [["波次需求PCS", "480", "有效波次需求彙總"], ["未分派PCS", "0", "需求PCS − 已分派PCS"]],
      "WMS波次／派工事件"
    ),
    "揀貨下架": (businessDate) => wh01OperationalProfile(
      "揀貨下架",
      businessDate,
      ["營運日期", "倉別", "揀貨單", "波次單", "SKU ID", "儲位", "需求PCS", "完成PCS", "差異PCS", "差異原因", "作業員ID", "最後PDA事件時間"],
      [["PK260716001", "WV260716001", "DF-209", "WH01-A01-01-43", 480, 472, 8, "短揀／待複核", "OP-031", `${businessDate} 11:12`]],
      [["揀貨完成率", "98.3%", "完成PCS ÷ 需求PCS"], ["揀貨差異PCS", "8", "需求PCS − 完成PCS"]],
      "WMS揀貨單／PDA揀貨事件"
    )
  },
  inventory: {
    "庫存查詢": (businessDate) => wh01OperationalProfile(
      "庫存查詢",
      businessDate,
      ["營運日期", "倉別", "SKU ID", "品名", "批號", "效期", "儲位", "總PCS", "占用PCS", "剩餘PCS", "庫存狀態", "最後異動時間", "異動人員"],
      [["DF-209", "大豐一般商品", "B260716", "2028-07-16", "WH01-A01-01-43", 1200, 280, 920, "可用", `${businessDate} 11:25`, "OP-031"]],
      [["總PCS", "1,200", "庫存快照總量"], ["占用PCS", "280", "有效訂單配置量"], ["剩餘PCS", "920", "總PCS − 占用PCS"]],
      "WMS庫存快照／庫存異動Log"
    ),
    "盤點稽核": (businessDate) => wh01OperationalProfile(
      "盤點稽核",
      businessDate,
      ["營運日期", "倉別", "盤點單", "SKU ID", "儲位", "帳面PCS", "實盤PCS", "占用PCS", "盤差PCS", "差異原因", "盤點人員", "複核狀態"],
      [["CC260716001", "DF-209", "WH01-A01-01-43", 1200, 1198, 280, -2, "待查揀貨交接", "OP-044", "待複核"]],
      [["待複核盤點單", "1", "盤差未完成責任複核"], ["盤差PCS", "-2", "實盤PCS − 帳面PCS"]],
      "WMS盤點單／PDA盤點事件"
    )
  },
  location: {
    "儲位查詢": (businessDate) => wh01OperationalProfile(
      "儲位查詢",
      businessDate,
      ["營運日期", "倉別", "儲位編號", "大類", "庫區／棚別", "走道", "座", "格號", "揀貨路順", "容量PCS", "已用PCS", "剩餘容量PCS", "儲位狀態", "最後異動時間"],
      [["WH01-A01-01-43", "一般商品", "A棚", "01", "01", "43", 143, 1500, 1200, 300, "可用", `${businessDate} 11:25`]],
      [["儲位使用率", "80.0%", "已用PCS ÷ 容量PCS"], ["剩餘容量PCS", "300", "容量PCS − 已用PCS"]],
      "WMS儲位主檔／庫存快照"
    ),
    "儲位主檔批次建置": (businessDate) => wh01OperationalProfile(
      "儲位主檔批次建置",
      businessDate,
      ["營運日期", "倉別", "儲位編號", "大類", "庫區／棚別", "走道", "座", "格號", "揀貨路順", "容量PCS", "啟用狀態", "建立人員"],
      [["WH01-A01-01-43", "一般商品", "A棚", "01", "01", "43", 143, 1500, "待PDA驗證", "OP-ADM01"]],
      [["本批新增儲位", "1", "批次建置後待PDA驗證"], ["待列印標籤", "1", "依儲位編號產生Barcode"]],
      "WMS儲位主檔／儲位建置紀錄"
    )
  }
};

export function calculateWmsRate(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return "資料不足";
  return `${(numerator / denominator * 100).toFixed(1)}%`;
}

function wh03GdpProfile(title, businessDate, columns, rows, kpis, source) {
  return {
    title,
    subtitle: "",
    source,
    dataStatus: "原型資料",
    columns: ["營運日期", "倉別", ...columns],
    rows: rows.map((row) => [businessDate, "WH03", ...row]),
    kpis,
    fieldNotes: []
  };
}

const WH03_GDP_SAMPLE_DATE = "2026-07-16";

const WH03_GDP_OPERATIONAL_PROFILES = {
  "進貨效期低於庫內庫存效期｜每日": (businessDate) => wh03GdpProfile(
    "進貨效期低於庫內庫存效期｜每日",
    businessDate,
    ["進貨單", "供應商", "SKU ID", "品名", "批號", "進貨效期", "剩餘效期天數", "允收天數", "庫內最短效期", "效期差異天數", "允收判定", "規則版本", "責任單位", "最後PDA事件時間"],
    [["RE260719001", "藥廠A", "GDP-001", "藥品A", "B260701", "2027-08-20", 397, 365, "2027-09-01", -12, "待採購／GDP確認", "GDP-2026-07", "採購／GDP窗口", `${businessDate} 09:42`]],
    [["效期異常SKU", "1", "進貨效期早於庫內最短效期"], ["待採購／GDP確認", "1", "允收天數通過但效期排序異常"], ["不允收SKU", "0", "剩餘效期低於允收天數"], ["規則完整率", "100%", "允收天數與規則版本皆存在"]],
    "WMS進貨單／商品主檔／庫存效期快照／PDA驗收事件"
  ),
  "每日驗收差異表": (businessDate) => wh03GdpProfile(
    "每日驗收差異表",
    businessDate,
    ["驗收單", "進貨單", "供應商", "SKU ID", "批號", "效期", "通知應收PCS", "驗收入庫PCS", "驗收差異PCS", "驗收完成率", "差異原因", "責任人", "最後PDA事件時間"],
    [["CK260719001", "RE260719001", "藥廠A", "GDP-001", "B260701", "2027-08-20", 1000, 980, 20, calculateWmsRate(980, 1000), "短收20PCS／效期待確認", "GDP-OP-018", `${businessDate} 09:42`]],
    [["通知應收PCS", "1,000", "有效進貨通知彙總"], ["驗收入庫PCS", "980", "PDA驗收完成事件"], ["驗收差異PCS", "20", "通知應收PCS − 驗收入庫PCS"], ["驗收完成率", calculateWmsRate(980, 1000), "驗收入庫PCS ÷ 通知應收PCS"]],
    "WMS進貨通知／驗收單／PDA驗收事件"
  ),
  "每日收貨上架情況": (businessDate) => wh03GdpProfile(
    "每日收貨上架情況",
    businessDate,
    ["上架單", "收貨單", "SKU ID", "批號", "效期", "收貨PCS", "已完成上架PCS", "未上架PCS", "上架達成率", "來源儲位", "目的儲位", "作業員ID", "最後PDA事件時間"],
    [["PA260719001", "RE260719001", "GDP-001", "B260701", "2027-08-20", 980, 0, 980, calculateWmsRate(0, 980), "WH03-QC-A03", "WH03-G01-02-01", "GDP-OP-026", `${businessDate} 10:05`]],
    [["收貨PCS", "980", "已完成驗收可進上架流程"], ["已完成上架PCS", "0", "PDA上架完成事件"], ["未上架PCS", "980", "收貨PCS − 已完成上架PCS"], ["上架達成率", calculateWmsRate(0, 980), "已完成上架PCS ÷ 收貨PCS"]],
    "WMS收貨單／上架任務／PDA上架事件"
  ),
  "未上架QC明細表": (businessDate) => wh03GdpProfile(
    "未上架QC明細表",
    businessDate,
    ["進貨單", "供應商", "SKU ID", "品名", "批號", "效期", "QC待上架PCS", "QC原因", "等待分鐘", "責任單位", "處理狀態", "最後PDA事件時間"],
    [["RE260719001", "藥廠A", "GDP-001", "藥品A", "B260701", "2027-08-20", 980, "進貨效期早於庫內最短效期", 143, "採購／GDP窗口", "待確認", `${businessDate} 09:42`]],
    [["QC待上架PCS", "980", "QC未放行且尚未上架"], ["逾時件數", "1", "等待時間超過120分鐘"], ["影響SKU", "1", "目前不可轉可用庫存"], ["責任未定", "0", "責任單位已指派"]],
    "WMS進貨單／QC狀態／PDA事件／異常責任主檔"
  ),
  "出貨明細／批號效期追溯表": (businessDate) => wh03GdpProfile(
    "出貨明細／批號效期追溯表",
    businessDate,
    ["出貨單", "箱號", "門市驗收單號", "門市", "SKU ID", "品名", "出貨PCS", "批號", "效期", "批效完整率", "PDA作業員ID", "出貨時間"],
    [["SO260719031", "BX260719-031", "ST260719-088", "門市0211", "GDP-118", "藥品B", 80, "B260703", "2027-11-10", calculateWmsRate(1, 1), "GDP-OP-031", `${businessDate} 13:15`]],
    [["出貨箱數", "1", "有效出貨箱號"], ["出貨PCS", "80", "出貨完成事件數量"], ["批效完整率", calculateWmsRate(1, 1), "具批號與效期明細行 ÷ 全部明細行"], ["門市驗收單完整率", calculateWmsRate(1, 1), "具有驗收單號箱數 ÷ 出貨箱數"]],
    "WMS出貨單／箱號明細／PDA裝箱出貨事件／門市驗收單"
  ),
  "每日庫存明細／不可用庫存表": (businessDate) => wh03GdpProfile(
    "每日庫存明細／不可用庫存表",
    businessDate,
    ["SKU ID", "品名", "批號", "效期", "儲位", "WMS庫存PCS", "暫用PCS", "已揀PCS", "可用庫存PCS", "不可用庫存PCS", "不可用原因", "最短效期", "最後異動時間"],
    [["GDP-118", "藥品B", "B260703", "2027-11-10", "WH03-G01-02-01", 1280, 60, 40, 1180, 0, "—", "2027-11-10", `${businessDate} 11:20`]],
    [["WMS庫存PCS", "1,280", "庫存快照總量"], ["可用庫存PCS", "1,180", "WMS庫存 − 暫用 − 已揀 − 不可用"], ["不可用庫存PCS", "0", "鎖庫、隔離、待報廢互斥彙總"], ["帳料差異PCS", "0", "帳面庫存 − 實盤庫存"]],
    "WMS庫存快照／批號效期／儲位主檔／庫存異動Log"
  ),
  "每日訂單作業／配庫達成表": (businessDate) => wh03GdpProfile(
    "每日訂單作業／配庫達成表",
    businessDate,
    ["訂單", "門市", "SKU ID", "原始開單量", "轉換單位量", "庫存配置量", "出貨量", "訂單達成率", "可用庫存出貨達成率", "未完成原因", "責任節點", "最後PDA事件時間"],
    [["SO260719041", "門市1098", "GDP-001", 80, 80, 0, 0, calculateWmsRate(0, 80), calculateWmsRate(0, 0), "效期允收未完成", "採購／GDP確認", `${businessDate} 10:18`]],
    [["原始開單量", "80", "訂單原始需求PCS"], ["庫存配置量", "0", "通過效期與可用庫存檢查的配置量"], ["訂單達成率", calculateWmsRate(0, 80), "出貨量 ÷ 轉換單位量"], ["可用庫存出貨達成率", calculateWmsRate(0, 0), "出貨量 ÷ 可出庫配置量"]],
    "OMS訂單／WMS配庫／庫存可用性／PDA出貨事件"
  )
};

export function getWarehouseOperationalProfile(warehouseCode, moduleId, childName, businessDate) {
  if (warehouseCode === "WH01") {
    const factory = WH01_OPERATIONAL_PROFILES[moduleId]?.[childName];
    return factory ? factory(businessDate || "") : null;
  }
  if (warehouseCode === "WH03" && moduleId === "gdp") {
    const factory = WH03_GDP_OPERATIONAL_PROFILES[childName];
    return factory ? factory(WH03_GDP_SAMPLE_DATE) : null;
  }
  return null;
}

function isoDayNumber(value, fieldName) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) throw new TypeError(`${fieldName}格式錯誤`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new TypeError(`${fieldName}格式錯誤`);
  return Math.floor(date.getTime() / 86400000);
}

export function evaluateGdpAcceptance({ businessDate, expiryDate, allowedReceiptDays, inventoryMinimumExpiry }) {
  if (!Number.isInteger(allowedReceiptDays) || allowedReceiptDays < 0) throw new TypeError("允收規則缺漏");
  const businessDay = isoDayNumber(businessDate, "營運日期");
  const expiryDay = isoDayNumber(expiryDate, "進貨效期");
  const inventoryMinimumDay = isoDayNumber(inventoryMinimumExpiry, "庫內最短效期");
  const remainingDays = expiryDay - businessDay;
  const expiryDifferenceDays = expiryDay - inventoryMinimumDay;
  const minimumRule = remainingDays >= allowedReceiptDays ? "通過" : "不通過";
  const inventoryRule = expiryDifferenceDays >= 0 ? "不早於庫內最短效期" : "早於庫內最短效期";
  let finalStatus = "正常允收";
  if (minimumRule === "不通過") finalStatus = "不允收／隔離";
  else if (inventoryRule === "早於庫內最短效期") finalStatus = "待採購／GDP確認";
  return { remainingDays, expiryDifferenceDays, minimumRule, inventoryRule, finalStatus };
}

const GDP_EXCEPTION_REQUIRED_FIELDS = [
  "originalStatus", "reason", "skuId", "lotNumber", "expiryDate",
  "quantityPcs", "approvedBy", "approvedAt", "ruleVersion"
];

export function validateGdpExceptionApproval(record = {}) {
  const missingFields = GDP_EXCEPTION_REQUIRED_FIELDS.filter((field) =>
    record[field] === undefined || record[field] === null || record[field] === ""
  );
  return { valid: missingFields.length === 0, missingFields };
}

export function filterReportRows(rows, filters = {}) {
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  return rows.filter((row) =>
    (!filters.businessDate || row.businessDate === filters.businessDate) &&
    (!filters.warehouseCode || row.warehouseCode === filters.warehouseCode) &&
    (!filters.status || filters.status === "全部狀態" || row.status === filters.status) &&
    (!keyword || String(row.searchText || "").toLowerCase().includes(keyword))
  );
}

export function getDashboardDefinition(name) {
  return DASHBOARD_DEFINITIONS.find((definition) => definition.name === name) || null;
}

export function buildInboundHealth(rows) {
  const stageKeys = [
    ["應到", "expected"], ["實到", "received"], ["卸貨", "unloaded"],
    ["驗收", "inspected"], ["QC", "qc"], ["上架", "putaway"]
  ];
  const stages = stageKeys.map(([label, key]) => ({
    label,
    value: rows.reduce((sum, row) => sum + Number(row[key] || 0), 0)
  }));
  const reconciled = stages.every((stage, index) => index === 0 || stage.value <= stages[index - 1].value);
  return {
    stages,
    reconciled,
    dataStatus: rows.every((row) => row.dataStatus === "正式資料") ? "正式資料" : "原型資料"
  };
}

const METRIC_REQUIRED_FIELDS = [
  "metricId", "numerator", "denominator", "period", "updatedAt", "target", "warningThreshold",
  "exclusions", "formulaVersion", "source", "dataStatus", "drilldown", "consumers"
];

export function validateMetricDefinition(definition = {}) {
  const missingFields = METRIC_REQUIRED_FIELDS.filter((field) => {
    const value = definition[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  });
  return { valid: missingFields.length === 0, missingFields };
}

export function getMetricDisplayState(metric, context = {}) {
  const validation = validateMetricDefinition(metric);
  if (!validation.valid) {
    return { status: "資料不足", rankable: false, reason: `欄位缺漏：${validation.missingFields.join("、")}` };
  }
  if (metric.dataStatus !== "正式資料") {
    return { status: "資料不足", rankable: false, reason: "尚未介接正式來源" };
  }
  if (!Number.isFinite(metric.denominatorValue) || metric.denominatorValue <= 0) {
    return { status: "資料不足", rankable: false, reason: "分母為零或缺漏" };
  }
  if (!Number.isFinite(metric.numeratorValue)) {
    return { status: "資料不足", rankable: false, reason: "分子缺漏" };
  }
  const updatedAt = Date.parse(metric.updatedAt);
  const now = Date.parse(context.now || new Date().toISOString());
  const freshnessMinutes = Number(context.freshnessMinutes ?? 60);
  if (!Number.isFinite(updatedAt) || !Number.isFinite(now) || now - updatedAt > freshnessMinutes * 60000) {
    return { status: "資料不足", rankable: false, reason: "資料未於允許時間內更新" };
  }
  return { status: "可用", rankable: true, reason: "", value: metric.numeratorValue / metric.denominatorValue };
}

export function canRankMetrics(metrics, context = {}) {
  if (!Array.isArray(metrics) || metrics.length < 2) return false;
  if (!metrics.every((metric) => getMetricDisplayState(metric, context).rankable)) return false;
  const reference = metrics[0];
  const comparableFields = ["metricId", "numerator", "denominator", "period", "formulaVersion"];
  return metrics.every((metric) =>
    comparableFields.every((field) => metric[field] === reference[field]) &&
    JSON.stringify(metric.exclusions) === JSON.stringify(reference.exclusions)
  );
}

const METRIC_CONSUMERS = ["Dashboard", "Daily_DB", "04_看板總表"];
const COMMON_DRILLDOWN = ["營運日期", "倉別", "單據", "SKU", "批號／效期", "LPN", "儲位", "PDA事件", "人員", "責任節點"];
function metricContract(metricId, numerator, denominator, target, warningThreshold, formulaVersion, source, exclusions = []) {
  return {
    metricId,
    numerator,
    denominator,
    period: "營運日",
    updatedAt: "待正式介接",
    target,
    warningThreshold,
    exclusions,
    formulaVersion,
    source,
    dataStatus: "資料不足",
    drilldown: [...COMMON_DRILLDOWN],
    consumers: [...METRIC_CONSUMERS]
  };
}

const METRIC_DEFINITIONS = {
  weighted_attainment_rate: metricContract("weighted_attainment_rate", "完成任務標準工時合計", "有效實際投入工時合計", "≥100%", "<95%", "LABOR-1.0", "PDA任務／報工事件", ["未完成任務", "無標準工時任務"]),
  reporting_completeness: metricContract("reporting_completeness", "已完整報工任務數", "應報工任務數", "≥98%", "<95%", "LABOR-1.0", "PDA任務／報工事件", ["取消任務"]),
  commitment_ship_rate: metricContract("commitment_ship_rate", "最晚應出貨時間前完成訂單數", "同批應出訂單數", "依倉別出貨時效規則", "低於各倉門檻", "SHIP-1.0", "WMS／PDA／TMS", ["取消單", "測試單", "未到最晚應出貨時間"]),
  inbound_expected_pcs: metricContract("inbound_expected_pcs", "營運日應到PCS", "營運日有效ASN母集合", "依排程", "低於排程完整率", "INBOUND-1.0", "WMS ASN／採購單", ["取消ASN"]),
  inbound_received_pcs: metricContract("inbound_received_pcs", "同批實到PCS", "同批應到PCS", "100%", "<98%", "INBOUND-1.0", "WMS收貨單／PDA到倉事件", ["取消ASN"]),
  inbound_putaway_pcs: metricContract("inbound_putaway_pcs", "同批已上架PCS", "同批驗收可上架PCS", "100%", "<95%", "INBOUND-1.0", "PDA上架事件", ["QC隔離", "不允收"]),
  backlog_pcs: metricContract("backlog_pcs", "最晚應出貨時間前未完成PCS", "同批應出PCS", "0", ">0", "SHIP-1.0", "WMS訂單／PDA出貨事件", ["取消單", "測試單"]),
  oldest_wait_minutes: metricContract("oldest_wait_minutes", "最早未完成訂單等待分鐘", "同批未完成訂單母集合", "依倉別SLA", "超過倉別SLA", "SHIP-1.0", "WMS訂單事件", ["暫停單"]),
  available_pcs: metricContract("available_pcs", "互斥狀態為可用PCS", "庫存快照總PCS", "依安全庫存", "低於安全庫存", "INV-1.0", "WMS庫存快照", ["零庫存"]),
  unavailable_pcs: metricContract("unavailable_pcs", "互斥狀態為鎖庫／隔離／待報廢PCS", "庫存快照總PCS", "0", ">0", "INV-1.0", "WMS庫存快照", ["零庫存"]),
  aging_90d_pcs: metricContract("aging_90d_pcs", "適用庫存且90天未有效異動PCS", "適用庫存總PCS", "0", ">0", "AGING-1.0", "WMS庫存異動Log", ["WH06待判定", "WH06隔離", "WH06待報廢", "WH06退貨處理中"]),
  weighted_productivity: metricContract("weighted_productivity", "完成任務標準工時合計", "有效實際投入工時合計", "≥100%", "<95%", "LABOR-1.0", "PDA任務／報工事件", ["漏報任務禁止排名"]),
  labor_utilization: metricContract("labor_utilization", "有效作業工時", "可用排班工時", "依作業標準", "低於班別門檻", "LABOR-1.0", "排班／PDA／報工", ["核准休息", "教育訓練"]),
  p1_open_count: metricContract("p1_open_count", "P1未結件數", "P1有效事件母集合", "0", ">0", "EXC-1.0", "異常事件主檔", ["取消事件"]),
  sla_overdue_count: metricContract("sla_overdue_count", "超過SLA且未結事件數", "未結異常事件數", "0", ">0", "EXC-1.0", "異常事件主檔", ["核准暫停"]),
  closure_rate: metricContract("closure_rate", "期間內完成複核結案件數", "期間內應結案件數", "100%", "<95%", "EXC-1.0", "異常事件主檔", ["取消事件"]),
  total_cost: metricContract("total_cost", "人力＋OT＋委外＋配送＋包材＋異常成本", "營運日有效作業母集合", "預算內", "超預算", "COST-1.0", "ERP／TMS／工時／包材", ["非營運費用"]),
  cost_per_order: metricContract("cost_per_order", "營運總成本", "完成訂單數", "依預算", "超單位預算", "COST-1.0", "ERP／WMS", ["取消單", "測試單"]),
  cost_per_pcs: metricContract("cost_per_pcs", "營運總成本", "完成出貨PCS", "依預算", "超單位預算", "COST-1.0", "ERP／WMS", ["取消單", "測試單"])
};

export function getMetricDefinition(metricId) {
  return METRIC_DEFINITIONS[metricId] ? { ...METRIC_DEFINITIONS[metricId], exclusions: [...METRIC_DEFINITIONS[metricId].exclusions], drilldown: [...METRIC_DEFINITIONS[metricId].drilldown], consumers: [...METRIC_DEFINITIONS[metricId].consumers] } : null;
}

const OUTBOUND_COMMITMENT_POLICIES = {
  WH05: {
    status: "已設定",
    policyId: "WH05-EXSD-1.0",
    label: "通路EXSD出貨時效",
    startsAt: "訂單釋放時間",
    endsAt: "完成出貨時間",
    deadlineField: "EXSD",
    exclusions: ["取消單", "測試單", "尚未到最晚應出貨時間"],
    source: "02電商_報表／每日訂單統計表"
  }
};

export function getOutboundCommitmentPolicy(warehouseCode) {
  return OUTBOUND_COMMITMENT_POLICIES[warehouseCode] || {
    status: "資料不足",
    policyId: null,
    label: "出貨時效規則未確認",
    warehouseCode
  };
}

export function buildOutboundFunnel(orders, warehouseCode, businessDate) {
  const eligibleOrders = orders.filter((order) =>
    order.warehouseCode === warehouseCode &&
    order.businessDate === businessDate &&
    !order.excluded &&
    !order.cancelled
  );
  const cohortOrderIds = eligibleOrders.map((order) => order.orderId);
  const stageDefinitions = [
    ["應出", null], ["已釋放", "releasedAt"], ["已揀", "pickedAt"],
    ["已包", "packedAt"], ["已交接", "handedOffAt"], ["已出貨", "shippedAt"]
  ];
  const stages = stageDefinitions.map(([label, eventField]) => ({
    label,
    value: eventField ? eligibleOrders.filter((order) => Boolean(order[eventField])).length : eligibleOrders.length,
    denominatorOrderIds: [...cohortOrderIds]
  }));
  return { warehouseCode, businessDate, cohortOrderIds, stages };
}

const OUTBOUND_REPORT_CHILDREN = new Set(["每日出貨總表", "應出未出", "有庫未出", "無庫未出"]);
const WH05_OUTBOUND_SAMPLE_ORDERS = [
  { orderId: "SO260716001", warehouseCode: "WH05", businessDate: "2026-07-16", excluded: false, releasedAt: "08:05", pickedAt: "08:42", packedAt: "09:18", handedOffAt: null, shippedAt: null, sku: "DP-C001", lpn: "BX260716-001", deadline: "2026-07-16 13:00", responsibility: "包裝交接", owner: "包裝組", pdaEvent: "包裝完成 09:18", inventoryState: "有庫" },
  { orderId: "SO260716002", warehouseCode: "WH05", businessDate: "2026-07-16", excluded: false, releasedAt: "08:15", pickedAt: null, packedAt: null, handedOffAt: null, shippedAt: null, sku: "DP-C118", lpn: "—", deadline: "2026-07-16 15:00", responsibility: "揀貨", owner: "揀貨組", pdaEvent: "波次釋放 08:15", inventoryState: "無庫" }
];

export function getOutboundReportProfile(warehouseCode, childName, businessDate) {
  if (!OUTBOUND_REPORT_CHILDREN.has(childName)) return null;
  const policy = getOutboundCommitmentPolicy(warehouseCode);
  const columns = ["營運日期", "倉別", "出貨時效規則", "訂單", "SKU", "LPN／箱號", "庫存狀態", "目前節點", "最晚應出貨時間", "是否逾時", "責任節點", "責任人／單位", "最後PDA事件時間"];
  if (policy.status !== "已設定") {
    return {
      title: childName,
      dataStatus: "資料不足",
      policy,
      columns,
      rows: [],
      kpis: [["出貨時效規則", policy.label, "資料不足｜未確認前禁止套用24小時"], ["應出母集合", "資料不足", "禁止計算與排名"]],
      fieldNotes: []
    };
  }
  const funnel = buildOutboundFunnel(WH05_OUTBOUND_SAMPLE_ORDERS, warehouseCode, businessDate);
  const eligible = WH05_OUTBOUND_SAMPLE_ORDERS.filter((order) => funnel.cohortOrderIds.includes(order.orderId));
  const rows = eligible
    .filter((order) => childName === "每日出貨總表" || childName === "應出未出" || (childName === "有庫未出" && order.inventoryState === "有庫" && !order.shippedAt) || (childName === "無庫未出" && order.inventoryState === "無庫" && !order.shippedAt))
    .map((order) => [businessDate, warehouseCode, policy.label, order.orderId, order.sku, order.lpn, order.inventoryState, order.shippedAt ? "已出貨" : order.handedOffAt ? "已交接" : order.packedAt ? "已包" : order.pickedAt ? "已揀" : "已釋放", order.deadline, "依系統時間判定", order.responsibility, order.owner, order.pdaEvent]);
  return {
    title: childName,
    dataStatus: "原型資料",
    policy,
    columns,
    rows,
    kpis: funnel.stages.map((stage) => [stage.label, String(stage.value), `同一母集合 ${funnel.cohortOrderIds.length} 單`]),
    fieldNotes: []
  };
}

export function classifyInventoryState(record) {
  if (!Number.isFinite(record.quantity) || record.quantity < 0) throw new TypeError("庫存數量錯誤");
  if (record.pendingDisposal) return "待報廢";
  if (record.isolated) return "隔離";
  if (record.locked) return "鎖庫";
  if (record.allocated) return "已配置";
  if (record.available) return "可用";
  throw new TypeError("庫存狀態缺漏");
}

export function calculateInactiveDays(record, businessDate) {
  const effectiveDates = (record.events || [])
    .filter((event) => Number(event.quantityDelta) !== 0)
    .map((event) => event.date)
    .filter(Boolean);
  const lastEffectiveDate = record.lastEffectiveMovementDate || effectiveDates.sort().at(-1);
  if (!lastEffectiveDate) throw new TypeError("最後有效庫存異動日缺漏");
  return isoDayNumber(businessDate, "營運日期") - isoDayNumber(lastEffectiveDate, "最後有效庫存異動日");
}

export function isAgingEligible(record, warehouseCode) {
  if (!AGING_WAREHOUSES.has(warehouseCode)) return { eligible: false, reason: "此倉不適用90天未異動" };
  if (warehouseCode !== "WH06") return { eligible: true, reason: "適用" };
  const excludedStates = new Set(["待判定", "隔離", "待報廢", "退貨處理中"]);
  if (excludedStates.has(record.dispositionState)) return { eligible: false, reason: `WH06排除：${record.dispositionState}` };
  return { eligible: ["良品", "可再利用"].includes(record.dispositionState), reason: ["良品", "可再利用"].includes(record.dispositionState) ? "適用" : "WH06僅計良品／可再利用" };
}

const INVENTORY_REPORT_CHILDREN = new Set(["庫存查詢", "每日庫存總表", "每日庫存快照", "庫齡／90天未異動", "可用／暫用／已揀／不可用"]);
const INVENTORY_SAMPLE_RECORDS = [
  { warehouseCode: "WH01", sku: "DF-209", batch: "B260101", expiry: "2028-01-01", lpn: "LPN-WH01-001", location: "A01-01-01", quantity: 120, available: true, dispositionState: "可用", lastEffectiveMovementDate: "2026-04-01", lastEvent: "移庫完成" },
  { warehouseCode: "WH04", sku: "RX-MAT-01", batch: "B251201", expiry: "2027-12-01", lpn: "LPN-WH04-011", location: "M02-03-01", quantity: 80, locked: true, dispositionState: "可用", lastEffectiveMovementDate: "2026-03-20", lastEvent: "盤點調整" },
  { warehouseCode: "WH05", sku: "DP-C001", batch: "B260702", expiry: "2028-07-01", lpn: "LPN-WH05-021", location: "A01-03-02", quantity: 300, allocated: true, dispositionState: "可用", lastEffectiveMovementDate: "2026-07-15", lastEvent: "波次配置" },
  { warehouseCode: "WH06", sku: "RT-991", batch: "B260101", expiry: "2028-01-01", lpn: "LPN-WH06-031", location: "GOOD-01", quantity: 92, available: true, dispositionState: "良品", lastEffectiveMovementDate: "2026-04-01", lastEvent: "退貨良品入庫" },
  { warehouseCode: "WH06", sku: "RT-332", batch: "B250901", expiry: "2026-09-15", lpn: "LPN-WH06-032", location: "ISO-01", quantity: 120, isolated: true, dispositionState: "隔離", lastEffectiveMovementDate: "2026-03-01", lastEvent: "退貨判定隔離" }
];

export function getInventoryReportProfile(warehouseCode, childName, businessDate) {
  if (warehouseCode === "WH04" && ["90天未異動資料", "庫齡／90天未異動", "效期清查"].includes(childName)) {
    return getWh04InventoryProfile(childName, businessDate);
  }
  if (!INVENTORY_REPORT_CHILDREN.has(childName)) return null;
  if (childName === "庫齡／90天未異動" && !AGING_WAREHOUSES.has(warehouseCode)) return null;
  const records = INVENTORY_SAMPLE_RECORDS.filter((record) => record.warehouseCode === warehouseCode);
  const selected = childName === "庫齡／90天未異動"
    ? records.filter((record) => isAgingEligible(record, warehouseCode).eligible && calculateInactiveDays(record, businessDate) >= 90)
    : records;
  const columns = ["營運日期", "倉別", "SKU", "批號", "效期", "LPN", "儲位", "互斥庫存狀態", "PCS", "最後有效異動日", "未異動天數", "適用判定", "最後有效事件"];
  const rows = selected.map((record) => [businessDate, warehouseCode, record.sku, record.batch, record.expiry, record.lpn, record.location, classifyInventoryState(record), record.quantity, record.lastEffectiveMovementDate, calculateInactiveDays(record, businessDate), isAgingEligible(record, warehouseCode).reason, record.lastEvent]);
  return {
    title: childName,
    dataStatus: "原型資料",
    columns,
    rows,
    kpis: [["庫存PCS", String(rows.reduce((sum, row) => sum + row[8], 0)), "互斥狀態加總"], ["90天未異動", String(rows.filter((row) => row[10] >= 90).reduce((sum, row) => sum + row[8], 0)), "只計適用庫存"]],
    fieldNotes: []
  };
}

const RETURN_REPORT_CHILDREN = new Set(["退貨收貨總表", "退貨判定", "退貨處置"]);
export function getReturnReportProfile(warehouseCode, childName, businessDate) {
  if (warehouseCode !== "WH06" || !RETURN_REPORT_CHILDREN.has(childName)) return null;
  const columns = ["營運日期", "倉別", "退貨單", "來源門市", "SKU", "批號", "效期", "LPN", "收貨PCS", "商品狀態", "處置判定", "不可退廠清冊狀態", "報廢銷毀狀態", "責任節點", "責任人／單位", "最後PDA事件時間"];
  return {
    title: childName,
    dataStatus: "原型資料",
    columns,
    rows: [[businessDate, "WH06", "RT260716001", "門市0211", "RT-991", "B260701", "2028-01-01", "LPN-WH06-031", 92, "良品／不良品待分流", childName === "退貨收貨總表" ? "待判定" : "良品入庫／不良隔離", "未列入", "不適用", childName, "退貨判定組", "2026-07-16 11:08"]],
    kpis: [["收貨PCS", "92", "來源退貨單"], ["待判定PCS", childName === "退貨收貨總表" ? "92" : "0", "不得提前列可用庫存"]],
    fieldNotes: []
  };
}

export function calculateLaborMetrics(tasks, completenessThreshold = 0.95) {
  const earnedStandardMinutes = tasks.reduce((sum, task) => sum + Number(task.standardMinutesPerUnit || 0) * Number(task.completedUnits || 0), 0);
  const actualEffectiveMinutes = tasks.reduce((sum, task) => sum + Number(task.actualEffectiveMinutes || 0), 0);
  const completeReports = tasks.filter((task) => task.reportComplete).length;
  const weightedEfficiency = actualEffectiveMinutes > 0 ? earnedStandardMinutes / actualEffectiveMinutes : null;
  const reportingCompleteness = tasks.length > 0 ? completeReports / tasks.length : null;
  return {
    earnedStandardMinutes,
    actualEffectiveMinutes,
    weightedEfficiency,
    reportingCompleteness,
    rankable: weightedEfficiency !== null && reportingCompleteness !== null && reportingCompleteness >= completenessThreshold
  };
}

const P1_REQUIRED_FIELDS = ["businessDate", "warehouseCode", "operation", "condition", "impact", "ownerNode", "owner", "sla", "sourceDocument"];
export function validateP1Alert(alert = {}) {
  const missingFields = P1_REQUIRED_FIELDS.filter((field) => alert[field] === undefined || alert[field] === null || alert[field] === "");
  return { valid: missingFields.length === 0, missingFields };
}

const LABOR_REPORT_CHILDREN = new Set(["報工稼動", "作業效率", "班別組別量能"]);
const LABOR_SAMPLE_TASKS = {
  WH05: [
    { taskId: "PK260716-01", operation: "包裝", team: "包裝A組", standardMinutesPerUnit: 1.2, completedUnits: 120, actualEffectiveMinutes: 130, reportComplete: true, owner: "包裝A組" },
    { taskId: "PK260716-02", operation: "包裝", team: "包裝B組", standardMinutesPerUnit: 1.2, completedUnits: 80, actualEffectiveMinutes: 70, reportComplete: false, owner: "包裝B組" }
  ]
};

export function getLaborReportProfile(warehouseCode, childName, businessDate) {
  if (!LABOR_REPORT_CHILDREN.has(childName)) return null;
  const tasks = LABOR_SAMPLE_TASKS[warehouseCode] || [];
  const metrics = calculateLaborMetrics(tasks);
  const columns = ["營運日期", "倉別", "作業", "班別／組別", "完成任務", "標準工時分鐘", "有效實際工時分鐘", "標準工時加權達成率", "報工完整率", "排名資格", "責任人／單位"];
  const status = metrics.rankable ? "可排名" : "禁止排名";
  return {
    title: childName,
    dataStatus: tasks.length ? "原型資料" : "資料不足",
    columns,
    rows: tasks.length ? [[businessDate, warehouseCode, childName, "全班", tasks.length, metrics.earnedStandardMinutes, metrics.actualEffectiveMinutes, metrics.weightedEfficiency === null ? "資料不足" : `${(metrics.weightedEfficiency * 100).toFixed(1)}%`, metrics.reportingCompleteness === null ? "資料不足" : `${(metrics.reportingCompleteness * 100).toFixed(1)}%`, status, "倉主管／組長"]] : [],
    kpis: [["標準工時加權達成率", metrics.weightedEfficiency === null ? "資料不足" : `${(metrics.weightedEfficiency * 100).toFixed(1)}%`, "標準工時合計÷有效實際工時合計"], ["報工完整率", metrics.reportingCompleteness === null ? "資料不足" : `${(metrics.reportingCompleteness * 100).toFixed(1)}%`, status]],
    fieldNotes: []
  };
}

const P1_SAMPLE_ALERTS = [
  { businessDate: "2026-07-16", warehouseCode: "WH03", operation: "GDP進貨允收", condition: "進貨效期早於庫內最短效期", impact: "980PCS暫不可上架，影響可用庫存", ownerNode: "採購／GDP允收", owner: "採購與GDP窗口", sla: "剩餘4小時", sourceDocument: "ASN260716001" },
  { businessDate: "2026-07-16", warehouseCode: "WH05", operation: "出貨包裝", condition: "EXSD前35分鐘仍有28PCS待包", impact: "可能造成出貨時效逾時", ownerNode: "包裝交接", owner: "包裝組", sla: "剩餘35分鐘", sourceDocument: "SO260716001" },
  { businessDate: "2026-07-16", warehouseCode: "WH06", operation: "退貨處置", condition: "不可退廠清冊24筆未結", impact: "待報廢庫存與報廢金額無法結清", ownerNode: "退貨判定／管理核准", owner: "退貨組與管理課", sla: "剩餘1日", sourceDocument: "RT260716001" }
];

export function getP1ReportProfile(warehouseCode, businessDate) {
  const alerts = P1_SAMPLE_ALERTS.filter((alert) => alert.businessDate === businessDate && (!warehouseCode || alert.warehouseCode === warehouseCode));
  const columns = ["優先級", "營運日期", "倉別", "大作業類型", "具體狀況", "營運影響", "責任節點", "責任人／單位", "SLA", "來源單據"];
  const dataStatus = warehouseCode ? getWarehouseDataStatus(warehouseCode) : "原型資料";
  return {
    title: "P1待處理",
    dataStatus,
    columns,
    rows: dataStatus === "待確認" ? [] : alerts.filter((alert) => validateP1Alert(alert).valid).map((alert) => ["P1", alert.businessDate, alert.warehouseCode, alert.operation, alert.condition, alert.impact, alert.ownerNode, alert.owner, alert.sla, alert.sourceDocument]),
    kpis: dataStatus === "待確認"
      ? [["資料狀態", "待確認", "不得補造P1事件"], ["P1未結", "資料不足", "待主管或會議確認來源"]]
      : [["P1未結", String(alerts.length), "每筆必須具備狀況、影響與責任"], ["資料完整率", alerts.length && alerts.every((alert) => validateP1Alert(alert).valid) ? "100%" : "資料不足", "缺欄不得列入管理數字"]],
    fieldNotes: []
  };
}
