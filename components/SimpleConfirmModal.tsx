/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useCallback } from "react";
import { SimpleConfirmModalProps } from "../types";

function SimpleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDangerous = false,
}: SimpleConfirmModalProps) {
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
      // Focus the cancel button for safety
      const cancelButton = document.getElementById(
        "simple-confirm-cancel-button"
      );
      if (cancelButton) {
        cancelButton.focus();
      }
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
      aria-labelledby="simple-confirm-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="simple-confirm-modal-title" className="modal-header">
          {title}
        </h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            onClick={onConfirm}
            className={isDangerous ? "button-danger" : "button-primary"}
          >
            {confirmText}
          </button>
          <button
            type="button"
            id="simple-confirm-cancel-button"
            onClick={onClose}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimpleConfirmModal;
