const warehouses = [
  { code: "WH01", name: "大豐一般倉", type: "一般倉", focus: "門市配送、一般庫存、出貨達成" },
  { code: "WH02", name: "大豐採品倉(000112)", type: "採品倉", focus: "採品、管罐玩具、採購補貨" },
  { code: "WH03", name: "新屋西藥倉(GDP)", type: "GDP / 西藥", focus: "GDP效期、批號、可用庫存、未上架QC" },
  { code: "WH04", name: "內壢成章倉(調劑)", type: "調劑倉", focus: "調劑耗材、庫齡、庫存移動" },
  { code: "WH05", name: "大園新倉電商倉", type: "電商倉", focus: "EXSD、Backlog、有庫未出、包裝交接" },
  { code: "WH06", name: "高邊退貨倉", type: "退貨倉", focus: "退貨分類、報廢銷毀、不可退廠、90天未異動" },
  { code: "WH07", name: "帳務及庶務倉", type: "帳務庶務", focus: "未拋帳、帳實差異、TMS派車、費用與權限" },
  { code: "WH08", name: "後送中心倉", type: "處方籤 / 零散藥品", focus: "處方籤、零散藥品、缺藥與交接" }
];

const modules = [
  {
    id: "home",
    label: "Home",
    icon: "layout-dashboard",
    title: "工作台",
    defaultChild: "今日工作台",
    children: ["今日工作台", "全倉總覽", "P1待處理", "各倉狀態"]
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
    id: "returns",
    label: "退貨作業",
    icon: "package-search",
    title: "退貨作業",
    defaultChild: "公告退貨工作台",
    children: ["公告退貨工作台", "PDA收貨", "待判定 / 隔離", "處置任務", "退廠 / 調撥", "報廢銷毀", "退貨追溯"]
  },
  {
    id: "transfer",
    label: "移交",
    icon: "shuffle",
    title: "移交",
    defaultChild: "任務交接",
    children: ["任務交接", "保管責任交接", "跨倉調撥", "在途逾時與差異"]
  },
  {
    id: "location",
    label: "位置",
    icon: "map-pin",
    title: "位置",
    defaultChild: "儲位查詢",
    children: ["儲位查詢", "儲位主檔批次建置", "儲位標籤列印", "PDA驗證與啟用", "庫區與容量", "溫層區管理"]
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
    children: ["庫存查詢", "庫存大報表", "每日庫存快照", "庫齡 / 90天未異動", "庫存狀態", "盤點稽核", "SN流水"]
  },
  {
    id: "outbound",
    label: "出貨管理",
    icon: "truck",
    title: "出貨管理",
    defaultChild: "出貨大報表",
    children: ["訂單接收", "訂單配庫", "出貨履約總覽", "出貨覆核", "出貨明細", "配送交接", "EXSD Miss"]
  },
  {
    id: "outboundWork",
    label: "出貨工作",
    icon: "scan-line",
    title: "出貨工作",
    defaultChild: "波次 / 派工",
    children: ["波次 / 派工", "補貨", "揀貨", "覆核", "裝箱", "分貨 / 集貨", "裝車點交", "出貨確認", "PDA作業Log"]
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
    children: ["異常閉環", "外部 / 人工通報", "重複異常分析", "原因碼主檔", "責任單位矩陣"]
  },
  {
    id: "labor",
    label: "人效",
    icon: "users-round",
    title: "人效",
    defaultChild: "報工稼動",
    children: ["報工稼動", "作業效率", "班別組別量能", "人貨二次比對", "技能授權矩陣"]
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
    defaultChild: "全倉營運達標總覽",
    children: ["全倉營運達標總覽", "入庫作業健康", "出貨履約監控", "庫存健康與可用性", "人效與稼動管理", "異常責任與閉環", "營運成本與單位成本"]
  },
  {
    id: "settings",
    label: "權限",
    icon: "settings",
    title: "權限",
    defaultChild: "角色權限",
    children: ["角色權限", "倉別權限", "欄位權限", "操作紀錄", "主檔參數"]
  }
];

const state = {
  warehouse: warehouses[4],
  activeModule: "home",
  activeChild: "今日工作台",
  expandedP1Category: null,
  showColumnPanel: false,
  currentExport: { title: "大樹WMS報表", columns: [], rows: [] }
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
  },
  gdp: {
    title: "效期風險大表",
    subtitle: "把進貨效期、庫內最短效期、近效短效、批號完整率、未上架QC與採購允收規則放在同一張每日必看報表。",
    source: "GDP八報表 / 效期與批號每日必看報表",
    kpis: [
      ["效期異常SKU", "12", "R1 / 效期快照"],
      ["未上架QC", "980 PCS", "R7 未上架QC"],
      ["不可用庫存", "1,060 PCS", "R6 庫存明細"],
      ["批號完整率", "98.4%", "R5 出貨追溯"]
    ],
    columns: ["倉別", "供應商", "SKU", "品名", "進貨批號", "進貨效期", "庫內最短效期", "效期差異天數", "通知應收PCS", "驗收入庫PCS", "未上架QC", "允收判斷", "責任單位", "Daily指標"],
    rows: [
      ["WH03", "藥廠A", "GDP-001", "藥品A", "B260701", "2027-01-05", "2027-03-01", "-55", 1000, 980, 980, status("待採購確認", "warn"), "採購/GDP窗口", "GDP八報表 / 效期異常"],
      ["WH08", "藥廠E", "RX-011", "處方藥B", "B260705", "2026-10-01", "2026-12-01", "-61", 80, 60, 60, status("待確認", "warn"), "後送中心", "未上架QC"]
    ],
    fieldNotes: [
      ["GDP八報表", "R1效期異常、R2/R4驗收、R3上架、R5出貨、R6庫存、R7 QC、R8訂單"],
      ["Daily來源", "通知應收PCS、驗收入庫PCS、驗收差異PCS、未上架QC、可用庫存出貨達成率"],
      ["下鑽", "供應商→SKU→批號→效期→允收規則→責任單位"]
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
  return modules.filter((item) => {
    if (item.id === "gdp") return isGdpWarehouse();
    if (item.id === "returns") return state.warehouse.code === "WH06";
    return true;
  });
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
  const children = getVisibleChildrenForState(mod);
  if (!children.includes(state.activeChild)) {
    state.activeChild = children[0] || mod.defaultChild;
  }
  document.querySelector("#sideTitle").textContent = mod.title;
  document.querySelector("#sideNav").innerHTML = children.map((child) => `
    <button type="button" class="${child === state.activeChild ? "is-active" : ""}" data-child="${child}">
      <i data-lucide="${mod.icon}"></i>
      ${child}
    </button>
  `).join("");
}

function getVisibleChildrenForState(mod = moduleById(state.activeModule)) {
  if (["home", "dashboard"].includes(mod.id)) return mod.children;
  return DASHU_WMS.getVisibleChildren(mod.id, state.warehouse.code);
}

function pageHeader(title, subtitle, breadcrumb = "大樹 WMS 原型") {
  return `
    <div class="page-header">
      <div>
        <p class="breadcrumb">${breadcrumb} / ${state.warehouse.code} ${state.warehouse.name}</p>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="header-actions">
        <button class="action-button" type="button" data-action="export-report"><i data-lucide="download"></i>匯出CSV</button>
        <button class="action-button" type="button" data-action="column-settings"><i data-lucide="list-filter"></i>欄位設定</button>
      </div>
    </div>
  `;
}

function renderDataQualityBanner({ period = "2026-07-09", updatedAt = "原型資料", completeness = "示意" } = {}) {
  return `
    <section class="data-quality-banner" aria-label="資料品質">
      <strong>原型假資料</strong>
      <span>資料期間：${period}</span>
      <span>最後更新：${updatedAt}</span>
      <span>完整率：${completeness}</span>
    </section>
  `;
}

function renderPage() {
  if (state.activeModule === "gdp" && !isGdpWarehouse()) {
    state.activeModule = "home";
    state.activeChild = moduleById("home").defaultChild;
  }
  if (state.activeModule === "returns" && state.warehouse.code !== "WH06") {
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

  if (state.activeModule === "location" && state.activeChild === "儲位主檔批次建置") {
    document.querySelector("#pageRoot").innerHTML = renderLocationBatch();
    return;
  }

  if (state.activeModule === "inventoryMove" && state.activeChild === "庫存移交路徑") {
    document.querySelector("#pageRoot").innerHTML = renderInventoryTrace();
    return;
  }

  document.querySelector("#pageRoot").innerHTML = renderChildPage();
}

function renderLocationBatch() {
  const preview = DASHU_WMS.previewLocationBatch({ warehouseCode: state.warehouse.code, zoneCode: "Z01", aisleCode: "A", rackFrom: 1, rackTo: 2, levels: 2, bins: 2 });
  const columns = ["儲位代號", "Barcode", "PDA驗證", "啟用狀態", "實體儲位"];
  const rows = preview.map((item) => [item.code, item.barcodeType, item.pdaVerified ? "已驗證" : "待驗證", item.enabled ? "已啟用" : "未啟用", item.physical ? "是" : "否"]);
  setCurrentExport("儲位主檔批次建置", columns, rows);
  return `
    ${pageHeader("儲位主檔批次建置", "依倉別－庫區－列－架－層－格批次預覽；核准、列印 Code 128、現場 PDA 驗證後才可啟用。", "位置")}
    ${renderDataQualityBanner({ period: "建置批次預覽", updatedAt: "尚未寫入正式主檔", completeness: "8筆示意" })}
    <section class="query-panel location-batch-form">
      <div class="query-grid">
        ${queryField("倉別", state.warehouse.code)}${queryField("庫區", "Z01")}${queryField("列", "A")}
        ${queryField("架號", "001–002")}${queryField("層數", "02")}${queryField("每層格數", "02")}
      </div>
      <div class="query-actions"><button class="action-button" type="button">預覽與重複檢查</button><button class="action-button" type="button">送主管核准</button></div>
    </section>
    ${renderTable(columns, rows)}
  `;
}

function renderInventoryTrace() {
  const trace = DASHU_WMS.buildInventoryTrace("LPN260709001", state.warehouse.code);
  const columns = ["事件時間", "事件", "來源倉儲位", "目的倉儲位", "交出人", "接收人", "PDA", "數量"];
  const rows = trace.events.map((event) => [event.at, event.event, event.from, event.to, event.handedBy, event.receivedBy, event.device, event.quantity]);
  setCurrentExport("庫存移交路徑", columns, rows);
  return `
    ${pageHeader("庫存移交路徑", "輸入商品編號、SKU ID 或 LPN，回查從到倉至今的完整經手與責任事件；只呈現掃描證據，不推測責任。", "庫存移動")}
    ${renderDataQualityBanner({ period: "完整歷程示意", updatedAt: trace.events.at(-1).at, completeness: "事件鏈完整" })}
    <section class="query-panel"><div class="query-grid">${queryField("商品編號 / SKU ID / LPN", trace.query, "search")}</div><div class="query-actions"><button class="action-button" type="button">查詢完整歷程</button></div></section>
    <section class="trace-summary">
      <div><strong>目前儲位</strong><span>${trace.currentLocation}</span></div>
      <div><strong>目前保管責任</strong><span>${trace.currentCustodian}</span></div>
      <div><strong>查詢鍵</strong><span>${trace.queryType}：${trace.query}</span></div>
    </section>
    <section class="trace-path" aria-label="庫存移交路徑">
      ${trace.events.map((event, index) => `<div class="trace-node"><small>${index + 1}</small><strong>${event.event}</strong><span>${event.to}</span><em>${event.receivedBy}｜${event.at}</em></div>`).join("")}
    </section>
    ${renderTable(columns, rows)}
  `;
}

function renderReturnWorkflow() {
  const child = state.activeChild;
  const timeline = DASHU_WMS.buildReturnTimeline("WH06-RT-S001-000012");
  const columns = ["暫收LPN", "來源門市", "公告批次", "SKU ID", "商品", "批號", "效期", "實收PCS", "判定", "隔離儲位", "處置", "未結PCS"];
  const rows = [
    [timeline.lpn, "S001", "ANN-20260713", "SKU001", "公告回收商品A", "B260601", "2027-12-31", 12, "良品", "WH06-ISO-01", "待調撥", 12],
    ["WH06-RT-S018-000013", "S018", "未列公告", "SKU118", "門市異常退回品", "B250101", "2026-09-01", 3, "待判定", "WH06-ISO-EX", "異常隔離", 3]
  ];
  setCurrentExport(`退貨作業_${child}`, columns, rows);
  return `
    ${pageHeader(child, "WH06 專用公告退貨閉環：門市有公告清單但無可掃條碼時，到退貨倉後由現場逐筆掃商品、來源門市、批效期與數量。", "退貨作業")}
    ${renderDataQualityBanner({ period: "流程示意", updatedAt: "2026-07-14", completeness: "待正式介接" })}
    <section class="workflow-steps">
      ${["1 公告清單比對", "2 掃來源門市與商品", "3 建暫收LPN", "4 品況 / 效期判定與隔離", "5 退廠 / 調撥 / 批銷 / 報廢結清"].map((step) => `<div class="field-chip"><strong>${step}</strong></div>`).join("")}
    </section>
    <section class="field-map">
      <div class="field-chip"><strong>三個不可跨越控制點</strong><span>無來源門市不得完成收貨；不符公告品不得入正常庫；未完成處置判定不得轉為可用庫存。</span></div>
      <div class="field-chip"><strong>數量平衡</strong><span>實收＝退廠＋調撥＋批銷＋報廢＋未結，差異不為零即列 P1。</span></div>
      <div class="field-chip"><strong>人工 Key 改造</strong><span>PDA 先取得事件證據；WMS 工作台負責主管判定、核准與結案。</span></div>
    </section>
    ${renderReportToolbar()}
    ${renderTable(columns, rows)}
    <section class="trace-path">${timeline.events.map((event, index) => `<div class="trace-node"><small>${index + 1}</small><strong>${event.event}</strong><span>${event.actor}</span><em>${event.at}</em></div>`).join("")}</section>
  `;
}

function getReportProfile(type) {
  const base = baseReportProfiles[type] || baseReportProfiles.inventory;
  const override = warehouseReportProfiles[state.warehouse.code]?.[type] || {};
  return { ...base, ...override, kpis: override.kpis || base.kpis, fieldNotes: override.fieldNotes || base.fieldNotes };
}

function getChildPageProfile() {
  const mod = moduleById(state.activeModule);
  const child = state.activeChild;
  const spec = DASHU_WMS.getPageSpec(state.warehouse.code, state.activeModule, child);
  if (!spec) {
    return {
      title: child,
      status: "不適用",
      queryFields: [],
      actions: [],
      kpis: [],
      columns: ["資料狀態"],
      rows: [["此倉別不適用此功能"]],
      pdaEvents: [],
      drilldown: []
    };
  }
  return spec;
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
  setCurrentExport(profile.title, profile.columns, profile.rows);
  return `
    ${pageHeader(profile.title, "", mod.label)}
    ${renderDataQualityBanner({ period: "尚未介接", updatedAt: "未更新", completeness: profile.status })}
    ${renderColumnPanel(profile.columns)}
    ${renderDedicatedToolbar(profile)}
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, mod.icon)).join("")}
    </section>
    ${renderTable(profile.columns, profile.rows)}
    ${profile.rows.length ? "" : renderEmptyOperationalState(profile)}
  `;
}

function renderDedicatedToolbar(profile) {
  return `
    <section class="query-panel compact-operational-toolbar">
      <div class="query-grid">${profile.queryFields.map((field) => queryField(field, "")).join("")}</div>
      <div class="query-actions">${profile.actions.map((action) => `<button class="action-button" type="button">${action}</button>`).join("")}</div>
    </section>
  `;
}

function renderEmptyOperationalState(profile) {
  return `<section class="empty-operational-state"><strong>資料不足／尚未介接</strong><span>${profile.warehouseCode || state.warehouse.code} ${profile.warehouseName || state.warehouse.name} 尚無此功能的正式來源資料；不顯示其他倉或推定數值。</span></section>`;
}

function setCurrentExport(title, columns, rows) {
  state.currentExport = { title, columns, rows };
}

function renderReport(type) {
  const profile = getReportProfile(type);
  setCurrentExport(profile.title, profile.columns, profile.rows);
  return `
    ${pageHeader(profile.title, profile.subtitle, profile.source || moduleById(state.activeModule).label)}
    ${renderDataQualityBanner()}
    ${renderColumnPanel(profile.columns)}
    <section class="kpi-grid">
      ${profile.kpis.map(([label, value, note]) => kpi(label, value, note, "database")).join("")}
    </section>
    ${renderReportToolbar()}
    ${renderTable(profile.columns, profile.rows)}
    <section class="field-map">
      ${profile.fieldNotes.map(([title, text]) => `
        <div class="field-chip">
          <strong>${title}</strong>
          <span>${text}</span>
        </div>
      `).join("")}
    </section>
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
    const columns = ["優先級", "倉別", "來源報表", "問題類別", "案件數", "核心KPI", "責任單位", "SLA", "下鑽"];
    const rows = [
      ["P1", "WH03", "新屋西藥倉_報表｜每日", "效期/GDP", "2件", "980 PCS", "採購/GDP窗口", "4h", "供應商→SKU→批號"],
      ["P1", "WH05", "02電商_報表｜每日", "出貨履約", "3件", "68 有庫未出", "包裝/出貨組", "2h", "訂單→SKU→箱號"],
      ["P1", "WH06", "高邊退貨_報表｜每日", "退貨處置", "2件", "24筆", "退貨/管理課", "1日", "清冊→SKU→退貨單"],
      ["P1", "WH07", "帳務及庶務倉_報表｜每日", "帳務/TMS", "1件", "3筆", "資訊/帳務", "4h", "車次→單據→錯誤碼"]
    ];
    const categories = [
      { id: "gdp", icon: "shield-check", label: "效期/GDP", count: "2件", warehouse: "WH03", issue: "進貨效期低於庫內", owner: "採購/GDP窗口", sla: "4h", drilldown: "供應商→SKU→批號", tone: "warning" },
      { id: "outbound", icon: "truck", label: "出貨履約", count: "3件", warehouse: "WH05", issue: "EXSD Miss / Backlog", owner: "包裝/出貨組", sla: "2h", drilldown: "訂單→SKU→箱號", tone: "danger" },
      { id: "returns", icon: "package-search", label: "退貨處置", count: "2件", warehouse: "WH06", issue: "不可退廠清冊未結", owner: "退貨/管理課", sla: "1日", drilldown: "清冊→SKU→退貨單", tone: "warning" },
      { id: "accounting", icon: "receipt-text", label: "帳務/TMS", count: "1件", warehouse: "WH07", issue: "TMS派車與未拋帳", owner: "資訊/帳務", sla: "4h", drilldown: "車次→單據→錯誤碼", tone: "warning" }
    ];
    setCurrentExport("Home_P1待處理", columns, rows);
    return `
      ${pageHeader("P1待處理", "只放今天必須升級處理的跨倉風險，避免主管被一般明細淹沒。", "Home")}
      ${renderColumnPanel(columns)}
      <section class="p1-reconciliation">
        <strong>P1未結案件 <b>8件</b></strong>
        <span>共4類｜分類合計 2＋3＋2＋1＝8件</span>
        <em>SLA逾時 2件</em>
      </section>
      <section class="p1-category-grid">
        ${categories.map((category) => `
          <button type="button" class="p1-category-card ${category.tone} ${state.expandedP1Category === category.id ? "is-expanded" : ""}" data-p1-category="${category.id}" aria-expanded="${state.expandedP1Category === category.id}">
            <i data-lucide="${category.icon}"></i>
            <span>${category.label}<small>${category.warehouse}</small></span>
            <strong>${category.count}</strong>
            <em>${category.issue}</em>
            <b>責任：${category.owner}</b>
            <small>SLA ${category.sla}</small>
          </button>
        `).join("")}
      </section>
      ${categories.map((category) => `
        <section class="p1-case-detail" data-p1-detail="${category.id}" ${state.expandedP1Category === category.id ? "" : "hidden"}>
          <div><span>倉別</span><strong>${category.warehouse}</strong></div>
          <div><span>目前問題</span><strong>${category.issue}</strong></div>
          <div><span>責任單位</span><strong>${category.owner}</strong></div>
          <div><span>處理時限</span><strong>${category.sla}</strong></div>
          <div class="p1-drilldown-path"><span>回查路徑</span><strong>${category.drilldown}</strong></div>
        </section>
      `).join("")}
    `;
  }

  if (view === "各倉狀態") {
    setCurrentExport("Home_各倉狀態", ["倉別", "今日狀態", "主要異常", "未結件數", "更新時間"], warehouses.map((warehouse) => [
      warehouse.code,
      warehouse.code === "WH05" || warehouse.code === "WH06" ? "需處理" : "需追蹤",
      dashboardRanking.find((row) => row.code === warehouse.code)?.risk || "正常",
      dashboardRanking.find((row) => row.code === warehouse.code)?.exceptions || 0,
      "2026-07-14 14:00"
    ]));
    return `
      ${pageHeader("各倉狀態", "主管跨倉異常摘要；卡片只保留今日狀態、主要異常、未結件數與更新時間，點倉別後進入該倉工作台。", "Home")}
      ${renderDataQualityBanner()}
      ${renderColumnPanel(state.currentExport.columns)}
      <section class="warehouse-status-grid">
        ${warehouses.map((warehouse) => {
          const rank = dashboardRanking.find((row) => row.code === warehouse.code);
          return `
            <article class="warehouse-card ${warehouse.code === state.warehouse.code ? "is-active" : ""}">
              <strong>${warehouse.code} ${warehouse.name}</strong>
              <span>今日狀態：${warehouse.code === "WH05" || warehouse.code === "WH06" ? "需處理" : "需追蹤"}</span>
              <p>主要異常：${rank?.risk || "正常"}</p>
              <small>未結件數：${rank?.exceptions || 0}｜更新：2026-07-14 14:00</small>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  setCurrentExport("Home_今日工作台", ["項目", "數值", "來源", "處理方向"], [
    ["今日應出PCS", "15,033", "Daily各倉產能統計", "看出貨完成率與有庫未出"],
    ["待驗/待上架", "2,140", "進貨/驗收/上架Log", "看入庫健康與庫存可用"],
    ["P1未結異常", "8", "異常Log", "看責任單位與SLA"],
    ["成本趨勢", "+6.2%", "報工/TMS/費用表", "看OT、委外、配送、包材"]
  ]);
  return `
    ${pageHeader("今日工作台", "主管一進WMS先看今天要處理什麼、哪個倉卡住、哪個異常需要升級。", "Home")}
    ${renderColumnPanel(state.currentExport.columns)}
    <section class="kpi-grid">
      ${kpi("今日應出PCS", "15,033", "出貨大報表 / 訂單應出PCS", "truck")}
      ${kpi("出貨完成率", "97.5%", "低於98%需追蹤", "gauge")}
      ${kpi("待驗 / 待上架", "2,140", "接收與GDP共同追蹤", "package-check")}
      ${kpi("P1未結異常", "8", "SLA逾時2件", "circle-alert")}
    </section>
    <section class="dashboard-grid">
      <div class="panel">
        <h3>今日作業健康度</h3>
        <div class="flow-list">
          ${flow("進貨接收", 74, "待上架 1,100")}
          ${flow("驗收QC", 61, "短效 2 件")}
          ${flow("揀貨下架", 82, "有庫未出 68")}
          ${flow("裝箱交接", 57, "車次等待 3")}
          ${flow("異常結案", 69, "未結 8")}
        </div>
      </div>
      <div class="panel">
        <h3>每日必看風險</h3>
        <div class="risk-list">
          ${risk("danger", "GDP進貨短效", "WH03 藥品A 980PCS 待採購允收")}
          ${risk("warn", "有庫未出", "WH05 包裝站等待 28PCS")}
          ${risk("warn", "不可退廠清冊", "WH06 待報廢120PCS")}
          ${risk("warn", "TMS派車", "WH07 派車已拋、簽收未回")}
        </div>
      </div>
      <div class="panel">
        <h3>各倉出貨完成率</h3>
        <div class="mini-bars">
          ${dashboardRanking.slice(0, 6).map((row) => bar(row.code, row.complete, `${row.complete}%`)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderDashboardView() {
  const child = state.activeChild;
  const dashboardText = {
    "全倉營運達標總覽": "跨倉判斷是否達標、卡在哪個節點及應由誰處理。",
    "入庫作業健康": "聚焦同母集合應到至上架的停留時間、瓶頸與責任節點。",
    "出貨履約監控": "聚焦承諾時限、出貨節點、待發貨預警與人力缺口。",
    "庫存健康與可用性": "聚焦互斥庫存狀態、庫齡、效期、容量及帳實差異。",
    "人效與稼動管理": "聚焦標準工時加權達成率、報工完整率、工時分布與編制。",
    "異常責任與閉環": "聚焦未結、SLA、已確認根因、責任、改善證據與複核。",
    "營運成本與單位成本": "聚焦總成本、單位成本、差異來源及分攤規則版本。"
  }[child];
  if (child === "全倉營運達標總覽") {
    return renderExecutiveDashboard();
  }
  const columns = ["排名", "倉別", "出貨完成率", "入庫健康", "庫存健康", "異常件數", "成本指標", "主要風險"];
  const rows = dashboardRanking.map((row, index) => [
    index + 1,
    `${row.code} ${row.name}`,
    `${row.complete}%`,
    `${row.inbound}%`,
    `${row.inventory}%`,
    row.exceptions,
    `${row.cost}%`,
    row.risk
  ]);
  if (child !== "全倉營運達標總覽") {
    return renderFocusedDashboard(child, dashboardText);
  }
  setCurrentExport(`Dashboard_${child}`, columns, rows);
  return `
    <section class="dark-dashboard">
      ${pageHeader(`${child} Dashboard`, `${dashboardText} 來源一路由各倉每日必看報表、Daily統計*各倉產能*整合模板彙總到04_看板總表。`, "Dashboard")}
      ${renderDataQualityBanner({ period: "示意期間", updatedAt: "尚未介接正式來源", completeness: "資料不足" })}
      ${renderColumnPanel(columns)}
      <div class="dark-kpis">
        <div class="dark-kpi"><span>今日出貨完成</span><strong>14,654 PCS</strong></div>
        <div class="dark-kpi"><span>全倉完成率</span><strong>97.5%</strong></div>
        <div class="dark-kpi"><span>庫存健康風險</span><strong>1,060 PCS</strong></div>
        <div class="dark-kpi"><span>P1未結異常</span><strong>8 件</strong></div>
      </div>
      <div class="dark-grid">
        <div class="dark-panel wide">
          <h3>全倉比較排名</h3>
          ${renderWarehouseComparison("", dashboardRanking)}
        </div>
        <div class="dark-panel">
          <h3>庫存狀態占比</h3>
          <div class="donut"></div>
          <div class="legend-row"><span>可用</span><span>暫用</span><span>已揀</span><span>不可用</span></div>
        </div>
        <div class="dark-panel">
          <h3>入庫健康漏斗</h3>
          <div class="flow-list">
            ${flow("應到", 100, "3,020")}
            ${flow("已收", 95, "2,880")}
            ${flow("已驗", 88, "2,660")}
            ${flow("已上架", 45, "1,360")}
          </div>
        </div>
        <div class="dark-panel">
          <h3>異常閉環</h3>
          <div class="risk-list">
            ${risk("danger", "SLA逾時", "2件")}
            ${risk("warn", "責任未定", "3件")}
            ${risk("warn", "重複異常", "4件")}
            ${risk("ok", "今日結案", "11件")}
          </div>
        </div>
        <div class="dark-panel">
          <h3>成本趨勢</h3>
          <div class="mini-bars">
            ${bar("人力", 72, "+3%")}
            ${bar("OT", 84, "+9%")}
            ${bar("委外", 48, "-2%")}
            ${bar("配送", 66, "+6%")}
            ${bar("包材", 58, "+4%")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderExecutiveDashboard() {
  const warehouseAchievement = [
    { code: "WH05", name: "大園新倉電商倉", labor: 86, reporting: 96, utilization: 108, shipment: 91, misses: 3, status: "danger" },
    { code: "WH06", name: "高邊退貨倉", labor: 89, reporting: 92, utilization: 103, shipment: null, misses: 2, status: "danger" },
    { code: "WH03", name: "新屋西藥倉", labor: 94, reporting: 99, utilization: 98, shipment: 97.7, misses: 1, status: "warning" },
    { code: "WH08", name: "後送中心倉", labor: 96, reporting: 98, utilization: 95, shipment: 93.4, misses: 1, status: "warning" },
    { code: "WH01", name: "大豐一般倉", labor: 101, reporting: 100, utilization: 91, shipment: 98.2, misses: 0, status: "normal" },
    { code: "WH02", name: "大豐採品倉", labor: 98, reporting: 97, utilization: 90, shipment: 94.8, misses: 1, status: "warning" },
    { code: "WH04", name: "內壢成章倉", labor: 103, reporting: 99, utilization: 88, shipment: 99.7, misses: 0, status: "normal" },
    { code: "WH07", name: "帳務及庶務倉", labor: null, reporting: 76, utilization: null, shipment: null, misses: null, status: "insufficient" }
  ];
  const selected = warehouseAchievement.find((item) => item.code === state.warehouse.code) || warehouseAchievement[0];
  const columns = ["倉別", "標準工時加權達成率", "報工完整率", "人力使用率", "承諾時限內出貨率", "未達標作業數", "判斷"];
  const rows = warehouseAchievement.map((item) => [item.code, displayRate(item.labor), displayRate(item.reporting), displayRate(item.utilization), displayRate(item.shipment), item.misses ?? "資料不足", dashboardStatusLabel(item.status)]);
  setCurrentExport("Dashboard_全倉營運達標總覽", columns, rows);
  return `
    <section class="dark-dashboard accountable-dashboard">
      ${pageHeader("全倉營運達標總覽", "", "Dashboard")}
      ${renderDataQualityBanner({ period: "2026-07-09 原型假資料", updatedAt: "原型資料", completeness: "公式版本 2026-07-15-dashboard-v2" })}
      <div class="achievement-layout">
        <section class="dark-panel warehouse-achievement-list">
          <div class="panel-heading"><h3>各倉達標總覽</h3><span>未達標且即將逾時優先；資料不足不排名</span></div>
          <div class="achievement-header"><span>倉別</span><span>標準工時加權達成率</span><span>報工完整率</span><span>人力使用率</span><span>承諾時限內出貨率</span><span>未達標</span></div>
          ${warehouseAchievement.map(renderWarehouseAchievementRow).join("")}
        </section>
        <section class="dark-panel selected-warehouse-fulfillment">
          <div class="panel-heading"><h3>${selected.code} 出貨履約監控</h3><span>承諾規則：${selected.code === "WH05" ? "訂單建立後24小時" : "依倉別截單／班次"}</span></div>
          ${renderOutboundFulfillment(selected)}
        </section>
      </div>
      ${renderShippingLaborWarnings()}
      ${renderTable(columns, rows)}
    </section>
  `;
}

function renderWarehouseAchievementRow(item) {
  return `<button type="button" class="achievement-row ${item.status}" data-dashboard-drilldown data-warehouse="${item.code}" data-flow="achievement" data-status="${item.status}" data-formula-version="2026-07-15-dashboard-v2">
    <strong>${item.code}<small>${item.name}</small></strong>
    <span>${displayRate(item.labor)}</span><span>${displayRate(item.reporting)}</span><span>${displayRate(item.utilization)}</span><span>${displayRate(item.shipment)}</span>
    <b>${item.misses ?? "資料不足"}<small>${dashboardStatusLabel(item.status)}</small></b>
  </button>`;
}

function renderOutboundFulfillment(item) {
  const stages = [
    ["待分配", 36, "420 PCS", "0:22"], ["待揀貨", 42, "680 PCS", "0:41"], ["揀貨中", 28, "510 PCS", "0:35"],
    ["待覆核", 19, "260 PCS", "0:28"], ["待包裝", 31, "380 PCS", "1:12"], ["待出貨", 24, "320 PCS", "0:53"], ["已出貨", 186, "3,940 PCS", "-"]
  ];
  return `<div class="fulfillment-flow">${stages.map(([label, orders, pcs, age], index) => `<button type="button" class="fulfillment-stage ${index === 4 ? "warning" : ""}" data-dashboard-drilldown data-warehouse="${item.code}" data-flow="outbound" data-status="${label}" data-formula-version="2026-07-15-dashboard-v2"><span>${label}</span><strong>${orders}單</strong><small>${pcs}</small><em>最老等待時間 ${age}</em></button>`).join("")}</div>`;
}

function renderShippingLaborWarnings() {
  return `<section class="dark-panel shipping-labor-warning"><div class="panel-heading"><h3>待發貨與人力預警</h3><span>剩餘工作量依標準人效換算需求人力</span></div>
    <div class="warning-grid">
      <button type="button" class="warning-case danger" data-dashboard-drilldown data-warehouse="WH05" data-flow="outbound" data-status="即將逾時"><strong>WH05｜包裝即將逾時</strong><span>28單／380 PCS｜最老等待1:12</span><small>投入5人｜需求8人｜缺口3人｜責任：包裝組</small></button>
      <button type="button" class="warning-case warning" data-dashboard-drilldown data-warehouse="WH03" data-flow="outbound" data-status="待放行"><strong>WH03｜GDP待放行</strong><span>9單／980 PCS｜承諾班次16:00</span><small>效期允收未完成｜責任：GDP／採購</small></button>
      <button type="button" class="warning-case insufficient" data-dashboard-drilldown data-warehouse="WH07" data-flow="outbound" data-status="資料不足"><strong>WH07｜履約資料不足</strong><span>承諾規則未介接</span><small>不計入全倉排名</small></button>
    </div></section>`;
}

function displayRate(value) {
  return value === null || value === undefined ? "資料不足" : `${value}%`;
}

function dashboardStatusLabel(statusType) {
  return { normal: "達標", warning: "注意", danger: "未達標", insufficient: "資料不足" }[statusType] || "資料不足";
}

function executiveMetric(label, value, formula, statusType) {
  return `<div class="executive-metric ${statusType}"><span>${label}</span><strong>${value}</strong><small>${formula}</small></div>`;
}

function executiveRisk(warehouse, cause, impact, owner, sla, level) {
  return `<div class="executive-risk ${level}"><strong>${warehouse}｜${cause}</strong><b>${impact}</b><small>責任：${owner}｜${sla}</small></div>`;
}

function renderRiskHeatmap() {
  const heatmapRows = [
    ["WH01", "98.2%", "正常", "有庫未出18", "2", "未介接"],
    ["WH03", "97.7%", "效期允收", "鎖庫980", "5", "未介接"],
    ["WH05", "91.0%", "待上架", "有庫未出", "8", "未介接"],
    ["WH06", "不適用", "退貨收貨", "處置未結", "9", "未介接"],
    ["WH07", "不適用", "不適用", "帳實差異", "6", "未拋帳"]
  ];
  const cellClass = (value) => /91\.0|效期|處置|未拋帳|^8$|^9$/.test(value) ? "danger" : /未出|待上架|鎖庫|差異|^5$|^6$/.test(value) ? "warn" : /不適用|未介接/.test(value) ? "na" : "normal";
  return `<div class="heatmap-grid"><b></b><b>出貨</b><b>入庫</b><b>庫存</b><b>異常</b><b>成本</b>${heatmapRows.map((row) => `<b>${row[0]}</b>${row.slice(1).map((value) => `<button type="button" class="heatmap-cell ${cellClass(value)}">${value}</button>`).join("")}`).join("")}</div>`;
}

function renderFocusedDashboard(child, dashboardText) {
  if (child === "入庫作業健康") return renderInboundHealthDashboard(dashboardText);
  if (child === "庫存健康與可用性") return renderInventoryHealthDashboard(dashboardText);
  if (child === "人效與稼動管理") return renderLaborDashboard(dashboardText);
  if (child === "異常責任與閉環") return renderExceptionDashboard(dashboardText);
  if (child === "營運成本與單位成本") return renderCostDashboard(dashboardText);
  const configs = {
    "入庫作業健康": {
      kpis: [["應到", "3,020 PCS"], ["實到", "2,880 PCS"], ["待驗收", "220 PCS"], ["待上架", "1,300 PCS"]],
      panels: [["同母集合入庫漏斗", "應到 → 實到 → 卸貨 → 驗收 → QC → 已上架"], ["節點處理時間", "中位數、P90 與 SLA 目標線"], ["逾時原因 Pareto", "卸貨等待、QC等待、儲位不足、資料缺漏"]],
      columns: ["倉別", "ASN / 採購單", "收貨單", "供應商", "目前節點", "待處理PCS", "停留時間", "責任單位"]
    },
    "出貨履約監控": {
      kpis: [["承諾時限內出貨率", "97.5%"], ["即將逾時", "28單"], ["已逾時", "2單"], ["人力缺口", "3人"]],
      panels: [["履約節點", "待分配、待揀貨、揀貨中、待覆核、待包裝、待出貨、已出貨"], ["待發貨預警", "依各倉承諾截止時間，而非全倉固定24小時"], ["人力需求", "剩餘工作量依標準人效換算需求人力"]],
      columns: ["倉別", "訂單", "承諾截止", "目前節點", "PCS", "最老等待時間", "責任組", "預警狀態"]
    },
    "庫存健康與可用性": {
      kpis: [["可用", "12,480 PCS"], ["鎖庫", "1,060 PCS"], ["90天未異動", "680 PCS"], ["滿載儲位", "24格"]],
      panels: [["互斥庫存狀態", "可用、暫用、已揀、不可用、鎖庫、隔離、待報廢"], ["庫齡與效期分布", "0–30、31–60、61–90、90天以上"], ["儲位容量熱區", "容量母體、已用與不可用儲格分開計算"]],
      columns: ["倉別", "SKU", "批號 / 效期", "LPN", "儲位", "庫存狀態", "PCS", "庫齡", "風險"]
    },
    "人效與稼動管理": {
      kpis: [["加權達成率", "75.0%"], ["報工完整率", "93.8%"], ["人力使用率", "88.0%"], ["未達標作業", "3項"]],
      panels: [["標準工時加權達成率", "標準工時合計 ÷ 實際作業工時"], ["報工完整率", "已報作業工時 ÷ 應報工時，獨立顯示"], ["編制評估", "大於100%編制不足；80%至100%合理；低於80%需連同報工品質判讀"]],
      columns: ["日期", "倉別", "作業類型", "完成量", "標準人效", "標準工時", "實際工時", "達成率", "報工完整率"]
    },
    "異常責任與閉環": {
      kpis: [["未結案", "18件"], ["SLA逾時", "2件"], ["根因未確認", "6件"], ["今日結案", "11件"]],
      panels: [["案件 Aging", "0–2h、2–4h、4–8h、8h以上"], ["原因 Pareto", "異常現象與已確認根因分開"], ["責任與閉環", "改善證據、複核人與結案時間缺一不可"]],
      columns: ["異常單", "倉別", "來源模組", "分級", "SLA", "已確認根因", "責任單位", "改善證據", "結案狀態"]
    },
    "營運成本與單位成本": {
      kpis: [["總成本", "資料不足"], ["每單成本", "資料不足"], ["每PCS成本", "資料不足"], ["OT成本", "資料不足"]],
      panels: [["成本趨勢", "正式費用來源未介接，不繪製趨勢圖"], ["成本差異拆解", "人力、OT、委外、配送、包材、異常成本"], ["分攤規則版本", "無分攤規則與母數時禁止跨倉排名"]],
      columns: ["日期", "倉別", "成本類型", "金額", "訂單母數", "PCS母數", "分攤規則版本", "資料狀態"]
    }
  };
  const config = configs[child];
  const gate = DASHU_WMS.dashboardQualityGate({ requiredFields: ["date", "warehouseCode"], record: { date: "2026-07-14" }, denominator: 1, updated: true });
  const rows = [["資料不足", state.warehouse.code, "尚未介接正式來源", "-", "-", "-", "-", gate.reason]];
  setCurrentExport(`Dashboard_${child}`, config.columns, rows);
  return `
    <section class="dark-dashboard">
      ${pageHeader(`${child} Dashboard`, dashboardText, "Dashboard")}
      ${renderDataQualityBanner({ period: "尚未介接", updatedAt: "未更新", completeness: "資料不足" })}
      <div class="dark-kpis">${config.kpis.map(([label, value]) => `<div class="dark-kpi"><span>${label}</span><strong>${value}</strong><small>原型假資料｜待正式對帳</small></div>`).join("")}</div>
      <div class="dark-grid">${config.panels.map(([title, text]) => `<div class="dark-panel"><h3>${title}</h3><p>${text}</p><div class="insufficient-state">${gate.canRender ? "可呈現" : `資料不足：${gate.reason}`}</div></div>`).join("")}</div>
      ${renderTable(config.columns, rows)}
    </section>
  `;
}

function renderInboundHealthDashboard(dashboardText) {
  const gdpFields = state.warehouse.code === "WH03";
  const stages = [["應到", "3,020 PCS"], ["實到", "2,880 PCS"], ["卸貨", "2,760 PCS"], ["驗收", "2,660 PCS"], ["QC", "2,540 PCS"], ["待上架", "1,300 PCS"], ["已上架", "1,240 PCS"]];
  const columns = ["倉別", "ASN", "收貨單", "供應商", "目前節點", "待處理PCS", "停留時間", ...(gdpFields ? ["批號", "效期", "庫內最短效期", "GDP允收"] : []), "責任單位"];
  const rows = [[state.warehouse.code, "資料不足", "資料不足", "尚未介接", "-", "-", "-", ...(gdpFields ? ["-", "-", "-", "資料不足"] : []), "-"]];
  setCurrentExport("Dashboard_入庫作業健康", columns, rows);
  return `<section class="dark-dashboard accountable-dashboard">
    ${pageHeader("入庫作業健康", dashboardText, "Dashboard")}
    ${renderDataQualityBanner({ period: "2026-07-09 原型假資料", updatedAt: "原型資料", completeness: "同母集合示意；正式來源未介接" })}
    <section class="dark-panel"><div class="panel-heading"><h3>同母集合入庫漏斗</h3><span>母集合：當期應到 ASN／收貨單</span></div><div class="process-funnel">${stages.map(([label, value], index) => `<button type="button" data-dashboard-drilldown data-warehouse="${state.warehouse.code}" data-flow="inbound" data-status="${label}" style="--stage-width:${100 - index * 8}%"><strong>${label}</strong><span>${value}</span></button>`).join("")}</div></section>
    ${gdpFields ? `<section class="gdp-rule-strip"><strong>WH03 GDP允收</strong><span>批號＋效期＋庫內最短效期比對；不符合不得上架</span></section>` : ""}
    <div class="dashboard-specific-grid"><section class="dark-panel"><h3>停留時間分布</h3><p>卸貨、驗收、QC與上架分別顯示中位數、P90及SLA目標線。</p><div class="insufficient-state">正式事件時間尚未介接</div></section><section class="dark-panel"><h3>逾時原因 Pareto</h3><p>卸貨等待、文件缺漏、QC等待、儲位不足；只採已確認原因碼。</p><div class="insufficient-state">正式原因碼尚未介接</div></section><section class="dark-panel"><h3>待上架責任清單</h3><p>顯示ASN、SKU、PCS、目前節點、最老等待時間與責任單位。</p><div class="insufficient-state">正式責任節點尚未介接</div></section></div>
    ${renderTable(columns, rows)}
  </section>`;
}

function renderInventoryHealthDashboard(dashboardText) {
  const states = [["可用", "12,480 PCS", "normal"], ["暫用", "630 PCS", "warning"], ["已揀", "1,240 PCS", "normal"], ["不可用", "210 PCS", "danger"], ["鎖庫", "980 PCS", "danger"], ["隔離", "80 PCS", "danger"], ["待報廢", "140 PCS", "warning"]];
  const columns = ["倉別", "SKU ID", "批號", "效期", "LPN", "儲位", "互斥庫存狀態", "PCS", "庫齡", "容量風險", "最後PDA事件"];
  const rows = [[state.warehouse.code, "資料不足", "-", "-", "-", "-", "資料不足", "-", "-", "-", "-"]];
  setCurrentExport("Dashboard_庫存健康與可用性", columns, rows);
  return `<section class="dark-dashboard accountable-dashboard">
    ${pageHeader("庫存健康與可用性", dashboardText, "Dashboard")}
    ${renderDataQualityBanner({ period: "2026-07-09 原型假資料", updatedAt: "原型資料", completeness: "狀態互斥示意；正式快照未介接" })}
    <section class="dark-panel"><div class="panel-heading"><h3>庫存狀態互斥總覽</h3><span>同一庫存單位只能歸屬一種狀態</span></div><div class="inventory-state-grid">${states.map(([label, value, statusType]) => `<button type="button" class="inventory-state ${statusType}" data-dashboard-drilldown data-warehouse="${state.warehouse.code}" data-flow="inventory" data-status="${label}"><span>${label}</span><strong>${value}</strong></button>`).join("")}</div></section>
    <div class="dashboard-specific-grid"><section class="dark-panel"><h3>庫齡與效期</h3><p>0–30、31–60、61–90、90天以上；WH03另依批號效期下鑽。</p><div class="insufficient-state">正式庫存快照尚未介接</div></section><section class="dark-panel"><h3>容量風險</h3><p>庫區容量母數、已用儲格與不可用儲格分開計算。</p><div class="insufficient-state">容量母數尚未介接</div></section><section class="dark-panel"><h3>帳實差異與有庫未出</h3><p>回查SKU ID、LPN、儲位與最後PDA事件，不以差異總數代替原因。</p><div class="insufficient-state">盤點與訂單明細尚未介接</div></section></div>
    ${renderTable(columns, rows)}
  </section>`;
}

function renderLaborDashboard(dashboardText) {
  const activities = [["電商揀貨", 94, "注意"], ["電商覆核", 108, "達標"], ["電商包裝", 82, "未達標"], ["入庫上架", 76, "未達標"], ["排車上貨", 101, "達標"]];
  const columns = ["日期", "倉別", "作業類型", "完成量", "標準人效", "標準工時", "實際作業工時", "加權達成率", "報工完整率", "人力使用率"];
  const rows = [["2026-07-09", state.warehouse.code, "原型假資料", "-", "-", "-", "-", "資料不足", "資料不足", "資料不足"]];
  setCurrentExport("Dashboard_人效與稼動管理", columns, rows);
  return `<section class="dark-dashboard accountable-dashboard">${pageHeader("人效與稼動管理", dashboardText, "Dashboard")}${renderDataQualityBanner({ period: "2026-07-09 原型假資料", updatedAt: "原型資料", completeness: "報工資料尚未正式介接" })}
    <div class="executive-kpi-grid">${executiveMetric("標準工時加權達成率", "86.0%", "Σ(完成量÷標準人效) ÷ Σ實際作業工時｜目標100%", "warning")}${executiveMetric("報工完整率", "96.0%", "已報作業工時 ÷ 應報工時｜目標98%", "warning")}${executiveMetric("人力使用率", "108.0%", "實際耗用人力 ÷ 當日安排人力｜編制不足", "danger")}${executiveMetric("未達標作業", "2項", "同一公式版本2026-07-15-dashboard-v2", "danger")}</div>
    <div class="labor-dashboard-grid"><section class="dark-panel"><div class="panel-heading"><h3>作業別加權達成率</h3><span>不同單位先換算標準工時</span></div><div class="labor-bars">${activities.map(([label, value, statusLabel]) => `<button type="button" data-dashboard-drilldown data-warehouse="${state.warehouse.code}" data-flow="labor" data-status="${statusLabel}"><strong>${label}</strong><span><i style="width:${Math.min(value, 120) / 1.2}%"></i></span><b>${value}%<small>${statusLabel}</small></b></button>`).join("")}</div></section>
    <section class="dark-panel"><h3>作業工時分布</h3><div class="hour-distribution"><span style="--share:32%">揀貨 32%</span><span style="--share:24%">包裝 24%</span><span style="--share:18%">入庫 18%</span><span style="--share:14%">覆核 14%</span><span style="--share:12%">其他 12%</span></div><small>報工不完整時標記資料品質，不解讀成高效率。</small></section>
    <section class="dark-panel"><h3>場內編制評估</h3><div class="staffing-list"><p><strong>包裝</strong><span>投入5人／需求8人</span><b>編制不足3人</b></p><p><strong>揀貨</strong><span>投入7人／需求7人</span><b>合理</b></p><p><strong>入庫</strong><span>投入4人／需求3人</span><b>人力偏多1人</b></p></div></section></div>${renderTable(columns, rows)}</section>`;
}

function renderExceptionDashboard(dashboardText) {
  const columns = ["異常單", "倉別", "作業", "分級", "Aging", "SLA", "已確認根因", "責任單位", "改善證據", "複核人", "結案狀態"];
  const rows = [["EX-260709-001", "WH05", "包裝", "P1", "3:25", "逾時", "包裝人力缺口3人", "包裝組", "待補", "未複核", "未結"]];
  setCurrentExport("Dashboard_異常責任與閉環", columns, rows);
  return `<section class="dark-dashboard accountable-dashboard">${pageHeader("異常責任與閉環", dashboardText, "Dashboard")}${renderDataQualityBanner({ period: "2026-07-09 原型假資料", updatedAt: "原型資料", completeness: "異常主檔示意" })}
    <div class="executive-kpi-grid">${executiveMetric("P1未結", "8件", "分級=P1且結案狀態=未結", "danger")}${executiveMetric("SLA逾時", "2件", "目前時間超過SLA截止時間", "danger")}${executiveMetric("根因確認率", "62.5%", "已確認根因案件 ÷ 應確認案件", "warning")}${executiveMetric("結案率", "55.0%", "具改善證據且已複核案件 ÷ 應結案件", "warning")}</div>
    <div class="exception-dashboard-grid"><section class="dark-panel"><h3>案件 Aging</h3><div class="aging-buckets"><span>0–2h<strong>9</strong></span><span>2–4h<strong>5</strong></span><span>4–8h<strong>2</strong></span><span>8h以上<strong>2</strong></span></div></section><section class="dark-panel"><h3>已確認根因 Pareto</h3><div class="cause-list"><p>人力缺口 <b>6</b></p><p>資料缺漏 <b>4</b></p><p>設備異常 <b>3</b></p><p>庫存不可用 <b>2</b></p></div></section><section class="dark-panel"><h3>責任、改善證據與複核</h3><p>無根因、無改善證據或無複核人時不得結案。</p><div class="insufficient-state">3件責任未定｜4件改善證據待補｜2件待複核</div></section></div>${renderTable(columns, rows)}</section>`;
}

function renderCostDashboard(dashboardText) {
  const columns = ["日期", "倉別", "費用類型", "金額", "訂單母數", "PCS母數", "每單成本", "每PCS成本", "分攤規則版本", "資料狀態"];
  const rows = [["2026-07-09", state.warehouse.code, "資料不足", "-", "-", "-", "資料不足", "資料不足", "未介接", "禁止排名"]];
  setCurrentExport("Dashboard_營運成本與單位成本", columns, rows);
  return `<section class="dark-dashboard accountable-dashboard">${pageHeader("營運成本與單位成本", dashboardText, "Dashboard")}${renderDataQualityBanner({ period: "尚未介接", updatedAt: "未更新", completeness: "缺分攤規則與作業母數" })}
    <div class="executive-kpi-grid">${executiveMetric("總營運成本", "資料不足", "人力＋OT＋委外＋配送＋包材＋異常成本", "insufficient")}${executiveMetric("每單成本", "資料不足", "總營運成本 ÷ 已完成訂單數", "insufficient")}${executiveMetric("每PCS成本", "資料不足", "總營運成本 ÷ 已出PCS", "insufficient")}${executiveMetric("異常成本", "資料不足", "需連回異常單及責任單位", "insufficient")}</div>
    <div class="cost-dashboard-grid"><section class="dark-panel"><h3>成本趨勢與目標差異</h3><div class="insufficient-state">資料不足：正式費用來源未介接，不繪製趨勢</div></section><section class="dark-panel"><h3>費用差異拆解</h3><div class="cost-categories"><span>人力</span><span>OT</span><span>委外</span><span>配送</span><span>包材</span><span>異常</span></div><div class="insufficient-state">資料不足：缺少來源金額</div></section><section class="dark-panel"><h3>分攤規則版本</h3><p>缺少分攤規則版本、訂單母數或PCS母數時禁止跨倉排名。</p><div class="insufficient-state">目前版本：未介接</div></section></div>${renderTable(columns, rows)}</section>`;
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
    <section class="module-brief">
      <div>
        <strong>${definition.title}</strong>
        <span>${definition.problem}</span>
      </div>
      <div>
        <strong>PDA相輔相成</strong>
        <span>開始、完成、異常、取消、重派、責任人與時間戳都要回寫到報表中心與Dashboard。</span>
      </div>
    </section>
    <section class="kpi-grid">
      ${definition.kpis.map(([label, value, note]) => kpi(label, value, note, mod.icon)).join("")}
    </section>
    ${renderTable(definition.columns, definition.rows)}
    <section class="field-map">
      <div class="field-chip"><strong>報表來源</strong><span>每日必看報表 / WMS單據 / PDA Log / Daily_DB</span></div>
      <div class="field-chip"><strong>下鑽邏輯</strong><span>倉別→作業大類→單據→SKU→批號/效期→儲位→人員</span></div>
      <div class="field-chip"><strong>權限提醒</strong><span>副總看趨勢，部長看倉別與人員，組長與作業員看自己的任務與異常。</span></div>
    </section>
  `;
}

function renderReportToolbar() {
  return `
    <section class="report-toolbar">
      <input value="2026-07-09" aria-label="日期" />
      <select aria-label="倉別"><option>${state.warehouse.code} ${state.warehouse.name}</option><option>全倉</option></select>
      <select aria-label="狀態"><option>全部狀態</option><option>P1異常</option><option>未完成</option><option>已完成</option></select>
      <input placeholder="單號 / SKU / 批號 / 人員" />
      <select aria-label="Daily"><option>可進Daily統計</option><option>需補資料</option><option>僅明細追蹤</option></select>
      <button class="action-button primary" type="button"><i data-lucide="search"></i>查詢</button>
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
        <div class="ranking-row ${row.code === state.warehouse.code ? "is-current-warehouse" : ""}">
          <span>${index + 1}</span>
          <strong>${row.code} ${row.name}${row.code === state.warehouse.code ? '<small class="current-warehouse-label">目前查看</small>' : ""}</strong>
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
  const csv = [
    columns.map(escapeCsv).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsv(stripHtml(String(cell)))).join(","))
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}_${state.warehouse.code}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
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

  const warehouseButton = event.target.closest("#warehouseButton");
  if (warehouseButton) {
    document.querySelector("#warehouseMenu").classList.toggle("is-hidden");
    return;
  }

  const dashboardDrilldown = event.target.closest("[data-dashboard-drilldown]");
  if (dashboardDrilldown) {
    const targetWarehouse = warehouses.find((item) => item.code === dashboardDrilldown.dataset.warehouse);
    if (targetWarehouse) state.warehouse = targetWarehouse;
    if (dashboardDrilldown.dataset.flow === "outbound") {
      state.activeModule = "outbound";
      state.activeChild = "出貨履約總覽";
    } else {
      state.activeModule = "home";
      state.activeChild = "今日工作台";
    }
    state.showColumnPanel = false;
    render();
    return;
  }

  const warehouseOption = event.target.closest("[data-warehouse]");
  if (warehouseOption) {
    state.warehouse = warehouses.find((item) => item.code === warehouseOption.dataset.warehouse);
    document.querySelector("#warehouseMenu").classList.add("is-hidden");
    if ((state.activeModule === "gdp" && !isGdpWarehouse()) || (state.activeModule === "returns" && state.warehouse.code !== "WH06")) {
      state.activeModule = "home";
      state.activeChild = moduleById("home").defaultChild;
    }
    state.showColumnPanel = false;
    render();
    return;
  }

  const moduleButton = event.target.closest("[data-module]");
  if (moduleButton) {
    const mod = moduleById(moduleButton.dataset.module);
    state.activeModule = mod.id;
    state.activeChild = mod.defaultChild;
    state.showColumnPanel = false;
    render();
    return;
  }

  const childButton = event.target.closest("[data-child]");
  if (childButton) {
    state.activeChild = childButton.dataset.child;
    state.showColumnPanel = false;
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

  const p1CategoryButton = event.target.closest("[data-p1-category]");
  if (p1CategoryButton) {
    state.expandedP1Category = state.expandedP1Category === p1CategoryButton.dataset.p1Category ? null : p1CategoryButton.dataset.p1Category;
    renderPage();
    refreshIcons();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "export-report") {
    downloadCurrentReport();
    return;
  }
  if (action?.dataset.action === "column-settings") {
    toggleColumnPanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !document.querySelector("#loginScreen").classList.contains("is-hidden")) {
    enterApp();
  }
});

refreshIcons();
