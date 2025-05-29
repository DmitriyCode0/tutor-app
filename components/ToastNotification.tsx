/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { Toast, ToastMessageProps, ToastNotificationProps } from '../types';

function ToastMessage({ message, type, onDismiss }: ToastMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500); 
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast-message toast-${type}`} role="alert">
      {message}
      <button onClick={onDismiss} className="toast-close-button" aria-label="Close notification">&times;</button>
    </div>
  );
}

function ToastNotification({ toasts, removeToast }: ToastNotificationProps) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="assertive" aria-atomic="true">
      {toasts.map(toast => (
        <ToastMessage
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastNotification;
