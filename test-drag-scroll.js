// Test script for drag and scroll behavior
// Run this in browser console to test functionality

console.log("🧪 Starting Drag & Scroll Behavior Tests...");

// Test 1: Check if touch-action is properly set
function testTouchActionSettings() {
  console.log("\n📱 Test 1: Touch Action Settings");

  const calendarWrapper = document.querySelector(".calendar-grid-wrapper");
  const timeSlotCells = document.querySelectorAll(".time-slot-cell");
  const lessonDetails = document.querySelectorAll(".lesson-details");

  if (calendarWrapper) {
    const touchAction = getComputedStyle(calendarWrapper).touchAction;
    console.log(`✅ Calendar wrapper touch-action: ${touchAction}`);
  }

  if (timeSlotCells.length > 0) {
    const touchAction = getComputedStyle(timeSlotCells[0]).touchAction;
    console.log(`✅ Time slot cell touch-action: ${touchAction}`);
  }

  if (lessonDetails.length > 0) {
    const touchAction = getComputedStyle(lessonDetails[0]).touchAction;
    console.log(`✅ Lesson details touch-action: ${touchAction}`);
  }
}

// Test 2: Simulate long press behavior
function testLongPressBehavior() {
  console.log("\n⏱️  Test 2: Long Press Simulation");

  const firstLesson = document.querySelector(".lesson-details");
  if (!firstLesson) {
    console.log("❌ No lessons found to test");
    return;
  }

  console.log("🎯 Simulating touch start...");

  // Create touch start event
  const touchStartEvent = new TouchEvent("touchstart", {
    touches: [
      {
        clientX: 100,
        clientY: 100,
        target: firstLesson,
      },
    ],
    bubbles: true,
    cancelable: true,
  });

  firstLesson.dispatchEvent(touchStartEvent);
  console.log("✅ Touch start event dispatched");

  // Wait 1.6 seconds and check for long press visual feedback
  setTimeout(() => {
    const hasLongPressIndicator = document.querySelector(
      ".long-press-indicator"
    );
    const hasLongPressingAttribute =
      firstLesson.hasAttribute("data-long-pressing");

    console.log(`🔍 Long press indicator present: ${!!hasLongPressIndicator}`);
    console.log(`🔍 Long pressing attribute: ${hasLongPressingAttribute}`);

    // Clean up
    const touchEndEvent = new TouchEvent("touchend", {
      changedTouches: [
        {
          clientX: 100,
          clientY: 100,
          target: firstLesson,
        },
      ],
      bubbles: true,
      cancelable: true,
    });

    firstLesson.dispatchEvent(touchEndEvent);
    console.log("✅ Touch end event dispatched (cleanup)");
  }, 1600);
}

// Test 3: Check scrolling capability
function testScrolling() {
  console.log("\n📜 Test 3: Scrolling Capability");

  const calendarWrapper = document.querySelector(".calendar-grid-wrapper");
  if (!calendarWrapper) {
    console.log("❌ Calendar wrapper not found");
    return;
  }

  const initialScrollLeft = calendarWrapper.scrollLeft;
  const initialScrollTop = calendarWrapper.scrollTop;

  console.log(
    `📍 Initial scroll position: left=${initialScrollLeft}, top=${initialScrollTop}`
  );

  // Test horizontal scroll
  calendarWrapper.scrollLeft += 50;
  const newScrollLeft = calendarWrapper.scrollLeft;

  // Test vertical scroll
  calendarWrapper.scrollTop += 50;
  const newScrollTop = calendarWrapper.scrollTop;

  console.log(
    `📍 New scroll position: left=${newScrollLeft}, top=${newScrollTop}`
  );
  console.log(
    `✅ Horizontal scroll: ${
      newScrollLeft !== initialScrollLeft ? "WORKING" : "NOT WORKING"
    }`
  );
  console.log(
    `✅ Vertical scroll: ${
      newScrollTop !== initialScrollTop ? "WORKING" : "NOT WORKING"
    }`
  );

  // Reset scroll position
  calendarWrapper.scrollLeft = initialScrollLeft;
  calendarWrapper.scrollTop = initialScrollTop;
}

// Test 4: Check CSS animations are loaded
function testCSSAnimations() {
  console.log("\n🎨 Test 4: CSS Animations");

  // Check if long press animations are defined
  const styleSheets = Array.from(document.styleSheets);
  let hasLongPressAnimation = false;
  let hasSpinnerAnimation = false;

  styleSheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules);
      rules.forEach((rule) => {
        if (rule.name === "long-press-pulse") hasLongPressAnimation = true;
        if (rule.name === "long-press-spinner") hasSpinnerAnimation = true;
      });
    } catch (e) {
      // Cross-origin stylesheets may throw errors
    }
  });

  console.log(
    `✅ Long press pulse animation: ${
      hasLongPressAnimation ? "LOADED" : "NOT FOUND"
    }`
  );
  console.log(
    `✅ Long press spinner animation: ${
      hasSpinnerAnimation ? "LOADED" : "NOT FOUND"
    }`
  );
}

// Run all tests
function runAllTests() {
  console.log("🚀 Running All Drag & Scroll Tests...");
  testTouchActionSettings();
  testScrolling();
  testCSSAnimations();
  testLongPressBehavior();

  console.log("\n✨ Tests completed! Check results above.");
  console.log("💡 For manual testing:");
  console.log("   1. Try scrolling left/right on mobile");
  console.log("   2. Try scrolling up/down on mobile");
  console.log("   3. Try long press (1.5s) on a lesson to drag");
  console.log("   4. Try quick tap on lesson to open modal");
}

// Auto-run tests when script loads
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual use
window.dragScrollTests = {
  runAllTests,
  testTouchActionSettings,
  testScrolling,
  testCSSAnimations,
  testLongPressBehavior,
};

console.log("📖 Available commands: window.dragScrollTests.runAllTests()");
