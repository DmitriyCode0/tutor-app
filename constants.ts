/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOURS_OF_THE_DAY = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// New Vibrant Color Palette (12 Colors)
export const VIBRANT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B801', '#F9A620',
  '#5EAAA8', '#A2D5F2', '#FF8C42', '#E26D5C', '#726DA8',
  '#20A39E', '#F45B69' 
];

export const LOCAL_STORAGE_STUDENT_PRICES_KEY = 'tutorAppStudentPrices';
export const LOCAL_STORAGE_LESSONS_KEY = 'tutorAppLessons';
export const LOCAL_STORAGE_STUDENTS_KEY = 'tutorAppStudents';
export const LOCAL_STORAGE_SETTINGS_KEY = 'tutorAppAppSettings';

export const NUM_RECURRING_WEEKS_TOTAL = 13; // Approx 3 months
export const NUM_WEEKS_TO_DISPLAY: number = 1; 
