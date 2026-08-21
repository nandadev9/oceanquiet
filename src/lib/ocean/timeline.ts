import { DAY_PERIODS, PERIOD_HEADER_PX, PX_PER_HOUR, SNAP_MINUTES } from "./constants";
import { clampDuration, clampScheduleStart, snapMinutes } from "./dates";

function periodStartMin(startHour: number) {
  return startHour * 60;
}

function periodEndMin(endHour: number) {
  return endHour * 60;
}

function periodHours(startHour: number, endHour: number) {
  return endHour - startHour;
}

export function timelineHours(): number[] {
  const hours: number[] = [];
  for (const period of DAY_PERIODS) {
    for (let h = period.startHour; h < period.endHour; h++) {
      hours.push(h);
    }
  }
  return hours;
}

export function minutesToPx(minutes: number, role: "start" | "end" = "start"): number {
  let y = 0;
  const min = Math.max(0, Math.min(minutes, 24 * 60));
  for (const period of DAY_PERIODS) {
    const start = periodStartMin(period.startHour);
    const end = periodEndMin(period.endHour);
    const hoursPx = periodHours(period.startHour, period.endHour) * PX_PER_HOUR;
    y += PERIOD_HEADER_PX;
    const inStart = role === "start" && min >= start && min < end;
    const inEnd = role === "end" && min > start && min <= end;
    if (inStart || inEnd) {
      return y + ((min - start) / 60) * PX_PER_HOUR;
    }
    y += hoursPx;
  }
  return y;
}

export function blockHeightPx(startMinutes: number, durationMinutes: number): number {
  const end = Math.min(startMinutes + durationMinutes, 24 * 60);
  if (end <= startMinutes) return 22;
  const startPx = minutesToPx(startMinutes, "start");
  const endPx = minutesToPx(end, "end");
  return Math.max(endPx - startPx, 22);
}

export function totalTimelineHeight(): number {
  return timelineHours().length * PX_PER_HOUR + DAY_PERIODS.length * PERIOD_HEADER_PX;
}

export function periodHeaderTop(startHour: number): number {
  return minutesToPx(startHour * 60, "start") - PERIOD_HEADER_PX;
}

export function periodBlockHeight(startHour: number, endHour: number): number {
  return PERIOD_HEADER_PX + periodHours(startHour, endHour) * PX_PER_HOUR;
}

export function pxToMinutes(px: number): number {
  let y = 0;
  for (const period of DAY_PERIODS) {
    const start = periodStartMin(period.startHour);
    const hoursPx = periodHours(period.startHour, period.endHour) * PX_PER_HOUR;
    const headerEnd = y + PERIOD_HEADER_PX;
    const blockEnd = headerEnd + hoursPx;
    if (px < headerEnd) {
      return start;
    }
    if (px <= blockEnd) {
      const raw = start + ((px - headerEnd) / PX_PER_HOUR) * 60;
      return clampScheduleStart(raw);
    }
    y = blockEnd;
  }
  return 24 * 60 - SNAP_MINUTES;
}

export function clientYToMinutes(clientY: number, grid: HTMLElement): number {
  const rect = grid.getBoundingClientRect();
  return pxToMinutes(clientY - rect.top);
}

export function snapRange(startMinutes: number, durationMinutes: number) {
  const start = clampScheduleStart(startMinutes);
  return { start, duration: clampDuration(start, durationMinutes) };
}

export { snapMinutes };
