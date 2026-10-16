/**
 * auth.js — Aakar Authentication Service
 * Provides secure client-side authentication, user persistence,
 * session management, and auth state change listeners.
 */

const USERS_STORAGE_KEY = "aakar_users";
const SESSION_STORAGE_KEY = "aakar_session";

// Default demo account
const DEFAULT_DEMO_USER = {
  id: "usr_demo_visionary",
  name: "Demo Explorer",
  email: "demo@visionaryminds.com",
  passwordHash: btoa("password123"), // obfuscated demo password
  role: "Explorer",
  createdAt: "2024-10-01T10:00:00.000Z",
  avatar: "VE"
};

class AuthService {
  constructor() {
    this._listeners = new Set();
    this._initStorage();
  }

  _initStorage() {
    if (typeof localStorage === "undefined") return;
    try {
      const existing = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
      } else {
        const users = JSON.parse(existing);
        if (!users.some(u => u.email === DEFAULT_DEMO_USER.email)) {
          users.push(DEFAULT_DEMO_USER);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }

  _getUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [DEFAULT_DEMO_USER];
    } catch {
      return [DEFAULT_DEMO_USER];
    }
  }

  _saveUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users:", e);
    }
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      // Verify user still exists
      const users = this._getUsers();
      const user = users.find(u => u.id === session.userId);
      if (!user) {
        this.logout();
        return null;
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "Member",
        createdAt: user.createdAt,
        avatar: user.avatar || user.name.slice(0, 2).toUpperCase()
      };
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  login(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: "Please enter both email and password." };
    }

    const users = this._getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: "No account found with this email. Please check your spelling or sign up."
      };
    }

    if (user.passwordHash !== btoa(cleanPassword)) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // Set session
    const session = {
      userId: user.id,
      token: `aakar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this._notify();

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "Member",
        avatar: user.avatar || user.name.slice(0, 2).toUpperCase()
      }
    };
  }

  signup(name, email, password, confirmPassword) {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const cleanConfirm = (confirmPassword || "").trim();

    if (!cleanName) {
      return { success: false, error: "Please provide your full name." };
    }
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return { success: false, error: "Please provide a valid email address." };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }
    if (cleanPassword !== cleanConfirm) {
      return { success: false, error: "Passwords do not match." };
    }

    const users = this._getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists. Please log in instead." };
    }

    const initials = cleanName
      .split(" ")
      .filter(Boolean)
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NS";

    const newUser = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      email: cleanEmail,
      passwordHash: btoa(cleanPassword),
      role: "Member",
      createdAt: new Date().toISOString(),
      avatar: initials
    };

    users.push(newUser);
    this._saveUsers(users);

    // Auto log in new user
    const session = {
      userId: newUser.id,
      token: `aakar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this._notify();

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    };
  }

  logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this._notify();
  }

  onAuthStateChanged(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    const user = this.getCurrentUser();
    this._listeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
  }
}

export const auth = new AuthService();
