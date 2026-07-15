(function initializeDashuWmsData(global) {
  "use strict";

  function safeRate(numerator, denominator) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
    return Number(((numerator / denominator) * 100).toFixed(1));
  }

  function pad(value, width) {
    return String(value).padStart(width, "0");
  }

  function createLocationCode({ warehouseCode, zoneCode, aisleCode, rackNo, levelNo, binNo }) {
    return `${warehouseCode}-${zoneCode}-${aisleCode}-${pad(rackNo, 3)}-${pad(levelNo, 2)}-${pad(binNo, 2)}`;
  }

  function classifyReturnCondition({ remainingMonths, appearance, ruleVersion }) {
    if (remainingMonths <= 2) return { grade: "待報廢", ruleVersion };
    if (remainingMonths <= 13 || appearance !== "外觀良好") return { grade: "不良品", ruleVersion };
    return { grade: "良品", ruleVersion };
  }

  function reconcileDisposition({ receivedQuantity, returnedToVendor, transferred, bulkSold, scrapped, openQuantity }) {
    const accounted = returnedToVendor + transferred + bulkSold + scrapped + openQuantity;
    const difference = receivedQuantity - accounted;
    return { balanced: difference === 0, difference };
  }

  function previewLocationBatch({ warehouseCode, zoneCode, aisleCode, rackFrom, rackTo, levels, bins }) {
    const result = [];
    for (let rackNo = rackFrom; rackNo <= rackTo; rackNo += 1) {
      for (let levelNo = 1; levelNo <= levels; levelNo += 1) {
        for (let binNo = 1; binNo <= bins; binNo += 1) {
          result.push({
            code: createLocationCode({ warehouseCode, zoneCode, aisleCode, rackNo, levelNo, binNo }),
            barcodeType: "CODE128",
            pdaVerified: false,
            enabled: false,
            physical: true
          });
        }
      }
    }
    return result;
  }

  function buildInventoryTrace(query, warehouseCode = "WH05") {
    const queryType = /^LPN/i.test(query) ? "LPN" : /^SKU/i.test(query) ? "SKU ID" : "商品編號";
    return {
      query,
      queryType,
      currentLocation: `${warehouseCode}-PICK-A-012-01-03`,
      currentCustodian: "揀貨A組",
      events: [
        { at: "2026-07-09 06:02", event: "到倉掃描", from: "供應商", to: `${warehouseCode}-DOCK-01`, handedBy: "林司機", receivedBy: "收貨員A", device: "PDA-RECV-01", quantity: 120 },
        { at: "2026-07-09 06:38", event: "驗收完成", from: `${warehouseCode}-DOCK-01`, to: `${warehouseCode}-TEMP-01`, handedBy: "收貨員A", receivedBy: "驗收員B", device: "PDA-QC-03", quantity: 120 },
        { at: "2026-07-09 07:15", event: "上架完成", from: `${warehouseCode}-TEMP-01`, to: `${warehouseCode}-Z01-A-023-03-02`, handedBy: "驗收員B", receivedBy: "上架員C", device: "PDA-PUT-05", quantity: 120 },
        { at: "2026-07-09 09:42", event: "補貨移交", from: `${warehouseCode}-Z01-A-023-03-02`, to: `${warehouseCode}-PICK-A-012-01-03`, handedBy: "上架員C", receivedBy: "揀貨A組", device: "PDA-MOVE-08", quantity: 120 }
      ]
    };
  }

  function validateInventoryAdjustment({ before, after, reasonCode, approvedBy }) {
    const validNumbers = Number.isFinite(before) && Number.isFinite(after) && before >= 0 && after >= 0;
    const valid = validNumbers && Boolean(reasonCode) && Boolean(approvedBy) && before !== after;
    return { valid, difference: validNumbers ? after - before : null, requiresApproval: true };
  }

  function outboundStageSummary(stages) {
    return { ...stages, open: Math.max(0, stages.allocated - stages.shipped) };
  }

  function exceptionAging({ openedAt, now, slaHours }) {
    const ageHours = (new Date(now) - new Date(openedAt)) / 3600000;
    return { ageHours: Number(ageHours.toFixed(1)), overdue: ageHours > slaHours };
  }

  function laborMetrics({ directMinutes, paidMinutes, standardPcsPerHour, completedPcs }) {
    const utilizationRate = safeRate(directMinutes, paidMinutes);
    const directEfficiency = directMinutes > 0 ? Number((completedPcs / (standardPcsPerHour * directMinutes / 60) * 100).toFixed(1)) : null;
    return { utilizationRate, directEfficiency, lossMinutes: Math.max(0, paidMinutes - directMinutes) };
  }

  function gdpExpiryRisk({ inboundExpiry, warehouseMinimumExpiry, fefoEligible }) {
    if (!fefoEligible) return { risk: "FEFO不符" };
    return { risk: new Date(inboundExpiry) < new Date(warehouseMinimumExpiry) ? "進貨效期低於庫內" : "可允收" };
  }

  function validateAnnouncementScan({ announced, storeCode, skuId, quantity }) {
    const baseValid = Boolean(storeCode && skuId && Number.isFinite(quantity) && quantity > 0);
    if (!baseValid) return { accepted: false, route: "資料補正" };
    return announced ? { accepted: true, route: "逐筆驗收" } : { accepted: false, route: "異常隔離" };
  }

  function createTemporaryReturnLpn({ warehouseCode, storeCode, sequence }) {
    return `${warehouseCode}-RT-${storeCode}-${pad(sequence, 6)}`;
  }

  function buildReturnTimeline(lpn) {
    return {
      lpn,
      events: [
        { at: "08:10", event: "門市退貨到倉", actor: "收貨員A" },
        { at: "08:14", event: "公告清單比對", actor: "PDA-RT-01" },
        { at: "08:20", event: "商品與效期逐筆驗收", actor: "驗收員B" },
        { at: "08:28", event: "暫收LPN與隔離儲位", actor: "PDA-RT-01" },
        { at: "08:35", event: "待處置", actor: "退貨判定組" }
      ]
    };
  }

  function dashboardQualityGate({ requiredFields, record, denominator, updated }) {
    if (!updated) return { canRender: false, reason: "未更新" };
    if (denominator === 0) return { canRender: false, reason: "分母為零" };
    const missing = requiredFields.filter((field) => record[field] === undefined || record[field] === null || record[field] === "");
    if (missing.length) return { canRender: false, reason: `缺少欄位：${missing.join("、")}` };
    return { canRender: true, reason: "資料完整" };
  }

  function dashboardMetric(metricId, input) {
    if (metricId === "outboundCompletionRate") {
      const value = safeRate(input.shippedPcs, input.duePcs);
      return {
        value,
        numerator: input.shippedPcs,
        denominator: input.duePcs,
        unit: "%",
        target: 98,
        status: value === null ? "insufficient" : value >= 98 ? "normal" : "warning"
      };
    }
    if (metricId === "inventoryRiskPcs") {
      return {
        value: input.lockedPcs + input.quarantinedPcs,
        numerator: null,
        denominator: null,
        unit: "PCS",
        target: 0,
        status: input.lockedPcs + input.quarantinedPcs > 0 ? "warning" : "normal"
      };
    }
    return { value: null, numerator: null, denominator: null, unit: "", target: null, status: "insufficient" };
  }

  const DASHBOARD_FORMULA_VERSION = "2026-07-15-dashboard-v2";
  const dashboardMetricDefinitions = {
    weightedLaborAchievement: {
      target: 100,
      drilldownKeys: ["日期", "倉別", "作業類型", "人員", "事件時間"],
      calculate(records) {
        const earnedStandardHours = records.reduce((total, row) => {
          if (!Number.isFinite(row.completedQty) || !Number.isFinite(row.standardPerHour) || row.standardPerHour <= 0) return total;
          return total + row.completedQty / row.standardPerHour;
        }, 0);
        const actualHours = records.reduce((total, row) => total + (Number.isFinite(row.actualHours) ? row.actualHours : 0), 0);
        return { numerator: earnedStandardHours, denominator: actualHours, value: safeRate(earnedStandardHours, actualHours) };
      }
    },
    reportingCompleteness: {
      target: 98,
      drilldownKeys: ["日期", "倉別", "人員", "事件時間"],
      calculate(records) {
        const reportedHours = records.reduce((total, row) => total + (Number.isFinite(row.reportedHours) ? row.reportedHours : 0), 0);
        const requiredHours = records.reduce((total, row) => total + (Number.isFinite(row.requiredHours) ? row.requiredHours : 0), 0);
        return { numerator: reportedHours, denominator: requiredHours, value: safeRate(reportedHours, requiredHours) };
      }
    }
  };

  function metricStatus(value, target) {
    if (value === null) return "insufficient";
    if (value >= target) return "normal";
    return value >= target * 0.8 ? "warning" : "danger";
  }

  function calculateDashboardMetric(metricId, records, context = {}) {
    const definition = dashboardMetricDefinitions[metricId];
    if (!definition) return null;
    const base = {
      metricId,
      value: null,
      numerator: null,
      denominator: null,
      unit: "%",
      target: definition.target,
      status: "insufficient",
      formulaVersion: context.formulaVersion || DASHBOARD_FORMULA_VERSION,
      updatedAt: context.updatedAt || null,
      drilldownKeys: definition.drilldownKeys
    };
    if (!Array.isArray(records) || records.length === 0) return base;
    const result = definition.calculate(records);
    return { ...base, ...result, status: metricStatus(result.value, definition.target) };
  }

  function dashboardDataGate(records, { requiredFields = [], formulaVersion } = {}) {
    if (!Array.isArray(records) || records.length === 0) {
      return { canRender: false, canRank: false, reason: "資料不足" };
    }
    const missingRequired = records.some((row) => requiredFields.some((field) => row[field] === undefined || row[field] === null || row[field] === ""));
    if (missingRequired) return { canRender: false, canRank: false, reason: "必填欄位缺漏" };
    if (formulaVersion && records.some((row) => row.formulaVersion !== formulaVersion)) {
      return { canRender: false, canRank: false, reason: "公式版本不同" };
    }
    return { canRender: true, canRank: true, reason: "資料完整" };
  }

  function permissionAllows({ role, warehouseCode, assignedWarehouse, action }) {
    const roleSpec = roleMatrix.find((item) => item.role === role);
    if (!roleSpec || !roleSpec.actions.includes(action)) return false;
    return roleSpec.scope === "全倉" || warehouseCode === assignedWarehouse;
  }

  const dashboardSpecs = {
    "全倉營運達標總覽": {
      managementQuestion: "哪個倉未達標、卡在哪個節點、應由誰處理？",
      metricIds: ["weightedLaborAchievement", "reportingCompleteness", "laborUtilization", "promiseWindowShipmentRate", "dataCompleteness"],
      visuals: ["warehouse-achievement-list", "selected-warehouse-fulfillment", "shipping-labor-warning"],
      drilldownKeys: ["日期", "倉別", "流程", "狀態", "公式版本"]
    },
    "入庫作業健康": {
      managementQuestion: "應到至上架卡在哪個節點？",
      metricIds: ["receivingCompletionRate", "putawayCompletionRate", "inboundAging"],
      visuals: ["same-cohort-inbound-funnel", "aging-distribution", "delay-pareto"],
      drilldownKeys: ["日期", "倉別", "供應商", "ASN", "收貨單", "SKU ID", "責任節點"]
    },
    "出貨履約監控": {
      managementQuestion: "哪些訂單即將逾時，貨卡在哪個節點，人力是否足夠？",
      metricIds: ["promiseWindowShipmentRate", "outboundBacklog", "oldestWaitingMinutes", "laborGap"],
      visuals: ["fulfillment-flow", "deadline-warning", "labor-gap"],
      drilldownKeys: ["日期", "倉別", "訂單", "SKU ID", "LPN", "PDA事件時間", "責任組"]
    },
    "庫存健康與可用性": {
      managementQuestion: "庫存是否可用，風險來自庫齡、效期、容量或帳實差異？",
      metricIds: ["availableRate", "inventoryRiskPcs", "capacityUtilization", "stockVariance"],
      visuals: ["exclusive-inventory-state", "inventory-aging", "capacity-risk"],
      drilldownKeys: ["日期", "倉別", "SKU ID", "批號", "效期", "LPN", "儲位"]
    },
    "人效與稼動管理": {
      managementQuestion: "各倉與各作業是否達到標準，人力編制是否合理？",
      metricIds: ["weightedLaborAchievement", "reportingCompleteness", "laborUtilization"],
      visuals: ["labor-achievement", "work-hour-distribution", "staffing-assessment"],
      drilldownKeys: ["日期", "倉別", "作業類型", "組別", "人員", "事件時間"]
    },
    "異常責任與閉環": {
      managementQuestion: "異常是否逾時，根因、責任、改善證據與複核是否完整？",
      metricIds: ["openP1", "slaOverdue", "rootCauseConfirmedRate", "closureRate"],
      visuals: ["exception-aging", "cause-pareto", "owner-evidence"],
      drilldownKeys: ["日期", "倉別", "異常單", "來源單據", "SKU ID", "LPN", "責任單位"]
    },
    "營運成本與單位成本": {
      managementQuestion: "成本是否超標，差異來自人力、委外、配送、包材或異常？",
      metricIds: ["totalOperatingCost", "costPerOrder", "costPerPcs", "overtimeCost", "exceptionCost"],
      visuals: ["cost-trend", "cost-variance", "cost-breakdown"],
      drilldownKeys: ["日期", "倉別", "作業類型", "費用類型", "來源單據", "分攤規則版本"]
    }
  };

  function getDashboardSpec(name) {
    return dashboardSpecs[name] || null;
  }

  function getDashboardWarehouseApplicability(name, warehouseCode) {
    return {
      applicable: Boolean(dashboardSpecs[name]),
      gdp: warehouseCode === "WH03",
      returns: warehouseCode === "WH06"
    };
  }

  const pageNames = {
    inbound: ["到貨通知大表", "進貨大報表", "驗收作業", "驗收差異", "理貨上架", "未上架QC", "短效效期比對"],
    transfer: ["任務交接", "保管責任交接", "跨倉調撥", "在途逾時與差異"],
    location: ["儲位查詢", "儲位主檔批次建置", "儲位標籤列印", "PDA驗證與啟用", "庫區與容量", "溫層區管理"],
    inventoryMove: ["庫存異動大表", "鎖庫 / 解鎖", "補貨任務", "庫存移交路徑", "盤點調整", "轉倉在途"],
    inventory: ["庫存查詢", "庫存快照", "庫齡 / 90天未異動", "庫存狀態", "盤點稽核", "SN流水"],
    outbound: ["訂單接收", "訂單配庫", "出貨履約總覽", "出貨覆核", "出貨明細", "配送交接", "EXSD Miss"],
    outboundWork: ["波次 / 派工", "補貨", "揀貨", "覆核", "裝箱", "分貨 / 集貨", "裝車點交", "出貨確認", "PDA作業Log"],
    gdp: ["效期風險大表", "進貨效期低於庫內", "短效 / 近效", "批號效期追溯", "未上架QC明細", "採購允收規則"],
    exception: ["異常閉環", "外部 / 人工通報", "重複異常分析", "原因碼主檔", "責任單位矩陣"],
    labor: ["報工稼動", "作業效率", "班別組別量能", "人貨二次比對", "技能授權矩陣"],
    reports: ["Daily報表中心", "Daily_DB", "月季彙總", "欄位字典", "匯出中心", "廠商格式對照"],
    settings: ["角色權限", "倉別權限", "欄位權限", "操作紀錄", "主檔參數"],
    returns: ["公告退貨工作台", "PDA收貨", "待判定 / 隔離", "處置任務", "退廠 / 調撥", "報廢銷毀", "退貨追溯"]
  };
  const modulePageSpecs = Object.fromEntries(Object.entries(pageNames).map(([moduleId, names]) => [
    moduleId,
    Object.fromEntries(names.map((name) => [name, { title: name, independentDataModel: true, pdaTimestampRequired: true }]))
  ]));

  const warehouseCapabilities = {
    WH01: { hiddenModules: ["gdp", "returns"] },
    WH02: { hiddenModules: ["gdp", "returns"] },
    WH03: { hiddenModules: ["returns"] },
    WH04: { hiddenModules: ["gdp", "returns"] },
    WH05: { hiddenModules: ["gdp", "returns"] },
    WH06: { hiddenModules: ["gdp"] },
    WH07: { hiddenModules: ["gdp", "returns"], hiddenChildren: { location: ["溫層區管理"] } },
    WH08: { hiddenModules: ["gdp", "returns"] }
  };

  const specificColumns = {
    "transfer:任務交接": ["倉別", "交接班次", "任務編號", "未完成工作", "交出人", "接收人", "交接時間", "確認狀態"],
    "transfer:保管責任交接": ["倉別", "交接單", "LPN", "SKU ID", "來源儲位", "目的儲位", "交出PCS", "接收PCS", "差異PCS", "交出人", "接收人", "PDA事件", "狀態"],
    "transfer:跨倉調撥": ["調撥單", "來源倉", "目的倉", "LPN", "SKU ID", "調出PCS", "在途PCS", "調入PCS", "出入差異", "目前節點", "責任單位"],
    "transfer:在途逾時與差異": ["調撥單", "來源倉", "目的倉", "LPN", "應到時間", "在途時數", "出入差異PCS", "異常原因碼", "責任單位", "SLA狀態"],
    "location:儲位查詢": ["倉別", "庫區", "儲位代號", "儲位狀態", "容量PCS", "已用PCS", "可用PCS", "滿載率", "PDA驗證", "啟用狀態"],
    "location:儲位主檔批次建置": ["建置批次", "倉別", "庫區", "列", "架", "層", "格", "預覽代號", "重複檢查", "核准狀態"],
    "location:儲位標籤列印": ["列印批次", "倉別", "儲位代號", "Barcode格式", "標籤版次", "列印份數", "列印人", "列印時間", "列印狀態", "補印原因"],
    "location:PDA驗證與啟用": ["倉別", "儲位代號", "PDA設備", "驗證人", "驗證時間", "掃描結果", "失敗原因", "核准人", "啟用狀態"],
    "location:庫區與容量": ["倉別", "庫區", "用途", "溫層", "總容量PCS", "已用PCS", "可用PCS", "滿載率", "狀態"],
    "location:溫層區管理": ["倉別", "庫區", "溫層規則", "允許商品類型", "目前溫度", "上下限", "最後回報", "異常狀態"]
  };

  Object.assign(specificColumns, {
    "inbound:到貨通知大表": ["倉別", "ASN / 採購單", "供應商", "預計到倉", "實際到倉", "車號", "月台", "應到PCS", "到貨狀態", "責任單位"],
    "inbound:進貨大報表": ["倉別", "ASN / 採購單", "收貨單", "供應商", "SKU ID", "應到PCS", "實到PCS", "卸貨PCS", "驗收PCS", "QC PCS", "已上架PCS", "目前節點"],
    "inbound:驗收作業": ["倉別", "驗收單", "LPN", "SKU ID", "應驗PCS", "已驗PCS", "批號", "效期", "驗收人", "開始時間", "完成時間", "驗收狀態"],
    "inbound:驗收差異": ["倉別", "驗收差異單", "收貨單", "SKU ID", "應驗PCS", "實驗PCS", "差異PCS", "異常現象", "原因碼", "責任單位", "結案狀態"],
    "inbound:理貨上架": ["倉別", "上架任務", "LPN", "SKU ID", "來源暫存位", "建議儲位", "實際儲位", "應上PCS", "已上PCS", "上架人", "PDA事件", "狀態"],
    "inbound:未上架QC": ["倉別", "收貨單", "LPN", "SKU ID", "批號", "效期", "待QC PCS", "待上架PCS", "停留時間", "QC原因", "責任單位", "SLA狀態"],
    "inbound:短效效期比對": ["倉別", "收貨單", "SKU ID", "批號", "進貨效期", "庫內最短效期", "剩餘月數", "規則版本", "判定", "核准人", "處理狀態"],
    "inventoryMove:庫存異動大表": ["倉別", "異動單", "異動類型", "SKU ID", "LPN", "來源儲位", "目的儲位", "異動前PCS", "異動PCS", "異動後PCS", "原因碼", "操作人", "時間"],
    "inventoryMove:鎖庫 / 解鎖": ["倉別", "鎖庫單", "SKU ID", "LPN", "儲位", "鎖定PCS", "鎖定原因", "建立人", "核准人", "解鎖條件", "狀態"],
    "inventoryMove:補貨任務": ["倉別", "補貨任務", "SKU ID", "來源儲位", "目的揀貨位", "需求PCS", "補貨PCS", "作業人", "PDA事件", "逾時", "狀態"],
    "inventoryMove:庫存移交路徑": ["事件時間", "事件", "SKU ID", "LPN", "來源倉儲位", "目的倉儲位", "交出人", "接收人", "PDA設備", "數量", "狀態"],
    "inventoryMove:盤點調整": ["倉別", "盤點單", "SKU ID", "LPN", "儲位", "帳面PCS", "實盤PCS", "差異PCS", "原因碼", "建立人", "核准人", "調整狀態"],
    "inventoryMove:轉倉在途": ["轉倉單", "來源倉", "目的倉", "LPN", "SKU ID", "調出PCS", "在途PCS", "已收PCS", "預計到達", "在途時數", "責任單位", "狀態"],
    "inventory:庫存查詢": ["倉別", "SKU ID", "品名", "批號", "效期", "LPN", "儲位", "庫存狀態", "PCS", "最後異動時間"],
    "inventory:庫存大報表": ["倉別", "SKU ID", "品名", "批號", "效期", "LPN", "儲位", "可用PCS", "暫用PCS", "已揀PCS", "不可用PCS", "鎖庫PCS", "隔離PCS", "待報廢PCS"],
    "inventory:每日庫存快照": ["快照日期", "倉別", "SKU ID", "批號", "效期", "庫存狀態", "PCS", "儲位數", "LPN數", "來源批次", "資料狀態"],
    "inventory:庫齡 / 90天未異動": ["倉別", "SKU ID", "批號", "效期", "LPN", "儲位", "PCS", "最後異動日", "庫齡天數", "90天狀態", "責任單位"],
    "inventory:庫存狀態": ["倉別", "SKU ID", "LPN", "儲位", "可用", "暫用", "已揀", "不可用", "鎖庫", "待判定", "隔離", "待報廢", "狀態合計"],
    "inventory:盤點稽核": ["倉別", "盤點單", "盤點範圍", "SKU ID", "LPN", "儲位", "帳面PCS", "實盤PCS", "差異PCS", "複盤人", "核准人", "稽核狀態"],
    "inventory:SN流水": ["倉別", "SKU ID", "SN", "LPN", "入庫單", "目前儲位", "出庫單", "最後事件", "事件時間", "狀態"],
    "outbound:訂單接收": ["倉別", "來源系統", "訂單", "通路", "客戶 / 門市", "SKU ID", "訂購PCS", "EXSD", "取消狀態", "主檔完整性", "接收狀態"],
    "outbound:訂單配庫": ["倉別", "訂單", "SKU ID", "需求PCS", "可用PCS", "配庫PCS", "缺口PCS", "批號", "效期", "來源儲位", "配庫規則", "狀態"],
    "outbound:出貨履約總覽": ["倉別", "訂單", "通路", "EXSD", "SKU ID", "應出PCS", "配庫PCS", "已揀PCS", "已覆核PCS", "已包PCS", "已出PCS", "庫存判定", "目前節點", "原因碼"],
    "outbound:出貨覆核": ["倉別", "覆核任務", "訂單", "箱號 / LPN", "SKU ID", "應覆核PCS", "實覆核PCS", "差異PCS", "覆核人", "PDA事件", "異常碼", "狀態"],
    "outbound:出貨明細": ["倉別", "出貨單", "訂單", "箱號 / LPN", "SKU ID", "批號", "效期", "出貨PCS", "車次", "作業人", "出貨時間"],
    "outbound:配送交接": ["倉別", "車次", "箱號 / LPN", "訂單", "門市 / 客戶", "點交PCS", "交出人", "接收人", "裝車時間", "簽收狀態", "差異PCS"],
    "outbound:EXSD Miss": ["倉別", "訂單", "通路", "EXSD", "目前時間", "SKU ID", "未出PCS", "庫存判定", "卡點", "Miss原因", "責任單位", "SLA"],
    "outboundWork:波次 / 派工": ["倉別", "波次", "任務", "通路", "訂單數", "SKU數", "PCS", "負責組", "指派人", "釋放時間", "狀態"],
    "outboundWork:補貨": ["倉別", "補貨任務", "SKU ID", "來源儲位", "目的揀貨位", "需求PCS", "完成PCS", "作業人", "開始", "完成", "異常碼"],
    "outboundWork:揀貨": ["倉別", "揀貨任務", "波次", "訂單", "儲位", "SKU ID", "批號", "效期", "應揀PCS", "已揀PCS", "人員", "PDA事件", "異常碼"],
    "outboundWork:覆核": ["倉別", "覆核任務", "箱號 / LPN", "SKU ID", "應覆PCS", "實覆PCS", "差異PCS", "覆核人", "開始", "完成", "狀態"],
    "outboundWork:裝箱": ["倉別", "裝箱任務", "訂單", "箱號", "SKU ID", "應裝PCS", "已裝PCS", "包材", "作業人", "PDA事件", "異常碼"],
    "outboundWork:分貨 / 集貨": ["倉別", "集貨任務", "路線", "車次", "箱號 / LPN", "門市 / 客戶", "PCS", "集貨位", "作業人", "狀態"],
    "outboundWork:裝車點交": ["倉別", "車次", "箱號 / LPN", "箱數", "PCS", "交出人", "接收人", "司機", "裝車時間", "點交差異", "狀態"],
    "outboundWork:出貨確認": ["倉別", "出貨單", "車次", "訂單", "箱號 / LPN", "PCS", "確認人", "確認時間", "扣帳狀態", "出倉狀態"],
    "outboundWork:PDA作業Log": ["倉別", "事件時間", "PDA設備", "人員", "作業類型", "任務", "單據", "SKU ID", "LPN", "事件", "結果", "異常碼"],
    "gdp:效期風險大表": ["倉別", "SKU ID", "品名", "批號", "效期", "剩餘月數", "庫內最短效期", "FEFO狀態", "風險等級", "責任單位"],
    "gdp:進貨效期低於庫內": ["收貨單", "供應商", "SKU ID", "進貨批號", "進貨效期", "庫內最短效期", "差異天數", "規則版本", "允收狀態", "核准人"],
    "gdp:短效 / 近效": ["SKU ID", "批號", "效期", "剩餘月數", "PCS", "儲位", "FEFO順位", "風險等級", "處理期限", "責任單位"],
    "gdp:批號效期追溯": ["SKU ID", "批號", "效期", "LPN", "入庫單", "供應商", "目前儲位", "出庫單", "門市 / 客戶", "事件時間"],
    "gdp:未上架QC明細": ["收貨單", "LPN", "SKU ID", "批號", "效期", "待QC PCS", "QC原因", "停留時間", "責任單位", "SLA狀態"],
    "gdp:採購允收規則": ["規則版本", "供應商", "SKU / 品類", "最低剩餘效期", "庫內比較規則", "例外條件", "生效日", "核准人", "狀態"],
    "exception:異常閉環": ["倉別", "異常單", "來源模組", "分級", "異常現象", "初步原因", "已確認根因", "責任單位", "SLA", "改善證據", "複核人", "結案狀態"],
    "exception:外部 / 人工通報": ["倉別", "通報來源", "通報時間", "通報人", "異常現象", "關聯單據", "SKU ID", "建立異常單", "受理人", "狀態"],
    "exception:重複異常分析": ["倉別", "根因代碼", "已確認根因", "發生次數", "影響PCS", "影響單數", "責任單位", "改善措施", "複發狀態"],
    "exception:原因碼主檔": ["原因碼", "異常現象", "適用模組", "初步原因分類", "是否需根因", "預設責任單位", "SLA", "版本", "狀態"],
    "exception:責任單位矩陣": ["來源模組", "異常類型", "主責單位", "協辦單位", "分級規則", "SLA", "升級對象", "核准人", "版本"],
    "labor:報工稼動": ["倉別", "人員", "班別", "任務", "作業類型", "開始", "暫停", "續作", "完成", "直接分鐘", "損失分鐘", "報工狀態"],
    "labor:作業效率": ["倉別", "人員 / 組別", "作業類型", "完成PCS", "標準PCS", "直接分鐘", "付薪分鐘", "直接效率", "稼動率", "損失原因"],
    "labor:班別組別量能": ["倉別", "日期", "班別", "組別", "出勤人數", "可用人時", "需求人時", "缺口人時", "預估量", "實際量", "調度建議"],
    "labor:人貨二次比對": ["倉別", "人員", "任務", "PDA報工PCS", "任務完成PCS", "庫存異動PCS", "差異PCS", "差異原因", "複核人", "稽核狀態"],
    "labor:技能授權矩陣": ["人員", "倉別", "作業技能", "授權等級", "訓練日期", "到期日", "授權人", "設備權限", "狀態"],
    "reports:Daily報表中心": ["報表代碼", "報表名稱", "適用倉別", "資料期間", "最後更新", "完整率", "資料狀態", "查詢入口", "匯出格式"],
    "reports:Daily_DB": ["資料ID", "日期", "倉別", "作業類型", "指標", "數值", "單位", "來源工作表", "欄位版本", "歸檔時間", "唯讀狀態"],
    "reports:月季彙總": ["期間", "倉別", "指標", "加總值", "平均值", "目標", "差異", "公式版本", "資料完整率", "狀態"],
    "reports:欄位字典": ["欄位代碼", "欄位名稱", "定義", "公式", "來源", "粒度", "單位", "納入 / 排除", "下鑽鍵", "版本", "狀態"],
    "reports:匯出中心": ["匯出批次", "報表", "倉別", "期間", "欄位版本", "格式", "申請人", "產生時間", "筆數", "狀態"],
    "reports:廠商格式對照": ["欄位代碼", "大樹欄位", "廠商欄位", "轉換規則", "必填", "資料型態", "版本", "測試結果", "負責人", "狀態"],
    "settings:角色權限": ["角色", "功能", "查看", "建立", "修改", "取消", "核准", "匯出", "下鑽深度", "操作留痕"],
    "settings:倉別權限": ["角色 / 人員", "WH01", "WH02", "WH03", "WH04", "WH05", "WH06", "WH07", "WH08", "生效日", "核准人"],
    "settings:欄位權限": ["角色", "模組", "欄位", "可見", "可編輯", "可匯出", "遮蔽規則", "高風險", "核准人", "版本"],
    "settings:操作紀錄": ["事件時間", "使用者", "角色", "倉別", "模組", "功能", "動作", "資料鍵", "異動前", "異動後", "結果"],
    "settings:主檔參數": ["主檔類型", "代碼", "名稱", "適用倉別", "參數值", "版本", "生效日", "建立人", "核准人", "狀態"],
    "returns:公告退貨工作台": ["倉別", "公告批次", "來源門市", "應退SKU", "應退PCS", "實收SKU", "實收PCS", "待判定PCS", "未結PCS", "完成率", "狀態"],
    "returns:PDA收貨": ["暫收LPN", "來源門市", "公告批次", "SKU ID", "批號", "效期", "掃描PCS", "公告比對", "收貨人", "PDA設備", "收貨時間", "狀態"],
    "returns:待判定 / 隔離": ["暫收LPN", "來源門市", "SKU ID", "批號", "效期", "實收PCS", "外觀", "判定等級", "隔離儲位", "判定人", "狀態"],
    "returns:處置任務": ["處置任務", "暫收LPN", "SKU ID", "可處置PCS", "退廠PCS", "調撥PCS", "批銷PCS", "報廢PCS", "未結PCS", "核准人", "平衡狀態"],
    "returns:退廠 / 調撥": ["處置單", "處置類型", "暫收LPN", "SKU ID", "來源儲位", "目的廠商 / 倉", "處置PCS", "交出人", "接收人", "PDA事件", "狀態"],
    "returns:報廢銷毀": ["報廢單", "暫收LPN", "SKU ID", "批號", "效期", "報廢PCS", "報廢原因", "核准人", "銷毀人", "見證人", "銷毀時間", "狀態"],
    "returns:退貨追溯": ["事件時間", "公告批次", "來源門市", "暫收LPN", "SKU ID", "事件", "來源儲位", "目的儲位", "人員", "PDA設備", "數量", "狀態"]
  });

  const moduleFields = {
    inbound: ["倉別", "ASN / 收貨單", "SKU ID", "LPN", "應到PCS", "實際PCS", "目前節點", "PDA事件", "責任單位", "狀態"],
    inventoryMove: ["倉別", "異動單", "SKU ID", "LPN", "來源儲位", "目的儲位", "異動PCS", "PDA事件", "核准狀態", "責任單位"],
    inventory: ["倉別", "SKU ID", "批號", "效期", "LPN", "儲位", "庫存狀態", "PCS", "最後異動", "資料狀態"],
    outbound: ["倉別", "訂單", "SKU ID", "LPN / 箱號", "應處理PCS", "已完成PCS", "目前節點", "PDA事件", "責任單位", "狀態"],
    outboundWork: ["倉別", "任務", "訂單", "SKU ID", "LPN / 箱號", "應作業PCS", "完成PCS", "作業人員", "PDA事件", "狀態"],
    gdp: ["倉別", "SKU ID", "批號", "效期", "庫內最短效期", "FEFO", "QC狀態", "規則版本", "責任單位", "狀態"],
    exception: ["倉別", "異常單", "來源模組", "異常現象", "已確認根因", "責任單位", "SLA", "改善證據", "複核人", "結案狀態"],
    labor: ["倉別", "人員", "任務", "事件區段", "開始", "結束", "直接分鐘", "損失分鐘", "完成PCS", "二次比對", "狀態"],
    reports: ["報表 / 欄位", "定義", "公式 / 來源", "粒度", "更新頻率", "必填", "下鑽鍵", "版本", "狀態"],
    settings: ["角色 / 主檔", "倉別範圍", "功能", "動作", "資料列範圍", "欄位遮蔽", "建立權", "核准權", "操作留痕"],
    returns: ["倉別", "公告批次", "來源門市", "暫收LPN", "SKU ID", "批號", "效期", "實收PCS", "處置PCS", "未結PCS", "PDA事件", "狀態"]
  };

  function getVisibleChildren(moduleId, warehouseCode) {
    const capability = warehouseCapabilities[warehouseCode];
    if (!capability || capability.hiddenModules.includes(moduleId)) return [];
    const hidden = capability.hiddenChildren?.[moduleId] || [];
    return (pageNames[moduleId] || []).filter((name) => !hidden.includes(name));
  }

  function rowBelongsToWarehouse(row, warehouseCode) {
    if (row.sourceWarehouse && row.destinationWarehouse) {
      return row.sourceWarehouse === warehouseCode || row.destinationWarehouse === warehouseCode;
    }
    return row.warehouseCode === warehouseCode;
  }

  function getPageSpec(warehouseCode, moduleId, child) {
    if (!getVisibleChildren(moduleId, warehouseCode).includes(child)) return null;
    let columns = specificColumns[`${moduleId}:${child}`] || [
      `${child}編號`, ...(moduleFields[moduleId] || ["倉別", "單據", "狀態"])
    ];
    if (moduleId === "inbound" && warehouseCode === "WH03") {
      columns = [...columns.slice(0, 4), "批號", "效期", "庫內最短效期", "GDP判定", ...columns.slice(4)];
    }
    const warehouseName = {
      WH01: "大豐一般倉", WH02: "大豐採品倉", WH03: "新屋西藥倉", WH04: "內壢成章倉",
      WH05: "大園新倉電商倉", WH06: "高邊退貨倉", WH07: "帳務及庶務倉", WH08: "後送中心倉"
    }[warehouseCode];
    return {
      moduleId,
      child,
      title: child,
      warehouseCode,
      warehouseName,
      status: "未介接",
      queryFields: ["日期", "狀態", columns.find((name) => /單|SKU|LPN|儲位/.test(name)) || "關鍵字"],
      actions: child.includes("查詢") ? ["查詢", "匯出CSV"] : ["查詢", "匯出CSV", "建立 / 處理"],
      kpis: [[`${child}待處理`, "資料不足", "正式來源未介接"], [`${child}異常`, "資料不足", "正式來源未介接"]],
      columns,
      rows: [],
      pdaEvents: ["開始", "完成", "暫停", "異常", "取消", "重派"],
      drilldown: ["日期", "倉別", "單據", "SKU ID", "LPN", "事件時間"]
    };
  }

  const roleMatrix = [
    { role: "副總", scope: "全倉", actions: ["view-dashboard", "export-summary"] },
    { role: "課長", scope: "assigned-warehouse", actions: ["view", "assign", "approve"] },
    { role: "作業員", scope: "self-task", actions: ["view-task", "start", "pause", "complete", "report-exception"] }
  ];

  const auditEvents = [];

  global.DASHU_WMS = Object.freeze({
    version: "2026-07-14-full-update",
    safeRate,
    createLocationCode,
    classifyReturnCondition,
    reconcileDisposition,
    previewLocationBatch,
    buildInventoryTrace,
    validateInventoryAdjustment,
    outboundStageSummary,
    exceptionAging,
    laborMetrics,
    gdpExpiryRisk,
    validateAnnouncementScan,
    createTemporaryReturnLpn,
    buildReturnTimeline,
    dashboardQualityGate,
    dashboardMetric,
    dashboardMetricDefinitions,
    calculateDashboardMetric,
    dashboardDataGate,
    permissionAllows,
    dashboardSpecs,
    getDashboardSpec,
    getDashboardWarehouseApplicability,
    modulePageSpecs,
    warehouseCapabilities,
    getPageSpec,
    getVisibleChildren,
    rowBelongsToWarehouse,
    roleMatrix,
    auditEvents
  });
})(globalThis);
