/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from "react";
import { MOBILE_BREAKPOINT } from "../constants";

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Check for touch capability
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouch(touch);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isTouch };
}

export function useViewportHeight() {
  const [vh, setVh] = useState("100vh");

  useEffect(() => {
    const updateVh = () => {
      // Handle mobile viewport height issues (address bar, etc.)
      const height = window.innerHeight;
      setVh(`${height}px`);
    };

    updateVh();
    window.addEventListener("resize", updateVh);
    window.addEventListener("orientationchange", updateVh);

    return () => {
      window.removeEventListener("resize", updateVh);
      window.removeEventListener("orientationchange", updateVh);
    };
  }, []);

  return vh;
}

export function useTouchDragDrop(callbacks: {
  onDragStart: (lessonId: string) => void;
  onDrop: (lessonId: string, targetDate: Date, targetHour: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const getTouchEventHandlers = useCallback(
    (lessonId: string, targetDate: Date, targetHour: string) => {
      return {
        onTouchStart: (e: React.TouchEvent) => {
          const touch = e.touches[0];
          setTouchStartPos({ x: touch.clientX, y: touch.clientY });
          setDraggedItem(lessonId);
          setIsLongPressing(false);

          // Start long press timer (1.5 seconds)
          const timeout = setTimeout(() => {
            setIsLongPressing(true);
            callbacks.onDragStart(lessonId);

            // Strong haptic feedback for long press
            if ("vibrate" in navigator) {
              navigator.vibrate([50, 30, 50]); // Pattern to indicate drag mode start
            }
          }, 1500);

          setLongPressTimeout(timeout);

          // Light haptic feedback on touch start
          if ("vibrate" in navigator) {
            navigator.vibrate(5); // Very short vibration
          }

          // Don't prevent default initially - allow scrolling
        },

        onTouchMove: (e: React.TouchEvent) => {
          if (!touchStartPos || !draggedItem) return;

          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartPos.x);
          const deltaY = Math.abs(touch.clientY - touchStartPos.y);

          // If we moved significantly, cancel long press (allow scrolling)
          if ((deltaX > 15 || deltaY > 15) && !isLongPressing) {
            if (longPressTimeout) {
              clearTimeout(longPressTimeout);
              setLongPressTimeout(null);
            }
            setDraggedItem(null);
            setTouchStartPos(null);
            return;
          }

          // Start dragging only if long press was completed
          if (isLongPressing && (deltaX > 10 || deltaY > 10) && !isDragging) {
            setIsDragging(true);
            // Stronger haptic feedback when drag starts
            if ("vibrate" in navigator) {
              navigator.vibrate(20);
            }
          }

          // Prevent scrolling only during actual drag
          if (isDragging) {
            e.preventDefault();
          }
        },

        onTouchEnd: (e: React.TouchEvent) => {
          // Clear long press timeout if still active
          if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            setLongPressTimeout(null);
          }

          // If not dragging, just reset and allow normal touch behavior
          if (!isDragging || !draggedItem) {
            setTouchStartPos(null);
            setDraggedItem(null);
            setIsLongPressing(false);
            return;
          }

          // Find the element under the touch point
          const touch = e.changedTouches[0];
          const elementBelow = document.elementFromPoint(
            touch.clientX,
            touch.clientY
          );

          // Look for a time slot cell element
          let timeSlotElement = elementBelow;
          while (
            timeSlotElement &&
            !timeSlotElement.classList.contains("time-slot-cell")
          ) {
            timeSlotElement = timeSlotElement.parentElement;
          }

          if (
            timeSlotElement &&
            timeSlotElement.classList.contains("time-slot-cell")
          ) {
            callbacks.onDrop(draggedItem, targetDate, targetHour);
            // Success haptic feedback
            if ("vibrate" in navigator) {
              navigator.vibrate([10, 50, 10]); // Double pulse for success
            }
          } else {
            // Failed drop haptic feedback
            if ("vibrate" in navigator) {
              navigator.vibrate(100); // Longer vibration for failure
            }
          }

          // Reset state
          setIsDragging(false);
          setDraggedItem(null);
          setTouchStartPos(null);
          setIsLongPressing(false);
        },
      };
    },
    [
      touchStartPos,
      draggedItem,
      isDragging,
      isLongPressing,
      longPressTimeout,
      callbacks,
    ]
  );

  return {
    isDragging,
    draggedItem,
    isLongPressing,
    getTouchEventHandlers,
  };
}
