// Simple test to verify currency functionality
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "./constants.js";
import {
  formatCurrency,
  formatTips,
  getCurrencyLabel,
} from "./utils/currencyUtils.js";

console.log("Testing currency functionality...");

// Test 1: Check supported currencies
console.log("1. Supported currencies:", SUPPORTED_CURRENCIES.length);
console.log("2. Default currency:", DEFAULT_CURRENCY);

// Test 2: Test formatting functions
const testAmount = 25.5;
const testCurrency = { code: "USD", symbol: "$", name: "US Dollar" };

console.log("3. Format currency:", formatCurrency(testAmount, testCurrency));
console.log("4. Format tips:", formatTips(5, testCurrency));
console.log("5. Currency label:", getCurrencyLabel(testCurrency));

// Test 3: Test all supported currencies
console.log("6. Testing all supported currencies:");
SUPPORTED_CURRENCIES.forEach((currency) => {
  console.log(`   ${currency.code}: ${formatCurrency(100, currency)}`);
});

console.log("Currency functionality test completed!");
