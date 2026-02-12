export const timeStringToMinutes = (value: string): number | null => {
  if (!value) return null;
  const [hoursValue, minutesValue] = value.split(":");
  if (hoursValue === undefined || minutesValue === undefined) return null;
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number) => {
  const safeMinutes = Math.max(0, minutes);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const isTimeWithinRange = (
  time: number,
  start: number,
  end: number
) => time >= start && time <= end;

export const doRangesOverlap = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
) => startA < endB && startB < endA;

const padDatePart = (value: number) => String(value).padStart(2, "0");

export const formatLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate()
  )}`;

export const parseLocalDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
};

export const buildLocalDateTime = (date: Date, time: string) => {
  const [hoursValue, minutesValue] = time.split(":");
  if (hoursValue === undefined || minutesValue === undefined) return null;
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  );
};

export const buildTimeOptions = (
  ranges: Array<{ startTime: string; endTime: string }>,
  step = 30
) => {
  const options = new Map<number, string>();
  ranges.forEach((range) => {
    const start = timeStringToMinutes(range.startTime);
    const end = timeStringToMinutes(range.endTime);
    if (start === null || end === null) return;
    for (let minutes = start; minutes <= end; minutes += step) {
      options.set(minutes, minutesToTimeString(minutes));
    }
  });
  return Array.from(options.entries())
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);
};

export const buildEndTimeOptions = (
  startShift: string,
  ranges: Array<{ startTime: string; endTime: string }>,
  step = 30
) => {
  const startMinutes = timeStringToMinutes(startShift);
  if (startMinutes === null) return [];
  const options = new Map<number, string>();
  ranges.forEach((range) => {
    const start = timeStringToMinutes(range.startTime);
    const end = timeStringToMinutes(range.endTime);
    if (start === null || end === null) return;
    if (startMinutes < start || startMinutes >= end) return;
    for (let minutes = startMinutes + step; minutes <= end; minutes += step) {
      options.set(minutes, minutesToTimeString(minutes));
    }
  });
  return Array.from(options.entries())
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);
};
