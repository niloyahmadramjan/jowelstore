
export function generateOrderId(orderCountToday: number) {
  const prefix = "JW";

  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  // e.g. 20240315

  const serial = String(orderCountToday + 1).padStart(3, "0");
  // e.g. 001, 002

  return `${prefix}-${date}-${serial}`;
}