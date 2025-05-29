/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { TimeSlotCellProps, Lesson } from '../types';

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
  isDragOverTarget
}: TimeSlotCellProps) {
  const cellStyle = lessonColor ? { backgroundColor: lessonColor } : {};
  const dayName = fullDate.toLocaleDateString('en-US', { weekday: 'short' });
  let cellClasses = `time-slot-cell ${isToday ? 'today-timeslot' : ''}`;
  if (isDragOverTarget) {
    cellClasses += ' drag-over-active';
  }

  const handleDragStart = (event: React.DragEvent) => {
    if (lesson && onDragStartLesson) {
      event.dataTransfer.setData('lessonId', lesson.id);
      event.dataTransfer.effectAllowed = 'move';
      onDragStartLesson(lesson.id);
    } else {
      event.preventDefault(); // Prevent dragging if no lesson or handler
    }
  };
  
  return (
    <div 
      className={cellClasses}
      onClick={() => onClick(lesson)} 
      style={cellStyle}
      aria-label={lesson && studentName ? `Lesson with ${studentName} on ${dayName}, ${fullDate.toLocaleDateString()} at ${lesson.hour} for ${lesson.duration}h. Price: $${lesson.price.toFixed(2)}. Status: ${lesson.isPaid ? 'Paid' : 'Not Paid'}. Click to view.` : `Add lesson for ${dayName}, ${fullDate.toLocaleDateString()} at ${slotHour}. Click to add.`}
      onDragOver={onDragOverSlot}
      onDrop={(e) => onDropOnSlot(e, fullDate, slotHour)}
      onDragEnter={(e) => onDragEnterSlot(e, fullDate, slotHour)}
      onDragLeave={onDragLeaveSlot}
      role="gridcell"
      tabIndex={0} 
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(lesson);}} 
    >
      {lesson && studentName ? (
        <div 
          className="lesson-details"
          draggable={!!onDragStartLesson} 
          onDragStart={handleDragStart}
        >
          {lesson.recurringId && <span className="lesson-indicator lesson-recurring-indicator-chip">R</span>}
          <div className="lesson-name-chip">
            <span className="lesson-name">{studentName}</span>
          </div>
          <div className="lesson-price-display">${lesson.price.toFixed(2)}</div>
          <div className="lesson-time-duration-display">{lesson.hour} ({lesson.duration}h)</div>
          
          {lesson.isPaid && <span className="lesson-indicator lesson-paid-indicator-chip">Paid</span>}
          {lesson.tips > 0 && (
            <span className="lesson-indicator lesson-tip-amount-chip">
              +{lesson.tips.toFixed(2)}$
            </span>
          )}
        </div>
      ) : (
        <span className="add-lesson-plus">+</span>
      )}
    </div>
  );
}

export default TimeSlotCell;
