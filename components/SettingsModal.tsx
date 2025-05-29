/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { SettingsModalProps, Currency } from "../types";
import { SUPPORTED_CURRENCIES } from "../constants";

function SettingsModal({
  isOpen,
  onClose,
  currentStartDay,
  onUpdateStartDay,
  currentDarkMode,
  onUpdateDarkMode,
  currentCurrency,
  onUpdateCurrency,
}: SettingsModalProps) {
  const [selectedDay, setSelectedDay] = useState<0 | 1>(currentStartDay);
  const [darkMode, setDarkMode] = useState<boolean>(currentDarkMode);
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>(currentCurrency);

  useEffect(() => {
    if (isOpen) {
      setSelectedDay(currentStartDay);
      setDarkMode(currentDarkMode);
      setSelectedCurrency(currentCurrency);
    }
  }, [isOpen, currentStartDay, currentDarkMode, currentCurrency]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdateStartDay(selectedDay);
    onUpdateDarkMode(darkMode);
    onUpdateCurrency(selectedCurrency);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="settings-modal-title" className="modal-header">
          App Settings
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Start Week On:</label>
            <div>
              <input
                type="radio"
                id="startSunday"
                name="startOfWeek"
                value="0"
                checked={selectedDay === 0}
                onChange={() => setSelectedDay(0)}
              />
              <label htmlFor="startSunday" className="radio-label">
                Sunday
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="startMonday"
                name="startOfWeek"
                value="1"
                checked={selectedDay === 1}
                onChange={() => setSelectedDay(1)}
              />
              <label htmlFor="startMonday" className="radio-label">
                Monday
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="darkModeToggle">Dark Mode:</label>
            <label className="switch">
              <input
                type="checkbox"
                id="darkModeToggle"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="currencySelect">Currency:</label>
            <select
              id="currencySelect"
              value={selectedCurrency.code}
              onChange={(e) => {
                const currency = SUPPORTED_CURRENCIES.find(
                  (c) => c.code === e.target.value
                );
                if (currency) setSelectedCurrency(currency);
              }}
              className="currency-select"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="button-primary">
              Save Settings
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

export default SettingsModal;
