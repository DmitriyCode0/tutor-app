/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { ChangePriceModalProps } from "../types";
import { getCurrencyLabel } from "../utils/currencyUtils";

function ChangePriceModal({
  isOpen,
  onClose,
  onChangePrice,
  currentPrice,
  isRecurring,
  lessonName,
  currency,
}: ChangePriceModalProps) {
  const [newPrice, setNewPrice] = useState<string>("");
  const [scope, setScope] = useState<"single" | "future">("single");

  useEffect(() => {
    if (isOpen) {
      setNewPrice(currentPrice.toString());
      setScope("single");
      const priceInput = document.getElementById("newPriceInput");
      if (priceInput) {
        priceInput.focus();
      }
    }
  }, [isOpen, currentPrice]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const priceNumber = parseFloat(newPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }
    onChangePrice(priceNumber, isRecurring ? scope : "single");
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-price-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="change-price-modal-title" className="modal-header">
          Change Price for {lessonName}
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="newPriceInput">
              New Price {getCurrencyLabel(currency)}:
            </label>
            <input
              id="newPriceInput"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
              aria-required="true"
            />
          </div>
          {isRecurring && (
            <div className="form-group">
              <label>Apply change to:</label>
              <div>
                <input
                  type="radio"
                  id="scopeSinglePrice"
                  name="priceScope"
                  value="single"
                  checked={scope === "single"}
                  onChange={() => setScope("single")}
                />
                <label htmlFor="scopeSinglePrice" className="radio-label">
                  This lesson only
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="scopeFuturePrice"
                  name="priceScope"
                  value="future"
                  checked={scope === "future"}
                  onChange={() => setScope("future")}
                />
                <label htmlFor="scopeFuturePrice" className="radio-label">
                  This and all future lessons in series
                </label>
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="button-primary">
              Save Price
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

export default ChangePriceModal;
