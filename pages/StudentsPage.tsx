/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { StudentsPageProps, Student, Lesson } from "../types";
import { VIBRANT_COLORS, LOCAL_STORAGE_STUDENT_PRICES_KEY } from "../constants";
import {
  getWeekStartDate,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  parseTimeToDate,
} from "../utils/dateUtils";
import { formatCurrency } from "../utils/currencyUtils";

function StudentsPage({
  students,
  lessons,
  onUpdateStudentColor,
  onOpenTopUpModal,
  onOpenReportConfigModal,
  startOfWeekDay,
  currency,
}: StudentsPageProps) {
  const today = new Date();
  const currentWeekStart = getWeekStartDate(today, startOfWeekDay);
  const currentWeekEnd = getEndOfWeek(currentWeekStart, startOfWeekDay); // Pass start of week
  const currentMonthStart = getStartOfMonth(today);
  const currentMonthEnd = getEndOfMonth(today);

  const getLessonsInPeriodForStudent = (
    studentId: string,
    periodStart: Date,
    periodEnd: Date
  ) => {
    return lessons.filter((lesson) => {
      if (lesson.studentId !== studentId) return false;
      const lessonDateOnly = parseTimeToDate(lesson.date, "00:00");
      return lessonDateOnly >= periodStart && lessonDateOnly <= periodEnd;
    }).length;
  };

  const getAveragePriceForStudent = (studentId: string): string => {
    const studentLessons = lessons.filter(
      (lesson) => lesson.studentId === studentId
    );
    if (studentLessons.length === 0) return "N/A";
    const totalIncome = studentLessons.reduce(
      (sum, lesson) => sum + lesson.price,
      0
    );
    return formatCurrency(totalIncome / studentLessons.length, currency);
  };

  const getStoredStudentPrice = (studentName: string): number | undefined => {
    try {
      const storedPricesRaw = localStorage.getItem(
        LOCAL_STORAGE_STUDENT_PRICES_KEY
      );
      if (storedPricesRaw) {
        const storedPrices = JSON.parse(storedPricesRaw) as Record<
          string,
          number
        >;
        return storedPrices[studentName.toLowerCase()];
      }
    } catch (e) {
      console.error("Error reading student price from LS", e);
    }
    return undefined;
  };

  return (
    <div
      className="students-page"
      role="document"
      aria-labelledby="students-heading"
    >
      <h2 id="students-heading">Our Students</h2>
      {students.length > 0 ? (
        <ul className="student-list">
          {students.map((student) => {
            const studentPrice = getStoredStudentPrice(student.name);
            const remainingLessons =
              studentPrice && studentPrice > 0
                ? Math.floor(student.balance / studentPrice)
                : 0;

            return (
              <li key={student.id} className="student-item">
                <div className="student-info-main">
                  <div className="student-info-details">
                    <span className="student-name">{student.name}</span>
                    <span className="student-stat">
                      Avg. Price: {getAveragePriceForStudent(student.id)}
                    </span>
                    <span className="student-stat">
                      Balance: {formatCurrency(student.balance, currency)}
                      <button
                        onClick={() => onOpenTopUpModal(student)}
                        className="top-up-button"
                      >
                        Top Up/Deduct
                      </button>
                    </span>
                    <span className="student-stat">
                      Remaining Lessons (Est.):{" "}
                      {studentPrice ? remainingLessons : "N/A (Price not set)"}
                    </span>
                    <span className="student-stat">
                      Lessons This Week:{" "}
                      {getLessonsInPeriodForStudent(
                        student.id,
                        currentWeekStart,
                        currentWeekEnd
                      )}
                    </span>
                    <span className="student-stat">
                      Lessons This Month:{" "}
                      {getLessonsInPeriodForStudent(
                        student.id,
                        currentMonthStart,
                        currentMonthEnd
                      )}
                    </span>
                    <button
                      onClick={() => onOpenReportConfigModal(student)}
                      className="button-secondary student-report-button"
                    >
                      Generate Report
                    </button>
                  </div>
                  <div
                    className="color-picker-grid"
                    role="radiogroup"
                    aria-label={`Choose color for ${student.name}`}
                  >
                    {VIBRANT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch-button ${
                          student.color === color ? "selected-color-swatch" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => onUpdateStudentColor(student.id, color)}
                        aria-label={`Set color to ${color}`}
                        role="radio"
                        aria-checked={student.color === color}
                      >
                        {student.color === color && (
                          <span
                            className="color-swatch-checkmark"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>
          No students have been added yet. Add a lesson to create a student
          profile.
        </p>
      )}
    </div>
  );
}
export default StudentsPage;
