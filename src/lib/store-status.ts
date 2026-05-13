import type { StoreDay, StoreStatusSettings } from "@/features/admin-home/types";

const DAY_LABELS: Record<StoreDay, string> = {
  mon: "lundi",
  tue: "mardi",
  wed: "mercredi",
  thu: "jeudi",
  fri: "vendredi",
  sat: "samedi",
  sun: "dimanche",
};

const ORDERED_DAYS: StoreDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const INDEX_TO_DAY: Record<string, StoreDay> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

function parseTimeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatDisplayHour(value: string) {
  const [h] = value.split(":");
  return `${Number(h)}h`;
}

function nowInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const day = INDEX_TO_DAY[weekday] ?? "mon";

  return { day, minutes: hour * 60 + minute };
}

export function isStoreOpenNow(storeStatus: StoreStatusSettings) {
  if (!storeStatus.physicalStoreEnabled) return false;
  const { day, minutes } = nowInTimezone(storeStatus.timezone || "Europe/Paris");

  if (!storeStatus.openDays.includes(day)) return false;

  const morningOpen = parseTimeToMinutes(storeStatus.morningOpenTime);
  const morningClose = parseTimeToMinutes(storeStatus.morningCloseTime);
  const afternoonOpen = parseTimeToMinutes(storeStatus.afternoonOpenTime);
  const afternoonClose = parseTimeToMinutes(storeStatus.afternoonCloseTime);

  const inMorning = minutes >= morningOpen && minutes < morningClose;
  const inAfternoon = minutes >= afternoonOpen && minutes < afternoonClose;
  return inMorning || inAfternoon;
}

export function formatOpenDays(openDays: StoreDay[]) {
  const normalized = ORDERED_DAYS.filter((day) => openDays.includes(day));
  if (normalized.length === 0) return "jours non définis";

  const indexes = normalized.map((day) => ORDERED_DAYS.indexOf(day)).sort((a, b) => a - b);
  const contiguous = indexes.every((value, idx) => idx === 0 || value === indexes[idx - 1] + 1);

  if (contiguous && normalized.length >= 2) {
    const first = DAY_LABELS[normalized[0]];
    const last = DAY_LABELS[normalized[normalized.length - 1]];
    return `du ${first} au ${last}`;
  }

  return normalized.map((day) => DAY_LABELS[day]).join(", ");
}

export function formatOpenHours(storeStatus: StoreStatusSettings) {
  const mOpen = formatDisplayHour(storeStatus.morningOpenTime);
  const mClose = formatDisplayHour(storeStatus.morningCloseTime);
  const aOpen = formatDisplayHour(storeStatus.afternoonOpenTime);
  const aClose = formatDisplayHour(storeStatus.afternoonCloseTime);

  return `${mOpen} / ${mClose} - ${aOpen} / ${aClose}`;
}
