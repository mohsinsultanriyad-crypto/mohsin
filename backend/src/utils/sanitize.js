export function normStr(s) {
  return String(s ?? "").trim();
}

export function normLower(s) {
  return normStr(s).toLowerCase();
}

export function uniq(arr) {
  return Array.from(new Set((arr || []).map((x) => String(x).trim()).filter(Boolean)));
}
