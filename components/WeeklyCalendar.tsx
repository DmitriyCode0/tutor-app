/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WeeklyCalendarProps, Lesson, Student } from '../types';
import { HOURS_OF_THE_DAY, NUM_WEEKS_TO_DISPLAY } from '../constants';
import { addDays, formatDateForHeader, formatDateForStorage, parseTimeToDate } from '../utils/dateUtils';
import TimeSlotCell from './TimeSlotCell';

function WeeklyCalendar({ 
  lessons, 
  students, 
  onTimeSlotClick, 
  viewStartDate,
  draggedLessonId, 
  dragOverSlotInfo,
  onDragStartLesson, 
  onDropOnSlot, 
  onDragOverSlot, 
  onDragEnterSlot, 
  onDragLeaveSlot,
  startOfWeekDay
}: WeeklyCalendarProps) {
  const datesToDisplay: Date[] = [];
  for (let i = 0; i < NUM_WEEKS_TO_DISPLAY * 7; i++) {
    datesToDisplay.push(addDays(viewStartDate, i));
  }
  const todayDateString = formatDateForStorage(new Date());

  return (
    <div className="calendar-grid-wrapper">
      <div 
        className="calendar-grid" 
        role="grid" 
        aria-labelledby="calendar-heading" // Assuming you have an h2 with this id for the Calendar page title
        style={{ gridTemplateColumns: `var(--time-label-width) repeat(${NUM_WEEKS_TO_DISPLAY * 7}, 1fr)`}}
      >
        {/* Corner Cell */}
        <div className="grid-cell header-cell corner-cell" role="columnheader">
           <span className="timezone-info">UTC{new Date().getTimezoneOffset() / -60}</span>
        </div>
        {/* Day Headers */}
        {datesToDisplay.map((date) => (
          <div 
            key={date.toISOString()} 
            className={`grid-cell day-header-cell ${formatDateForStorage(date) === todayDateString ? 'today-header' : ''}`} 
            role="columnheader"
          >
            {formatDateForHeader(date)}
          </div>
        ))}

        {/* Time Slots */}
        {HOURS_OF_THE_DAY.map((hourSlot) => (
          <React.Fragment key={hourSlot}>
            <div className="grid-cell time-label-cell" role="rowheader">
              {hourSlot}
            </div>
            {datesToDisplay.map((date) => {
              const dateString = formatDateForStorage(date);
              // Find lessons that START in this dateString and within this hourSlot
              // For precise times, a lesson belongs to the slot its `lesson.hour` matches.
              // Visual representation of duration spanning multiple slots is complex and not done here.
              const lessonsInThisExactSlot = lessons.filter(l => 
                l.date === dateString && 
                l.hour.startsWith(hourSlot.substring(0,2)) // Simple check: lesson starts in this hour
              );
              
              // Taking the first lesson for simplicity. More complex UIs might stack them.
              const lesson = lessonsInThisExactSlot[0]; 
              const student = lesson ? students.find(s => s.id === lesson.studentId) : undefined;
              const isDragOverTarget = dragOverSlotInfo?.dateKey === dateString && dragOverSlotInfo?.hour === hourSlot;
              
              return (
                <TimeSlotCell
                  key={`${dateString}-${hourSlot}`}
                  fullDate={date}
                  hour={hourSlot} // Pass the slot's hour, not necessarily the lesson's precise hour
                  lesson={lesson}
                  studentName={student?.name}
                  lessonColor={student?.color}
                  onClick={(clickedLesson?: Lesson) => onTimeSlotClick(date, hourSlot, clickedLesson)}
                  isToday={dateString === todayDateString}
                  onDragStartLesson={onDragStartLesson}
                  onDropOnSlot={onDropOnSlot}
                  onDragOverSlot={onDragOverSlot}
                  onDragEnterSlot={onDragEnterSlot}
                  onDragLeaveSlot={onDragLeaveSlot}
                  isDragOverTarget={isDragOverTarget}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default WeeklyCalendar;
