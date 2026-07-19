const WAREHOUSE_CAPABILITIES = Object.freeze({
  WH01: Object.freeze({ aging90Day: true, gdp: false, exsd: false, returns: false, dataStatus: "原型資料" }),
  WH02: Object.freeze({ aging90Day: false, gdp: false, exsd: false, returns: false, dataStatus: "待確認" }),
  WH03: Object.freeze({ aging90Day: false, gdp: true, exsd: false, returns: false, dataStatus: "原型資料" }),
  WH04: Object.freeze({ aging90Day: true, gdp: false, exsd: false, returns: false, dataStatus: "原型資料" }),
  WH05: Object.freeze({ aging90Day: false, gdp: false, exsd: true, returns: false, dataStatus: "原型資料" }),
  WH06: Object.freeze({ aging90Day: true, gdp: false, exsd: false, returns: true, dataStatus: "原型資料" }),
  WH07: Object.freeze({ aging90Day: false, gdp: false, exsd: false, returns: false, dataStatus: "待確認" }),
  WH08: Object.freeze({ aging90Day: false, gdp: false, exsd: false, returns: false, dataStatus: "待確認" })
});

const RETURN_CHILDREN = new Set(["退貨收貨總表", "退貨判定", "退貨處置"]);
const AGING_CHILDREN = new Set(["庫齡／90天未異動", "90天未異動資料"]);

export function getWarehouseCapabilities(warehouseCode) {
  const capabilities = WAREHOUSE_CAPABILITIES[warehouseCode];
  return capabilities ? { ...capabilities } : null;
}

export function getWarehouseDataStatus(warehouseCode) {
  return WAREHOUSE_CAPABILITIES[warehouseCode]?.dataStatus || "資料不足";
}

export function isChildApplicable(warehouseCode, moduleId, childName) {
  const capabilities = WAREHOUSE_CAPABILITIES[warehouseCode];
  if (!capabilities) return false;
  if (moduleId === "gdp") return capabilities.gdp;
  if (childName === "EXSD Miss") return capabilities.exsd;
  if (RETURN_CHILDREN.has(childName)) return capabilities.returns;
  if (AGING_CHILDREN.has(childName)) return capabilities.aging90Day;
  return true;
}

const HOME_ROWS = Object.freeze({
  WH01: Object.freeze(["作業進行中", "90天未異動需追蹤", 1, "2026-07-16 11:25"]),
  WH03: Object.freeze(["GDP驗收待確認", "進貨效期早於庫內最短效期", 1, "2026-07-16 09:42"]),
  WH04: Object.freeze(["庫存清查中", "90天未異動80PCS", 1, "2026-07-16 11:10"]),
  WH05: Object.freeze(["電商出貨作業中", "待包裝28PCS", 1, "2026-07-16 12:25"]),
  WH06: Object.freeze(["退貨判定作業中", "不可退廠清冊24筆未結", 1, "2026-07-16 11:08"])
});

export function getWarehouseHomeProfile(warehouseCode, businessDate) {
  const dataStatus = getWarehouseDataStatus(warehouseCode);
  const columns = ["營運日期", "倉別", "今日狀態", "主要異常", "未結件數", "更新時間"];
  const row = HOME_ROWS[warehouseCode];
  return {
    title: "今日工作台",
    dataStatus,
    columns,
    rows: dataStatus === "待確認" || !row ? [] : [[businessDate, warehouseCode, ...row]],
    kpis: row && dataStatus !== "待確認"
      ? [["今日狀態", row[0], dataStatus], ["未結件數", String(row[2]), "依本倉有效事件"], ["更新時間", row[3], "本倉最後資料時間"]]
      : [["資料狀態", dataStatus, "待主管或會議確認後介接"], ["未結件數", "資料不足", "不得用其他倉資料補位"]]
  };
}

function isoDayNumber(value) {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? Math.floor(timestamp / 86400000) : null;
}

function dayDifference(laterDate, earlierDate) {
  const later = isoDayNumber(laterDate);
  const earlier = isoDayNumber(earlierDate);
  return later === null || earlier === null ? "資料不足" : later - earlier;
}

export function getWh04InventoryProfile(childName, businessDate) {
  if (childName === "90天未異動資料" || childName === "庫齡／90天未異動") {
    const columns = ["營運日期", "倉別", "SKU", "批號", "效期", "LPN", "儲位", "PCS", "最後有效異動日", "未異動天數", "最後有效事件", "責任單位"];
    const rows = [[businessDate, "WH04", "RX-MAT-01", "B251201", "2027-12-01", "LPN-WH04-011", "M02-03-01", 80, "2026-03-20", dayDifference(businessDate, "2026-03-20"), "盤點調整", "庫存組"]];
    return {
      title: "90天未異動資料",
      dataStatus: "原型資料",
      columns,
      rows,
      kpis: [["90天未異動PCS", "80", "最後有效異動日至營運日達90天以上"], ["待處理SKU", "1", "只計WH04適用庫存"]]
    };
  }
  if (childName === "效期清查") {
    const columns = ["營運日期", "倉別", "SKU", "批號", "效期", "剩餘效期天數", "LPN", "儲位", "PCS", "效期規則", "下架狀態", "鎖庫狀態", "責任單位"];
    return {
      title: "效期清查",
      dataStatus: "原型資料",
      columns,
      rows: [[businessDate, "WH04", "RX-MAT-02", "B250901", "2026-09-15", dayDifference("2026-09-15", businessDate), "LPN-WH04-012", "M02-03-02", 40, "資料不足", "待確認", "未鎖庫", "庫存組"]],
      kpis: [["待清查SKU", "1", "效期資料存在但警示門檻待確認"], ["規則狀態", "資料不足", "不得自行補造效期警示門檻"]]
    };
  }
  return null;
}
