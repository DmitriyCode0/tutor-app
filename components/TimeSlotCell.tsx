/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { TimeSlotCellProps, Lesson } from "../types";
import { formatCurrency, formatTips } from "../utils/currencyUtils";

function TimeSlotCell({
  fullDate,
  hour: slotHour,
  lesson,
  studentName,
  lessonColor,
  onClick,
  isToday,
  onDragStartLesson,
  onDropOnSlot,
  onDragOverSlot,
  onDragEnterSlot,
  onDragLeaveSlot,
  isDragOverTarget,
  draggedLessonDuration = 0.5, // Default to 30min if not provided
  currency,
  touchDragHandlers,
}: TimeSlotCellProps) {
  const dayName = fullDate.toLocaleDateString("en-US", { weekday: "short" });
  let cellClasses = `time-slot-cell ${isToday ? "today-timeslot" : ""}`;
  if (isDragOverTarget) {
    cellClasses += " drag-over-active";
  }

  const [dragOverPosition, setDragOverPosition] = React.useState<number | null>(
    null
  );
  const [dragOverTime, setDragOverTime] = React.useState<string | null>(null);
  const [isTouchDragging, setIsTouchDragging] = React.useState(false);

  // Create enhanced touch handlers with visual feedback
  const enhancedTouchHandlers = React.useMemo(() => {
    if (!touchDragHandlers || !lesson) return {};

    const originalHandlers = touchDragHandlers.getTouchEventHandlers(
      lesson.id,
      fullDate,
      slotHour
    );

    return {
      onTouchStart: (e: React.TouchEvent) => {
        setIsTouchDragging(true);
        originalHandlers.onTouchStart(e);
      },
      onTouchMove: (e: React.TouchEvent) => {
        originalHandlers.onTouchMove(e);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        setIsTouchDragging(false);
        originalHandlers.onTouchEnd(e);
      },
    };
  }, [touchDragHandlers, lesson, fullDate, slotHour]);

  // Calculate snapped time based on mouse position in cell
  const getSnappedTime = (
    event: React.DragEvent
  ): { time: string; position: number } => {
    if (!event.currentTarget) return { time: slotHour, position: 0 };

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const percentageInCell = (relativeY / rect.height) * 100;

    // Snap to nearest half hour
    const baseHour = parseInt(slotHour);
    const isInUpperHalf = percentageInCell < 50;

    return {
      time: isInUpperHalf
        ? `${baseHour.toString().padStart(2, "0")}:00`
        : `${baseHour.toString().padStart(2, "0")}:30`,
      position: isInUpperHalf ? 0 : 50,
    };
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (lesson && onDragStartLesson) {
      event.dataTransfer.setData("lessonId", lesson.id);
      event.dataTransfer.effectAllowed = "move";
      onDragStartLesson(lesson.id);
    } else {
      event.preventDefault(); // Prevent dragging if no lesson or handler
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    const { time, position } = getSnappedTime(event);
    setDragOverPosition(position);
    setDragOverTime(time);
    onDragOverSlot?.(event);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const { time } = getSnappedTime(event);
    onDropOnSlot?.(event, fullDate, time);
    setDragOverPosition(null);
    setDragOverTime(null);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    setDragOverPosition(null);
    setDragOverTime(null);
    onDragLeaveSlot?.(event);
  };

  const handleKeyboardMove = (e: React.KeyboardEvent) => {
    // Only process if we have a lesson (source of move) and keyboard navigation keys
    if (lesson && onDragStartLesson && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();

      // Simulate drag start
      onDragStartLesson(lesson.id);

      // Focus trapping and keyboard navigation would be implemented here
      // For a complete keyboard navigation system
      console.log(`Starting keyboard move for lesson: ${lesson.id}`);
    }
  };

  // Calculate position and height for the lesson
  const getLessonStyle = (lesson: Lesson): React.CSSProperties => {
    const [hours, minutes] = lesson.hour.split(":").map(Number);
    const slotStartHour = parseInt(slotHour);

    // Calculate position from top of cell
    const minutesFromSlotStart = (hours - slotStartHour) * 60 + minutes;
    const positionPercent = (minutesFromSlotStart / 60) * 100;

    // Calculate height based on duration
    const heightPercent = lesson.duration * 100;

    return {
      position: "absolute" as const,
      top: `${positionPercent}%`,
      left: 0,
      right: 0,
      height: `${heightPercent}%`,
      backgroundColor: lessonColor,
    };
  };

  return (
    <div
      className={cellClasses}
      onClick={() => onClick(lesson)}
      aria-label={
        lesson && studentName
          ? `Lesson with ${studentName} on ${dayName}, ${fullDate.toLocaleDateString()} at ${
              lesson.hour
            } for ${lesson.duration}h. Price: ${formatCurrency(
              lesson.price,
              currency
            )}. Status: ${lesson.isPaid ? "Paid" : "Not Paid"}. Click to view.`
          : `Add lesson for ${dayName}, ${fullDate.toLocaleDateString()} at ${slotHour}. Click to add.`
      }
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={(e) => {
        const { time } = getSnappedTime(e);
        onDragEnterSlot?.(e, fullDate, time);
      }}
      onDragLeave={handleDragLeave}
      role="gridcell"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (lesson) {
            handleKeyboardMove(e);
          } else {
            onClick(lesson); // Default action for non-lessons
          }
        }
      }}
    >
      {isDragOverTarget && !lesson && (
        <>
          {/* Show both snap guides */}
          <div
            className="snap-guide snap-guide-top"
            data-time={`${slotHour.split(":")[0]}:00`}
          />
          <div
            className="snap-guide snap-guide-middle"
            data-time={`${slotHour.split(":")[0]}:30`}
          />
          {/* Show active snap position with actual lesson duration */}
          {dragOverPosition !== null && dragOverTime && (
            <>
              <div
                className="drag-preview"
                style={{
                  top: `${dragOverPosition}%`,
                  height: `${draggedLessonDuration * 100}%`, // Scale by duration in hours
                  position: "absolute",
                  left: 0,
                  right: 0,
                  background: "var(--border-drag-active)",
                  opacity: 0.5,
                  zIndex: 40,
                  pointerEvents: "none",
                  borderRadius: "4px",
                }}
              />
              <div className="drag-time-tooltip">
                {dragOverTime} -{" "}
                {
                  // Calculate end time based on the duration
                  (() => {
                    const [hours, minutes] = dragOverTime
                      .split(":")
                      .map(Number);
                    const durationMinutes = draggedLessonDuration * 60;
                    let endMinutes = minutes + durationMinutes;
                    let endHours = hours + Math.floor(endMinutes / 60);
                    endMinutes = endMinutes % 60;

                    return `${endHours.toString().padStart(2, "0")}:${endMinutes
                      .toString()
                      .padStart(2, "0")}`;
                  })()
                }
              </div>
            </>
          )}
        </>
      )}
      {lesson && studentName ? (
        <div
          className="lesson-details"
          draggable={!!onDragStartLesson}
          onDragStart={handleDragStart}
          style={getLessonStyle(lesson)}
          data-dragging={isTouchDragging}
          {...enhancedTouchHandlers}
        >
          {lesson.recurringId && (
            <span className="lesson-indicator lesson-recurring-indicator-chip">
              R
            </span>
          )}
          <div className="lesson-name-chip">
            <span className="lesson-name">{studentName}</span>
          </div>
          <div className="lesson-price-display">
            {formatCurrency(lesson.price, currency)}
          </div>
          <div className="lesson-time-duration-display">
            {lesson.hour} ({lesson.duration}h)
          </div>

          {lesson.isPaid && (
            <span className="lesson-indicator lesson-paid-indicator-chip">
              Paid
            </span>
          )}
          {lesson.tips > 0 && (
            <span className="lesson-indicator lesson-tip-amount-chip">
              {formatTips(lesson.tips, currency)}
            </span>
          )}
        </div>
      ) : (
        <span className="add-lesson-plus"></span>
      )}
    </div>
  );
}

export default TimeSlotCell;
