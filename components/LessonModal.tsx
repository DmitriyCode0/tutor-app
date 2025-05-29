/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from "react";
import { LessonModalProps, Student } from "../types";
import {
  LOCAL_STORAGE_STUDENT_PRICES_KEY,
  NUM_RECURRING_WEEKS_TOTAL,
} from "../constants";
import { formatFullDateForDisplay } from "../utils/dateUtils";
import { getCurrencyLabel } from "../utils/currencyUtils";

function LessonModal({
  isOpen,
  onClose,
  onAddLesson,
  selectedDate,
  selectedHourProp,
  students,
  currency,
}: LessonModalProps) {
  const [studentNameInput, setStudentNameInput] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const [hour, setHour] = useState<string>("12:00");
  const [studentPhoneNumber, setStudentPhoneNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStudentNameInput("");
      setPrice("");
      setDuration(1);
      setHour(selectedHourProp || "12:00");
      setStudentPhoneNumber("");
      // Focus on the first input field when modal opens
      const firstInput = document.getElementById("studentNameInput");
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen, selectedHourProp]);

  useEffect(() => {
    if (studentNameInput.trim() && isOpen) {
      try {
        const storedPricesRaw = localStorage.getItem(
          LOCAL_STORAGE_STUDENT_PRICES_KEY
        );
        if (storedPricesRaw) {
          const storedPrices = JSON.parse(storedPricesRaw) as Record<
            string,
            number
          >;
          const studentPrice =
            storedPrices[studentNameInput.trim().toLowerCase()];
          if (studentPrice !== undefined) {
            setPrice(studentPrice.toString());
          }
        }
      } catch (error) {
        console.error(
          "Failed to read student prices from local storage:",
          error
        );
      }
    }
  }, [studentNameInput, isOpen]);

  const handleSubmit = (event: React.FormEvent, isWeekly: boolean) => {
    event.preventDefault();
    const priceNumber = parseFloat(price);
    if (
      !studentNameInput.trim() ||
      isNaN(priceNumber) ||
      priceNumber <= 0 ||
      !hour
    ) {
      alert("Please enter a valid name, a positive price, and a valid time.");
      return;
    }
    onAddLesson(
      {
        studentNameInput: studentNameInput.trim(),
        price: priceNumber,
        duration,
        hour,
        studentPhoneNumber: studentPhoneNumber.trim() || undefined,
      },
      isWeekly
    );
  };

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
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, handleEscKey]);

  if (!isOpen || !selectedDate) return null;
  const displayDateStr = formatFullDateForDisplay(selectedDate);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lesson-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="add-lesson-modal-title" className="modal-header">
          Add Lesson for {displayDateStr}
        </h3>
        <form onSubmit={(e) => handleSubmit(e, false)} className="modal-form">
          <div className="form-group">
            <label htmlFor="studentNameInput">Name:</label>
            <input
              id="studentNameInput"
              type="text"
              value={studentNameInput}
              onChange={(e) => setStudentNameInput(e.target.value)}
              required
              aria-required="true"
              list="students-datalist"
            />
            <datalist id="students-datalist">
              {students.map((student) => (
                <option key={student.id} value={student.name} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="priceInput">
              Price {getCurrencyLabel(currency)}:
            </label>
            <input
              id="priceInput"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              aria-required="true"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="hourInput">Time (HH:MM):</label>
            <input
              id="hourInput"
              type="time"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="durationSelect">Duration:</label>
            <select
              id="durationSelect"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              required
              aria-required="true"
            >
              <option value="0.5">0.5 hour</option>
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="studentPhoneNumberInput">
              Phone Number (Optional):
            </label>
            <input
              id="studentPhoneNumberInput"
              type="tel"
              value={studentPhoneNumber}
              onChange={(e) => setStudentPhoneNumber(e.target.value)}
              placeholder="e.g., 123-456-7890"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="button-primary">
              Add Lesson
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="button-primary add-weekly-button"
            >
              Add Weekly ({NUM_RECURRING_WEEKS_TOTAL} weeks)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonModal;
