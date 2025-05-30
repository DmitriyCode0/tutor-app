/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from "react";

import {
  AppSettings,
  Student,
  Lesson,
  Toast,
  Page,
  Currency,
  User,
  SyncStatus,
  AuthCredentials,
} from "./types";
import {
  DAY_NAMES_FULL,
  DAY_NAMES_SHORT,
  HOURS_OF_THE_DAY,
  VIBRANT_COLORS,
  LOCAL_STORAGE_STUDENT_PRICES_KEY,
  LOCAL_STORAGE_LESSONS_KEY,
  LOCAL_STORAGE_STUDENTS_KEY,
  LOCAL_STORAGE_SETTINGS_KEY,
  LOCAL_STORAGE_ARCHIVED_STUDENTS_KEY,
  NUM_RECURRING_WEEKS_TOTAL,
  NUM_WEEKS_TO_DISPLAY,
  DEFAULT_CURRENCY,
} from "./constants";
import {
  getWeekStartDate,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getPreviousPeriod,
  addDays,
  formatDateForHeader,
  formatDateForStorage,
  formatFullDateForDisplay,
  parseTimeToDate,
} from "./utils/dateUtils";
import { checkConflict } from "./utils/lessonUtils";
import { formatCurrency } from "./utils/currencyUtils";
import { useResponsive } from "./utils/responsiveUtils";
import { cloudSyncService, downloadFile } from "./utils/cloudSyncUtils";

import LessonModal from "./components/LessonModal";
import ViewLessonModal from "./components/ViewLessonModal";
import AddTipsModal from "./components/AddTipsModal";
import ChangePriceModal from "./components/ChangePriceModal";
import ChangeTimeDurationModal from "./components/ChangeTimeDurationModal";
import ConfirmModal from "./components/ConfirmModal";
import TopUpModal from "./components/TopUpModal";
import ReportConfigModal from "./components/ReportConfigModal";
import ReportViewModal from "./components/ReportViewModal";
import SettingsModal from "./components/SettingsModal";
import ToastNotification from "./components/ToastNotification";
import WeeklyCalendar from "./components/WeeklyCalendar";
import StatisticsPage from "./pages/StatisticsPage";
import StudentsPage from "./pages/StudentsPage";
import TutorLogo from "./components/TutorLogo";
import UserCabinetModal from "./components/UserCabinetModal";

function App() {
  const { isMobile, isTouch } = useResponsive();
  const [currentPage, setCurrentPage] = useState<Page>("calendar");
  const [lessons, setLessonsState] = useState<Lesson[]>([]);
  const [students, setStudentsState] = useState<Student[]>([]);

  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{
    date: Date;
    hour: string;
  } | null>(null);

  const [isViewLessonModalOpen, setIsViewLessonModalOpen] = useState(false);
  const [selectedLessonToView, setSelectedLessonToView] =
    useState<Lesson | null>(null);

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedStudentForTopUp, setSelectedStudentForTopUp] =
    useState<Student | null>(null);

  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [draggedLessonDuration, setDraggedLessonDuration] =
    useState<number>(0.5); // Default to 30min
  const [dragOverSlotInfo, setDragOverSlotInfo] = useState<{
    dateKey: string;
    hour: string;
  } | null>(null);

  const [
    isConfirmDeleteRecurringModalOpen,
    setIsConfirmDeleteRecurringModalOpen,
  ] = useState(false);
  const [lessonToDeleteInfo, setLessonToDeleteInfo] = useState<{
    lessonId: string;
    recurringId?: string;
    lessonDate: string;
  } | null>(null);

  const [
    isConfirmUpdateTimeRecurringModalOpen,
    setIsConfirmUpdateTimeRecurringModalOpen,
  ] = useState(false);
  const [updateTimeInfo, setUpdateTimeInfo] = useState<{
    lessonId: string;
    recurringId: string;
    originalDate: string;
    newDate: Date;
    newHour: string;
    newDuration: number;
  } | null>(null);

  const [isAddTipsModalOpen, setIsAddTipsModalOpen] = useState(false);
  const [lessonForTips, setLessonForTips] = useState<Lesson | null>(null);

  const [isChangePriceModalOpen, setIsChangePriceModalOpen] = useState(false);
  const [lessonForPriceChange, setLessonForPriceChange] =
    useState<Lesson | null>(null);

  const [isChangeTimeDurationModalOpen, setIsChangeTimeDurationModalOpen] =
    useState(false);
  const [lessonForTimeDurationChange, setLessonForTimeDurationChange] =
    useState<Lesson | null>(null);

  const [isReportConfigModalOpen, setIsReportConfigModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] =
    useState<Student | null>(null);
  const [isReportViewModalOpen, setIsReportViewModalOpen] = useState(false);
  const [generatedReportData, setGeneratedReportData] = useState<
    { date: string; hour: string; price: number; duration: number }[]
  >([]);
  const [reportLessonCount, setReportLessonCount] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // User Cabinet state
  const [isUserCabinetModalOpen, setIsUserCabinetModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingChanges: 0,
  });

  const [appSettings, setAppSettingsState] = useState<AppSettings>({
    startOfWeekDay: 0,
    darkMode: false,
    currency: DEFAULT_CURRENCY,
  });

  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    const savedSettings = savedSettingsRaw
      ? (JSON.parse(savedSettingsRaw) as Partial<AppSettings>)
      : {};
    const initialStartDay =
      savedSettings.startOfWeekDay === 0 || savedSettings.startOfWeekDay === 1
        ? savedSettings.startOfWeekDay
        : 0;
    return getWeekStartDate(new Date(), initialStartDay);
  });

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(
          savedSettingsRaw
        ) as Partial<AppSettings>;
        setAppSettingsState((prev) => ({
          startOfWeekDay:
            savedSettings.startOfWeekDay === 0 ||
            savedSettings.startOfWeekDay === 1
              ? savedSettings.startOfWeekDay
              : 0,
          darkMode:
            typeof savedSettings.darkMode === "boolean"
              ? savedSettings.darkMode
              : false,
          currency: savedSettings.currency || DEFAULT_CURRENCY,
        }));
      } catch (e) {
        console.error("Error parsing settings from LS", e);
        setAppSettingsState({
          startOfWeekDay: 0,
          darkMode: false,
          currency: DEFAULT_CURRENCY,
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_SETTINGS_KEY,
      JSON.stringify(appSettings)
    );
    setViewStartDate((currentViewDate) =>
      getWeekStartDate(currentViewDate, appSettings.startOfWeekDay)
    );
    if (appSettings.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    // Notify cloud sync service of settings change
    cloudSyncService.notifyDataChange();
  }, [appSettings]);

  // Cloud sync initialization and status monitoring
  useEffect(() => {
    // Check for existing user session
    const existingUser = cloudSyncService.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
      cloudSyncService.enableAutoSync();
    }

    // Set up sync status monitoring
    const unsubscribeSync = cloudSyncService.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    // Set up online/offline status monitoring
    const handleOnlineStatusChange = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      unsubscribeSync();
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  // Track pending changes for sync
  useEffect(() => {
    setSyncStatus((prev) => ({ ...prev, pendingChanges: 0 })); // Could be enhanced to track actual changes
  }, [students, lessons, appSettings]);

  const addToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const parseLessons = (savedLessons: string | null): Lesson[] => {
    if (savedLessons) {
      try {
        const parsed = JSON.parse(savedLessons) as Partial<Lesson>[];
        return parsed
          .map((l) => ({
            id: l.id || "",
            date: l.date || formatDateForStorage(new Date()),
            hour: l.hour || "12:00",
            studentId: l.studentId || "",
            price: typeof l.price === "number" ? l.price : 0,
            duration: typeof l.duration === "number" ? l.duration : 1, // Default duration 1 hour
            studentPhoneNumber: l.studentPhoneNumber || undefined,
            recurringId: l.recurringId || undefined,
            isPaid: typeof l.isPaid === "boolean" ? l.isPaid : false,
            tips: typeof l.tips === "number" ? l.tips : 0,
          }))
          .filter((l) => l.id && l.date && l.hour && l.studentId);
      } catch (e) {
        console.error("Error parsing lessons from LS", e);
      }
    }
    return [];
  };

  const parseStudents = (savedStudents: string | null): Student[] => {
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents) as Partial<Student>[];
        return parsed
          .map((s) => ({
            id: s.id || "",
            name: s.name || "Unknown Student",
            color: s.color || VIBRANT_COLORS[0],
            balance: typeof s.balance === "number" ? s.balance : 0,
          }))
          .filter((s) => s.id && s.name);
      } catch (e) {
        console.error("Error parsing students from LS", e);
      }
    }
    return [];
  };

  const autoUpdateAllStudentLessonPaidStatus = useCallback(
    (currentLessons: Lesson[], currentStudents: Student[]): Lesson[] => {
      // With the new post-payment system, lessons should remain unpaid until manually marked as paid
      // Auto-payment is disabled as it doesn't fit the new income tracking model
      return currentLessons || [];
    },
    []
  );

  useEffect(() => {
    const loadedStudents = parseStudents(
      localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY)
    );
    const loadedLessons = parseLessons(
      localStorage.getItem(LOCAL_STORAGE_LESSONS_KEY)
    );

    setStudentsState(loadedStudents);
    setLessonsState(
      autoUpdateAllStudentLessonPaidStatus(loadedLessons, loadedStudents)
    );
  }, [autoUpdateAllStudentLessonPaidStatus]);

  useEffect(() => {
    if (lessons.length > 0) {
      // Only save if lessons exist to avoid overwriting with empty array on initial bug
      localStorage.setItem(LOCAL_STORAGE_LESSONS_KEY, JSON.stringify(lessons));
      // Notify cloud sync service of data change
      cloudSyncService.notifyDataChange();
    }
  }, [lessons]);

  useEffect(() => {
    if (students.length > 0) {
      // Avoid overwriting with empty
      localStorage.setItem(
        LOCAL_STORAGE_STUDENTS_KEY,
        JSON.stringify(students)
      );
      // Notify cloud sync service of data change
      cloudSyncService.notifyDataChange();
    }
  }, [students]);

  const setLessons = useCallback(
    (newLessonsOrFn: React.SetStateAction<Lesson[]>) => {
      setLessonsState((prevLessons) => {
        const updatedLessonsRaw =
          typeof newLessonsOrFn === "function"
            ? newLessonsOrFn(prevLessons)
            : newLessonsOrFn;
        return autoUpdateAllStudentLessonPaidStatus(
          updatedLessonsRaw,
          students
        );
      });
    },
    [students, autoUpdateAllStudentLessonPaidStatus]
  );

  const setStudentsAndUpdateLessons = useCallback(
    (newStudentsOrFn: React.SetStateAction<Student[]>) => {
      setStudentsState((prevStudents) => {
        const updatedStudents =
          typeof newStudentsOrFn === "function"
            ? newStudentsOrFn(prevStudents)
            : newStudentsOrFn;
        setLessonsState((currentLs) =>
          autoUpdateAllStudentLessonPaidStatus(currentLs, updatedStudents)
        );
        return updatedStudents;
      });
    },
    [autoUpdateAllStudentLessonPaidStatus]
  );

  const navigateTo = (page: Page) => setCurrentPage(page);
  const handleGoToToday = () =>
    setViewStartDate(getWeekStartDate(new Date(), appSettings.startOfWeekDay));
  const handlePreviousWeek = () =>
    setViewStartDate((prev) =>
      getWeekStartDate(addDays(prev, -7), appSettings.startOfWeekDay)
    );
  const handleNextWeek = () =>
    setViewStartDate((prev) =>
      getWeekStartDate(addDays(prev, 7), appSettings.startOfWeekDay)
    );

  const handleTimeSlotClick = (date: Date, hour: string, lesson?: Lesson) => {
    if (lesson) {
      setSelectedLessonToView(lesson);
      setIsViewLessonModalOpen(true);
    } else {
      setSelectedSlotInfo({ date, hour });
      setIsAddLessonModalOpen(true);
    }
  };

  const handleCloseAddLessonModal = () => {
    setIsAddLessonModalOpen(false);
    setSelectedSlotInfo(null);
  };

  const handleCloseViewLessonModal = () => {
    setIsViewLessonModalOpen(false);
    setSelectedLessonToView(null);
  };

  const handleOpenTopUpModal = (student: Student) => {
    setSelectedStudentForTopUp(student);
    setIsTopUpModalOpen(true);
  };
  const handleCloseTopUpModal = () => {
    setIsTopUpModalOpen(false);
    setSelectedStudentForTopUp(null);
  };
  const handleTopUpBalance = (amount: number) => {
    if (!selectedStudentForTopUp) return;
    setStudentsAndUpdateLessons((prevStudents) =>
      prevStudents.map((s) =>
        s.id === selectedStudentForTopUp.id
          ? { ...s, balance: s.balance + amount }
          : s
      )
    );
    handleCloseTopUpModal();
    addToast(`Income adjusted for ${selectedStudentForTopUp.name}.`, "success");
  };

  const handleOpenAddTipsModal = (lesson: Lesson) => {
    setLessonForTips(lesson);
    setIsAddTipsModalOpen(true);
  };
  const handleCloseAddTipsModal = () => {
    setIsAddTipsModalOpen(false);
    setLessonForTips(null);
  };
  const handleAddTipToLesson = (tipAmount: number) => {
    if (!lessonForTips) return;
    setLessons((prevLessons) =>
      prevLessons.map((l) =>
        l.id === lessonForTips.id ? { ...l, tips: tipAmount } : l
      )
    );
    handleCloseAddTipsModal();
    addToast(`Tips updated for lesson.`, "success");
  };

  const handleOpenChangePriceModal = (lesson: Lesson) => {
    setLessonForPriceChange(lesson);
    setIsChangePriceModalOpen(true);
  };
  const handleCloseChangePriceModal = () => {
    setIsChangePriceModalOpen(false);
    setLessonForPriceChange(null);
  };
  const handleChangeLessonPrice = (
    newPrice: number,
    scope: "single" | "future"
  ) => {
    if (!lessonForPriceChange) return;

    let lessonsAfterPriceChange = lessons.map((l) => {
      if (scope === "single" && l.id === lessonForPriceChange.id) {
        return { ...l, price: newPrice };
      }
      if (
        scope === "future" &&
        l.recurringId === lessonForPriceChange.recurringId &&
        parseTimeToDate(l.date, l.hour) >=
          parseTimeToDate(lessonForPriceChange.date, lessonForPriceChange.hour)
      ) {
        return { ...l, price: newPrice };
      }
      return l;
    });

    setLessons(lessonsAfterPriceChange); // This will trigger autoUpdate via its internal setLessonsState
    handleCloseChangePriceModal();
    addToast(`Lesson price updated.`, "success");
  };

  const handleToggleLessonPaidStatus = (lessonId: string) => {
    handleCloseViewLessonModal();
    const lessonToToggle = lessons.find((l) => l.id === lessonId);
    if (!lessonToToggle) return;

    const studentOfLesson = students.find(
      (s) => s.id === lessonToToggle.studentId
    );
    if (!studentOfLesson) {
      addToast("Error: Student not found for this lesson.", "error");
      return;
    }

    const isNowPaid = !lessonToToggle.isPaid;
    let priceAdjustment = 0;

    if (isNowPaid) {
      // Trying to mark as PAID - ADD to balance (income received)
      priceAdjustment = lessonToToggle.price; // Add to balance
    } else {
      // Trying to mark as UNPAID - SUBTRACT from balance (reverse income)
      priceAdjustment = -lessonToToggle.price; // Subtract from balance
    }

    const updatedStudents = students.map((s) =>
      s.id === studentOfLesson.id
        ? { ...s, balance: s.balance + priceAdjustment }
        : s
    );

    const lessonsAfterDirectToggle = lessons.map((l) => {
      if (l.id === lessonId) {
        return { ...l, isPaid: isNowPaid, tips: isNowPaid ? l.tips : 0 };
      }
      return l;
    });

    setStudentsAndUpdateLessons(updatedStudents);
    setLessons(lessonsAfterDirectToggle);

    addToast(
      isNowPaid ? "Lesson marked as paid." : "Lesson marked as unpaid.",
      "success"
    );
  };

  const handleAddLesson = (
    {
      studentNameInput,
      price,
      duration,
      hour,
      studentPhoneNumber,
    }: {
      studentNameInput: string;
      price: number;
      duration: number;
      hour: string;
      studentPhoneNumber?: string;
    },
    isWeekly: boolean
  ) => {
    if (!selectedSlotInfo && !isWeekly) {
      // For weekly, we might not have a selectedSlotInfo if it's a general add.
      // For now, weekly also needs a selectedSlotInfo. Future enhancement: allow adding weekly without a specific slot.
      addToast("Error: No slot selected to add the lesson.", "error");
      return;
    }
    const baseDate = selectedSlotInfo?.date || new Date(); // Fallback for safety, though should be present

    let studentId: string;
    const studentNameTrimmed = studentNameInput.trim();
    const studentNameTrimmedLower = studentNameTrimmed.toLowerCase();
    let studentToUpdate = students.find(
      (s) => s.name.toLowerCase() === studentNameTrimmedLower
    );
    let newStudentsArray = students;

    if (studentToUpdate) {
      studentId = studentToUpdate.id;
    } else {
      const newStudent: Student = {
        id:
          Date.now().toString() +
          Math.random().toString(36).substring(2, 9) +
          "_student",
        name: studentNameTrimmed,
        color: VIBRANT_COLORS[students.length % VIBRANT_COLORS.length],
        balance: 0,
      };
      newStudentsArray = [...students, newStudent];
      studentId = newStudent.id;
    }

    const lessonsToAdd: Lesson[] = [];
    const baseLessonId =
      Date.now().toString() +
      Math.random().toString(36).substring(2, 9) +
      "_lesson";
    const recurringId = isWeekly ? baseLessonId + "_recur" : undefined;

    const firstLessonDateString = formatDateForStorage(baseDate);

    if (
      checkConflict(
        baseLessonId,
        firstLessonDateString,
        hour,
        duration,
        lessons
      )
    ) {
      addToast(
        "Cannot add lesson: Time slot conflicts with an existing lesson.",
        "error"
      );
      return;
    }

    const firstLesson: Lesson = {
      id: baseLessonId,
      date: firstLessonDateString,
      hour,
      studentId,
      price,
      duration,
      studentPhoneNumber,
      recurringId,
      isPaid: false,
      tips: 0,
    };
    lessonsToAdd.push(firstLesson);

    if (isWeekly && recurringId) {
      for (let i = 1; i < NUM_RECURRING_WEEKS_TOTAL; i++) {
        const nextDate = addDays(baseDate, i * 7);
        const nextDateString = formatDateForStorage(nextDate);
        const currentCheckLessonId = baseLessonId + `_recur_${i}`;

        if (
          checkConflict(currentCheckLessonId, nextDateString, hour, duration, [
            ...lessons,
            ...lessonsToAdd.filter((l) => l.id !== currentCheckLessonId),
          ])
        ) {
          addToast(
            `Skipping recurring lesson on ${nextDateString} at ${hour} due to conflict.`,
            "info"
          );
          continue;
        }

        lessonsToAdd.push({
          id: currentCheckLessonId,
          date: nextDateString,
          hour,
          studentId,
          price,
          duration,
          studentPhoneNumber,
          recurringId,
          isPaid: false,
          tips: 0,
        });
      }
    }

    const finalLessonsForUpdate = [...lessons, ...lessonsToAdd];

    if (students !== newStudentsArray) {
      setStudentsAndUpdateLessons(newStudentsArray);
      setLessons(finalLessonsForUpdate);
    } else {
      setLessons(finalLessonsForUpdate);
    }

    try {
      const storedPricesRaw = localStorage.getItem(
        LOCAL_STORAGE_STUDENT_PRICES_KEY
      );
      const storedPrices = storedPricesRaw
        ? (JSON.parse(storedPricesRaw) as Record<string, number>)
        : {};
      storedPrices[studentNameTrimmedLower] = price;
      localStorage.setItem(
        LOCAL_STORAGE_STUDENT_PRICES_KEY,
        JSON.stringify(storedPrices)
      );
    } catch (error) {
      console.error("Failed to save student price to local storage:", error);
    }
    handleCloseAddLessonModal();
    addToast(
      isWeekly
        ? `${lessonsToAdd.length} weekly lesson(s) added.`
        : "Lesson added.",
      "success"
    );
  };

  const handleDeleteLesson = (
    lessonId: string,
    recurringId?: string,
    lessonDateString?: string
  ) => {
    if (recurringId && lessonDateString) {
      setLessonToDeleteInfo({
        lessonId,
        recurringId,
        lessonDate: lessonDateString,
      });
      setIsConfirmDeleteRecurringModalOpen(true);
    } else {
      const lessonToDelete = lessons.find((l) => l.id === lessonId);
      let priceOfDeletedLesson = 0;
      let studentIdOfDeletedLesson: string | undefined;
      let wasPaid = false;

      if (lessonToDelete) {
        studentIdOfDeletedLesson = lessonToDelete.studentId;
        priceOfDeletedLesson = lessonToDelete.price;
        wasPaid = lessonToDelete.isPaid;
      }

      const newLessons = lessons.filter((l) => l.id !== lessonId);

      if (wasPaid && studentIdOfDeletedLesson) {
        setStudentsAndUpdateLessons((prevStudents) =>
          prevStudents.map((s) =>
            s.id === studentIdOfDeletedLesson
              ? { ...s, balance: s.balance + priceOfDeletedLesson }
              : s
          )
        );
      }
      setLessons(newLessons);
      addToast("Lesson deleted.", "success");
    }
    handleCloseViewLessonModal();
  };

  const handleConfirmDeleteRecurring = (action: "single" | "future") => {
    if (!lessonToDeleteInfo) return;
    const { lessonId, recurringId, lessonDate } = lessonToDeleteInfo;

    let lessonsRemovedWerePaidAndNeedRefund: {
      studentId: string;
      amount: number;
    }[] = [];
    let finalLessons: Lesson[];

    if (action === "single") {
      const lessonToDelete = lessons.find((l) => l.id === lessonId);
      if (lessonToDelete?.isPaid) {
        lessonsRemovedWerePaidAndNeedRefund.push({
          studentId: lessonToDelete.studentId,
          amount: lessonToDelete.price,
        });
      }
      finalLessons = lessons.filter((l) => l.id !== lessonId);
    } else if (action === "future" && recurringId) {
      const lessonDateObj = parseTimeToDate(lessonDate, "00:00");
      finalLessons = lessons.filter((l) => {
        if (
          l.recurringId === recurringId &&
          parseTimeToDate(l.date, "00:00") >= lessonDateObj
        ) {
          if (l.isPaid) {
            lessonsRemovedWerePaidAndNeedRefund.push({
              studentId: l.studentId,
              amount: l.price,
            });
          }
          return false;
        }
        return true;
      });
    } else {
      finalLessons = [...lessons];
    }

    if (lessonsRemovedWerePaidAndNeedRefund.length > 0) {
      setStudentsAndUpdateLessons((prevStudents) => {
        const studentBalancesToUpdate = new Map<string, number>();
        lessonsRemovedWerePaidAndNeedRefund.forEach((refund) => {
          studentBalancesToUpdate.set(
            refund.studentId,
            (studentBalancesToUpdate.get(refund.studentId) || 0) + refund.amount
          );
        });
        return prevStudents.map((s) =>
          studentBalancesToUpdate.has(s.id)
            ? {
                ...s,
                balance: s.balance + (studentBalancesToUpdate.get(s.id) || 0),
              }
            : s
        );
      });
    }
    setLessons(finalLessons);
    addToast("Recurring lessons updated.", "success");
    setIsConfirmDeleteRecurringModalOpen(false);
    setLessonToDeleteInfo(null);
  };

  const handleUpdateStudentColor = (studentId: string, newColor: string) => {
    setStudentsState((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, color: newColor } : student
      )
    );
  };

  const handleArchiveStudent = (studentId: string) => {
    const studentToArchive = students.find((s) => s.id === studentId);
    if (!studentToArchive) {
      addToast("Error: Student not found for archiving.", "error");
      return;
    }

    // Archive the student by adding archived flags
    const archivedStudent = {
      ...studentToArchive,
      isArchived: true,
      archivedDate: new Date().toISOString(),
    };

    // Remove student from active students list
    const updatedActiveStudents = students.filter((s) => s.id !== studentId);

    // Get or create archived students list
    let archivedStudents: Student[] = [];
    try {
      const storedArchivedRaw = localStorage.getItem(LOCAL_STORAGE_ARCHIVED_STUDENTS_KEY);
      if (storedArchivedRaw) {
        archivedStudents = JSON.parse(storedArchivedRaw);
      }
    } catch (e) {
      console.error("Error loading archived students", e);
    }

    // Add to archived students
    const updatedArchivedStudents = [...archivedStudents, archivedStudent];

    // Get current date for filtering future lessons
    const now = new Date();

    // Find future lessons for this student that need to be deleted
    const lessonsToRemove: string[] = [];
    const refundsNeeded: { studentId: string; amount: number }[] = [];

    lessons.forEach((lesson) => {
      if (lesson.studentId === studentId) {
        const lessonDate = parseTimeToDate(lesson.date, lesson.hour);
        if (lessonDate > now) {
          // This is a future lesson, mark for deletion
          lessonsToRemove.push(lesson.id);
          if (lesson.isPaid) {
            // If the lesson was paid, add refund to student balance
            refundsNeeded.push({ studentId, amount: lesson.price });
          }
        }
      }
    });

    // Remove future lessons
    const updatedLessons = lessons.filter((lesson) => !lessonsToRemove.includes(lesson.id));

    // Calculate total refund amount
    const totalRefund = refundsNeeded.reduce((sum, refund) => sum + refund.amount, 0);

    // Update archived student's balance with refund if any
    if (totalRefund > 0) {
      archivedStudent.balance += totalRefund;
      updatedArchivedStudents[updatedArchivedStudents.length - 1] = archivedStudent;
    }

    // Update state and localStorage
    setStudentsState(updatedActiveStudents);
    setLessons(updatedLessons);
    localStorage.setItem(LOCAL_STORAGE_ARCHIVED_STUDENTS_KEY, JSON.stringify(updatedArchivedStudents));

    const refundMessage = totalRefund > 0 ? ` Balance of ${formatCurrency(totalRefund, appSettings.currency)} refunded for deleted future lessons.` : '';
    addToast(`${studentToArchive.name} has been archived.${refundMessage}`, "success");
  };

  const handleDeleteStudent = (studentId: string) => {
    const studentToDelete = students.find((s) => s.id === studentId);
    if (!studentToDelete) {
      addToast("Error: Student not found for deletion.", "error");
      return;
    }

    // Get current date for filtering future lessons
    const now = new Date();

    // Find future lessons for this student that need to be deleted
    const lessonsToRemove: string[] = [];
    const refundsNeeded: { studentId: string; amount: number }[] = [];

    lessons.forEach((lesson) => {
      if (lesson.studentId === studentId) {
        const lessonDate = parseTimeToDate(lesson.date, lesson.hour);
        if (lessonDate > now) {
          // This is a future lesson, mark for deletion
          lessonsToRemove.push(lesson.id);
          if (lesson.isPaid) {
            // If the lesson was paid, we need to handle the balance somehow
            // Since we're deleting the student, we can't refund to their balance
            refundsNeeded.push({ studentId, amount: lesson.price });
          }
        }
      }
    });

    // Remove future lessons (past lessons are kept in the system)
    const updatedLessons = lessons.filter((lesson) => !lessonsToRemove.includes(lesson.id));

    // Remove student from active students list
    const updatedActiveStudents = students.filter((s) => s.id !== studentId);

    // Update state
    setStudentsState(updatedActiveStudents);
    setLessons(updatedLessons);

    const refundWarning = refundsNeeded.length > 0 
      ? ` Note: ${refundsNeeded.length} paid future lesson(s) were deleted - consider manual refund if needed.` 
      : '';
    addToast(`${studentToDelete.name} has been deleted.${refundWarning}`, "success");
  };

  const handleLessonDragStart = (lessonId: string) => {
    setDraggedLessonId(lessonId);
    // Find the lesson and set its duration for drag preview
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setDraggedLessonDuration(lesson.duration);
    }
  };

  const handleSlotDragEnter = (
    event: React.DragEvent,
    date: Date,
    hour: string
  ) => {
    event.preventDefault();
    if (draggedLessonId) {
      setDragOverSlotInfo({ dateKey: formatDateForStorage(date), hour });
    }
  };

  const handleSlotDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    const relatedTarget = event.relatedTarget as Node;
    if (!(event.currentTarget as Node).contains(relatedTarget)) {
      setDragOverSlotInfo(null);
    }
  };

  const handleSlotDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleSlotDrop = (
    event: React.DragEvent,
    date: Date,
    slotHour: string
  ) => {
    event.preventDefault();
    const lessonIdToMove =
      event.dataTransfer.getData("lessonId") || draggedLessonId;
    setDragOverSlotInfo(null);
    setDraggedLessonId(null);
    setDraggedLessonDuration(0.5); // Reset to default

    if (!lessonIdToMove) return;

    const originalLesson = lessons.find((l) => l.id === lessonIdToMove);
    if (!originalLesson) return;

    // Use the exact time from the snapped position
    const newHour = slotHour;
    const newDuration = originalLesson.duration;
    const newDateString = formatDateForStorage(date);

    // Use a temporary lessons list excluding the one being moved for conflict check
    const otherLessons = lessons.filter((l) => l.id !== lessonIdToMove);

    // Check if there's a conflict with existing lessons
    const conflictLesson = otherLessons.find((l) => {
      if (l.date !== newDateString) return false;

      // Convert lesson times to comparable minutes
      const [newHours, newMinutes] = newHour.split(":").map(Number);
      const newStartMinutes = newHours * 60 + newMinutes;
      const newEndMinutes = newStartMinutes + newDuration * 60;

      const [existingHours, existingMinutes] = l.hour.split(":").map(Number);
      const existingStartMinutes = existingHours * 60 + existingMinutes;
      const existingEndMinutes = existingStartMinutes + l.duration * 60;

      // Check for overlap
      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      );
    });

    if (conflictLesson) {
      const studentWithConflict = students.find(
        (s) => s.id === conflictLesson.studentId
      );
      const studentName = studentWithConflict
        ? studentWithConflict.name
        : "another student";
      const formattedTime = `${conflictLesson.hour} (${conflictLesson.duration}h)`;

      addToast(
        `Cannot move lesson: Time slot conflicts with ${studentName}'s lesson at ${formattedTime}.`,
        "error"
      );
      return;
    }

    if (originalLesson.recurringId) {
      setUpdateTimeInfo({
        lessonId: lessonIdToMove,
        recurringId: originalLesson.recurringId,
        originalDate: originalLesson.date,
        newDate: date,
        newHour: newHour,
        newDuration: newDuration,
      });
      setIsConfirmUpdateTimeRecurringModalOpen(true);
    } else {
      handleChangeLessonTimeDuration(
        lessonIdToMove,
        newHour,
        newDuration,
        "single",
        newDateString
      );
    }
  };

  const handleChangeLessonTimeDuration = (
    lessonIdOrOriginalLesson: string | Lesson,
    newHour: string,
    newDuration: number,
    updateType: "single" | "future",
    newDateString?: string
  ) => {
    handleCloseChangeTimeDurationModal();
    const originalLesson =
      typeof lessonIdOrOriginalLesson === "string"
        ? lessons.find((l) => l.id === lessonIdOrOriginalLesson)
        : lessonIdOrOriginalLesson;

    if (!originalLesson) {
      addToast("Error: Original lesson not found for update.", "error");
      return;
    }

    const targetDateString = newDateString || originalLesson.date;
    const lessonId = originalLesson.id;

    let lessonsToCheckConflictAgainst = lessons.filter(
      (l) => l.id !== lessonId
    );
    if (updateType === "future" && originalLesson.recurringId) {
      const originalLessonDateTime = parseTimeToDate(
        originalLesson.date,
        originalLesson.hour
      );
      lessonsToCheckConflictAgainst = lessons.filter(
        (l) =>
          l.id !== lessonId &&
          (l.recurringId !== originalLesson.recurringId ||
            parseTimeToDate(l.date, l.hour) < originalLessonDateTime)
      );
    }

    if (
      checkConflict(
        lessonId,
        targetDateString,
        newHour,
        newDuration,
        lessonsToCheckConflictAgainst
      )
    ) {
      addToast(
        "Cannot update: New time/duration conflicts with an existing lesson.",
        "error"
      );
      return;
    }

    let lessonsAfterUpdate: Lesson[] = [];
    let toastMessage = "Lesson time/duration updated.";

    if (updateType === "single") {
      lessonsAfterUpdate = lessons.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              date: targetDateString,
              hour: newHour,
              duration: newDuration,
            }
          : lesson
      );
    } else if (updateType === "future" && originalLesson.recurringId) {
      const { recurringId, studentId, price, studentPhoneNumber } =
        originalLesson;
      const originalLessonDateObj = parseTimeToDate(
        originalLesson.date,
        originalLesson.hour
      );

      let lessonsToKeep = lessons.filter((l) => {
        if (l.recurringId !== recurringId) return true;
        const lessonDateObj = parseTimeToDate(l.date, l.hour);
        return lessonDateObj < originalLessonDateObj;
      });

      const updatedMovedLesson = {
        ...originalLesson,
        id: lessonId,
        date: targetDateString,
        hour: newHour,
        duration: newDuration,
      };
      lessonsToKeep.push(updatedMovedLesson);

      const originalFutureLessonsCount = lessons.filter(
        (l) =>
          l.recurringId === recurringId &&
          parseTimeToDate(l.date, l.hour) > originalLessonDateObj
      ).length;

      for (let i = 0; i < originalFutureLessonsCount; i++) {
        const nextSeriesDate = addDays(
          parseTimeToDate(targetDateString, newHour),
          (i + 1) * 7
        );
        const nextSeriesDateString = formatDateForStorage(nextSeriesDate);
        const newFutureLessonId =
          originalLesson.id + `_future_recreated_${i}_${Date.now()}`;

        if (
          checkConflict(
            newFutureLessonId,
            nextSeriesDateString,
            newHour,
            newDuration,
            lessonsToKeep
          )
        ) {
          addToast(
            `Skipping re-creation of recurring lesson on ${nextSeriesDateString} at ${newHour} due to conflict.`,
            "info"
          );
          continue;
        }

        lessonsToKeep.push({
          id: newFutureLessonId,
          date: nextSeriesDateString,
          hour: newHour,
          duration: newDuration,
          studentId,
          price,
          studentPhoneNumber,
          recurringId,
          isPaid: false,
          tips: 0,
        });
      }
      lessonsAfterUpdate = lessonsToKeep;
      toastMessage = "Recurring lesson series updated.";
    } else {
      lessonsAfterUpdate = lessons.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              date: targetDateString,
              hour: newHour,
              duration: newDuration,
            }
          : lesson
      );
    }
    setLessons(lessonsAfterUpdate);
    addToast(toastMessage, "success");
  };

  const handleConfirmUpdateRecurringTime = (action: "single" | "future") => {
    if (!updateTimeInfo) return;
    const { lessonId, newDate, newHour, newDuration } = updateTimeInfo;
    handleChangeLessonTimeDuration(
      lessonId,
      newHour,
      newDuration,
      action,
      formatDateForStorage(newDate)
    );
    setIsConfirmUpdateTimeRecurringModalOpen(false);
    setUpdateTimeInfo(null);
  };

  const handleOpenReportConfigModal = (student: Student) => {
    setSelectedStudentForReport(student);
    setIsReportConfigModalOpen(true);
  };
  const handleCloseReportConfigModal = () => {
    setIsReportConfigModalOpen(false);
    setSelectedStudentForReport(null);
  };
  const handleGenerateStudentReport = (count: number) => {
    if (!selectedStudentForReport) return;
    const studentLessons = lessons
      .filter((l) => l.studentId === selectedStudentForReport.id)
      .sort(
        (a, b) =>
          parseTimeToDate(b.date, b.hour).getTime() -
          parseTimeToDate(a.date, a.hour).getTime()
      )
      .slice(0, count)
      .map((l) => ({
        date: l.date,
        hour: l.hour,
        price: l.price,
        duration: l.duration,
      }));

    setGeneratedReportData(studentLessons);
    setReportLessonCount(count);
    setIsReportViewModalOpen(true);
    handleCloseReportConfigModal();
  };
  const handleCloseReportViewModal = () => {
    setIsReportViewModalOpen(false);
    setGeneratedReportData([]);
  };

  const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
  const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);
  const handleUpdateStartOfWeekDay = (day: 0 | 1) => {
    setAppSettingsState((prev) => ({ ...prev, startOfWeekDay: day }));
    addToast(`Week start day updated.`, "success");
  };
  const handleUpdateDarkMode = (enabled: boolean) => {
    setAppSettingsState((prev) => ({ ...prev, darkMode: enabled }));
    addToast(`Dark mode ${enabled ? "enabled" : "disabled"}.`, "success");
  };

  const handleUpdateCurrency = (currency: Currency) => {
    setAppSettingsState((prev) => ({ ...prev, currency }));
    addToast(
      `Currency updated to ${currency.name} (${currency.symbol}).`,
      "success"
    );
  };

  const handleOpenChangeTimeDurationModal = (lesson: Lesson) => {
    setLessonForTimeDurationChange(lesson);
    setIsChangeTimeDurationModalOpen(true);
  };
  const handleCloseChangeTimeDurationModal = () => {
    setIsChangeTimeDurationModalOpen(false);
    setLessonForTimeDurationChange(null);
  };

  // User Cabinet handlers
  const handleOpenUserCabinetModal = () => setIsUserCabinetModalOpen(true);
  const handleCloseUserCabinetModal = () => setIsUserCabinetModalOpen(false);

  const handleSignIn = async (credentials: AuthCredentials) => {
    try {
      const user = await cloudSyncService.signIn(credentials);
      setCurrentUser(user);

      // Check for downloaded data and update app state
      const downloadedData = await cloudSyncService.downloadDataOnSignIn();
      if (downloadedData) {
        setStudentsState(downloadedData.students);
        setLessonsState(downloadedData.lessons);
        setAppSettingsState(downloadedData.settings);
        addToast(
          `Welcome back, ${user.name}! Your data has been synced.`,
          "success"
        );
      } else {
        addToast(`Welcome back, ${user.name}!`, "success");
      }

      // Enable automatic sync
      cloudSyncService.enableAutoSync();
    } catch (error) {
      throw new Error("Failed to sign in. Please check your credentials.");
    }
  };

  const handleSignUp = async (
    credentials: AuthCredentials & { name: string }
  ) => {
    try {
      const user = await cloudSyncService.signUp(credentials);
      setCurrentUser(user);
      addToast(
        `Welcome, ${user.name}! Your account has been created.`,
        "success"
      );

      // Enable automatic sync for new users
      cloudSyncService.enableAutoSync();
    } catch (error) {
      throw new Error("Failed to create account. Please try again.");
    }
  };

  const handleSignOut = () => {
    cloudSyncService.signOut();
    cloudSyncService.disableAutoSync();
    setCurrentUser(null);
    addToast("You have been signed out.", "info");
  };

  const handleSync = async () => {
    try {
      await cloudSyncService.syncData(students, lessons, appSettings);
      addToast("Data synced successfully!", "success");
    } catch (error) {
      throw new Error("Failed to sync data. Please try again.");
    }
  };

  const handleExportData = () => {
    const exportData = cloudSyncService.exportData(
      students,
      lessons,
      appSettings
    );
    const filename = `tutorapp-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    downloadFile(exportData, filename);
    addToast("Data exported successfully!", "success");
  };

  const handleImportData = async (file: File) => {
    try {
      const importedData = await cloudSyncService.importData(file);

      // Merge imported data with existing data
      setStudentsState(importedData.students);
      setLessonsState(importedData.lessons);
      setAppSettingsState(importedData.settings);

      addToast("Data imported successfully!", "success");
    } catch (error) {
      throw new Error("Failed to import data. Please check the file format.");
    }
  };

  const CurrentPeriodDisplay = () => {
    const endDate = addDays(viewStartDate, NUM_WEEKS_TO_DISPLAY * 7 - 1);
    return (
      <span className="date-range-display">
        {viewStartDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        {" - "}
        {endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    );
  };

  return (
    <div className={`app-container ${isMobile ? "mobile-app" : "desktop-app"}`}>
      <header>
        <div className="header-content">
          <div className="header-logo">
            <TutorLogo size={isMobile ? 28 : 36} showText={!isMobile} />
          </div>
          <h1 id="app-main-heading">
            {isMobile ? "Tutor Schedule" : "Weekly Tutoring Schedule"}
          </h1>
          <div className="header-buttons">
            <button
              onClick={handleOpenUserCabinetModal}
              className="user-cabinet-button"
              aria-label="Open User Cabinet"
              title={
                currentUser
                  ? `Signed in as ${currentUser.name}`
                  : "User Cabinet"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24px"
                height="24px"
              >
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
              </svg>
              {!isMobile && currentUser && (
                <span className="user-name">{currentUser.name}</span>
              )}
              {!isMobile && !currentUser && (
                <span className="user-name">Sign In</span>
              )}
            </button>
            <button
              onClick={handleOpenSettingsModal}
              className="settings-button"
              aria-label="Open Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24px"
                height="24px"
              >
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.68,4.82,12c0,0.32,0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
              </svg>
            </button>
          </div>
        </div>
        <nav
          className={`main-nav ${isMobile ? "mobile-nav" : "desktop-nav"}`}
          aria-label="Main navigation"
        >
          <button
            onClick={() => navigateTo("calendar")}
            className={`nav-button ${
              currentPage === "calendar" ? "active" : ""
            }`}
            aria-current={currentPage === "calendar" ? "page" : undefined}
          >
            {isMobile ? "📅" : "Calendar"}
          </button>
          <button
            onClick={() => navigateTo("statistics")}
            className={`nav-button ${
              currentPage === "statistics" ? "active" : ""
            }`}
            aria-current={currentPage === "statistics" ? "page" : undefined}
          >
            {isMobile ? "📊" : "Statistics"}
          </button>
          <button
            onClick={() => navigateTo("students")}
            className={`nav-button ${
              currentPage === "students" ? "active" : ""
            }`}
            aria-current={currentPage === "students" ? "page" : undefined}
          >
            {isMobile ? "👥" : "Students"}
          </button>
        </nav>
      </header>

      {currentPage === "calendar" && (
        <div
          className={`calendar-controls ${
            isMobile ? "mobile-controls" : "desktop-controls"
          }`}
        >
          <button
            onClick={handlePreviousWeek}
            className="control-button"
            aria-label="Previous period"
          >
            {isMobile ? "‹" : "‹ Prev"}
          </button>
          <button
            onClick={handleGoToToday}
            className="control-button today-button"
            aria-label="Go to today's week"
          >
            Today
          </button>
          <CurrentPeriodDisplay />
          <button
            onClick={handleNextWeek}
            className="control-button"
            aria-label="Next period"
          >
            {isMobile ? "›" : "Next ›"}
          </button>
        </div>
      )}

      <main>
        {currentPage === "calendar" && (
          <WeeklyCalendar
            lessons={lessons}
            students={students}
            onTimeSlotClick={handleTimeSlotClick}
            viewStartDate={viewStartDate}
            draggedLessonId={draggedLessonId}
            draggedLessonDuration={draggedLessonDuration}
            dragOverSlotInfo={dragOverSlotInfo}
            onDragStartLesson={handleLessonDragStart}
            onDropOnSlot={handleSlotDrop}
            onDragOverSlot={handleSlotDragOver}
            onDragEnterSlot={handleSlotDragEnter}
            onDragLeaveSlot={handleSlotDragLeave}
            startOfWeekDay={appSettings.startOfWeekDay}
            now={now}
            currency={appSettings.currency}
          />
        )}
        {currentPage === "statistics" && (
          <StatisticsPage
            lessons={lessons}
            students={students}
            startOfWeekDay={appSettings.startOfWeekDay}
            currency={appSettings.currency}
          />
        )}
        {currentPage === "students" && (
          <StudentsPage
            students={students}
            lessons={lessons}
            onUpdateStudentColor={handleUpdateStudentColor}
            onOpenTopUpModal={handleOpenTopUpModal}
            onOpenReportConfigModal={handleOpenReportConfigModal}
            onArchiveStudent={handleArchiveStudent}
            onDeleteStudent={handleDeleteStudent}
            startOfWeekDay={appSettings.startOfWeekDay}
            currency={appSettings.currency}
          />
        )}
      </main>

      <LessonModal
        isOpen={isAddLessonModalOpen}
        onClose={handleCloseAddLessonModal}
        onAddLesson={handleAddLesson}
        selectedDate={selectedSlotInfo?.date || null}
        selectedHourProp={selectedSlotInfo?.hour || "12:00"}
        students={students}
        currency={appSettings.currency}
      />
      <ViewLessonModal
        isOpen={isViewLessonModalOpen}
        onClose={handleCloseViewLessonModal}
        onDelete={handleDeleteLesson}
        lesson={selectedLessonToView}
        students={students}
        onTogglePaid={handleToggleLessonPaidStatus}
        onOpenAddTips={handleOpenAddTipsModal}
        onOpenChangePrice={handleOpenChangePriceModal}
        onOpenChangeTimeDuration={handleOpenChangeTimeDurationModal}
        currency={appSettings.currency}
      />
      <AddTipsModal
        isOpen={isAddTipsModalOpen}
        onClose={handleCloseAddTipsModal}
        onAddTip={handleAddTipToLesson}
        currentTips={lessonForTips?.tips || 0}
        lessonName={
          students.find((s) => s.id === lessonForTips?.studentId)?.name ||
          "Lesson"
        }
        currency={appSettings.currency}
      />
      <ChangePriceModal
        isOpen={isChangePriceModalOpen}
        onClose={handleCloseChangePriceModal}
        onChangePrice={handleChangeLessonPrice}
        currentPrice={lessonForPriceChange?.price || 0}
        isRecurring={!!lessonForPriceChange?.recurringId}
        lessonName={
          students.find((s) => s.id === lessonForPriceChange?.studentId)
            ?.name || "Lesson"
        }
        currency={appSettings.currency}
      />
      {lessonForTimeDurationChange && (
        <ChangeTimeDurationModal
          isOpen={isChangeTimeDurationModalOpen}
          onClose={handleCloseChangeTimeDurationModal}
          onChangeTimeDuration={(newTime, newDuration, scope) =>
            handleChangeLessonTimeDuration(
              lessonForTimeDurationChange,
              newTime,
              newDuration,
              scope
            )
          }
          currentHour={lessonForTimeDurationChange.hour}
          currentDuration={lessonForTimeDurationChange.duration}
          isRecurring={!!lessonForTimeDurationChange.recurringId}
          lessonName={
            students.find((s) => s.id === lessonForTimeDurationChange.studentId)
              ?.name || "Lesson"
          }
        />
      )}
      <ConfirmModal
        isOpen={isConfirmDeleteRecurringModalOpen}
        onClose={() => {
          setIsConfirmDeleteRecurringModalOpen(false);
          setLessonToDeleteInfo(null);
        }}
        onConfirm={handleConfirmDeleteRecurring}
        title="Delete Recurring Lesson"
        message="Do you want to delete only this specific lesson, or this lesson and all future lessons in this series?"
        confirmSingleText="Delete This Lesson Only"
        confirmFutureText="Delete This & All Future"
      />
      <ConfirmModal
        isOpen={isConfirmUpdateTimeRecurringModalOpen}
        onClose={() => {
          setIsConfirmUpdateTimeRecurringModalOpen(false);
          setUpdateTimeInfo(null);
        }}
        onConfirm={handleConfirmUpdateRecurringTime}
        title="Update Recurring Lesson Time/Duration"
        message="Do you want to change the time/duration for this lesson only, or for this lesson and all future lessons in this series?"
        confirmSingleText="Change This Lesson Only"
        confirmFutureText="Change This & All Future"
      />
      {selectedStudentForTopUp && (
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={handleCloseTopUpModal}
          onTopUp={handleTopUpBalance}
          studentName={selectedStudentForTopUp.name}
          currency={appSettings.currency}
        />
      )}
      {selectedStudentForReport && (
        <ReportConfigModal
          isOpen={isReportConfigModalOpen}
          onClose={handleCloseReportConfigModal}
          onSubmit={handleGenerateStudentReport}
          studentName={selectedStudentForReport.name}
        />
      )}
      <ReportViewModal
        isOpen={isReportViewModalOpen}
        onClose={handleCloseReportViewModal}
        reportData={generatedReportData}
        studentName={selectedStudentForReport?.name || "Student"}
        lessonCount={reportLessonCount}
        currency={appSettings.currency}
      />
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={handleCloseSettingsModal}
          currentStartDay={appSettings.startOfWeekDay}
          onUpdateStartDay={handleUpdateStartOfWeekDay}
          currentDarkMode={appSettings.darkMode}
          onUpdateDarkMode={handleUpdateDarkMode}
          currentCurrency={appSettings.currency}
          onUpdateCurrency={handleUpdateCurrency}
        />
      )}
      <UserCabinetModal
        isOpen={isUserCabinetModalOpen}
        onClose={handleCloseUserCabinetModal}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
        user={currentUser}
        syncStatus={syncStatus}
        onSync={handleSync}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
      <ToastNotification toasts={toasts} removeToast={removeToast} />
      <footer>
        <p>&copy; {new Date().getFullYear()} Tutor App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
