// data.js — Water Tracker data layer (localStorage) with no global name collisions

(() => {
  const STORAGE_KEY = "wt:data:v1";

  const DEFAULT_STATE = {
    version: 1,
    resetHourLocal: 5,
    dailyTotals: {},
    entries: {},
    meta: {
      lastBackupAt: null,
      changesSinceBackup: 0,
      backupReminderSnoozeUntil: null,
    },
  };

  const wtClone = (obj) => JSON.parse(JSON.stringify(obj));

  function wtLoadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return wtClone(DEFAULT_STATE);

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object")
        return wtClone(DEFAULT_STATE);

      return {
        ...wtClone(DEFAULT_STATE),
        ...parsed,
        dailyTotals: parsed.dailyTotals || {},
        entries: parsed.entries || {},
        meta: { ...DEFAULT_STATE.meta, ...(parsed.meta || {}) },
      };
    } catch (e) {
      console.warn("WT load failed, using defaults:", e);
      return wtClone(DEFAULT_STATE);
    }
  }

  function wtSaveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function wtGetDayKey(date = new Date(), resetHourLocal = 5) {
    const d = new Date(date);
    if (d.getHours() < resetHourLocal) d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function wtPruneEntries(state, keepDays = 30) {
    const keys = Object.keys(state.entries);
    if (!keys.length) return;

    keys.sort();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    const cutoffKey = `${cutoff.getFullYear()}-${pad2(cutoff.getMonth() + 1)}-${pad2(cutoff.getDate())}`;

    for (const k of keys) {
      if (k < cutoffKey) delete state.entries[k];
    }
  }

  function wtAddWater(oz, date = new Date()) {
    if (!Number.isFinite(oz) || oz <= 0)
      throw new Error("oz must be > 0");

    const state = wtLoadState();
    const dayKey = wtGetDayKey(date, state.resetHourLocal);

    state.entries[dayKey] ||= [];
    state.entries[dayKey].push({ ts: date.getTime(), oz });

    const prev = state.dailyTotals[dayKey] || 0;
    state.dailyTotals[dayKey] = Math.round((prev + oz) * 100) / 100;

    state.meta.changesSinceBackup =
      (state.meta.changesSinceBackup || 0) + 1;

    wtPruneEntries(state, 30);
    wtSaveState(state);

    return { dayKey, totalOz: state.dailyTotals[dayKey] };
  }

  function wtGetTodayTotal(date = new Date()) {
    const state = wtLoadState();
    const dayKey = wtGetDayKey(date, state.resetHourLocal);
    return { dayKey, totalOz: state.dailyTotals[dayKey] || 0 };
  }

  function wtGetLastNDaysTotals(n = 7, date = new Date()) {
    const state = wtLoadState();
    const out = [];

    const anchorDayKey = wtGetDayKey(date, state.resetHourLocal);
    const [y, m, d] = anchorDayKey.split("-").map(Number);
    const anchor = new Date(y, m - 1, d, 12, 0, 0, 0);

    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(anchor);
      dt.setDate(anchor.getDate() - i);
      const key = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      out.push({ dayKey: key, totalOz: state.dailyTotals[key] || 0 });
    }
    return out;
  }

  function wtClearAllData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function wtUndoLastEntry(date = new Date()) {
    const state = wtLoadState();
    const dayKey = wtGetDayKey(date, state.resetHourLocal);

    const list = state.entries[dayKey];
    if (!Array.isArray(list) || list.length === 0) {
      // nothing to undo
      return {
        dayKey,
        totalOz: state.dailyTotals[dayKey] || 0,
        undone: null,
      };
    }

    const undone = list.pop(); // {ts, oz}
    const prevTotal = state.dailyTotals[dayKey] || 0;
    const nextTotal = Math.max(
      0,
      Math.round((prevTotal - undone.oz) * 100) / 100,
    );

    state.dailyTotals[dayKey] = nextTotal;
    state.meta.changesSinceBackup =
      (state.meta.changesSinceBackup || 0) + 1;

    wtSaveState(state);
    return { dayKey, totalOz: nextTotal, undone };
  }

  function wtResetToday(date = new Date()) {
    const state = wtLoadState();
    const dayKey = wtGetDayKey(date, state.resetHourLocal);

    state.dailyTotals[dayKey] = 0;
    state.entries[dayKey] = [];
    state.meta.changesSinceBackup =
      (state.meta.changesSinceBackup || 0) + 1;

    wtSaveState(state);
    return { dayKey, totalOz: 0 };
  }

  window.WT = {
    loadState: wtLoadState,
    addWater: wtAddWater,
    undoLastEntry: wtUndoLastEntry,
    resetToday: wtResetToday,
    getDayKey: wtGetDayKey,
    getTodayTotal: wtGetTodayTotal,
    getLastNDaysTotals: wtGetLastNDaysTotals,
    clearAllData: wtClearAllData,
  };
})();
