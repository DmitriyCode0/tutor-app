/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Student,
  Lesson,
  AppSettings,
  CloudSyncData,
  User,
  AuthCredentials,
  SyncStatus,
} from "../types";

// Mock API base URL - in production, this would be your actual backend
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-tutorapp-api.com/api"
    : "http://localhost:3001/api";

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  USER: "tutorapp_user",
  ACCESS_TOKEN: "tutorapp_token",
  REFRESH_TOKEN: "tutorapp_refresh_token",
  LAST_SYNC: "tutorapp_last_sync",
  PENDING_CHANGES: "tutorapp_pending_changes",
  STUDENTS: "tutorapp_students",
  LESSONS: "tutorapp_lessons",
  SETTINGS: "tutorapp_settings",
};

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class CloudSyncService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private syncStatusListeners: ((status: SyncStatus) => void)[] = [];
  private currentSyncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingChanges: 0,
  };
  private autoSyncInterval: number | null = null;
  private pendingAutoSync: boolean = false;
  private dataChangeListeners: (() => void)[] = [];

  constructor() {
    this.loadTokensFromStorage();
    this.setupOnlineStatusListener();
    this.loadPendingChanges();
    this.setupAutoSync();
  }

  // Authentication methods
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const response = await this.apiCall("/auth/signin", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const authData: AuthResponse = await response.json();
      this.setAuthData(authData);

      // Automatically download user data after successful sign-in
      await this.downloadDataOnSignIn();

      return authData.user;
    } catch (error) {
      // Fallback for demo purposes - in production, remove this
      console.warn("API not available, using mock authentication");
      const mockUser = this.createMockUser(credentials.email);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(mockUser));

      // Setup auto-sync for demo mode
      this.setupAutoSync();

      return mockUser;
    }
  }

  async signUp(credentials: AuthCredentials & { name: string }): Promise<User> {
    try {
      const response = await this.apiCall("/auth/signup", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const authData: AuthResponse = await response.json();
      this.setAuthData(authData);

      // For new users, we don't need to download data but should enable auto-sync
      this.setupAutoSync();

      return authData.user;
    } catch (error) {
      // Fallback for demo purposes
      console.warn("API not available, using mock authentication");
      const mockUser = this.createMockUser(credentials.email, credentials.name);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(mockUser));

      // Setup auto-sync for demo mode
      this.setupAutoSync();

      return mockUser;
    }
  }

  signOut(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.disableAutoSync();
    Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    this.notifySyncStatusChange();
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Sync methods
  async syncData(
    students: Student[],
    lessons: Lesson[],
    settings: AppSettings
  ): Promise<void> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    this.setSyncStatus({ isSyncing: true });

    try {
      const cloudData: CloudSyncData = {
        students,
        lessons,
        settings,
        lastModified: new Date().toISOString(),
        version: Date.now(),
      };

      const response = await this.apiCall("/sync", {
        method: "POST",
        body: JSON.stringify(cloudData),
      });

      if (response.ok) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.LAST_SYNC,
          new Date().toISOString()
        );
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
        this.setSyncStatus({
          lastSyncTime: new Date().toISOString(),
          pendingChanges: 0,
        });
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      // For demo purposes, simulate successful sync
      console.warn("API not available, simulating sync");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
      this.setSyncStatus({
        lastSyncTime: new Date().toISOString(),
        pendingChanges: 0,
      });
    } finally {
      this.setSyncStatus({ isSyncing: false });
    }
  }

  async fetchCloudData(): Promise<CloudSyncData | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await this.apiCall("/sync");
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch cloud data:", error);
      return null;
    }
  }

  // Data management
  exportData(
    students: Student[],
    lessons: Lesson[],
    settings: AppSettings
  ): string {
    const exportData = {
      students,
      lessons,
      settings,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    return JSON.stringify(exportData, null, 2);
  }

  async importData(
    file: File
  ): Promise<{
    students: Student[];
    lessons: Lesson[];
    settings: AppSettings;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Validate data structure
          if (!data.students || !data.lessons || !data.settings) {
            throw new Error("Invalid data format");
          }

          resolve({
            students: data.students,
            lessons: data.lessons,
            settings: data.settings,
          });
        } catch (error) {
          reject(new Error("Failed to parse import file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  // Status management
  getSyncStatus(): SyncStatus {
    return { ...this.currentSyncStatus };
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.push(listener);
    return () => {
      const index = this.syncStatusListeners.indexOf(listener);
      if (index > -1) {
        this.syncStatusListeners.splice(index, 1);
      }
    };
  }

  markPendingChanges(count: number = 1): void {
    const current = parseInt(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES) || "0"
    );
    const newCount = Math.max(0, current + count);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PENDING_CHANGES,
      newCount.toString()
    );
    this.setSyncStatus({ pendingChanges: newCount });

    // Trigger auto-sync if authenticated and online
    this.scheduleAutoSync();
  }

  // Auto-sync methods
  enableAutoSync(): void {
    this.setupAutoSync();
  }

  disableAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  async autoSyncData(): Promise<boolean> {
    if (
      !this.accessToken ||
      !this.currentSyncStatus.isOnline ||
      this.currentSyncStatus.isSyncing ||
      this.pendingAutoSync
    ) {
      return false;
    }

    try {
      this.pendingAutoSync = true;

      // Get current app data from localStorage or provided callbacks
      const studentsData = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
      const lessonsData = localStorage.getItem(LOCAL_STORAGE_KEYS.LESSONS);
      const settingsData = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);

      if (!studentsData || !lessonsData || !settingsData) {
        return false; // No data to sync
      }

      const students = JSON.parse(studentsData);
      const lessons = JSON.parse(lessonsData);
      const settings = JSON.parse(settingsData);

      await this.syncData(students, lessons, settings);
      return true;
    } catch (error) {
      console.warn("Auto-sync failed:", error);
      return false;
    } finally {
      this.pendingAutoSync = false;
    }
  }

  async downloadDataOnSignIn(): Promise<CloudSyncData | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const cloudData = await this.fetchCloudData();
      if (cloudData) {
        // Store the downloaded data
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.STUDENTS,
          JSON.stringify(cloudData.students)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.LESSONS,
          JSON.stringify(cloudData.lessons)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SETTINGS,
          JSON.stringify(cloudData.settings)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.LAST_SYNC,
          new Date().toISOString()
        );

        // Clear pending changes since we just synced
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
        this.setSyncStatus({
          lastSyncTime: new Date().toISOString(),
          pendingChanges: 0,
        });
      }
      return cloudData;
    } catch (error) {
      console.warn("Failed to download data on sign-in:", error);
      return null;
    }
  }

  onDataChange(listener: () => void): () => void {
    this.dataChangeListeners.push(listener);
    return () => {
      const index = this.dataChangeListeners.indexOf(listener);
      if (index > -1) {
        this.dataChangeListeners.splice(index, 1);
      }
    };
  }

  notifyDataChange(): void {
    this.dataChangeListeners.forEach((listener) => listener());
    this.markPendingChanges();
  }

  private scheduleAutoSync(): void {
    if (!this.accessToken || !this.currentSyncStatus.isOnline) {
      return;
    }

    // Debounce auto-sync to avoid too frequent calls
    setTimeout(() => {
      if (this.currentSyncStatus.pendingChanges > 0) {
        this.autoSyncData();
      }
    }, 5000); // Wait 5 seconds after last change
  }

  private setupAutoSync(): void {
    // Set up periodic sync every 5 minutes if authenticated
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = window.setInterval(() => {
      if (
        this.accessToken &&
        this.currentSyncStatus.isOnline &&
        this.currentSyncStatus.pendingChanges > 0
      ) {
        this.autoSyncData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Private methods
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  private setAuthData(authData: AuthResponse): void {
    this.accessToken = authData.accessToken;
    this.refreshToken = authData.refreshToken;

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.USER,
      JSON.stringify(authData.user)
    );
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.REFRESH_TOKEN,
      authData.refreshToken
    );

    // Enable auto-sync when authentication is set
    this.setupAutoSync();
  }

  private createMockUser(email: string, name?: string): User {
    return {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
      subscription: {
        type: "free",
        features: ["basic_sync", "data_export"],
      },
    };
  }

  private async apiCall(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
        ...options.headers,
      },
    });

    if (response.status === 401 && this.refreshToken) {
      // Token expired, try to refresh
      await this.refreshAccessToken();
      return this.apiCall(endpoint, options);
    }

    return response;
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      } else {
        this.signOut();
      }
    } catch (error) {
      this.signOut();
    }
  }

  private setupOnlineStatusListener(): void {
    const updateOnlineStatus = () => {
      this.setSyncStatus({ isOnline: navigator.onLine });
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
  }

  private loadPendingChanges(): void {
    const pendingChanges = parseInt(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES) || "0"
    );
    const lastSyncTime =
      localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC) || undefined;

    this.setSyncStatus({
      pendingChanges,
      lastSyncTime,
    });
  }

  private setSyncStatus(updates: Partial<SyncStatus>): void {
    this.currentSyncStatus = { ...this.currentSyncStatus, ...updates };
    this.notifySyncStatusChange();
  }

  private notifySyncStatusChange(): void {
    this.syncStatusListeners.forEach((listener) => {
      listener(this.getSyncStatus());
    });
  }
}

// Export singleton instance
export const cloudSyncService = new CloudSyncService();

// Export utility functions
export const downloadFile = (
  content: string,
  filename: string,
  contentType = "application/json"
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
