/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DAY_NAMES_SHORT } from '../constants';

export function getWeekStartDate(date: Date, startDay: 0 | 1 = 0): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  if (startDay === 1) { // Monday start
    const diff = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; 
    d.setDate(d.getDate() - diff);
  } else { // Sunday start (default)
    d.setDate(d.getDate() - dayOfWeek);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date, startDay: 0 | 1 = 0): Date {
  const d = new Date(date); // Use the week start date passed in
  const dayOfWeek = d.getDay(); // dayOfWeek of the start of the week
  if (startDay === 1) { // Monday start, so week ends on Sunday
    // if startDay is Monday (1), then d.getDay() would be 1. We need to add 6 days.
    // if dayOfWeek is 1 (Mon), add 6 to get to Sun.
    // if the date passed IS Sunday (0) and startDay is Monday, it means we want Sunday of *that* week.
    // No, this is simpler: just add 6 days to the start of the week.
    d.setDate(d.getDate() + 6);
  } else { // Sunday start, so week ends on Saturday
    // if startDay is Sunday (0), d.getDay() is 0. We add 6 days.
    d.setDate(d.getDate() + 6);
  }
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0,0,0,0);
    return d;
}

export function getEndOfMonth(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23,59,59,999);
    return d;
}

export function getPreviousPeriod(date: Date, unit: 'week' | 'month', startOfWeekDay: 0 | 1 = 0): Date {
    const d = new Date(date);
    if (unit === 'week') {
        d.setDate(d.getDate() - 7); // Go back 7 days from the start of the current week
    } else if (unit === 'month') {
        const currentMonth = d.getMonth();
        d.setMonth(currentMonth - 1); // Go to the previous month
        // If month changed to something unexpected (e.g. March 31 -> Feb 31 becomes March 3), set to last day of previous month
        // This is primarily an issue if 'date' was an end-of-month day. For start of month, it's usually fine.
        if (d.getMonth() === currentMonth || (d.getMonth() > currentMonth && d.getFullYear() === date.getFullYear()) ) { // Handles December -> November correctly.
             d.setDate(0); // Sets to last day of previous month. Then getStartOfMonth will fix it.
        }
    }
    return d; // For 'week' this is previous week's start, for 'month' this could be any day in prev month.
}


export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateForHeader(date: Date): string {
  return `${DAY_NAMES_SHORT[date.getDay()]} ${date.getDate()}`;
}

export function formatDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFullDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function parseTimeToDate(dateString: string, timeString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0); // Ensure hours/minutes default to 0 if not provided
}
