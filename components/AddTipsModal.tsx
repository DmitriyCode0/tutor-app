/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { AddTipsModalProps } from "../types";
import { getCurrencyLabel } from "../utils/currencyUtils";

function AddTipsModal({
  isOpen,
  onClose,
  onAddTip,
  currentTips,
  lessonName,
  currency,
}: AddTipsModalProps) {
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setTip(currentTips ? currentTips.toString() : "");
      const tipInput = document.getElementById("tipAmountInput");
      if (tipInput) {
        tipInput.focus();
      }
    }
  }, [isOpen, currentTips]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const tipAmount = parseFloat(tip);
    if (isNaN(tipAmount) || tipAmount < 0) {
      alert("Please enter a valid non-negative tip amount.");
      return;
    }
    onAddTip(tipAmount);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tips-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="add-tips-modal-title" className="modal-header">
          Add/Edit Tip for {lessonName}
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="tipAmountInput">
              Tip Amount {getCurrencyLabel(currency)}:
            </label>
            <input
              id="tipAmountInput"
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              min="0"
              step="0.01"
              required
              aria-required="true"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="button-primary">
              Save Tip
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

export default AddTipsModal;
