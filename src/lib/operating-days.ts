export const operatingDayOptions = [
  { value: "MONDAY", label: "Monday", index: 1 },
  { value: "TUESDAY", label: "Tuesday", index: 2 },
  { value: "WEDNESDAY", label: "Wednesday", index: 3 },
  { value: "THURSDAY", label: "Thursday", index: 4 },
  { value: "FRIDAY", label: "Friday", index: 5 },
  { value: "SATURDAY", label: "Saturday", index: 6 },
  { value: "SUNDAY", label: "Sunday", index: 0 },
] as const;

export type OperatingDayValue = (typeof operatingDayOptions)[number]["value"];

const operatingDayMap: Record<number, OperatingDayValue> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export const getOperatingDayFromDate = (date: Date): OperatingDayValue =>
  operatingDayMap[date.getDay()];

export const getOperatingDayLabel = (value: OperatingDayValue) =>
  operatingDayOptions.find((day) => day.value === value)?.label ?? value;
