/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Lesson } from '../types';
import { parseTimeToDate } from './dateUtils';

export function getLessonDateTimeRange(lessonDate: string, lessonHour: string, lessonDuration: number): { start: Date; end: Date } {
    const start = parseTimeToDate(lessonDate, lessonHour);
    const end = new Date(start.getTime() + lessonDuration * 60 * 60 * 1000);
    return { start, end };
}

export function checkConflict(
    lessonAId: string, // ID of the lesson being checked/moved/added
    lessonADate: string, 
    lessonAHour: string, 
    lessonADuration: number,
    allLessons: Lesson[] // All other lessons to check against
): boolean {
    const rangeA = getLessonDateTimeRange(lessonADate, lessonAHour, lessonADuration);
    
    for (const lessonB of allLessons) {
        if (lessonB.id === lessonAId) continue; // Don't check against itself
        const rangeB = getLessonDateTimeRange(lessonB.date, lessonB.hour, lessonB.duration);
        
        // Check for overlap: (StartA < EndB) and (EndA > StartB)
        if (rangeA.start < rangeB.end && rangeA.end > rangeB.start) {
            return true; // Conflict found
        }
    }
    return false; // No conflict
}
