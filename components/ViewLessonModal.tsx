/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useCallback } from "react";
import { ViewLessonModalProps, Lesson, Student } from "../types";
import { formatFullDateForDisplay, parseTimeToDate } from "../utils/dateUtils";
import { formatCurrency, formatTips } from "../utils/currencyUtils";

function ViewLessonModal({
  isOpen,
  onClose,
  onDelete,
  lesson,
  students,
  onTogglePaid,
  onOpenAddTips,
  onOpenChangePrice,
  onOpenChangeTimeDuration,
  currency,
}: ViewLessonModalProps) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      const closeButton = document.getElementById("closeViewLessonModalButton");
      if (closeButton) {
        closeButton.focus();
      }
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, handleEscKey]);

  if (!isOpen || !lesson) return null;

  const student = students.find((s) => s.id === lesson.studentId);
  const lessonDateObj = parseTimeToDate(lesson.date, lesson.hour);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-lesson-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="view-lesson-modal-title" className="modal-header">
          Lesson Details
        </h3>
        <div className="view-lesson-details">
          <p>
            <strong>Student:</strong> {student?.name || "Unknown"}
          </p>
          {lesson.studentPhoneNumber && (
            <p>
              <strong>Phone:</strong> {lesson.studentPhoneNumber}
            </p>
          )}
          <p>
            <strong>Date:</strong> {formatFullDateForDisplay(lessonDateObj)}
          </p>
          <p>
            <strong>Time:</strong> {lesson.hour}
          </p>
          <p>
            <strong>Price:</strong> {formatCurrency(lesson.price, currency)}
          </p>
          <p>
            <strong>Duration:</strong> {lesson.duration} hour(s)
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {lesson.isPaid
              ? `Paid ${
                  lesson.tips && lesson.tips > 0
                    ? `(Tips: ${formatCurrency(lesson.tips, currency)})`
                    : ""
                }`
              : "Not Paid"}
          </p>
          {lesson.recurringId && (
            <p>
              <em>(This is a recurring lesson)</em>
            </p>
          )}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            onClick={() => onTogglePaid(lesson.id)}
            className="button-primary"
          >
            {lesson.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
          </button>
          {lesson.isPaid && (
            <button
              type="button"
              onClick={() => onOpenAddTips(lesson)}
              className="button-primary"
            >
              Add/Edit Tips
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChangePrice(lesson)}
            className="button-primary"
          >
            Change Price
          </button>
          <button
            type="button"
            onClick={() => onOpenChangeTimeDuration(lesson)}
            className="button-primary"
          >
            Change Time/Duration
          </button>
          <button
            type="button"
            onClick={() => onDelete(lesson.id, lesson.recurringId, lesson.date)}
            className="button-danger"
          >
            Delete Lesson
          </button>
          <button
            type="button"
            id="closeViewLessonModalButton"
            onClick={onClose}
            className="button-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewLessonModal;
