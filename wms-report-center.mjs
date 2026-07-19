export const EXPENSE_CATEGORIES = [
  "人力薪資",
  "加班OT",
  "委外作業",
  "配送物流",
  "租金／水電",
  "包材耗材",
  "設備維修",
  "異常與其他費用"
];

const AGGREGATION_MODES = new Set([
  "FLOW_SUM",
  "RATIO_RECALCULATE",
  "PERIOD_END_SNAPSHOT"
]);

export function aggregateReportMetric(records, contract) {
  if (!AGGREGATION_MODES.has(contract?.aggregationMode)) {
    throw new TypeError("月報彙總模式錯誤");
  }

  const eligible = records.filter((row) => row.eligible !== false);
  if (!eligible.length) {
    return { status: "資料不足", value: null, reason: "沒有合格資料" };
  }

  if (contract.aggregationMode === "FLOW_SUM") {
    return {
      status: "可用",
      value: eligible.reduce((sum, row) => sum + Number(row.value || 0), 0)
    };
  }

  if (contract.aggregationMode === "RATIO_RECALCULATE") {
    const numerator = eligible.reduce((sum, row) => sum + Number(row.numerator || 0), 0);
    const denominator = eligible.reduce((sum, row) => sum + Number(row.denominator || 0), 0);
    return denominator > 0
      ? { status: "可用", value: numerator / denominator, numerator, denominator }
      : { status: "資料不足", value: null, reason: "分母為零" };
  }

  const latest = [...eligible]
    .sort((a, b) => String(a.businessDate).localeCompare(String(b.businessDate)))
    .at(-1);
  return {
    status: "可用",
    value: Number(latest.value),
    snapshotDate: latest.businessDate
  };
}

export function getMetricAvailability(records, context = {}) {
  if (context.denominator === 0) {
    return { status: "資料不足", reason: "分母為零", rankable: false };
  }
  if (!records.length) {
    return { status: "資料不足", reason: "缺少正式來源", rankable: false };
  }
  if (records.some((row) => row.dataStatus === "資料不足")) {
    return { status: "資料不足", reason: "來源資料不足", rankable: false };
  }
  if (new Set(records.map((row) => row.formulaVersion)).size !== 1) {
    return { status: "資料不足", reason: "公式版本不一致", rankable: false };
  }

  const isFormal = records.every((row) => row.dataStatus === "正式資料");
  return {
    status: isFormal ? "正式資料" : "原型資料",
    reason: "",
    rankable: isFormal
  };
}

export function classifyExpense(record) {
  const text = `${record.accountName || ""} ${record.expenseItem || ""}`;
  const rules = [
    ["人力薪資", /薪資|薪酬|獎金/],
    ["加班OT", /加班|OT/i],
    ["委外作業", /委外|外包/],
    ["配送物流", /配送|運費|物流/],
    ["租金／水電", /租金|水費|電費|水電/],
    ["包材耗材", /包材|耗材|紙箱|膠帶/],
    ["設備維修", /維修|修理|零件|保養/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "異常與其他費用";
}

export function buildExpenseReconciliation(records) {
  const categories = EXPENSE_CATEGORIES.map((categoryId) => ({
    categoryId,
    amount: records
      .filter((row) => row.categoryId === categoryId)
      .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  }));
  const total = records.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const categoryTotal = categories.reduce((sum, row) => sum + row.amount, 0);
  return {
    total,
    categoryTotal,
    categories,
    isBalanced:
      total === categoryTotal &&
      records.every((row) => EXPENSE_CATEGORIES.includes(row.categoryId))
  };
}

export function appendOperationalNote(notes, input) {
  if (!String(input.text || "").trim()) {
    throw new TypeError("註記內容不可空白");
  }
  const prior = notes.filter(
    (note) =>
      note.entityType === input.entityType && note.entityId === input.entityId
  );
  return [
    ...notes,
    {
      ...input,
      noteId: `NOTE-${String(notes.length + 1).padStart(4, "0")}`,
      version: prior.length + 1,
      status: input.status || "追蹤中"
    }
  ];
}
