/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DragEvent } from "react";

// --- App Settings ---
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AppSettings {
  startOfWeekDay: 0 | 1; // 0 for Sunday, 1 for Monday
  darkMode: boolean;
  currency: Currency;
}

// --- Core Data Interfaces ---
export interface Student {
  id: string;
  name: string;
  color: string;
  balance: number;
}

export interface Lesson {
  id: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH:MM
  studentId: string;
  price: number;
  duration: number; // hours (0.5, 1, 1.5, 2)
  studentPhoneNumber?: string;
  recurringId?: string;
  isPaid: boolean;
  tips: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export type Page = "calendar" | "statistics" | "students";

// --- Modals Props Interfaces ---
export interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (
    lessonData: {
      studentNameInput: string;
      price: number;
      duration: number;
      hour: string;
      studentPhoneNumber?: string;
    },
    isWeekly: boolean
  ) => void;
  selectedDate: Date | null;
  selectedHourProp: string | null;
  students: Student[];
  currency: Currency;
}

export interface ViewLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (
    lessonId: string,
    recurringId?: string,
    lessonDate?: string
  ) => void;
  onTogglePaid: (lessonId: string) => void;
  onOpenAddTips: (lesson: Lesson) => void;
  onOpenChangePrice: (lesson: Lesson) => void;
  onOpenChangeTimeDuration: (lesson: Lesson) => void;
  lesson: Lesson | null;
  students: Student[];
  currency: Currency;
}

export interface AddTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTip: (tipAmount: number) => void;
  currentTips: number;
  lessonName: string;
  currency: Currency;
}

export interface ChangePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePrice: (newPrice: number, scope: "single" | "future") => void;
  currentPrice: number;
  isRecurring: boolean;
  lessonName: string;
  currency: Currency;
}

export interface ChangeTimeDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeTimeDuration: (
    newTime: string,
    newDuration: number,
    scope: "single" | "future"
  ) => void;
  currentHour: string;
  currentDuration: number;
  isRecurring: boolean;
  lessonName: string;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: "single" | "future") => void;
  title: string;
  message: string;
  confirmSingleText: string;
  confirmFutureText: string;
}

export interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
  studentName: string;
  currency: Currency;
}

export interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (count: number) => void;
  studentName: string;
}

export interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: { date: string; hour: string; price: number; duration: number }[];
  studentName: string;
  lessonCount: number;
  currency: Currency;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDay: 0 | 1;
  onUpdateStartDay: (day: 0 | 1) => void;
  currentDarkMode: boolean;
  onUpdateDarkMode: (enabled: boolean) => void;
  currentCurrency: Currency;
  onUpdateCurrency: (currency: Currency) => void;
}

// --- UI Component Props Interfaces ---
export interface ToastMessageProps {
  message: string;
  type: "success" | "info" | "error";
  onDismiss: () => void;
}

export interface ToastNotificationProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export interface TimeSlotCellProps {
  fullDate: Date;
  hour: string;
  lesson?: Lesson;
  studentName?: string;
  lessonColor?: string;
  onClick: (lesson?: Lesson) => void;
  isToday: boolean;
  onDragStartLesson?: (lessonId: string) => void;
  onDropOnSlot?: (event: React.DragEvent, date: Date, hour: string) => void;
  onDragOverSlot?: (event: React.DragEvent) => void;
  onDragEnterSlot?: (event: React.DragEvent, date: Date, hour: string) => void;
  onDragLeaveSlot?: (event: React.DragEvent) => void;
  isDragOverTarget: boolean;
  draggedLessonDuration?: number; // Duration of the lesson being dragged
  currency: Currency;
  touchDragHandlers?: {
    getTouchEventHandlers: (
      lessonId: string,
      targetDate: Date,
      targetHour: string
    ) => {
      onTouchStart: (e: React.TouchEvent) => void;
      onTouchMove: (e: React.TouchEvent) => void;
      onTouchEnd: (e: React.TouchEvent) => void;
    };
  };
}

export interface WeeklyCalendarProps {
  lessons: Lesson[];
  students: Student[];
  onTimeSlotClick: (date: Date, hour: string, lesson?: Lesson) => void;
  viewStartDate: Date;
  draggedLessonId: string | null;
  draggedLessonDuration: number;
  dragOverSlotInfo: { dateKey: string; hour: string } | null;
  onDragStartLesson: (lessonId: string) => void;
  onDropOnSlot: (event: React.DragEvent, date: Date, hour: string) => void;
  onDragOverSlot: (event: React.DragEvent) => void;
  onDragEnterSlot: (event: React.DragEvent, date: Date, hour: string) => void;
  onDragLeaveSlot: (event: React.DragEvent) => void;
  startOfWeekDay: 0 | 1;
  now: Date;
  currency: Currency;
}

export interface StatisticsPageProps {
  lessons: Lesson[];
  students: Student[];
  startOfWeekDay: 0 | 1;
  currency: Currency;
}

export interface StudentsPageProps {
  students: Student[];
  lessons: Lesson[];
  onUpdateStudentColor: (studentId: string, newColor: string) => void;
  onOpenTopUpModal: (student: Student) => void;
  onOpenReportConfigModal: (student: Student) => void;
  startOfWeekDay: 0 | 1;
  currency: Currency;
}
