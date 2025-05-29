/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { WeeklyCalendarProps, Lesson, Student } from "../types";
import {
  HOURS_OF_THE_DAY,
  NUM_WEEKS_TO_DISPLAY,
  MOBILE_HOURS_OF_THE_DAY,
  MOBILE_DAYS_TO_DISPLAY,
} from "../constants";
import {
  addDays,
  formatDateForHeader,
  formatDateForStorage,
  parseTimeToDate,
} from "../utils/dateUtils";
import { useResponsive, useTouchDragDrop } from "../utils/responsiveUtils";
import TimeSlotCell from "./TimeSlotCell";

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
  startOfWeekDay,
  now,
  currency,
}: WeeklyCalendarProps) {
  const { isMobile, isTouch } = useResponsive();

  // Use responsive values
  const daysToDisplay = isMobile
    ? MOBILE_DAYS_TO_DISPLAY
    : NUM_WEEKS_TO_DISPLAY * 7;
  const hoursToDisplay = isMobile ? MOBILE_HOURS_OF_THE_DAY : HOURS_OF_THE_DAY;

  const datesToDisplay: Date[] = [];
  for (let i = 0; i < daysToDisplay; i++) {
    datesToDisplay.push(addDays(viewStartDate, i));
  }
  const todayDateString = formatDateForStorage(new Date());

  // Calculate time line positions for all visible dates
  const getTimeLinePosition = (date: Date) => {
    const dateString = formatDateForStorage(date);
    const nowDateString = formatDateForStorage(now);

    // Only show time line for dates that match the current time or are visible
    if (dateString !== nowDateString && dateString !== todayDateString) {
      return null;
    }

    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Calculate which time slot row this falls into (0-based index)
    const slotIndex = isMobile
      ? hours - 6 // MOBILE_HOURS_OF_THE_DAY starts at 06:00
      : hours - 6; // HOURS_OF_THE_DAY starts at 06:00

    // If time is outside our display range, don't show line
    if (slotIndex < 0 || slotIndex >= hoursToDisplay.length) {
      return null;
    }

    // Calculate percentage within the hour slot (0-100%)
    const percentageInHour = (minutes / 60) * 100;

    return {
      slotIndex,
      percentageInHour,
      isToday: dateString === nowDateString,
    };
  };

  // Touch drag and drop for mobile
  const touchDragHandlers = useTouchDragDrop({
    onDragStart: (lessonId: string) => {
      if (onDragStartLesson) {
        onDragStartLesson(lessonId);
      }
    },
    onDrop: (lessonId: string, targetDate: Date, targetHour: string) => {
      if (onDropOnSlot) {
        // Create a synthetic event for compatibility
        const syntheticEvent = {
          preventDefault: () => {},
          dataTransfer: {
            getData: () => lessonId,
          },
        } as unknown as React.DragEvent;
        onDropOnSlot(syntheticEvent, targetDate, targetHour);
      }
    },
  });

  return (
    <div
      className={`calendar-grid-wrapper ${
        isMobile ? "mobile-calendar" : "desktop-calendar"
      }`}
    >
      <div
        className="calendar-grid"
        role="grid"
        aria-labelledby="calendar-heading"
        style={{
          gridTemplateColumns: `var(--time-label-width) repeat(${daysToDisplay}, 1fr)`,
        }}
      >
        {/* Corner Cell */}
        <div className="grid-cell header-cell corner-cell" role="columnheader">
          <span className="timezone-info">
            UTC{new Date().getTimezoneOffset() / -60}
          </span>
        </div>
        {/* Day Headers */}
        {datesToDisplay.map((date) => (
          <div
            key={date.toISOString()}
            className={`grid-cell day-header-cell ${
              formatDateForStorage(date) === todayDateString
                ? "today-header"
                : ""
            }`}
            role="columnheader"
          >
            {isMobile
              ? formatDateForHeader(date).split(" ")[0]
              : formatDateForHeader(date)}
          </div>
        ))}

        {/* Time Slots */}
        {hoursToDisplay.map((hourSlot, hourIndex) => (
          <React.Fragment key={hourSlot}>
            <div className="grid-cell time-label-cell" role="rowheader">
              {isMobile ? hourSlot.substring(0, 2) : hourSlot}
            </div>
            {datesToDisplay.map((date, dayIndex) => {
              const dateString = formatDateForStorage(date);
              // Find lessons that START in this dateString and within this hourSlot
              const lessonsInThisExactSlot = lessons.filter(
                (l) =>
                  l.date === dateString &&
                  l.hour.startsWith(hourSlot.substring(0, 2))
              );

              const lesson = lessonsInThisExactSlot[0];
              const student = lesson
                ? students.find((s) => s.id === lesson.studentId)
                : undefined;
              const isDragOverTarget =
                dragOverSlotInfo?.dateKey === dateString &&
                dragOverSlotInfo?.hour === hourSlot;

              // Calculate time line position for this date
              const timeLinePos = getTimeLinePosition(date);
              const shouldShowTimeLine =
                timeLinePos && timeLinePos.slotIndex === hourIndex;

              return (
                <div
                  key={`${dateString}-${hourSlot}`}
                  style={{ position: "relative" }}
                >
                  <TimeSlotCell
                    fullDate={date}
                    hour={hourSlot}
                    lesson={lesson}
                    studentName={student?.name}
                    lessonColor={student?.color}
                    onClick={(clickedLesson?: Lesson) =>
                      onTimeSlotClick(date, hourSlot, clickedLesson)
                    }
                    isToday={dateString === todayDateString}
                    onDragStartLesson={isTouch ? undefined : onDragStartLesson}
                    onDropOnSlot={isTouch ? undefined : onDropOnSlot}
                    onDragOverSlot={isTouch ? undefined : onDragOverSlot}
                    onDragEnterSlot={isTouch ? undefined : onDragEnterSlot}
                    onDragLeaveSlot={isTouch ? undefined : onDragLeaveSlot}
                    isDragOverTarget={isDragOverTarget}
                    currency={currency}
                    touchDragHandlers={isTouch ? touchDragHandlers : undefined}
                  />
                  {/* Time Line Indicator */}
                  {shouldShowTimeLine && (
                    <div
                      className={`now-line ${
                        timeLinePos.isToday ? "today" : "grey"
                      }`}
                      style={{
                        top: `${timeLinePos.percentageInHour}%`,
                        left: 0,
                        right: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default WeeklyCalendar;
