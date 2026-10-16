/**
 * storage.js — User-Isolated Data Storage
 * Manages private photo uploads and chat histories strictly partitioned by userId.
 * No user can access or view another user's photos or conversations.
 */

const PHOTO_PREFIX = "aakar_photos_";
const CHAT_PREFIX = "aakar_chats_";
const SETTINGS_PREFIX = "aakar_settings_";

export const storage = {
  // ─── PHOTO VAULT (Isolated by userId) ───
  getPhotos(userId) {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(PHOTO_PREFIX + userId);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load user photos:", e);
      return [];
    }
  },

  savePhoto(userId, photo) {
    if (!userId || !photo) return null;
    try {
      const photos = this.getPhotos(userId);
      const newPhoto = {
        id: "photo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        userId,
        name: photo.name || "Space_Photo.jpg",
        size: photo.size || 0,
        type: photo.type || "image/jpeg",
        dataUrl: photo.dataUrl,
        status: "Ready for 3D Reconstruction",
        uploadedAt: new Date().toISOString(),
        tags: ["Indoor Room", "Raw Capture"]
      };
      photos.unshift(newPhoto);
      localStorage.setItem(PHOTO_PREFIX + userId, JSON.stringify(photos));
      return newPhoto;
    } catch (e) {
      console.error("Failed to save photo:", e);
      throw new Error("Storage quota exceeded or storage unavailable.");
    }
  },

  deletePhoto(userId, photoId) {
    if (!userId || !photoId) return false;
    try {
      const photos = this.getPhotos(userId).filter(p => p.id !== photoId);
      localStorage.setItem(PHOTO_PREFIX + userId, JSON.stringify(photos));
      return true;
    } catch (e) {
      console.error("Failed to delete photo:", e);
      return false;
    }
  },

  // ─── CHAT MESSAGES (Isolated by userId) ───
  getMessages(userId) {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(CHAT_PREFIX + userId);
      if (raw) return JSON.parse(raw);

      // Default welcome conversation for new user
      const defaultConvo = [
        {
          id: "msg_welcome",
          sender: "assistant",
          text: `Welcome to **Aakar** workspace! I am your 3D Reconstruction Assistant.\n\nYou can ask me questions about:\n- How to capture room photos for 3D reconstruction\n- Specifications and geometry of the current 3D living room model\n- Lighting, texturing, and WebGL rendering pipeline\n- Preparing your dataset for GLB export\n\nHow can I help you today?`,
          timestamp: new Date().toISOString()
        }
      ];
      this.saveMessages(userId, defaultConvo);
      return defaultConvo;
    } catch (e) {
      console.error("Failed to load user messages:", e);
      return [];
    }
  },

  saveMessages(userId, messages) {
    if (!userId) return;
    try {
      localStorage.setItem(CHAT_PREFIX + userId, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages:", e);
    }
  },

  addMessage(userId, message) {
    if (!userId || !message) return null;
    const messages = this.getMessages(userId);
    const newMsg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      sender: message.sender || "user",
      text: message.text || "",
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    this.saveMessages(userId, messages);
    return newMsg;
  },

  clearMessages(userId) {
    if (!userId) return;
    try {
      localStorage.removeItem(CHAT_PREFIX + userId);
    } catch (e) {
      console.error("Failed to clear messages:", e);
    }
  },

  // ─── SETTINGS (Isolated by userId) ───
  getSettings(userId) {
    if (!userId) return { apiKey: "", provider: "builtin" };
    try {
      const raw = localStorage.getItem(SETTINGS_PREFIX + userId);
      return raw ? JSON.parse(raw) : { apiKey: "", provider: "builtin" };
    } catch {
      return { apiKey: "", provider: "builtin" };
    }
  },

  saveSettings(userId, settings) {
    if (!userId) return;
    try {
      localStorage.setItem(SETTINGS_PREFIX + userId, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }
};
