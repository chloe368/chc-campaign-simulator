// Present a virtual day number as a friendly label.
export function formatDay(day: number): string {
  if (day < 0) return `Day ${day}`;
  return `Day ${day}`;
}

export function relativeDayLabel(day: number): string {
  if (day === 0) return "today";
  if (day === 1) return "tomorrow";
  return `day ${day}`;
}
