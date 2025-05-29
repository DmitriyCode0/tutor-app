/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Currency } from "../types";

/**
 * Formats a number as currency using the provided currency settings
 * @param amount The amount to format
 * @param currency The currency configuration
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return `${currency.symbol}${amount.toFixed(2)}`;
}

/**
 * Formats a tips amount with the currency symbol
 * @param amount The tips amount to format
 * @param currency The currency configuration
 * @returns Formatted tips string (e.g., "+₴5.00")
 */
export function formatTips(amount: number, currency: Currency): string {
  return `+${currency.symbol}${amount.toFixed(2)}`;
}

/**
 * Gets the currency symbol for form labels
 * @param currency The currency configuration
 * @returns Currency symbol in parentheses (e.g., "(₴)")
 */
export function getCurrencyLabel(currency: Currency): string {
  return `(${currency.symbol})`;
}
