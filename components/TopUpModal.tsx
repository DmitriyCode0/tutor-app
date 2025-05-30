/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from "react";
import { TopUpModalProps } from "../types";
import { getCurrencyLabel } from "../utils/currencyUtils";

function TopUpModal({
  isOpen,
  onClose,
  onTopUp,
  studentName,
  currency,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount === 0) {
      alert(
        "Please enter a valid amount (can be negative for corrections, but not zero)."
      );
      return;
    }
    onTopUp(topUpAmount);
    setAmount("");
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
      const amountInput = document.getElementById("topUpAmountInput");
      if (amountInput) {
        amountInput.focus();
      }
      setAmount(""); // Reset amount when modal opens
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, handleEscKey]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="top-up-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="top-up-modal-title" className="modal-header">
          Adjust Income for {studentName}
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="topUpAmountInput">
              Amount {getCurrencyLabel(currency)}:
            </label>
            <input
              id="topUpAmountInput"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              aria-required="true"
              step="0.01"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="button-primary">
              Adjust Income
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

export default TopUpModal;
