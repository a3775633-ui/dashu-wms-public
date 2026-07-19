const AGGREGATION_MODES = new Set([
  "FLOW_SUM",
  "RATIO_RECALCULATE",
  "PERIOD_END_SNAPSHOT",
  "WEIGHTED_AVERAGE"
]);

function eligibleRecords(records) {
  return (records || [])
    .filter((row) => row.eligible !== false)
    .sort((a, b) => Number(a.week) - Number(b.week));
}

export function aggregateQuarter(records, contract) {
  if (!AGGREGATION_MODES.has(contract?.aggregationMode)) throw new TypeError("季度彙總模式錯誤");
  const eligible = eligibleRecords(records);
  if (!eligible.length) return { status: "資料不足", actual: null, reason: "沒有合格週資料" };

  if (contract.aggregationMode === "FLOW_SUM") {
    return { status: "可用", actual: eligible.reduce((sum, row) => sum + Number(row.value || 0), 0) };
  }

  if (contract.aggregationMode === "RATIO_RECALCULATE") {
    const numerator = eligible.reduce((sum, row) => sum + Number(row.numerator || 0), 0);
    const denominator = eligible.reduce((sum, row) => sum + Number(row.denominator || 0), 0);
    return denominator > 0
      ? { status: "可用", actual: numerator / denominator, numerator, denominator }
      : { status: "資料不足", actual: null, reason: "分母為零" };
  }

  if (contract.aggregationMode === "PERIOD_END_SNAPSHOT") {
    const snapshot = eligible.at(-1);
    return { status: "可用", actual: Number(snapshot.value), snapshotWeek: snapshot.week };
  }

  const weightedTotal = eligible.reduce((sum, row) => sum + Number(row.value || 0) * Number(row.weight || 0), 0);
  const totalWeight = eligible.reduce((sum, row) => sum + Number(row.weight || 0), 0);
  return totalWeight > 0
    ? { status: "可用", actual: weightedTotal / totalWeight, weight: totalWeight, weightedTotal }
    : { status: "資料不足", actual: null, reason: "權重為零" };
}

export function evaluateQuarterTarget(actual, target) {
  if (!Number.isFinite(actual) || !target?.approved) return { status: "資料不足", gap: null };
  if (target.direction === "HIGHER_IS_BETTER") {
    return { status: actual >= target.value ? "達標" : "未達", gap: Math.max(target.value - actual, 0) };
  }
  if (target.direction === "LOWER_IS_BETTER") {
    return { status: actual <= target.value ? "達標" : "未達", gap: Math.max(actual - target.value, 0) };
  }
  if (target.direction === "TARGET_RANGE") {
    const inRange = actual >= target.lower && actual <= target.upper;
    const gap = inRange ? 0 : actual < target.lower ? target.lower - actual : actual - target.upper;
    return { status: inRange ? "達標" : "未達", gap };
  }
  throw new TypeError("季度目標方向錯誤");
}

export function calculateQuarterPace(actual, target, remainingWeeks, contract) {
  if (!target?.approved || !Number.isFinite(actual) || remainingWeeks <= 0) {
    return { status: "資料不足", label: "資料不足", value: null };
  }
  if (contract.aggregationMode === "FLOW_SUM" && target.direction === "HIGHER_IS_BETTER") {
    return { status: "可用", label: "每週尚需達成", value: Math.max(target.value - actual, 0) / remainingWeeks };
  }
  if (contract.aggregationMode === "FLOW_SUM" && target.direction === "LOWER_IS_BETTER") {
    return { status: "可用", label: "剩餘可用額度／週", value: Math.max(target.value - actual, 0) / remainingWeeks };
  }
  if (contract.aggregationMode === "RATIO_RECALCULATE" && typeof contract.recoveryRule !== "function") {
    return { status: "資料不足", label: "資料不足", value: null };
  }
  if (contract.aggregationMode === "RATIO_RECALCULATE") {
    return contract.recoveryRule({ actual, target, remainingWeeks });
  }
  return { status: "資料不足", label: "不適用", value: null };
}

export function forecastQuarter(records, contract, remainingWeeks) {
  const eligible = eligibleRecords(records).filter((row) => row.complete !== false);
  if (eligible.length < 2) return { status: "資料不足", forecast: null, reason: "少於兩個合格完整週" };
  const recent = eligible.slice(-4);
  const current = aggregateQuarter(eligible, contract);
  if (current.status !== "可用") return { status: "資料不足", forecast: null, reason: current.reason };

  if (contract.aggregationMode === "FLOW_SUM") {
    const recentAverage = recent.reduce((sum, row) => sum + Number(row.value || 0), 0) / recent.length;
    return { status: "可預估", forecast: current.actual + recentAverage * remainingWeeks };
  }

  if (contract.aggregationMode === "RATIO_RECALCULATE") {
    const weeklyNumerator = recent.reduce((sum, row) => sum + Number(row.numerator || 0), 0) / recent.length;
    const weeklyDenominator = recent.reduce((sum, row) => sum + Number(row.denominator || 0), 0) / recent.length;
    const projectedNumerator = current.numerator + weeklyNumerator * remainingWeeks;
    const projectedDenominator = current.denominator + weeklyDenominator * remainingWeeks;
    return projectedDenominator > 0
      ? { status: "可預估", forecast: projectedNumerator / projectedDenominator }
      : { status: "資料不足", forecast: null, reason: "預估分母為零" };
  }

  if (contract.aggregationMode === "WEIGHTED_AVERAGE") {
    const recentWeightedAverage = recent.reduce((sum, row) => sum + Number(row.value || 0) * Number(row.weight || 0), 0) / recent.length;
    const recentWeightAverage = recent.reduce((sum, row) => sum + Number(row.weight || 0), 0) / recent.length;
    const projectedWeight = current.weight + recentWeightAverage * remainingWeeks;
    return projectedWeight > 0
      ? { status: "可預估", forecast: (current.weightedTotal + recentWeightedAverage * remainingWeeks) / projectedWeight }
      : { status: "資料不足", forecast: null, reason: "預估權重為零" };
  }

  return contract.forecastMethod === "LAST_VALID_SNAPSHOT"
    ? { status: "可預估", forecast: current.actual }
    : { status: "資料不足", forecast: null, reason: "期末快照未定義預估方法" };
}

export function isQuarterComparable(results) {
  if (!Array.isArray(results) || results.length < 2) return false;
  const reference = results[0];
  return results.every((item) =>
    item.dataStatus === "正式資料" &&
    item.metricId === reference.metricId &&
    item.formulaVersion === reference.formulaVersion &&
    item.cohortId === reference.cohortId
  );
}

export function allocateWarehouseTargets(companyTarget, allocations) {
  const totalBasis = (allocations || []).reduce((sum, item) => sum + Number(item.basis || 0), 0);
  if (!Number.isFinite(companyTarget) || totalBasis <= 0) throw new TypeError("倉別目標分配基礎缺漏");
  let assigned = 0;
  return allocations.map((item, index) => {
    const suggestedTarget = index === allocations.length - 1
      ? companyTarget - assigned
      : Math.round(companyTarget * Number(item.basis) / totalBasis);
    assigned += suggestedTarget;
    return { warehouseCode: item.warehouseCode, suggestedTarget };
  });
}

export function calculateMilestoneProgress(milestones) {
  const total = (milestones || []).reduce((sum, item) => sum + Number(item.weight || 0), 0);
  if (total <= 0) throw new TypeError("里程碑權重缺漏");
  return milestones
    .filter((item) => item.accepted)
    .reduce((sum, item) => sum + Number(item.weight || 0), 0) / total;
}

export function evaluateProjectEffect(input) {
  if (input.deliveryProgress < 1) return { deliveryStatus: "交付進行中", effectStatus: "待觀察", improvement: null };
  if (input.completeObservationWeeks < 4) return { deliveryStatus: "交付完成", effectStatus: "成效觀察中", improvement: null };
  const improvement = input.direction === "LOWER_IS_BETTER"
    ? input.baseline - input.observed
    : input.observed - input.baseline;
  return {
    deliveryStatus: "交付完成",
    effectStatus: improvement >= input.expectedImprovement ? "已改善" : "未達預期",
    improvement
  };
}
