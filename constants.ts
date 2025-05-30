/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const HOURS_OF_THE_DAY = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

// New Vibrant Color Palette (12 Colors)
export const VIBRANT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F7B801",
  "#F9A620",
  "#5EAAA8",
  "#A2D5F2",
  "#FF8C42",
  "#E26D5C",
  "#726DA8",
  "#20A39E",
  "#F45B69",
];

export const LOCAL_STORAGE_STUDENT_PRICES_KEY = "tutorAppStudentPrices";
export const LOCAL_STORAGE_LESSONS_KEY = "tutorAppLessons";
export const LOCAL_STORAGE_STUDENTS_KEY = "tutorAppStudents";
export const LOCAL_STORAGE_SETTINGS_KEY = "tutorAppAppSettings";

export const NUM_RECURRING_WEEKS_TOTAL = 13; // Approx 3 months
export const NUM_WEEKS_TO_DISPLAY: number = 1;

// Mobile responsive constants
export const MOBILE_BREAKPOINT = 768;
export const MOBILE_HOURS_RANGE = { start: 0, end: 24 }; // Show all 24 hours on mobile
export const MOBILE_DAYS_TO_DISPLAY = 7; // Show all 7 days on mobile

// Generate hours for mobile (all 24 hours)
export const MOBILE_HOURS_OF_THE_DAY = Array.from(
  { length: MOBILE_HOURS_RANGE.end - MOBILE_HOURS_RANGE.start },
  (_, i) => {
    const hour = (i + MOBILE_HOURS_RANGE.start).toString().padStart(2, "0");
    return `${hour}:00`;
  }
);

// Supported Currencies
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

export const DEFAULT_CURRENCY = {
  code: "UAH",
  symbol: "₴",
  name: "Ukrainian Hryvnia",
};
