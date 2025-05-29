/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ChangeTimeDurationModalProps } from '../types';

function ChangeTimeDurationModal({ 
  isOpen, 
  onClose, 
  onChangeTimeDuration, 
  currentHour, 
  currentDuration, 
  isRecurring, 
  lessonName 
}: ChangeTimeDurationModalProps) {
  const [newTime, setNewTime] = useState<string>(currentHour);
  const [newDuration, setNewDuration] = useState<number>(currentDuration);
  const [scope, setScope] = useState<'single' | 'future'>('single');

  useEffect(() => {
    if (isOpen) {
      setNewTime(currentHour);
      setNewDuration(currentDuration);
      setScope('single');
      const timeInput = document.getElementById('newTimeInputModal');
      if (timeInput) {
        timeInput.focus();
      }
    }
  }, [isOpen, currentHour, currentDuration]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTime) {
        alert('Please enter a valid time.');
        return;
    }
    onChangeTimeDuration(newTime, newDuration, isRecurring ? scope : 'single');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="change-time-duration-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 id="change-time-duration-modal-title" className="modal-header">Change Time/Duration for {lessonName}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="newTimeInputModal">New Time (HH:MM):</label>
            <input
              id="newTimeInputModal"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newDurationSelectModal">New Duration:</label>
            <select id="newDurationSelectModal" value={newDuration} onChange={(e) => setNewDuration(parseFloat(e.target.value))} required aria-required="true">
              <option value="0.5">0.5 hour</option>
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
            </select>
          </div>
          {isRecurring && (
            <div className="form-group">
              <label>Apply change to:</label>
              <div>
                <input type="radio" id="scopeSingleTimeModal" name="timeDurationScopeModal" value="single" checked={scope === 'single'} onChange={() => setScope('single')} />
                <label htmlFor="scopeSingleTimeModal" className="radio-label">This lesson only</label>
              </div>
              <div>
                <input type="radio" id="scopeFutureTimeModal" name="timeDurationScopeModal" value="future" checked={scope === 'future'} onChange={() => setScope('future')} />
                <label htmlFor="scopeFutureTimeModal" className="radio-label">This and all future lessons in series</label>
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="button-primary">Save Changes</button>
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeTimeDurationModal;
