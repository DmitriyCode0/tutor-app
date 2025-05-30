/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from "react";
import { UserCabinetModalProps, AuthCredentials } from "../types";
import { useResponsive } from "../utils/responsiveUtils";

function UserCabinetModal({
  isOpen,
  onClose,
  user,
  syncStatus,
  onSignIn,
  onSignUp,
  onSignOut,
  onSync,
  onExportData,
  onImportData,
}: UserCabinetModalProps) {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "profile">(
    "signin"
  );
  const [credentials, setCredentials] = useState<
    AuthCredentials & { name?: string }
  >({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      if (user) {
        setActiveTab("profile");
      } else {
        setActiveTab("signin");
      }
      setCredentials({ email: "", password: "", name: "" });
      setError("");
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, handleEscKey, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "signin") {
        await onSignIn({
          email: credentials.email,
          password: credentials.password,
        });
      } else if (activeTab === "signup") {
        if (!credentials.name) {
          setError("Name is required");
          return;
        }
        await onSignUp({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    setError("");
    try {
      await onSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError("");
      try {
        await onImportData(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const renderAuthForm = () => (
    <form onSubmit={handleSubmit} className="user-cabinet-form">
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${activeTab === "signin" ? "active" : ""}`}
          onClick={() => setActiveTab("signin")}
        >
          {isMobile ? "🔑" : "Sign In"}
        </button>
        <button
          type="button"
          className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
          onClick={() => setActiveTab("signup")}
        >
          {isMobile ? "📝" : "Sign Up"}
        </button>
      </div>

      {activeTab === "signup" && (
        <div className="form-group">
          <label htmlFor="userName">Full Name:</label>
          <input
            id="userName"
            type="text"
            value={credentials.name || ""}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            placeholder="Enter your full name"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="userEmail">Email:</label>
        <input
          id="userEmail"
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, email: e.target.value }))
          }
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="userPassword">Password:</label>
        <input
          id="userPassword"
          type="password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, password: e.target.value }))
          }
          required
          placeholder="Enter your password"
          minLength={6}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="modal-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading
            ? "Please wait..."
            : activeTab === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>
        <button type="button" onClick={onClose} className="button-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderUserProfile = () => (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || "👤"}
        </div>
        <div className="user-details">
          <h3>{user?.name}</h3>
          <p className="user-email">{user?.email}</p>
          <div className="subscription-badge">
            {user?.subscription?.type === "premium" ? "⭐ Premium" : "🆓 Free"}
          </div>
        </div>
      </div>

      <div className="sync-section">
        <div className="sync-status">
          <div className="sync-indicator">
            <span
              className={`status-dot ${
                syncStatus.isOnline ? "online" : "offline"
              }`}
            ></span>
            <span className="status-text">
              {syncStatus.isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="sync-info">
            <p>Last sync: {formatLastSync(syncStatus.lastSyncTime)}</p>
            {syncStatus.pendingChanges > 0 && (
              <p className="pending-changes">
                {syncStatus.pendingChanges} pending changes
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSync}
          className={`sync-button ${syncStatus.isSyncing ? "syncing" : ""}`}
          disabled={isLoading || syncStatus.isSyncing || !syncStatus.isOnline}
        >
          {syncStatus.isSyncing ? (
            <>🔄 Syncing...</>
          ) : (
            <>{isMobile ? "🔄" : "🔄 Sync Now"}</>
          )}
        </button>
      </div>

      <div className="data-management">
        <h4>Data Management</h4>
        <div className="data-actions">
          <button onClick={onExportData} className="button-secondary">
            {isMobile ? "📤" : "📤 Export Data"}
          </button>
          <label className="button-secondary import-button">
            {isMobile ? "📥" : "📥 Import Data"}
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="modal-actions">
        <button onClick={onSignOut} className="button-danger">
          {isMobile ? "🚪" : "🚪 Sign Out"}
        </button>
        <button onClick={onClose} className="button-secondary">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-cabinet-modal-title"
    >
      <div
        className={`modal-content user-cabinet-modal ${
          isMobile ? "mobile" : "desktop"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="user-cabinet-modal-title" className="modal-header">
          {isMobile
            ? user
              ? "👤 Profile"
              : "🔐 Account"
            : user
            ? "👤 User Profile"
            : "🔐 Account Access"}
        </h3>

        {user ? renderUserProfile() : renderAuthForm()}
      </div>
    </div>
  );
}

export default UserCabinetModal;
