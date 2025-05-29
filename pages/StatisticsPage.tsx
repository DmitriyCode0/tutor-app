/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from "react";
import { StatisticsPageProps, Lesson, Student } from "../types";
import {
  getWeekStartDate,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getPreviousPeriod,
  parseTimeToDate,
} from "../utils/dateUtils";
import { formatCurrency } from "../utils/currencyUtils";

function StatisticsPage({
  lessons,
  students,
  startOfWeekDay,
  currency,
}: StatisticsPageProps) {
  const [statsView, setStatsView] = useState<"monthly" | "weekly" | "overall">(
    "monthly"
  );
  const today = new Date();
  const currentMonthName = today.toLocaleDateString("en-US", { month: "long" });

  const getPeriodStats = useCallback(
    (periodStart: Date, periodEnd: Date) => {
      const periodLessons = lessons.filter((lesson) => {
        const lessonDateOnly = parseTimeToDate(lesson.date, "00:00");
        return lessonDateOnly >= periodStart && lessonDateOnly <= periodEnd;
      });

      const paidLessonsInPeriod = periodLessons.filter((l) => l.isPaid);
      const income = paidLessonsInPeriod.reduce(
        (sum, lesson) => sum + lesson.price,
        0
      );
      const tips = paidLessonsInPeriod.reduce(
        (sum, lesson) => sum + (lesson.tips || 0),
        0
      );
      const count = periodLessons.length;

      return { income, tips, count, paidCount: paidLessonsInPeriod.length };
    },
    [lessons]
  );

  const getEstimatedMonthlyIncome = useCallback(() => {
    const monthStart = getStartOfMonth(today);
    const monthEnd = getEndOfMonth(today);
    return lessons
      .filter((lesson) => {
        const lessonDateOnly = parseTimeToDate(lesson.date, "00:00");
        return lessonDateOnly >= monthStart && lessonDateOnly <= monthEnd;
      })
      .reduce((sum, lesson) => sum + lesson.price, 0);
  }, [lessons]);

  const formatPercentageChange = (
    current: number,
    previous: number
  ): string => {
    if (previous === 0) {
      return current > 0 ? "+∞%" : "N/A";
    }
    if (current === 0 && previous === 0) return "N/A";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  let currentPeriodStart: Date, currentPeriodEnd: Date;
  let previousPeriodStart: Date, previousPeriodEnd: Date;
  let currentPeriodLabel: string = "";

  if (statsView === "weekly") {
    currentPeriodStart = getWeekStartDate(today, startOfWeekDay);
    currentPeriodEnd = getEndOfWeek(currentPeriodStart, startOfWeekDay); // Use start of week to get end
    const prevWeekStartDay = getPreviousPeriod(
      currentPeriodStart,
      "week",
      startOfWeekDay
    );
    previousPeriodStart = getWeekStartDate(prevWeekStartDay, startOfWeekDay);
    previousPeriodEnd = getEndOfWeek(previousPeriodStart, startOfWeekDay);
    currentPeriodLabel = "This Week";
  } else if (statsView === "monthly") {
    currentPeriodStart = getStartOfMonth(today);
    currentPeriodEnd = getEndOfMonth(today);
    const prevMonthStartDay = getPreviousPeriod(
      currentPeriodStart,
      "month",
      startOfWeekDay
    ); // Pass start of current month
    previousPeriodStart = getStartOfMonth(prevMonthStartDay);
    previousPeriodEnd = getEndOfMonth(previousPeriodStart);
    currentPeriodLabel = currentMonthName;
  }

  const statsCurrentPeriod =
    statsView === "weekly" || statsView === "monthly"
      ? getPeriodStats(currentPeriodStart!, currentPeriodEnd!)
      : { income: 0, tips: 0, count: 0, paidCount: 0 };
  const statsPreviousPeriod =
    statsView === "weekly" || statsView === "monthly"
      ? getPeriodStats(previousPeriodStart!, previousPeriodEnd!)
      : { income: 0, tips: 0, count: 0, paidCount: 0 };

  const estimatedMonthlyIncomeValue =
    statsView === "monthly" ? getEstimatedMonthlyIncome() : 0;
  const overallMonthlyIncomeValue =
    statsView === "monthly"
      ? statsCurrentPeriod.income + statsCurrentPeriod.tips
      : 0;

  const currentMonthStartForBestClients = getStartOfMonth(today);
  const currentMonthEndForBestClients = getEndOfMonth(today);
  const paidLessonsThisMonthForBestClients = lessons.filter((l) => {
    const lessonDateOnly = parseTimeToDate(l.date, "00:00");
    return (
      l.isPaid &&
      lessonDateOnly >= currentMonthStartForBestClients &&
      lessonDateOnly <= currentMonthEndForBestClients
    );
  });

  const studentContributions: Record<string, number> = {};
  paidLessonsThisMonthForBestClients.forEach((l) => {
    studentContributions[l.studentId] =
      (studentContributions[l.studentId] || 0) + l.price + (l.tips || 0);
  });

  const topStudents = Object.entries(studentContributions)
    .map(([studentId, total]) => ({
      studentId,
      name: students.find((s) => s.id === studentId)?.name || "Unknown Student",
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const totalIncomeAllTime = lessons
    .filter((l) => l.isPaid)
    .reduce((sum, l) => sum + l.price + (l.tips || 0), 0);
  const totalLessonsAllTime = lessons.length;

  return (
    <div
      className="statistics-page"
      role="document"
      aria-labelledby="statistics-heading"
    >
      <h2 id="statistics-heading">Income & Activity Statistics</h2>
      <div className="stats-view-toggle">
        <button
          onClick={() => setStatsView("weekly")}
          className={`view-toggle-button ${
            statsView === "weekly" ? "active" : ""
          }`}
          aria-pressed={statsView === "weekly"}
        >
          Weekly Stats
        </button>
        <button
          onClick={() => setStatsView("monthly")}
          className={`view-toggle-button ${
            statsView === "monthly" ? "active" : ""
          }`}
          aria-pressed={statsView === "monthly"}
        >
          Monthly Stats
        </button>
        <button
          onClick={() => setStatsView("overall")}
          className={`view-toggle-button ${
            statsView === "overall" ? "active" : ""
          }`}
          aria-pressed={statsView === "overall"}
        >
          Overall Stats
        </button>
      </div>

      <div className="stats-grid">
        {(statsView === "weekly" || statsView === "monthly") && (
          <>
            <div className="stat-card">
              <h3>Income (Paid Lessons) - {currentPeriodLabel}</h3>
              <p className="income-amount">
                {formatCurrency(statsCurrentPeriod.income, currency)}
              </p>
              <p className="stat-comparison">
                vs Prev. Period:{" "}
                {formatCurrency(statsPreviousPeriod.income, currency)} (
                {formatPercentageChange(
                  statsCurrentPeriod.income,
                  statsPreviousPeriod.income
                )}
                )
              </p>
              <p className="stat-placeholder">[Graph: Income Trend]</p>
            </div>
            <div className="stat-card">
              <h3>Tips - {currentPeriodLabel}</h3>
              <p className="income-amount">
                {formatCurrency(statsCurrentPeriod.tips, currency)}
              </p>
              <p className="stat-comparison">
                vs Prev. Period:{" "}
                {formatCurrency(statsPreviousPeriod.tips, currency)} (
                {formatPercentageChange(
                  statsCurrentPeriod.tips,
                  statsPreviousPeriod.tips
                )}
                )
              </p>
            </div>
            <div className="stat-card">
              <h3>Lessons Scheduled - {currentPeriodLabel}</h3>
              <p className="lesson-count">{statsCurrentPeriod.count}</p>
              <p className="stat-comparison">
                vs Prev. Period: {statsPreviousPeriod.count} (
                {formatPercentageChange(
                  statsCurrentPeriod.count,
                  statsPreviousPeriod.count
                )}
                )
              </p>
              <p className="stat-placeholder">[Graph: Lessons Trend]</p>
            </div>
          </>
        )}

        {statsView === "monthly" && (
          <>
            <div className="stat-card">
              <h3>Overall {currentMonthName} Income (Paid + Tips)</h3>
              <p className="income-amount">
                {formatCurrency(overallMonthlyIncomeValue, currency)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Estimated Monthly Income (All Scheduled Lesson Prices)</h3>
              <p className="income-amount">
                {formatCurrency(estimatedMonthlyIncomeValue, currency)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Top 3 Clients This Month</h3>
              {topStudents.length > 0 ? (
                <ul className="best-clients-list">
                  {topStudents.map((s) => (
                    <li key={s.studentId}>
                      {s.name}: {formatCurrency(s.total, currency)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="placeholder-text">No paid lessons this month.</p>
              )}
            </div>
          </>
        )}

        {statsView === "overall" && (
          <>
            <div className="stat-card">
              <h3>Total Income (All Time - Paid Lessons + Tips)</h3>
              <p className="income-amount">
                {formatCurrency(totalIncomeAllTime, currency)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Total Recorded Lessons (All Time)</h3>
              <p className="lesson-count">{totalLessonsAllTime}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StatisticsPage;
