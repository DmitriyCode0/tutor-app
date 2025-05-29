/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ReportViewModalProps } from '../types';
import { formatFullDateForDisplay, parseTimeToDate } from '../utils/dateUtils';

function ReportViewModal({ isOpen, onClose, reportData, studentName, lessonCount }: ReportViewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="report-view-modal-title">
        <div className="modal-content report-view-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 id="report-view-modal-title" className="modal-header">Lesson Report for {studentName} (Last {lessonCount} Conducted Lessons)</h3>
            {reportData.length > 0 ? (
            <ul className="report-list">
                {reportData.map((item, index) => {
                 const lessonDateTime = parseTimeToDate(item.date, item.hour);
                 return (
                    <li key={index} className="report-item">
                        <span>{formatFullDateForDisplay(lessonDateTime)} at {item.hour} (Duration: {item.duration}h)</span>
                        <span>Price: ${item.price.toFixed(2)}</span>
                    </li>
                 );
                })}
            </ul>
            ) : (
            <p>No lessons found for this student in the selected range.</p>
            )}
            <div className="modal-actions">
            <button type="button" onClick={onClose} className="button-secondary">Close</button>
            </div>
        </div>
        </div>
    );
}

export default ReportViewModal;
