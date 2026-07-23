export const EMPLOYEE_STATS_CHANGED_EVENT = "employee-stats-changed";

export function emitEmployeeStatsChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EMPLOYEE_STATS_CHANGED_EVENT));
}

export function subscribeEmployeeStatsChanged(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener(EMPLOYEE_STATS_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener(EMPLOYEE_STATS_CHANGED_EVENT, handler);
  };
}