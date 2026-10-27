import type { HolidayType } from "@/types/catalog";

export interface HolidayOption {
  value: HolidayType;
  label: string;
}

/**
 * Holiday tags (Product.holidays) in calendar order, with display labels.
 * "yom-tov" is the catch-all for general Yom Tov / Chol Hamoed finds — those
 * show under "All" in the Yom Tov & Holidays section, with no chip of their own.
 */
export const holidays: HolidayOption[] = [
  { value: "rosh-hashanah", label: "Rosh Hashanah" },
  { value: "sukkos", label: "Sukkos" },
  { value: "chanukah", label: "Chanukah" },
  { value: "purim", label: "Purim" },
  { value: "pesach", label: "Pesach" },
  { value: "yom-tov", label: "Yom Tov" },
];

/** Holidays that get their own chip / menu entry (everything except the general "yom-tov"). */
export const holidayChips = holidays.filter((holiday) => holiday.value !== "yom-tov");

export function getHolidayLabel(value: string): string | undefined {
  return holidays.find((holiday) => holiday.value === value)?.label;
}
