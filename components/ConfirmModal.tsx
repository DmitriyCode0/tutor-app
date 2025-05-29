/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useCallback } from 'react';
import { ConfirmModalProps } from '../types';

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmSingleText, 
  confirmFutureText 
}: ConfirmModalProps) {
    const handleEscKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
        onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
        document.addEventListener('keydown', handleEscKey);
        // Optionally focus a button here
        } else {
        document.removeEventListener('keydown', handleEscKey);
        }
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, handleEscKey]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-modal-title" className="modal-header">{title}</h3>
            <p>{message}</p>
            <div className="modal-actions">
            <button type="button" onClick={() => onConfirm('single')} className="button-primary">{confirmSingleText}</button>
            <button type="button" onClick={() => onConfirm('future')} className="button-primary">{confirmFutureText}</button>
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
            </div>
        </div>
        </div>
    );
}

export default ConfirmModal;
