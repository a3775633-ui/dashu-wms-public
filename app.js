import {
  WAREHOUSES as warehouses,
  MODULES as modules,
  getVisibleModules as getConfiguredVisibleModules,
  getVisibleChildren,
  getDailyReportProfile,
  filterReportRows,
  getDashboardDefinition,
  getOutboundReportProfile,
  getInventoryReportProfile,
  getReturnReportProfile,
  getLaborReportProfile,
  getP1ReportProfile,
  getWarehouseOperationalProfile
} from "./wms-domain.mjs";
import { getQuarterlyKpiModel, getQuarterlyMilestoneModel } from "./wms-quarterly-data.mjs";
import { renderQuarterlyFilters, renderQuarterlyKpiTab, renderQuarterlyMilestoneTab, buildCurrentQuarterExport, buildQuarterWorkbookSheets } from "./wms-quarterly-view.mjs";
import { createXlsxWorkbook } from "./wms-excel-export.mjs";
import { getDashboardModel } from "./wms-dashboard-data.mjs";
import { renderDashboardCharts } from "./wms-dashboard-view.mjs";
import {
  getDailyReportCenterModel,
  getMonthlyReportModel,
  getKeyNumbersModel,
  getExpenseHierarchyModel,
  getMetricDrilldownModel,
  getDailyDrilldownTarget
} from "./wms-report-center-data.mjs";
import {
  renderDailyReportCenter,
  renderMonthlyReport,
  renderKeyNumbers,
  renderExpenseHierarchy,
  renderMetricDrilldown,
  buildDailyExportSheets,
  buildMonthlyExportSheets,
  buildKeyNumbersExportSheets
} from "./wms-report-center-view.mjs";
import { appendOperationalNote } from "./wms-report-center.mjs";
import { getWarehouseDataStatus, getWarehouseHomeProfile } from "./wms-warehouse-profiles.mjs";

/* Legacy definitions retained temporarily while report profiles are migrated. */
/* const warehouses = [
  { code: "WH01", name: "大豐一般倉", type: "一般倉", focus: "門市配送、一般庫存、出貨達成" },
  { code: "WH02", name: "大豐採品倉(000112)", type: "採品倉", focus: "採品、管罐玩具、採購補貨" },
  { code: "WH03", name: "新屋西藥倉(GDP)", type: "GDP / 西藥", focus: "GDP效期、批號、可用庫存、未上架QC" },
  { code: "WH04", name: "內壢成章倉(調劑)", type: "調劑倉", focus: "調劑耗材、庫齡、庫存移動" },
  { code: "WH05", name: "大園新倉電商倉", type: "電商倉", focus: "EXSD、Backlog、有庫未出、包裝交接" },
  { code: "WH06", name: "高邊退貨倉", type: "退貨倉", focus: "退貨分類、報廢銷毀、不可退廠、90天未異動" },
  { code: "WH07", name: "帳務及庶務倉", type: "帳務庶務", focus: "未拋帳、帳實差異、TMS派車、費用與權限" },
  { code: "WH08", name: "後送中心倉", type: "處方籤 / 零散藥品", focus: "處方籤、零散藥品、缺藥與交接" }
]; */

/* const modules = [
  {
    id: "home",
    label: "Home",
    icon: "layout-dashboard",
    title: "工作台",
    defaultChild: "今日工作台",
    children: ["今日工作台", "全倉總覽", "P1待處理", "需求追蹤", "各倉狀態"]
  },
  {
    id: "inbound",
    label: "接收",
    icon: "package-plus",
    title: "接收",
    defaultChild: "進貨大報表",
    children: ["到貨通知大表", "進貨大報表", "驗收作業", "驗收差異", "理貨上架", "未上架QC", "短效效期比對"]
  },
  {
    id: "transfer",
    label: "移交",
    icon: "shuffle",
    title: "移交",
    defaultChild: "調整庫存移交",
    children: ["商品可用化明細", "查詢搬運作業", "查詢搬運等待", "查詢搬運明細", "庫存移交計畫", "庫存移交現況", "調整庫存移交", "跨倉分配明細"]
  },
  {
    id: "location",
    label: "位置",
    icon: "map-pin",
    title: "位置",
    defaultChild: "儲位查詢",
    children: ["儲位查詢", "庫區查詢", "儲位使用率", "儲位滿載率", "平面儲位容量", "溫層區管理"]
  },
  {
    id: "inventoryMove",
    label: "庫存移動",
    icon: "move-3d",
    title: "庫存移動",
    defaultChild: "庫存異動大表",
    children: ["庫存異動大表", "鎖庫 / 解鎖", "補貨任務", "庫存移交路徑", "盤點調整", "轉倉在途"]
  },
  {
    id: "inventory",
    label: "管理庫存",
    icon: "boxes",
    title: "管理庫存",
    defaultChild: "庫存查詢",
    children: ["庫存查詢", "庫存大報表", "每日庫存快照", "庫齡 / 90天未異動", "可用 / 暫用 / 已揀 / 不可用", "盤點稽核", "SN流水"]
  },
  {
    id: "outbound",
    label: "出貨管理",
    icon: "truck",
    title: "出貨管理",
    defaultChild: "出貨大報表",
    children: ["訂單接收", "出貨大報表", "應出未出", "有庫未出", "無庫未出", "出貨明細", "配送交接", "EXSD Miss"]
  },
  {
    id: "outboundWork",
    label: "出貨工作",
    icon: "scan-line",
    title: "出貨工作",
    defaultChild: "揀貨下架",
    children: ["揀貨下架", "波次任務", "補貨 / 缺庫", "裝箱包貨", "分貨疊貨", "裝車載貨", "PDA作業Log"]
  },
  {
    id: "gdp",
    label: "GDP效期",
    icon: "shield-check",
    title: "GDP效期",
    defaultChild: "效期風險大表",
    children: ["效期風險大表", "進貨效期低於庫內", "短效 / 近效", "批號效期追溯", "未上架QC明細", "採購允收規則"]
  },
  {
    id: "exception",
    label: "異常",
    icon: "circle-alert",
    title: "異常",
    defaultChild: "異常閉環",
    children: ["異常閉環", "Line異常", "SLA逾時", "責任單位矩陣", "重複異常", "異常原因碼"]
  },
  {
    id: "labor",
    label: "人效",
    icon: "users-round",
    title: "人效",
    defaultChild: "報工稼動",
    children: ["報工稼動", "作業效率", "班別組別量能", "人貨二次比對", "訓練與責任追蹤"]
  },
  {
    id: "reports",
    label: "報表中心",
    icon: "file-spreadsheet",
    title: "報表中心",
    defaultChild: "Daily報表中心",
    children: ["Daily報表中心", "Daily_DB", "月季彙總", "欄位字典", "匯出中心", "廠商格式對照"]
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "chart-no-axes-combined",
    title: "Dashboard",
    defaultChild: "全倉經營總覽",
    children: ["全倉經營總覽", "電商倉營運", "入庫健康", "庫存健康", "異常閉環", "營運成本"]
  },
  {
    id: "settings",
    label: "權限",
    icon: "settings",
    title: "權限",
    defaultChild: "角色權限",
    children: ["角色權限", "倉別權限", "欄位權限", "操作紀錄", "主檔參數"]
  }
]; */

const state = {
  warehouse: warehouses[4],
  activeModule: "home",
  activeChild: "今日工作台",
  showColumnPanel: false,
  currentExport: { title: "大樹WMS報表", columns: [], rows: [] },
  reportCenterWorkbook: { title: "大樹WMS_報表中心", sheets: [] },
  dashboardSelection: null,
  reportFilters: { businessDate: "2026-07-16", status: "全部狀態", keyword: "" },
  dailyReportFilters: {
    businessDate: "2026-07-16",
    warehouseCode: "WH05",
    dimension: "進貨",
    reportId: "daily_inbound",
    status: "全部狀態",
    keyword: ""
  },
  monthlyReportFilters: {
    yearMonth: "2026-07",
    warehouseCode: "ALL",
    compareMode: "上月",
    dimension: "全部方向",
    keyword: ""
  },
  keyNumberFilters: {
    yearMonth: "2026-07",
    warehouseCode: "ALL",
    compareMode: "上月",
    dimension: "全部方向",
    keyword: ""
  },
  monthlyUi: { selectedDimension: "進貨", selectedMetricId: "arrival_rate" },
  keyNumberUi: {
    selectedDimension: "進貨",
    selectedMetricId: "",
    expenseLevel: "summary",
    selectedExpenseCategory: "",
    selectedAccountName: "",
    selectedExpenseItem: ""
  },
  operationalNotes: [],
  quarterlyTab: "kpi",
  quarterlyGranularity: "week",
  selectedQuarterlyMetricId: "commitment_ship_rate",
  selectedQuarterlyPoint: "",
  quarterlyFilters: {
    year: 2026,
    quarter: "Q3",
    warehouseCode: "ALL",
    dimension: "全部面向",
    status: "全部狀態",
    keyword: ""
  }
};

const dailySummaryRows = [
  ["WH01", "大豐一般倉", "98.2%", "18", "1", "一般倉", "需追蹤"],
  ["WH02", "大豐採品倉", "94.8%", "8", "1", "採品倉", "需追蹤"],
  ["WH03", "新屋西藥倉(GDP)", "97.7%", "9", "2", "GDP效期", "需追蹤"],
  ["WH04", "內壢成章倉", "99.7%", "0", "3", "調劑倉", "需追蹤"],
  ["WH05", "大園新倉電商倉", "91.0%", "68", "83", "電商倉", "P1追蹤"],
  ["WH06", "高邊退貨倉", "88.0%", "12", "4", "退貨倉", "P1追蹤"],
  ["WH07", "帳務及庶務倉", "96.5%", "3", "0", "帳務庶務", "P1追蹤"],
  ["WH08", "後送中心倉", "93.4%", "7", "6", "處方籤", "需追蹤"]
];

const dashboardRanking = [
  { code: "WH04", name: "內壢成章倉", complete: 99.7, inbound: 97, inventory: 82, exceptions: 1, cost: 92, risk: "庫齡 90天未異動" },
  { code: "WH01", name: "大豐一般倉", complete: 98.2, inbound: 91, inventory: 78, exceptions: 2, cost: 88, risk: "有庫未出 18" },
  { code: "WH03", name: "新屋西藥倉(GDP)", complete: 97.7, inbound: 83, inventory: 68, exceptions: 5, cost: 81, risk: "GDP八報表 / 效期允收" },
  { code: "WH07", name: "帳務及庶務倉", complete: 96.5, inbound: 92, inventory: 74, exceptions: 6, cost: 69, risk: "TMS派車與未拋帳" },
  { code: "WH02", name: "大豐採品倉", complete: 94.8, inbound: 88, inventory: 73, exceptions: 3, cost: 79, risk: "採品缺庫" },
  { code: "WH08", name: "後送中心倉", complete: 93.4, inbound: 80, inventory: 71, exceptions: 4, cost: 75, risk: "缺藥與交接" },
  { code: "WH05", name: "大園新倉電商倉", complete: 91.0, inbound: 76, inventory: 70, exceptions: 8, cost: 66, risk: "EXSD / Backlog" },
  { code: "WH06", name: "高邊退貨倉", complete: 88.0, inbound: 72, inventory: 62, exceptions: 9, cost: 64, risk: "不可退廠清冊 / 報廢銷毀" }
];

const baseReportProfiles = {
  outbound: {
    title: "出貨大報表",
    subtitle: "回答今天該出的有沒有出，沒出卡在哪個節點；來源為每日必看報表、Daily各倉產能統計與WMS/PDA出貨Log。",
    source: "Outbound出貨 / 每日訂單統計表",
    kpis: [
      ["訂單應出PCS", "15,033", "Daily 出貨核心"],
      ["實際已出PCS", "14,654", "出貨完成率 97.5%"],
      ["有庫未出", "68", "需看節點與人員"],
      ["無庫未出", "83", "需回庫存健康"]
    ],
    columns: ["倉別", "通路", "訂單編號", "EXSD", "SKU", "品名", "訂購PCS", "配庫PCS", "已揀PCS", "已包PCS", "已出PCS", "庫存狀態", "作業節點", "作業人員", "異常原因碼", "Daily指標"],
    rows: [
      ["WH05", "OMO官網", "SO202607090001", "13:00", "DP-C001", "保健組合包", 120, 120, 118, 92, 92, "有庫", status("包裝等待", "warn"), "張組長", "PKG-WAIT", "有庫未出"],
      ["WH05", "蝦皮", "SO202607090002", "15:00", "DP-C118", "寵物清潔組", 64, 64, 64, 64, 64, "有庫", status("已出", "ok"), "李主任", "", "實際已出PCS"],
      ["WH03", "門市補貨", "SO202607090003", "16:00", "GDP-001", "藥品A", 80, 0, 0, 0, 0, "無庫", status("未釋放", "danger"), "吳課長", "NO-STOCK", "無庫未出"]
    ],
    fieldNotes: [
      ["Daily來源", "訂單應出PCS、實際已出PCS、出貨完成率、有庫未出、無庫未出"],
      ["PDA節點", "揀貨開始/完成、包裝開始/完成、交接、異常、重派"],
      ["下鑽", "日期→波次→訂單→SKU→箱號→人員→異常原因碼"]
    ]
  },
  inbound: {
    title: "進貨大報表",
    subtitle: "回答今天該到、已到、驗收、上架與差異是否清楚；資料需回到ASN、採購單、收貨單、驗收單與PDA上架Log。",
    source: "Inbound進貨 / 每日進貨總表",
    kpis: [
      ["應到PCS", "3,020", "ASN / 採購單"],
      ["驗收入庫PCS", "2,880", "驗收完成率 95.4%"],
      ["驗收差異PCS", "140", "需責任歸屬"],
      ["未上架PCS", "2,140", "影響可用庫存"]
    ],
    columns: ["倉別", "到貨時間", "供應商", "ASN/採購單", "收貨單", "SKU", "品名", "應到PCS", "實到PCS", "驗收差異", "QC狀態", "上架狀態", "儲位", "作業人員", "異常原因碼", "Daily指標"],
    rows: [
      ["WH05", "06:02", "供應商B", "ASN2607090002", "RE202607090002", "DP-C001", "保健組合包", 500, 500, 0, status("免QC", "ok"), status("已上架", "ok"), "A01-03-02", "欣琪", "", "供應商實際收PCS"],
      ["WH01", "06:44", "供應商C", "ASN2607090003", "RE202607090003", "DF-209", "家庭紙品", 1200, 1100, 100, status("完成", "ok"), status("待上架", "warn"), "TEMP-01", "張組長", "SHORT-100", "驗收差異PCS"]
    ],
    fieldNotes: [
      ["Daily來源", "應到PCS、實到PCS、驗收完成率、待上架PCS、上架逾時"],
      ["PDA節點", "到倉、卸貨、收貨、驗收、QC、上架、異常"],
      ["下鑽", "日期→供應商→單號→SKU→批號/效期→儲位→人員"]
    ]
  },
  inventory: {
    title: "庫存大報表",
    subtitle: "回答帳上有貨是否真的可用；庫存需拆可用、暫用、已揀、不可用、鎖庫原因、庫齡與效期風險。",
    source: "Inventory庫存 / 每日效期與庫存健康表",
    kpis: [
      ["庫存PCS", "108,554", "全倉快照"],
      ["可用PCS", "92,480", "可履約出貨"],
      ["不可用PCS", "1,060", "效期/鎖庫/QC"],
      ["90天未異動", "420", "需庫齡追蹤"]
    ],
    columns: ["倉別", "區域", "儲位", "SKU", "品名", "批號", "效期", "庫存PCS", "可用PCS", "暫用PCS", "已揀PCS", "不可用PCS", "鎖庫原因", "最後異動日", "庫齡", "Daily指標"],
    rows: [
      ["WH05", "A區", "A01-03-02", "DP-C001", "保健組合包", "B260702", "2028-07-01", 3580, 3020, 300, 180, 80, "", "2026-07-09", "3天", "可用PCS"],
      ["WH01", "暫存區", "TEMP-01", "DF-209", "家庭紙品", "default", "", 1100, 0, 1100, 0, 0, "", "2026-07-09", "0天", "待上架PCS"]
    ],
    fieldNotes: [
      ["Daily來源", "現場庫存PCS、已用儲位、儲位滿載率、呆滯庫存、效期預警"],
      ["PDA節點", "移儲、鎖庫、解鎖、盤點、補貨、揀貨扣帳"],
      ["下鑽", "倉別→樓層/區域→儲位→SKU→批號/效期→庫存狀態"]
    ]
  }
};

const warehouseReportProfiles = {
  WH03: {
    inbound: {
      title: "新屋西藥倉 GDP｜每日進貨驗收表",
      subtitle: "WH03 必須比一般倉多看 GDP 效期、批號、庫內最短效期、允收判斷與未上架QC，避免用一般進貨欄位誤判。",
      columns: ["倉別", "供應商", "ASN/採購單", "SKU", "品名", "批號", "效期", "庫內最短效期", "通知應收PCS", "驗收入庫PCS", "驗收差異PCS", "未上架QC待上架PCS", "允收判斷", "責任單位", "Daily指標"],
      rows: [
        ["WH03", "藥廠A", "ASN2607090001", "GDP-001", "藥品A", "B260701", "2027-01-05", "2027-03-01", 1000, 980, 20, 980, status("待採購確認", "warn"), "採購/GDP窗口", "驗收差異PCS / 效期異常"],
        ["WH03", "藥廠B", "ASN2607090041", "GDP-118", "藥品B", "B260703", "2026-11-10", "2027-02-01", 240, 240, 0, 0, status("允收", "ok"), "GDP窗口", "驗收入庫PCS"]
      ]
    },
    inventory: {
      columns: ["倉別", "GDP區域", "儲位", "SKU", "品名", "批號", "效期", "最短效期", "WMS庫存PCS", "暫用PCS", "已揀PCS", "可用庫存PCS", "不可用庫存PCS", "不可用原因", "批號效期完整率", "Daily指標"],
      rows: [
        ["WH03", "GDP區", "QC-A03", "GDP-001", "藥品A", "B260701", "2027-01-05", "2027-01-05", 980, 0, 0, 0, 980, "短效待採購確認", "100%", "不可用庫存PCS"],
        ["WH03", "GDP區", "G01-02-01", "GDP-118", "藥品B", "B260703", "2027-11-10", "2027-11-10", 1280, 60, 40, 1180, 0, "", "99.2%", "可用庫存PCS"]
      ]
    }
  },
  WH05: {
    outbound: {
      title: "大園新倉電商｜出貨履約總覽",
      subtitle: "WH05 重點是 EXSD、Backlog、有庫未出、無庫未出、波次任務、包裝交接與出貨箱號。",
      columns: ["倉別", "通路", "訂單編號", "EXSD", "Backlog", "SKU", "品名", "訂購PCS", "庫存配置PCS", "已揀PCS", "已包PCS", "已出PCS", "出貨箱號", "車次", "節點", "異常原因"],
      rows: [
        ["WH05", "OMO官網", "SO202607090001", "13:00", "Y", "DP-C001", "保健組合包", 120, 120, 118, 92, 92, "BX260709-001", "TMS260709-01", status("包裝等待", "warn"), "包裝站等待"],
        ["WH05", "蝦皮", "SO202607090002", "15:00", "N", "DP-C118", "寵物清潔組", 64, 64, 64, 64, 64, "BX260709-019", "TMS260709-02", status("已出", "ok"), ""]
      ]
    }
  },
  WH06: {
    inbound: {
      title: "高邊退貨倉｜退貨與報廢銷毀每日表",
      subtitle: "WH06 不是一般進貨倉，橫向欄位必須放退貨分類、良品/不良品/待報廢、不可退廠清冊、報廢金額與銷毀狀態。",
      source: "高邊退貨_報表｜每日 / 不可退廠清冊",
      kpis: [
        ["退貨已退回箱", "186", "退貨收貨"],
        ["退貨已檢驗箱", "142", "分類驗收"],
        ["待報廢PCS", "320", "需責任與金額"],
        ["不可退廠清冊", "24筆", "每月第2-4週三12:00"]
      ],
      columns: ["倉別", "退貨單", "來源門市", "SKU", "品名", "批號", "效期", "良品PCS", "不良品PCS", "待報廢PCS", "不可退廠PCS", "報廢金額", "銷毀狀態", "責任單位", "Daily指標"],
      rows: [
        ["WH06", "RT260709001", "門市0211", "RT-991", "退貨良品", "B260701", "2028-01-01", 80, 12, 0, 0, "$0", status("免銷毀", "ok"), "退貨窗口", "退貨入庫PCS"],
        ["WH06", "RT260709018", "門市1098", "RT-332", "近效保健品", "B250901", "2026-09-15", 0, 40, 120, 120, "$18,400", status("待銷毀", "danger"), "管理課", "不可退廠清冊"]
      ],
      fieldNotes: [
        ["每日必看報表", "報廢銷毀商品資訊、報廢銷毀未結清單、90天未異動資料、效期清查、不可退廠清冊"],
        ["分類規則", "良品=效期14個月以上且外觀良好；不良品=效期3-13個月或外觀瑕疵；待報廢=效期2個月以下"],
        ["下鑽", "清冊批次→判定狀態→SKU→批號/效期→退貨單→處理流向"]
      ]
    },
    inventory: {
      columns: ["倉別", "狀態", "SKU", "品名", "批號", "效期", "最後異動日", "庫齡", "良品PCS", "不良品PCS", "待報廢PCS", "不可退廠PCS", "近效狀態", "清冊狀態", "Daily指標"],
      rows: [
        ["WH06", "待清冊", "RT-332", "近效保健品", "B250901", "2026-09-15", "2026-03-18", "113天", 0, 40, 120, 120, status("近效", "warn"), status("待轉採/批銷", "warn"), "90天未異動資料"],
        ["WH06", "已處理", "RT-991", "退貨良品", "B260701", "2028-01-01", "2026-07-09", "1天", 80, 12, 0, 0, status("正常", "ok"), status("已入庫", "ok"), "退貨入庫PCS"]
      ]
    }
  },
  WH07: {
    inventory: {
      title: "帳務及庶務倉｜帳務費用與異常追蹤",
      subtitle: "WH07 必須看未拋帳、帳實差異、TMS派車、作業費用、配送費用與權限異動，不應只套庫存表。",
      columns: ["倉別", "作業類型", "單據", "來源系統", "拋帳狀態", "差異PCS", "差異金額", "TMS派車", "裝車", "簽收", "費用類型", "金額", "責任單位", "Daily指標"],
      rows: [
        ["WH07", "帳務拋轉", "ACC26070901", "WMS→ERP", status("失敗", "danger"), 0, "$0", "-", "-", "-", "作業費", "$0", "資訊/帳務", "未拋帳"],
        ["WH07", "配送費用", "TMS26070922", "TMS→WMS", status("成功", "ok"), 0, "$1,820", status("已派車", "ok"), status("已裝車", "ok"), status("待簽收", "warn"), "配送費", "$1,820", "物流配送", "TMS派車"]
      ]
    }
  }
};

const childPageProfiles = {
  inbound: {
    "到貨通知大表": pageSpec("到貨通知大表", "追蹤ASN、預計到貨、車輛到倉、未到貨與責任單位。", ["到貨通知", "待到貨", "延遲", "責任"], ["到貨日", "供應商", "ASN/採購單", "車號", "預計到倉", "實際到倉", "應到PCS", "到貨狀態", "責任單位"], [["2026-07-09", "供應商B", "ASN2607090002", "KLA-8812", "06:00", "06:02", 500, status("已到", "ok"), "物流"], ["2026-07-09", "藥廠A", "ASN2607090001", "KLB-1205", "05:00", "05:18", 1000, status("延遲", "warn"), "供應商"]]),
    "進貨大報表": pageSpec("進貨大報表", "把應到、實到、驗收、上架、差異與未完成串成每日進貨管理頁。", ["應到PCS", "實到PCS", "驗收差異", "待上架"], ["倉別", "供應商", "ASN/採購單", "收貨單", "SKU", "品名", "應到PCS", "實到PCS", "驗收差異", "上架狀態", "異常原因碼"], [["WH05", "供應商B", "ASN2607090002", "RE202607090002", "DP-C001", "保健組合包", 500, 500, 0, status("已上架", "ok"), ""], ["WH01", "供應商C", "ASN2607090003", "RE202607090003", "DF-209", "家庭紙品", 1200, 1100, 100, status("待上架", "warn"), "SHORT-100"]]),
    "驗收作業": pageSpec("驗收作業", "現場驗收開始、完成、差異、QC與人員時間戳，需能回寫Daily。", ["待驗收", "已驗收", "QC待判", "驗收人效"], ["驗收單", "SKU", "品名", "應驗PCS", "已驗PCS", "QC狀態", "開始時間", "完成時間", "驗收人員"], [["CK26070901", "DP-C001", "保健組合包", 500, 500, status("免QC", "ok"), "06:12", "06:38", "欣琪"], ["CK26070902", "DF-209", "家庭紙品", 1200, 1100, status("待複驗", "warn"), "06:50", "-", "張組長"]]),
    "驗收差異": pageSpec("驗收差異", "把通知應收、實際驗收與差異量拉到SKU與責任單位。", ["差異PCS", "差異單數", "短卸", "待結案"], ["驗收單", "供應商", "SKU", "通知應收PCS", "實際驗收PCS", "差異PCS", "差異原因", "責任單位", "結案狀態"], [["CK26070902", "供應商C", "DF-209", 1200, 1100, 100, "短卸", "供應商", status("未結", "danger")], ["CK26070905", "藥廠A", "GDP-001", 1000, 980, 20, "效期待確認", "採購", status("處理中", "warn")]]),
    "理貨上架": pageSpec("理貨上架", "追蹤從收貨暫存到正式儲位的上架任務、儲位與PDA掃描。", ["待上架PCS", "逾時任務", "完成率", "儲位滿"], ["上架任務", "來源區", "目的儲位", "SKU", "PCS", "PDA事件", "作業人員", "逾時", "狀態"], [["PT26070901", "TEMP-01", "A01-03-02", "DP-C001", 500, "上架完成", "欣琪", "0h", status("完成", "ok")], ["PT26070902", "QC-A03", "G01-01-01", "GDP-001", 980, "待QC", "柏勳", "2.4h", status("待上架", "warn")]]),
    "未上架QC": pageSpec("未上架QC", "已收貨但仍卡在QC或未上架的商品，需看供應商、SKU、待上架量與責任。", ["QC待上架", "供應商數", "逾時", "影響出貨"], ["供應商", "進貨單", "SKU", "品名", "待上架PCS", "QC原因", "責任單位", "逾時", "Daily指標"], [["藥廠A", "RE202607090001", "GDP-001", "藥品A", 980, "效期允收待定", "採購/GDP", "2.4h", "未上架QC待上架PCS"], ["供應商C", "RE202607090003", "DF-209", "家庭紙品", 1100, "儲位待確認", "庫存組", "1.1h", "待上架PCS"]]),
    "短效效期比對": pageSpec("短效效期比對", "比對進貨效期與庫內最短效期；非GDP倉只保留一般效期提醒，GDP倉才顯示完整允收邏輯。", ["短效SKU", "近效PCS", "待允收", "已退回"], ["倉別", "SKU", "品名", "進貨效期", "短效規則", "判定", "責任單位", "處理狀態"], [["WH03", "GDP-001", "藥品A", "2027-01-05", "低於庫內最短效期", status("待允收", "warn"), "採購/GDP", "處理中"], ["WH06", "RT-332", "近效保健品", "2026-09-15", "近效", status("待下架", "warn"), "退貨", "待處理"]])
  },
  outbound: {
    "訂單接收": pageSpec("訂單接收", "OMS/門市/電商訂單匯入後，先確認資料完整、取消單、主檔與應出判斷。", ["匯入訂單", "資料異常", "取消單", "待配庫"], ["來源", "訂單編號", "通路", "客戶/門市", "SKU", "PCS", "EXSD", "主檔狀態", "接收狀態"], [["OMS", "SO202607090001", "OMO官網", "官網客戶", "DP-C001", 120, "13:00", status("完整", "ok"), status("已接收", "ok")], ["OMS", "SO202607090006", "酷澎", "Coupang", "DP-C331", 44, "12:00", status("缺尺寸", "warn"), status("待補", "warn")]]),
    "出貨大報表": pageSpec("出貨履約總覽", "看今日應出、已出、EXSD、Backlog、有庫未出、無庫未出與出貨箱號。", ["應出PCS", "已出PCS", "有庫未出", "無庫未出"], ["倉別", "通路", "訂單編號", "EXSD", "SKU", "品名", "訂購PCS", "配庫PCS", "已揀PCS", "已包PCS", "已出PCS", "節點"], [["WH05", "OMO官網", "SO202607090001", "13:00", "DP-C001", "保健組合包", 120, 120, 118, 92, 92, status("包裝等待", "warn")], ["WH05", "蝦皮", "SO202607090002", "15:00", "DP-C118", "寵物清潔組", 64, 64, 64, 64, 64, status("已出", "ok")]]),
    "應出未出": pageSpec("應出未出分析", "所有該出未出的訂單，先拆有庫未出與無庫未出，再下鑽原因碼。", ["應出未出", "有庫", "無庫", "EXSD Miss"], ["訂單", "SKU", "應出PCS", "已出PCS", "未出PCS", "庫存判定", "卡點", "原因碼", "責任單位"], [["SO202607090001", "DP-C001", 120, 92, 28, "有庫", "包裝", "PKG-WAIT", "包裝組"], ["SO202607090003", "GDP-001", 80, 0, 80, "無庫", "配庫", "NO-STOCK", "庫存/GDP"]]),
    "有庫未出": pageSpec("有庫未出處理", "有庫但未出要看任務、儲位、人員、包裝/交接卡點，不能算成缺貨。", ["有庫未出PCS", "包裝等待", "揀貨等待", "交接等待"], ["訂單", "SKU", "可用PCS", "未出PCS", "目前節點", "作業人員", "逾時", "處理動作"], [["SO202607090001", "DP-C001", 3020, 28, "包裝站", "張組長", "1.2h", "加開包裝台"], ["SO202607090004", "DF-209", 360, 40, "車次等待", "王組長", "0.8h", "確認車次"]]),
    "無庫未出": pageSpec("無庫未出追蹤", "缺庫要回到庫存健康、未上架、鎖庫、效期與採購允收，而不是追人效。", ["無庫未出PCS", "未上架影響", "鎖庫影響", "採購待回"], ["訂單", "SKU", "需求PCS", "可用PCS", "未上架PCS", "鎖庫PCS", "缺庫原因", "責任單位"], [["SO202607090003", "GDP-001", 80, 0, 980, 980, "效期待允收", "採購/GDP"], ["SO202607090007", "DP-C881", 36, 0, 0, 0, "採購未到", "採購"]]),
    "出貨明細": pageSpec("出貨明細追溯", "已出貨資料需追到箱號、門市、SKU、批號效期、原始訂單與PDA人員。", ["出貨箱數", "明細行數", "批號完整率", "門市驗收單"], ["箱號", "訂單", "門市/客戶", "SKU", "PCS", "批號", "效期", "車次", "作業人員"], [["BX260709-001", "SO202607090001", "官網客戶", "DP-C001", 92, "B260702", "2028-07-01", "TMS260709-01", "張組長"], ["BX260709-019", "SO202607090002", "蝦皮客戶", "DP-C118", 64, "B260704", "2028-01-31", "TMS260709-02", "李主任"]]),
    "配送交接": pageSpec("配送交接", "出倉責任切點，確認點交、裝車、車次、箱件、短少與回簽。", ["已交接", "未交接", "點交差異", "簽收待回"], ["車次", "箱號", "訂單", "門市/客戶", "點交PCS", "裝車狀態", "簽收狀態", "差異", "責任"], [["TMS260709-01", "BX260709-001", "SO202607090001", "官網客戶", 92, status("已裝車", "ok"), status("待簽收", "warn"), 0, "物流"], ["TMS260709-03", "BX260709-077", "SO202607090004", "門市0211", 260, status("待裝車", "warn"), "-", 0, "出貨"]]),
    "EXSD Miss": pageSpec("EXSD Miss", "超過預定出貨時間仍未完成的訂單，需追節點、原因碼與責任單位。", ["Miss訂單", "Miss PCS", "有庫Miss", "無庫Miss"], ["訂單", "通路", "EXSD", "目前時間", "SKU", "未出PCS", "庫存判定", "Miss原因", "責任單位"], [["SO202607090001", "OMO官網", "13:00", "14:10", "DP-C001", 28, "有庫", "包裝等待", "包裝組"], ["SO202607090003", "門市補貨", "16:00", "17:30", "GDP-001", 80, "無庫", "效期鎖庫", "GDP/採購"]])
  },
  outboundWork: {
    "揀貨下架": pageSpec("揀貨下架", "PDA揀貨任務、儲位、批號、短揀與找不到貨的現場作業頁。", ["待揀", "已揀", "短揀", "找不到貨"], ["波次", "任務", "儲位", "SKU", "應揀PCS", "已揀PCS", "人員", "PDA狀態", "異常碼"], [["WV26070901", "PK26070988", "A01-03-02", "DP-C001", 120, 118, "張組長", status("揀貨中", "warn"), ""], ["WV26070903", "PK26070995", "QC-A03", "GDP-001", 80, 0, "吳課長", status("未釋放", "danger"), "LOCK-EXP"]]),
    "波次任務": pageSpec("波次任務", "建立波次、任務釋放、重派、取消與卡住任務追蹤。", ["波次數", "未釋放", "卡住任務", "重派"], ["波次", "任務", "通路", "訂單數", "SKU數", "PCS", "釋放狀態", "負責組", "異常"], [["WV26070901", "PK26070988", "OMO", 18, 44, 1260, status("已釋放", "ok"), "揀貨A組", ""], ["WV26070903", "PK26070995", "門市", 4, 9, 240, status("未釋放", "danger"), "GDP組", "庫存鎖定"]]),
    "補貨 / 缺庫": pageSpec("補貨 / 缺庫", "揀貨區不足時，連動補貨任務、未上架、鎖庫與效期。", ["補貨任務", "缺庫SKU", "未上架影響", "鎖庫影響"], ["SKU", "揀貨區可用", "需求PCS", "補貨PCS", "來源儲位", "補貨狀態", "缺庫原因", "責任"], [["DP-C001", 40, 120, 180, "A01-03-02", status("補貨中", "warn"), "", "庫存組"], ["GDP-001", 0, 80, 0, "QC-A03", status("不可補", "danger"), "效期鎖庫", "GDP/採購"]]),
    "裝箱包貨": pageSpec("裝箱包貨", "揀貨後到出貨前的瓶頸，追箱號、包材、漏品、錯箱與人員。", ["待包", "已包", "漏品", "包材不足"], ["箱號", "訂單", "SKU", "應包PCS", "已包PCS", "包材", "人員", "PDA狀態", "異常"], [["BX260709-001", "SO202607090001", "DP-C001", 120, 92, "M箱", "張組長", status("包裝中", "warn"), "待補品"], ["BX260709-019", "SO202607090002", "DP-C118", 64, 64, "L箱", "李主任", status("完成", "ok"), ""]]),
    "分貨疊貨": pageSpec("分貨疊貨", "包裝完成後依路線、車次、門市進行分貨與疊貨，避免錯車錯線。", ["待分貨", "已分貨", "錯分", "待疊貨"], ["路線", "車次", "箱號", "門市/客戶", "PCS", "分貨狀態", "疊貨狀態", "人員", "異常"], [["R01", "TMS260709-01", "BX260709-001", "官網客戶", 92, status("已分貨", "ok"), status("待疊貨", "warn"), "小敏", ""], ["R03", "TMS260709-03", "BX260709-077", "門市0211", 260, status("待分貨", "warn"), "-", "王組長", "車次待確認"]]),
    "裝車載貨": pageSpec("裝車載貨", "裝車點交與出倉責任轉移，連動TMS派車與簽收節點。", ["已裝車", "未裝車", "點交差異", "錯車"], ["車次", "司機", "箱數", "PCS", "裝車時間", "點交人", "裝車狀態", "差異", "責任"], [["TMS260709-01", "林司機", 18, 1260, "14:30", "小敏", status("已裝車", "ok"), 0, "物流"], ["TMS260709-03", "待派", 7, 420, "-", "王組長", status("待裝車", "warn"), 0, "出貨"]]),
    "PDA作業Log": pageSpec("PDA作業Log", "所有開始、完成、異常、取消、重派與人員時間戳，用於Daily與人效稼動。", ["事件數", "異常事件", "漏刷", "重派"], ["時間", "人員", "作業", "單據", "SKU", "事件", "結果", "設備", "備註"], [["09:12", "張組長", "揀貨", "PK26070988", "DP-C001", "開始", status("成功", "ok"), "PDA-011", ""], ["09:44", "吳課長", "揀貨", "PK26070995", "GDP-001", "釋放", status("失敗", "danger"), "WMS", "效期鎖庫"]])
  }
};

function pageSpec(title, subtitle, kpiLabels, columns, rows) {
  return {
    title,
    subtitle,
    kpis: kpiLabels.map((label, index) => [label, sampleValue(index), sampleNote(label)]),
    columns,
    rows,
    fieldNotes: [
      ["PDA相輔相成", "現場開始、完成、異常、取消、重派與人員時間戳要回寫此頁。"],
      ["Daily對應", "每個欄位需能回到每日必看報表、Daily_DB與Dashboard同一口徑。"],
      ["下鑽層級", "倉別→日期→作業類型→單據→SKU→批號/效期→儲位→人員。"]
    ]
  };
}

function sampleValue(index) {
  return ["36", "14,654", "8", "97.5%"][index % 4];
}

function sampleNote(label) {
  if (label.includes("異常") || label.includes("未結") || label.includes("Miss")) return "P1需追蹤";
  if (label.includes("率")) return "低於目標需下鑽";
  return "每日必看";
}

const operationalDefinitions = {
  transfer: {
    title: "庫存移交與跨倉履約",
    problem: "貨從收貨區、暫存、正式儲位、揀貨區或跨倉在途時，是否有責任節點與狀態。",
    kpis: [["移交未完成", "42", "暫存/正式儲位"], ["在途逾時", "6", "跨倉需追蹤"], ["差異PCS", "118", "入出差異"], ["PDA漏掃", "3", "需補刷"]],
    columns: ["移交單", "來源倉/區", "目的倉/區", "SKU", "PCS", "目前節點", "PDA事件", "責任人", "逾時", "異常碼"],
    rows: [
      ["TR26070901", "WH05-TEMP", "WH05-A01", "DP-C001", 320, status("待上架", "warn"), "收貨完成/未上架", "欣琪", "2.4h", "PUTAWAY-LATE"],
      ["TR26070902", "WH01", "WH05", "DF-209", 120, status("在途", "warn"), "轉倉出庫", "王組長", "5.1h", "TRANSFER-OPEN"]
    ]
  },
  location: {
    title: "儲位與庫區管理",
    problem: "儲位是否滿載、暫存是否占用、溫層與GDP區是否符合商品需求。",
    kpis: [["已用儲位", "7,420", "儲存格"], ["滿載率", "88%", "高於90%預警"], ["暫存占用", "1,100 PCS", "影響可用"], ["溫層異常", "1", "需P1"]],
    columns: ["倉別", "庫區", "儲位", "層別", "容量PCS", "已用PCS", "滿載率", "溫層", "狀態", "管理標示"],
    rows: [
      ["WH03", "GDP區", "G01-02-01", "2nd", 1500, 1280, "85%", "常溫", status("正常", "ok"), "GDP"],
      ["WH05", "A區", "A01-03-02", "1st", 4200, 3580, "85%", "常溫", status("正常", "ok"), "電商"]
    ]
  },
  inventoryMove: {
    title: "庫存異動與鎖庫解鎖",
    problem: "庫存移動是否有單據、原因、來源/目的儲位與PDA紀錄，避免帳上有貨但現場找不到。",
    kpis: [["鎖庫PCS", "1,060", "效期/QC/盤差"], ["補貨任務", "24", "待揀區"], ["盤點調整", "8", "需稽核"], ["異動未結", "5", "責任不清"]],
    columns: ["異動單", "異動類型", "SKU", "來源儲位", "目的儲位", "PCS", "原因", "PDA事件", "操作人", "審核狀態"],
    rows: [
      ["MV26070901", "鎖庫", "GDP-001", "QC-A03", "-", 980, "短效待允收", "PDA鎖庫", "柏勳", status("待主管確認", "warn")],
      ["MV26070902", "補貨", "DP-C001", "A01-03-02", "PICK-01", 180, "揀貨區不足", "PDA補貨完成", "欣琪", status("完成", "ok")]
    ]
  },
  exception: {
    title: "異常閉環",
    problem: "所有進貨、出貨、退貨、庫存、GDP、帳務與配送異常都必須有原因碼、責任單位、SLA與結案狀態。",
    kpis: [["未結異常", "18", "P1 8件"], ["SLA逾時", "2", "需升級"], ["責任未定", "3", "管理課追蹤"], ["重複異常", "4", "需改善"]],
    columns: ["異常單", "來源模組", "異常類型", "單據/SKU", "影響PCS", "原因碼", "責任單位", "SLA", "處理人", "結案狀態"],
    rows: [
      ["EX26070901", "GDP效期", "進貨效期低於庫內", "GDP-001", 980, "EXP-IN-LOW", "採購/GDP窗口", "4h", "吳課長", status("未結", "danger")],
      ["EX26070902", "出貨", "有庫未出", "SO202607090001", 28, "PKG-WAIT", "包裝組", "2h", "張組長", status("處理中", "warn")]
    ]
  },
  labor: {
    title: "人效稼動",
    problem: "先看貨，再看人，再看流程；人效判讀必須排除缺庫、鎖庫、未上架、效期與系統問題。",
    kpis: [["報工率", "96%", "漏報 4%"], ["標準達成率", "91%", "低於95追蹤"], ["OT加班", "42h", "成本連動"], ["二次比對", "7件", "人貨流程"]],
    columns: ["人員", "班別", "作業類型", "應報工時", "已報工時", "實際PCS", "標準PCS", "達成率", "排除原因", "改善建議"],
    rows: [
      ["張組長", "早班", "包裝", "8h", "8h", 920, 1050, "87.6%", "包裝站等待", "補包裝台支援"],
      ["欣琪", "早班", "上架", "8h", "7.8h", 1360, 1300, "104.6%", "", "維持"]
    ]
  },
  reports: {
    title: "報表中心與欄位字典",
    problem: "Daily、Daily_DB、週報、月報、季報與Dashboard必須共用欄位定義，避免同名欄位不同算法。",
    kpis: [["每日報表", "22", "各倉必看"], ["欄位字典", "128欄", "名稱/定義/來源"], ["可下鑽率", "92%", "需到單據"], ["需廠商回覆", "31", "缺口項目"]],
    columns: ["報表", "欄位", "定義", "資料來源", "更新頻率", "必填", "可下鑽", "資料型態", "Dashboard支援", "廠商現況"],
    rows: [
      ["電商倉營運總表", "EXSD Miss", "超過預定出貨時間仍未完成", "WMS訂單時間戳", "即時", "Y", "Y", "number", "Y", "待回覆"],
      ["庫存健康看板", "已使用儲位數", "目前有庫存或被占用儲位", "儲位庫存快照", "Daily", "Y", "Y", "number", "Y", "待確認"]
    ]
  },
  settings: {
    title: "角色權限與資料遮蔽",
    problem: "副總、經理、部長、課長、主任、組長、作業員、管理課看到的資料層級、下鑽深度與可編輯欄位不同。",
    kpis: [["角色", "8", "角色層級"], ["倉別權限", "8倉", "依職掌控管"], ["敏感欄位", "16", "費用/人員"], ["操作留痕", "100%", "異動可追"]],
    columns: ["角色", "觀看層級", "必看報表/看板", "可下鑽深度", "資料遮蔽", "可編輯", "決策用途", "操作紀錄"],
    rows: [
      ["副總", "全倉/月季", "全倉經營總覽、月季KPI", "倉別/大類", "不看個人明細", "N", "資源配置", "Y"],
      ["部長", "倉別/日週月", "電商倉營運、庫存健康、報工稼動", "倉別→組別→人員", "可看人員效率", "N", "管理改善", "Y"],
      ["組長", "現場/即時", "Daily填寫、報工、異常", "人員/單據", "只看本組", "Y", "現場排除", "Y"]
    ]
  }
};

function status(text, type = "ok") {
  const cls = type === "ok" ? "" : ` ${type}`;
  return `<span class="status-pill${cls}"><span class="dot${cls}"></span>${text}</span>`;
}

function moduleById(id) {
  return modules.find((item) => item.id === id);
}

function isGdpWarehouse(warehouse = state.warehouse) {
  return warehouse.code === "WH03";
}

function getVisibleModules() {
  return getConfiguredVisibleModules(state.warehouse.code);
}

function enterApp() {
  document.querySelector("#loginScreen").classList.add("is-hidden");
  document.querySelector("#appShell").classList.remove("is-hidden");
  render();
}

function render() {
  renderWarehouseMenu();
  renderTopNav();
  renderSideNav();
  renderPage();
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderWarehouseMenu() {
  document.querySelector("#warehouseCode").textContent = state.warehouse.code;
  document.querySelector("#warehouseMenu").innerHTML = warehouses.map((warehouse) => `
    <button class="warehouse-option ${warehouse.code === state.warehouse.code ? "is-active" : ""}" type="button" data-warehouse="${warehouse.code}">
      <strong>${warehouse.code}</strong>
      <span>${warehouse.name}<small>${warehouse.type}｜${warehouse.focus}</small></span>
      <i data-lucide="warehouse"></i>
    </button>
  `).join("");
}

function renderTopNav() {
  document.querySelector("#topNav").innerHTML = getVisibleModules().map((item) => `
    <button type="button" class="${item.id === state.activeModule ? "is-active" : ""}" data-module="${item.id}">
      ${item.label}
    </button>
  `).join("");
}

function renderSideNav() {
  const mod = moduleById(state.activeModule);
  const visibleChildren = getVisibleChildren(state.warehouse.code, mod.id);
  document.querySelector("#sideTitle").textContent = mod.title;
  document.querySelector("#sideNav").innerHTML = visibleChildren.map((child) => `
    <button type="button" class="${child === state.activeChild ? "is-active" : ""}" data-child="${child}">
      <i data-lucide="${mod.icon}"></i>
      ${child}
    </button>
  `).join("");
}

function pageHeader(title, _subtitle, breadcrumb = "大樹 WMS 原型", actionMode = "default") {
  return `
    <div class="page-header">
      <div>
        <p class="breadcrumb">${breadcrumb} / ${state.warehouse.code} ${state.warehouse.name}</p>
        <h2>${title}</h2>
      </div>
      <div class="header-actions">
        ${actionMode === "quarter" ? `
          <button class="action-button" type="button" data-quarter-export="current"><i data-lucide="download"></i>匯出目前篩選 XLSX</button>
          <button class="action-button" type="button" data-quarter-export="workbook"><i data-lucide="file-spreadsheet"></i>匯出完整季度 Excel</button>
        ` : actionMode === "report-center" ? `
          <button class="action-button" type="button" data-action="export-report-center"><i data-lucide="file-spreadsheet"></i>匯出目前查詢 Excel</button>
        ` : `<button class="action-button" type="button" data-action="export-report"><i data-lucide="download"></i>匯出Excel</button>
          <button class="action-button" type="button" data-action="column-settings"><i data-lucide="list-filter"></i>欄位設定</button>`}
      </div>
    </div>
  `;
}

function renderPage() {
  if (state.activeModule === "gdp" && !isGdpWarehouse()) {
    state.activeModule = "home";
    state.activeChild = moduleById("home").defaultChild;
  }

  if (state.activeModule === "dashboard") {
    document.querySelector("#pageRoot").innerHTML = renderDashboardView();
    return;
  }

  if (state.activeModule === "home") {
    document.querySelector("#pageRoot").innerHTML = renderHomeSubview();
    return;
  }

  if (state.activeModule === "reports" && state.activeChild === "Daily報表中心") {
    document.querySelector("#pageRoot").innerHTML = renderDailyReportCenterPage();
    return;
  }

  if (state.activeModule === "reports" && state.activeChild === "全倉月報表") {
    document.querySelector("#pageRoot").innerHTML = renderMonthlyReportPage();
    return;
  }

  if (state.activeModule === "reports" && state.activeChild === "營運關鍵數字") {
    document.querySelector("#pageRoot").innerHTML = renderKeyNumbersPage();
    return;
  }

  if (state.activeModule === "reports" && state.activeChild === "WMS季度報表") {
    document.querySelector("#pageRoot").innerHTML = renderQuarterlyReport();
    return;
  }

  document.querySelector("#pageRoot").innerHTML = renderChildPage();
}

function getReportProfile(type) {
  const base = baseReportProfiles[type] || baseReportProfiles.inventory;
  const override = warehouseReportProfiles[state.warehouse.code]?.[type] || {};
  return { ...base, ...override, kpis: override.kpis || base.kpis, fieldNotes: override.fieldNotes || base.fieldNotes };
}

function getChildPageProfile() {
  const mod = moduleById(state.activeModule);
  const child = state.activeChild;
  const warehouseDataStatus = getWarehouseDataStatus(state.warehouse.code);
  if (warehouseDataStatus === "待確認") {
    return {
      title: child,
      source: mod.label,
      dataStatus: "待確認",
      columns: ["營運日期", "倉別", "資料狀態"],
      rows: [],
      kpis: [["資料狀態", "待確認", "不得自行補造"], ["作業數據", "資料不足", "待主管或會議確認來源"]],
      fieldNotes: []
    };
  }
  const dailyReportProfile = getDailyReportProfile(state.warehouse.code, mod.id, child);
  if (dailyReportProfile) return dailyReportProfile;
  const warehouseOperationalProfile = getWarehouseOperationalProfile(
    state.warehouse.code,
    mod.id,
    child,
    state.reportFilters.businessDate
  );
  if (warehouseOperationalProfile) return warehouseOperationalProfile;
  const outboundReportProfile = mod.id === "outbound" ? getOutboundReportProfile(state.warehouse.code, child, state.reportFilters.businessDate) : null;
  if (outboundReportProfile) return outboundReportProfile;
  const inventoryReportProfile = mod.id === "inventory" ? getInventoryReportProfile(state.warehouse.code, child, state.reportFilters.businessDate) : null;
  if (inventoryReportProfile) return inventoryReportProfile;
  const returnReportProfile = mod.id === "inbound" ? getReturnReportProfile(state.warehouse.code, child, state.reportFilters.businessDate) : null;
  if (returnReportProfile) return returnReportProfile;
  const laborReportProfile = mod.id === "labor" ? getLaborReportProfile(state.warehouse.code, child, state.reportFilters.businessDate) : null;
  if (laborReportProfile) return laborReportProfile;
  const explicit = childPageProfiles[state.activeModule]?.[child];
  const profile = explicit ? { ...explicit } : buildChildPageProfile(mod, child);
  const reportType = moduleReportType(state.activeModule);
  const warehouseOverride = warehouseReportProfiles[state.warehouse.code]?.[reportType];

  const candidate = warehouseOverride
    ? {
      ...profile,
      title: profile.title,
      subtitle: warehouseOverride.subtitle || profile.subtitle,
      kpis: warehouseOverride.kpis || profile.kpis,
      columns: warehouseOverride.columns || profile.columns,
      rows: warehouseOverride.rows || profile.rows,
      fieldNotes: warehouseOverride.fieldNotes || profile.fieldNotes,
      source: warehouseOverride.source || profile.source
    }
    : profile;
  return scopeFallbackProfile(candidate, state.warehouse.code);
}

function scopeFallbackProfile(profile, warehouseCode) {
  const rows = Array.isArray(profile.rows) ? profile.rows : [];
  const warehouseIndex = profile.columns.indexOf("倉別");
  const scopedRows = warehouseIndex >= 0
    ? rows.filter((row) => String(row[warehouseIndex] || "") === warehouseCode)
    : rows.filter((row) => {
        const warehouseCodes = row.flatMap((cell) => String(cell).match(/WH\d{2}/g) || []);
        return warehouseCodes.length > 0 && warehouseCodes.every((code) => code === warehouseCode);
      });
  return {
    ...profile,
    dataStatus: scopedRows.length ? "原型資料" : "資料不足",
    rows: scopedRows,
    kpis: scopedRows.length
      ? profile.kpis
      : [["資料狀態", "資料不足", "沒有本倉已確認來源"], ["可匯出明細", "0", "不使用其他倉資料補位"]]
  };
}

function moduleReportType(moduleId) {
  return {
    inbound: "inbound",
    outbound: "outbound",
    outboundWork: "outbound",
    inventory: "inventory",
    inventoryMove: "inventory",
    location: "inventory",
    gdp: "gdp",
    transfer: "transfer",
    exception: "exception",
    labor: "labor",
    reports: "reports",
    settings: "settings"
  }[moduleId];
}

function buildChildPageProfile(mod, child) {
  const definition = operationalDefinitions[mod.id] || operationalDefinitions.reports;
  return {
    title: child,
    subtitle: `${child} 是 ${mod.label} 模組的實際工作頁，需對應每日必看報表、PDA節點、單據資料與Dashboard下鑽。${definition.problem}`,
    source: `${mod.label} / ${child}`,
    kpis: definition.kpis,
    columns: definition.columns,
    rows: definition.rows.map((row, index) => row.map((cell, cellIndex) => cellIndex === 0 && typeof cell === "string" ? `${cell}` : cell)).concat(extraChildRows(mod.id, child)),
    fieldNotes: [
      ["頁面定位", `${child} 不只是選單入口，需提供可查詢、可匯出、可下鑽、可回寫Daily的實際作業看板。`],
      ["PDA相輔相成", "PDA需記錄開始、完成、異常、取消、重派、人員與時間戳，並回到此頁。"],
      ["下鑽層級", "倉別→日期→作業大類→單據→SKU→批號/效期→儲位→人員。"]
    ]
  };
}

function extraChildRows(moduleId, child) {
  if (moduleId === "reports") {
    return [[child, "欄位名稱/定義/來源", "WMS/Google Sheet", "Daily/即時", "Y", "Y", "需支援Dashboard", "待廠商回覆", "P1"]];
  }
  if (moduleId === "settings") {
    return [[child, "欄位/角色", "可看/可編輯/可匯出", "依倉別控管", "敏感資料遮蔽", "操作留痕", "P1", "資訊/管理課"]];
  }
  return [];
}

function renderChildPage() {
  const mod = moduleById(state.activeModule);
  const profile = getChildPageProfile();
  const visibleRows = filterProfileRows(profile);
  setCurrentExport(profile.title, profile.columns, visibleRows);
  return `
    ${pageHeader(profile.title, profile.subtitle, profile.source || mod.label)}
    <div class="data-status-strip"><strong>${profile.dataStatus || "資料不足"}</strong><span>${profile.rows.length ? `${profile.rows.length} 筆本倉資料` : "無本倉可用明細"}</span></div>
    ${renderColumnPanel(profile.columns)}
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, mod.icon)).join("")}
    </section>
    ${renderReportToolbar()}
    ${renderTable(profile.columns, visibleRows)}
  `;
}

function filterProfileRows(profile) {
  if (!profile.columns.includes("營運日期")) return profile.rows;
  const dateIndex = profile.columns.indexOf("營運日期");
  const warehouseIndex = profile.columns.indexOf("倉別");
  const statusIndex = profile.columns.findIndex((column) => ["目前節點", "允收判定", "處置判定"].includes(column));
  const normalizedRows = profile.rows.map((row) => ({
    businessDate: String(row[dateIndex] || ""),
    warehouseCode: String(row[warehouseIndex] || ""),
    status: statusIndex >= 0 ? stripHtml(String(row[statusIndex] || "")) : "",
    searchText: row.map((cell) => stripHtml(String(cell))).join(" "),
    row
  }));
  return filterReportRows(normalizedRows, {
    ...state.reportFilters,
    warehouseCode: state.warehouse.code
  }).map((item) => item.row);
}

function setCurrentExport(title, columns, rows) {
  state.currentExport = { title, columns, rows };
  document.querySelector("#pageRoot")?.setAttribute("data-export-row-count", String(rows.length));
}

function renderReport(type) {
  const profile = getReportProfile(type);
  setCurrentExport(profile.title, profile.columns, profile.rows);
  return `
    ${pageHeader(profile.title, profile.subtitle, profile.source || moduleById(state.activeModule).label)}
    ${renderColumnPanel(profile.columns)}
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, "database")).join("")}
    </section>
    ${renderReportToolbar()}
    ${renderTable(profile.columns, profile.rows)}
  `;
}

function renderQuarterlyReport() {
  const model = state.quarterlyTab === "kpi"
    ? getQuarterlyKpiModel(state.quarterlyFilters)
    : getQuarterlyMilestoneModel(state.quarterlyFilters);
  if (state.quarterlyTab === "kpi") {
    const exportModel = buildCurrentQuarterExport(model, state.selectedQuarterlyMetricId);
    setCurrentExport(exportModel.title, exportModel.columns, exportModel.rows);
  } else {
    setCurrentExport("WMS季度報表_專案里程碑", ["影響KPI", "專案", "倉別", "責任單位", "交付進度", "成效驗證"], model.groups.flatMap((group) => group.projects.map((project) => [group.metricName, project.projectName, project.warehouseCodes.join("／"), project.ownerUnit, project.deliveryProgressLabel, project.effectStatus])));
  }
  return `
    ${pageHeader("WMS季度報表", "", "報表中心", "quarter")}
    <section class="quarter-tabs" aria-label="季度報表頁籤">
      <button type="button" class="quarter-tab ${state.quarterlyTab === "kpi" ? "is-active" : ""}" data-quarter-tab="kpi">營運 KPI</button>
      <button type="button" class="quarter-tab ${state.quarterlyTab === "milestones" ? "is-active" : ""}" data-quarter-tab="milestones">專案里程碑</button>
    </section>
    ${renderQuarterlyFilters(state.quarterlyFilters, warehouses)}
    ${state.quarterlyTab === "kpi"
      ? renderQuarterlyKpiTab(model, { selectedMetricId: state.selectedQuarterlyMetricId, granularity: state.quarterlyGranularity, selectedPoint: state.selectedQuarterlyPoint })
      : renderQuarterlyMilestoneTab({ ...model, weeks: getQuarterlyKpiModel(state.quarterlyFilters).weeks })}
  `;
}

function renderDailyReportCenterPage() {
  const model = getDailyReportCenterModel(state.dailyReportFilters);
  state.reportCenterWorkbook = {
    title: `大樹WMS_Daily_${state.dailyReportFilters.businessDate}_${state.dailyReportFilters.warehouseCode}`,
    sheets: buildDailyExportSheets(model)
  };
  return `
    ${pageHeader("Daily報表中心", "", "報表中心", "report-center")}
    ${renderDailyReportCenter(model)}
  `;
}

function renderMonthlyReportPage() {
  const model = getMonthlyReportModel(state.monthlyReportFilters);
  state.reportCenterWorkbook = {
    title: `大樹WMS_全倉月報_${state.monthlyReportFilters.yearMonth}_${state.monthlyReportFilters.warehouseCode}`,
    sheets: buildMonthlyExportSheets(model)
  };
  return `
    ${pageHeader("全倉月報表", "", "報表中心", "report-center")}
    ${renderMonthlyReport(model, state.monthlyUi)}
  `;
}

function renderKeyNumbersPage() {
  const model = getKeyNumbersModel(state.keyNumberFilters);
  const expenseModel = getExpenseHierarchyModel({
    yearMonth: state.keyNumberFilters.yearMonth,
    warehouseCode: state.keyNumberFilters.warehouseCode,
    categoryId: state.keyNumberUi.selectedExpenseCategory,
    accountName: state.keyNumberUi.selectedAccountName,
    expenseItem: state.keyNumberUi.selectedExpenseItem
  });
  state.reportCenterWorkbook = {
    title: `大樹WMS_營運關鍵數字_${state.keyNumberFilters.yearMonth}_${state.keyNumberFilters.warehouseCode}`,
    sheets: buildKeyNumbersExportSheets(model, getExpenseHierarchyModel({
      yearMonth: state.keyNumberFilters.yearMonth,
      warehouseCode: state.keyNumberFilters.warehouseCode,
      categoryId: "",
      accountName: "",
      expenseItem: ""
    }))
  };

  let detail = "";
  if (state.keyNumberUi.selectedMetricId) {
    const metric = getMetricDrilldownModel(
      state.keyNumberFilters,
      state.keyNumberUi.selectedMetricId
    );
    if (metric) {
      metric.notes = [
        ...metric.notes,
        ...state.operationalNotes.filter(
          (note) =>
            note.entityType === "metric" &&
            note.entityId === metric.metricId
        )
      ];
    }
    detail = renderMetricDrilldown(metric);
  } else if (
    state.keyNumberUi.selectedDimension === "成本費用／人效" &&
    state.keyNumberUi.expenseLevel !== "summary"
  ) {
    detail = renderExpenseHierarchy(expenseModel, state.keyNumberUi);
  }

  return `
    ${pageHeader("營運關鍵數字", "", "報表中心", "report-center")}
    ${renderKeyNumbers(model, state.keyNumberUi)}
    ${detail}
  `;
}

function renderHomeSubview() {
  const view = state.activeChild;
  if (view === "全倉總覽") {
    setCurrentExport("Home全倉總覽", ["倉別", "名稱", "出貨率", "有庫未出", "無庫未出", "職能", "狀態"], dailySummaryRows);
    return `
      ${pageHeader("全倉總覽", "由各倉每日必看報表彙總，提供部長與副總快速看出哪個倉、哪條流程需要處理。", "Home")}
      ${renderColumnPanel(state.currentExport.columns)}
      <section class="kpi-grid">
        ${kpi("整體出貨完成率", "97.5%", "低於98%需追蹤", "gauge")}
        ${kpi("需追蹤倉數", "4", "WH02/03/05/06", "warehouse")}
        ${kpi("P1風險", "8", "效期/出貨/退貨/帳務", "circle-alert")}
        ${kpi("資料缺口", "2倉", "需補Daily欄位", "file-question")}
      </section>
      ${renderWarehouseComparison("全倉比較排名", dashboardRanking)}
    `;
  }

  if (view === "P1待處理") {
    const profile = getP1ReportProfile(state.warehouse.code, state.reportFilters.businessDate);
    setCurrentExport("Home_P1待處理", profile.columns, profile.rows);
    return `
      ${pageHeader("P1待處理", "", "Home")}
      ${renderColumnPanel(profile.columns)}
      <section class="kpi-grid">
        ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, "circle-alert")).join("")}
      </section>
      ${renderTable(profile.columns, profile.rows)}
    `;
  }

  if (view === "需求追蹤") {
    const dataStatus = getWarehouseDataStatus(state.warehouse.code);
    const columns = ["倉別", "需求狀態", "資料來源", "處理原則"];
    const rows = [[
      state.warehouse.code,
      status(dataStatus, dataStatus === "原型資料" ? "ok" : "warn"),
      dataStatus === "待確認" ? "待主管／會議確認" : "既有書面規格與窗口明確回覆",
      dataStatus === "待確認" ? "不補造、不列入正式數字" : "依已確認規格執行"
    ]];
    setCurrentExport("Home_需求追蹤", columns, rows);
    return `
      ${pageHeader("需求追蹤", "把各倉更新、RETURN二次確認、P1欄位缺口集中管理，替代原本的廠商會議板。", "Home")}
      ${renderColumnPanel(columns)}
      <section class="kpi-grid">
        ${kpi("本倉資料狀態", dataStatus, dataStatus === "待確認" ? "不補造需求" : "依已確認規格", "file-question")}
      </section>
      ${renderTable(columns, rows)}
    `;
  }

  if (view === "各倉狀態") {
    setCurrentExport("Home_各倉狀態", ["倉別", "倉名", "職能", "今日必看", "風險", "看板入口"], warehouses.map((warehouse) => [
      warehouse.code,
      warehouse.name,
      warehouse.type,
      warehouse.focus,
      dashboardRanking.find((row) => row.code === warehouse.code)?.risk || "正常",
      "Dashboard / " + warehouse.type
    ]));
    return `
      ${pageHeader("各倉狀態", "倉別切換不是只換名稱，必須連動該倉每日必看報表、欄位、風險與下鑽入口。", "Home")}
      ${renderColumnPanel(state.currentExport.columns)}
      <section class="warehouse-status-grid">
        ${warehouses.map((warehouse) => {
          const rank = dashboardRanking.find((row) => row.code === warehouse.code);
          return `
            <article class="warehouse-card ${warehouse.code === state.warehouse.code ? "is-active" : ""}">
              <strong>${warehouse.code} ${warehouse.name}</strong>
              <span>${warehouse.type}</span>
              <p>${warehouse.focus}</p>
              <small>主要風險：${rank?.risk || "正常"}</small>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  const profile = getWarehouseHomeProfile(state.warehouse.code, state.reportFilters.businessDate);
  setCurrentExport(`Home_${profile.title}`, profile.columns, profile.rows);
  return `
    ${pageHeader(profile.title, "", "Home")}
    ${renderColumnPanel(profile.columns)}
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, "warehouse")).join("")}
    </section>
    ${renderReportToolbar()}
    ${renderTable(profile.columns, profile.rows)}
  `;
}

function renderDashboardView() {
  const child = state.activeChild;
  const definition = getDashboardDefinition(child);
  if (!definition) return pageHeader("看板資料不足", "此看板未納入04_看板總表正式定義，不顯示推測數字。", "Dashboard");
  const model = getDashboardModel(child, state.warehouse.code);
  const columns = ["看板", "圖表", "倉別", "資料點", "數值", "狀況", "營運影響", "責任節點", "責任單位", "處理時效", "回查路徑", "資料期間", "更新時間", "公式版本"];
  const rows = model.charts.flatMap((chart) => chart.points.map((point) => [model.name, chart.title, point.warehouseCode, point.label, point.valueLabel, point.cause, point.impact, point.ownerNode, point.owner, point.sla, point.drilldown, model.period, model.updatedAt, model.formulaVersion]));
  setCurrentExport(`Dashboard_${child}`, columns, rows);
  return `
    <section class="dark-dashboard">
      ${pageHeader(child, definition.managementQuestion, "Dashboard／04_看板總表")}
      ${renderDashboardCharts(model, state.dashboardSelection)}
    </section>
  `;
}

function renderInventoryQuery() {
  const profile = getReportProfile("inventory");
  setCurrentExport("庫存查詢", profile.columns, profile.rows);
  return `
    ${pageHeader("庫存查詢", "參考現行WMS查詢頁，但補上大樹需要的可用/暫用/已揀/不可用、效期、批號、庫齡、儲位與Daily指標。", "管理庫存")}
    ${renderColumnPanel(profile.columns)}
    <section class="query-panel">
      <div class="query-grid">
        ${queryField("組織*", "大樹醫藥有限公司-測試", "search")}
        ${queryField("倉庫", state.warehouse.name, "search")}
        ${queryField("商品代號", "", "search")}
        ${queryField("商品集合", "", "search")}
        <label class="toggle-field"><span>是否查詢零庫存</span><button type="button" class="switch" aria-label="是否查詢零庫存"><span></span></button></label>
        ${queryField("[庫存起始區間1]", "-999,999,999")}
        ${queryField("[庫存結束區間1]", "999,999,999")}
        ${queryField("物採屬性", "全部")}
        ${queryField("供貨狀態", "")}
        ${queryField("管理標示", "")}
        ${queryField("供應商代號", "", "search")}
        ${queryField("儲位", "")}
      </div>
      <div class="query-actions">
        <button class="action-button" type="button">更多</button>
        <button class="action-button" type="button">重置</button>
        <button class="action-button primary" type="button"><i data-lucide="search"></i>查詢</button>
      </div>
    </section>
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, "boxes")).join("")}
    </section>
    ${renderTable(profile.columns, profile.rows)}
  `;
}

function queryField(label, value, icon) {
  return `
    <label class="query-field">
      <span>${label}</span>
      <div>
        <input value="${value}" />
        ${icon ? `<i data-lucide="${icon}"></i>` : ""}
      </div>
    </label>
  `;
}

function renderOperationalModule() {
  const mod = moduleById(state.activeModule);
  const definition = operationalDefinitions[state.activeModule] || operationalDefinitions.reports;
  setCurrentExport(`${mod.label}_${state.activeChild}`, definition.columns, definition.rows);
  return `
    ${pageHeader(state.activeChild, `${definition.problem} 本頁對應「每日必看報表」與PDA節點，避免左側功能只有入口沒有實際報表。`, mod.label)}
    ${renderColumnPanel(definition.columns)}
    <section class="kpi-grid">
      ${definition.kpis.map(([label, value, note]) => kpi(label, value, note, mod.icon)).join("")}
    </section>
    ${renderTable(definition.columns, definition.rows)}
  `;
}

function renderReportToolbar() {
  return `
    <section class="report-toolbar">
      <input type="date" value="${state.reportFilters.businessDate}" aria-label="營運日期" data-filter="businessDate" />
      <select aria-label="倉別"><option>${state.warehouse.code} ${state.warehouse.name}</option><option>全倉</option></select>
      <select aria-label="狀態" data-filter="status">
        ${["全部狀態", "已上架", "上架中", "QC待確認", "判定完成", "待採購／GDP確認"].map((option) => `<option ${option === state.reportFilters.status ? "selected" : ""}>${option}</option>`).join("")}
      </select>
      <input value="${state.reportFilters.keyword}" placeholder="單號 / SKU / 批號 / 人員" aria-label="關鍵字" data-filter="keyword" />
      <select aria-label="Daily"><option>可進Daily統計</option><option>需補資料</option><option>僅明細追蹤</option></select>
      <button class="action-button primary" type="button" data-action="query-report"><i data-lucide="search"></i>查詢</button>
    </section>
  `;
}

function renderTable(columns, rows) {
  return `
    <section class="table-wrap">
      <table>
        <thead><tr>${columns.map((col) => `<th>${col}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderWarehouseComparison(title, rows) {
  return `
    ${title ? `<h3>${title}</h3>` : ""}
    <div class="ranking-list">
      ${rows.map((row, index) => `
        <div class="ranking-row ${row.code === state.warehouse.code ? "is-active" : ""}">
          <span>${index + 1}</span>
          <strong>${row.code} ${row.name}</strong>
          <div class="rank-metrics">
            <em>出貨 ${row.complete}%</em>
            <em>入庫 ${row.inbound}%</em>
            <em>庫存 ${row.inventory}%</em>
            <em>異常 ${row.exceptions}</em>
          </div>
          <small>${row.risk}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function renderColumnPanel(columns) {
  if (!state.showColumnPanel) {
    return "";
  }
  return `
    <section class="column-panel">
      <div>
        <strong>欄位設定</strong>
        <span>目前以需求原型呈現，正式版需支援欄位顯示、順序、必填、可下鑽與匯出權限。</span>
      </div>
      <div class="column-tags">
        ${columns.map((column, index) => `<span>${index + 1}. ${column}</span>`).join("")}
      </div>
    </section>
  `;
}

function toggleColumnPanel() {
  state.showColumnPanel = !state.showColumnPanel;
  renderPage();
  refreshIcons();
}

function downloadCurrentReport() {
  const { title, columns, rows } = state.currentExport;
  const workbook = createXlsxWorkbook([{ name: title, columns, rows: rows.map((row) => row.map((cell) => typeof cell === "number" ? cell : stripHtml(String(cell)))) }]);
  downloadBlob(`${title}_${state.warehouse.code}.xlsx`, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

function downloadQuarterWorkbook() {
  const kpiModel = getQuarterlyKpiModel(state.quarterlyFilters);
  const milestoneModel = getQuarterlyMilestoneModel(state.quarterlyFilters);
  const workbook = createXlsxWorkbook(buildQuarterWorkbookSheets(kpiModel, milestoneModel));
  downloadBlob(`大樹WMS_${state.quarterlyFilters.year}${state.quarterlyFilters.quarter}_季度報表.xlsx`, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

function downloadReportCenterWorkbook() {
  const { title, sheets } = state.reportCenterWorkbook;
  const workbook = createXlsxWorkbook(sheets);
  downloadBlob(
    `${title}.xlsx`,
    workbook,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, "");
}

function kpi(label, value, note, icon) {
  return `
    <div class="kpi-card">
      <span><i data-lucide="${icon}"></i>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </div>
  `;
}

function flow(label, pct, note) {
  return `
    <div class="flow-item">
      <strong>${label}</strong>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <small>${note}</small>
    </div>
  `;
}

function risk(type, title, text) {
  return `
    <div class="risk-item">
      <span class="dot ${type}"></span>
      <strong>${title}</strong>
      <span>${text}</span>
    </div>
  `;
}

function bar(label, pct, value) {
  return `<div class="mini-bar" style="height:${pct}%"><b>${value}</b><span>${label}</span></div>`;
}

document.addEventListener("click", (event) => {
  const login = event.target.closest("#loginButton, #logoEnter");
  if (login) {
    enterApp();
    return;
  }

  const dashboardPoint = event.target.closest("[data-dashboard-point]");
  if (dashboardPoint) {
    const [chartId, pointId] = dashboardPoint.dataset.dashboardPoint.split("|");
    state.dashboardSelection = { chartId, pointId };
    renderPage();
    refreshIcons();
    return;
  }

  if (event.target.closest("[data-dashboard-detail-close]")) {
    state.dashboardSelection = null;
    renderPage();
    refreshIcons();
    return;
  }

  const warehouseButton = event.target.closest("#warehouseButton");
  if (warehouseButton) {
    document.querySelector("#warehouseMenu").classList.toggle("is-hidden");
    return;
  }

  const warehouseOption = event.target.closest("[data-warehouse]");
  if (warehouseOption) {
    state.warehouse = warehouses.find((item) => item.code === warehouseOption.dataset.warehouse);
    if (state.dailyReportFilters.warehouseCode !== "ALL") {
      state.dailyReportFilters.warehouseCode = state.warehouse.code;
      state.dailyReportFilters.reportId = "";
    }
    document.querySelector("#warehouseMenu").classList.add("is-hidden");
    if (state.activeModule === "gdp" && !isGdpWarehouse()) {
      state.activeModule = "home";
      state.activeChild = moduleById("home").defaultChild;
    }
    const visibleChildren = getVisibleChildren(state.warehouse.code, state.activeModule);
    if (!visibleChildren.includes(state.activeChild)) {
      state.activeChild = visibleChildren[0] || moduleById("home").defaultChild;
    }
    state.showColumnPanel = false;
    state.dashboardSelection = null;
    render();
    return;
  }

  const moduleButton = event.target.closest("[data-module]");
  if (moduleButton) {
    const mod = moduleById(moduleButton.dataset.module);
    state.activeModule = mod.id;
    const visibleChildren = getVisibleChildren(state.warehouse.code, mod.id);
    state.activeChild = visibleChildren.includes(mod.defaultChild) ? mod.defaultChild : visibleChildren[0];
    state.showColumnPanel = false;
    state.dashboardSelection = null;
    render();
    return;
  }

  const childButton = event.target.closest("[data-child]");
  if (childButton) {
    state.activeChild = childButton.dataset.child;
    state.showColumnPanel = false;
    state.dashboardSelection = null;
    renderSideNav();
    renderPage();
    refreshIcons();
    return;
  }

  const collapseButton = event.target.closest("#collapseButton");
  if (collapseButton) {
    document.querySelector(".sidebar").classList.toggle("is-collapsed");
    return;
  }

  const action = event.target.closest("[data-action]");
  const dailyDimension = event.target.closest("[data-report-dimension]");
  if (dailyDimension) {
    state.dailyReportFilters.dimension = dailyDimension.dataset.reportDimension;
    state.dailyReportFilters.reportId = "";
    renderPage();
    refreshIcons();
    return;
  }
  const dailyReport = event.target.closest("[data-daily-report]");
  if (dailyReport) {
    state.dailyReportFilters.reportId = dailyReport.dataset.dailyReport;
    renderPage();
    refreshIcons();
    return;
  }
  const dailyWarehouse = event.target.closest("[data-daily-warehouse]");
  if (dailyWarehouse) {
    state.dailyReportFilters.warehouseCode = dailyWarehouse.dataset.dailyWarehouse;
    state.dailyReportFilters.reportId = "";
    state.warehouse = warehouses.find(
      (item) => item.code === dailyWarehouse.dataset.dailyWarehouse
    );
    render();
    return;
  }
  const monthlyDimension = event.target.closest("[data-monthly-dimension]");
  if (monthlyDimension) {
    state.monthlyUi.selectedDimension = monthlyDimension.dataset.monthlyDimension;
    state.monthlyUi.selectedMetricId = "";
    renderPage();
    refreshIcons();
    return;
  }
  const monthlyMetric = event.target.closest("[data-monthly-metric]");
  if (monthlyMetric) {
    const monthlyModel = getMonthlyReportModel(state.monthlyReportFilters);
    const metric = monthlyModel.dimensions
      .flatMap((item) => item.metrics)
      .find((item) => item.metricId === monthlyMetric.dataset.monthlyMetric);
    if (metric) {
      const target = getDailyDrilldownTarget(monthlyModel.filters, metric);
      state.dailyReportFilters = {
        businessDate: target.businessDate,
        warehouseCode: target.warehouseCode,
        dimension: target.dimension,
        reportId: target.reportId,
        status: target.status,
        keyword: target.keyword
      };
      state.warehouse =
        warehouses.find((item) => item.code === target.warehouseCode) ||
        state.warehouse;
      state.activeChild = "Daily報表中心";
      render();
    }
    return;
  }
  const keyDimension = event.target.closest("[data-key-dimension]");
  if (keyDimension) {
    state.keyNumberUi.selectedDimension = keyDimension.dataset.keyDimension;
    state.keyNumberUi.selectedMetricId = "";
    state.keyNumberUi.expenseLevel = "summary";
    state.keyNumberUi.selectedExpenseCategory = "";
    state.keyNumberUi.selectedAccountName = "";
    state.keyNumberUi.selectedExpenseItem = "";
    renderPage();
    refreshIcons();
    return;
  }
  const keyMetric = event.target.closest("[data-key-metric]");
  if (keyMetric) {
    state.keyNumberUi.selectedMetricId = keyMetric.dataset.keyMetric;
    renderPage();
    refreshIcons();
    return;
  }
  const expenseEntry = event.target.closest("[data-expense-entry]");
  if (expenseEntry) {
    state.keyNumberUi.expenseLevel = "category";
    renderPage();
    refreshIcons();
    return;
  }
  const expenseCategory = event.target.closest("[data-expense-category]");
  if (expenseCategory) {
    state.keyNumberUi.expenseLevel = "detail";
    state.keyNumberUi.selectedExpenseCategory =
      expenseCategory.dataset.expenseCategory;
    state.keyNumberUi.selectedAccountName = "";
    state.keyNumberUi.selectedExpenseItem = "";
    renderPage();
    refreshIcons();
    return;
  }
  const expenseAccount = event.target.closest("[data-expense-account]");
  if (expenseAccount) {
    state.keyNumberUi.selectedAccountName = expenseAccount.dataset.expenseAccount;
    state.keyNumberUi.selectedExpenseItem = "";
    renderPage();
    refreshIcons();
    return;
  }
  const expenseItem = event.target.closest("[data-expense-item]");
  if (expenseItem) {
    state.keyNumberUi.selectedExpenseItem = expenseItem.dataset.expenseItem;
    renderPage();
    refreshIcons();
    return;
  }
  const quarterExport = event.target.closest("[data-quarter-export]");
  if (quarterExport) {
    if (quarterExport.dataset.quarterExport === "workbook") downloadQuarterWorkbook();
    else downloadCurrentReport();
    return;
  }
  const quarterTab = event.target.closest("[data-quarter-tab]");
  if (quarterTab) {
    state.quarterlyTab = quarterTab.dataset.quarterTab;
    state.selectedQuarterlyPoint = "";
    renderPage();
    refreshIcons();
    return;
  }
  const quarterGranularity = event.target.closest("[data-quarter-granularity]");
  if (quarterGranularity) {
    state.quarterlyGranularity = quarterGranularity.dataset.quarterGranularity;
    renderPage();
    refreshIcons();
    return;
  }
  const quarterMetric = event.target.closest("[data-quarter-metric]");
  if (quarterMetric) {
    state.selectedQuarterlyMetricId = quarterMetric.dataset.quarterMetric;
    renderPage();
    refreshIcons();
    return;
  }
  const quarterPoint = event.target.closest("[data-quarter-point]");
  if (quarterPoint) {
    state.selectedQuarterlyPoint = quarterPoint.dataset.quarterPoint;
    renderPage();
    refreshIcons();
    return;
  }
  if (action?.dataset.action === "query-quarter") {
    state.quarterlyFilters = {
      year: Number(document.querySelector('[data-quarter-filter="year"]')?.value || 2026),
      quarter: document.querySelector('[data-quarter-filter="quarter"]')?.value || "Q3",
      warehouseCode: document.querySelector('[data-quarter-filter="warehouseCode"]')?.value || "ALL",
      dimension: document.querySelector('[data-quarter-filter="dimension"]')?.value || "全部面向",
      status: document.querySelector('[data-quarter-filter="status"]')?.value || "全部狀態",
      keyword: document.querySelector('[data-quarter-filter="keyword"]')?.value || ""
    };
    renderPage();
    refreshIcons();
    return;
  }
  if (action?.dataset.action === "query-daily-report") {
    const warehouseCode =
      document.querySelector('[data-daily-filter="warehouseCode"]')?.value ||
      state.warehouse.code;
    state.dailyReportFilters = {
      businessDate:
        document.querySelector('[data-daily-filter="businessDate"]')?.value ||
        state.dailyReportFilters.businessDate,
      warehouseCode,
      dimension:
        document.querySelector('[data-daily-filter="dimension"]')?.value ||
        "全部方向",
      reportId: "",
      status:
        document.querySelector('[data-daily-filter="status"]')?.value ||
        "全部狀態",
      keyword:
        document.querySelector('[data-daily-filter="keyword"]')?.value || ""
    };
    if (warehouseCode !== "ALL") {
      state.warehouse =
        warehouses.find((item) => item.code === warehouseCode) || state.warehouse;
    }
    render();
    return;
  }
  if (action?.dataset.action === "query-monthly-report") {
    state.monthlyReportFilters = {
      yearMonth:
        document.querySelector('[data-monthly-filter="yearMonth"]')?.value ||
        "2026-07",
      warehouseCode:
        document.querySelector('[data-monthly-filter="warehouseCode"]')?.value ||
        "ALL",
      compareMode:
        document.querySelector('[data-monthly-filter="compareMode"]')?.value ||
        "上月",
      dimension:
        document.querySelector('[data-monthly-filter="dimension"]')?.value ||
        "全部方向",
      keyword:
        document.querySelector('[data-monthly-filter="keyword"]')?.value || ""
    };
    state.monthlyUi.selectedDimension =
      state.monthlyReportFilters.dimension === "全部方向"
        ? "進貨"
        : state.monthlyReportFilters.dimension;
    state.monthlyUi.selectedMetricId = "";
    renderPage();
    refreshIcons();
    return;
  }
  if (action?.dataset.action === "query-key-numbers") {
    state.keyNumberFilters = {
      yearMonth:
        document.querySelector('[data-key-filter="yearMonth"]')?.value ||
        "2026-07",
      warehouseCode:
        document.querySelector('[data-key-filter="warehouseCode"]')?.value ||
        "ALL",
      compareMode:
        document.querySelector('[data-key-filter="compareMode"]')?.value ||
        "上月",
      dimension:
        document.querySelector('[data-key-filter="dimension"]')?.value ||
        "全部方向",
      keyword:
        document.querySelector('[data-key-filter="keyword"]')?.value || ""
    };
    state.keyNumberUi.selectedDimension =
      state.keyNumberFilters.dimension === "全部方向"
        ? "進貨"
        : state.keyNumberFilters.dimension;
    state.keyNumberUi.selectedMetricId = "";
    state.keyNumberUi.expenseLevel = "summary";
    renderPage();
    refreshIcons();
    return;
  }
  if (action?.dataset.action === "save-operational-note") {
    const form = action.closest("[data-note-entity-type]");
    state.operationalNotes = appendOperationalNote(state.operationalNotes, {
      entityType: form.dataset.noteEntityType,
      entityId: form.dataset.noteEntityId,
      authorId: "LOCAL-MANAGER",
      responsibleUnit:
        form.querySelector('[data-note-field="responsibleUnit"]')?.value || "待指派",
      responsiblePerson:
        form.querySelector('[data-note-field="responsiblePerson"]')?.value || "待指派",
      dueDate: form.querySelector('[data-note-field="dueDate"]')?.value || "",
      text: form.querySelector('[data-note-field="text"]')?.value || "",
      createdAt: new Date().toISOString()
    });
    renderPage();
    refreshIcons();
    return;
  }
  if (action?.dataset.action === "export-report-center") {
    downloadReportCenterWorkbook();
    return;
  }
  if (action?.dataset.action === "export-report") {
    downloadCurrentReport();
    return;
  }
  if (action?.dataset.action === "column-settings") {
    toggleColumnPanel();
    return;
  }
  if (action?.dataset.action === "query-report") {
    state.reportFilters = {
      businessDate: document.querySelector('[data-filter="businessDate"]')?.value || "",
      status: document.querySelector('[data-filter="status"]')?.value || "全部狀態",
      keyword: document.querySelector('[data-filter="keyword"]')?.value || ""
    };
    renderPage();
    refreshIcons();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !document.querySelector("#loginScreen").classList.contains("is-hidden")) {
    enterApp();
  }
});

refreshIcons();
