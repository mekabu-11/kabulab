export function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function toDateTimeInputValue(date = new Date()) {
  return date.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

export function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function endOfTodayIso() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function daysAgoDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

