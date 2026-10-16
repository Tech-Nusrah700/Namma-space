/**
 * ProfilePage.js — Account Profile & Activity Summary Page
 */

import { auth } from "../auth.js";
import { storage } from "../storage.js";
import { router } from "../router.js";

export function createProfilePage() {
  const user = auth.getCurrentUser();
  if (!user) {
    router.navigate("/login");
    return document.createElement("div");
  }

  const photos = storage.getPhotos(user.id);
  const messages = storage.getMessages(user.id);

  const container = document.createElement("div");
  container.className = "page-profile";

  container.innerHTML = `
    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-header-banner">
          <div class="profile-avatar-large">${escapeHtml(user.avatar || "U")}</div>
        </div>

        <div class="profile-body">
          <h1 class="profile-name">${escapeHtml(user.name)}</h1>
          <p class="profile-email">${escapeHtml(user.email)}</p>
          <span class="profile-role-badge">${escapeHtml(user.role || "Explorer")}</span>

          <!-- Activity Stats -->
          <div class="profile-stats-grid">
            <div class="p-stat-box">
              <span class="p-stat-num">${photos.length}</span>
              <span class="p-stat-label">Photos in Vault</span>
            </div>
            <div class="p-stat-box">
              <span class="p-stat-num">${messages.length}</span>
              <span class="p-stat-label">Chat Messages</span>
            </div>
            <div class="p-stat-box">
              <span class="p-stat-num">Active</span>
              <span class="p-stat-label">Session Status</span>
            </div>
          </div>

          <!-- Account Details -->
          <div class="profile-info-section">
            <h3 class="profile-section-title">Account Information</h3>
            <div class="profile-meta-list">
              <div class="profile-meta-row">
                <span class="pm-label">User ID:</span>
                <span class="pm-val"><code>${escapeHtml(user.id)}</code></span>
              </div>
              <div class="profile-meta-row">
                <span class="pm-label">Member Since:</span>
                <span class="pm-val">${new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="profile-meta-row">
                <span class="pm-label">Storage Type:</span>
                <span class="pm-val">Isolated Encrypted Local Vault</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="profile-actions">
            <a href="/workspace" data-route="/workspace" class="btn-primary">
              Open Workspace ↗
            </a>
            <a href="/explore" data-route="/explore" class="btn-ghost">
              Explore 3D Room →
            </a>
            <button id="profileLogoutBtn" class="btn-ghost btn-danger">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const logoutBtn = container.querySelector("#profileLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to sign out?")) {
        auth.logout();
        router.navigate("/login");
      }
    });
  }

  container.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute("data-route"));
    });
  });

  return container;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
