/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ReportConfigModalProps } from '../types';

function ReportConfigModal({ isOpen, onClose, onSubmit, studentName }: ReportConfigModalProps) {
  const [count, setCount] = useState('5'); 

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount < 1 || numCount > 10) {
      alert('Please enter a number of lessons between 1 and 10.');
      return;
    }
    onSubmit(numCount);
  };

  useEffect(() => {
    if (isOpen) {
      const countInput = document.getElementById('reportLessonCount');
      if (countInput) {
        countInput.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="report-config-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="report-config-modal-title" className="modal-header">Generate Report for {studentName}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="reportLessonCount">Number of past lessons to report (1-10):</label>
            <input
              id="reportLessonCount"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              max="10"
              required
              aria-required="true"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="button-primary">Generate Report</button>
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportConfigModal;
