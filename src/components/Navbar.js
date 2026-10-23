/**
 * Navbar.js — Responsive Header with Active Route and Auth State
 */

import { auth } from "../auth.js";
import { router } from "../router.js";

export function createNavbar() {
  const header = document.createElement("header");
  header.className = "navbar";
  header.id = "navbar";

  function render() {
    const user = auth.getCurrentUser();
    const currentPath = router.getCurrentPath();

    header.innerHTML = `
      <a class="logo" href="/" data-route="/">AA<span>KAR</span></a>

      <nav class="nav-links" id="nav-links">
        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to light theme">
          <span aria-hidden="true">☀</span><span class="theme-toggle-label">Light mode</span>
        </button>
        <a href="/" class="nav-link ${currentPath === "/" ? "active" : ""}" data-route="/">Home</a>
        <a href="/explore" class="nav-link ${currentPath === "/explore" ? "active" : ""}" data-route="/explore">Explore 3D</a>
        <a href="/about" class="nav-link ${currentPath === "/about" ? "active" : ""}" data-route="/about">About & Process</a>
        ${
          user
            ? `
              <a href="/workspace" class="nav-link ${currentPath === "/workspace" ? "active" : ""}" data-route="/workspace">Workspace</a>
              <div class="nav-user-menu">
                <a href="/profile" class="nav-user-chip ${currentPath === "/profile" ? "active" : ""}" data-route="/profile" title="View Profile">
                  <span class="user-avatar-badge">${user.avatar || "U"}</span>
                  <span class="user-name-text">${escapeHtml(user.name.split(" ")[0])}</span>
                </a>
                <button class="nav-logout-btn" id="navLogoutBtn" title="Log Out">Log Out</button>
              </div>
            `
            : `
              <a href="/login" class="nav-link ${currentPath === "/login" ? "active" : ""}" data-route="/login">Log In</a>
              <a href="/signup" class="nav-cta" data-route="/signup">Sign Up ↗</a>
            `
        }
      </nav>

      <button class="hamburger" id="hamburger" aria-label="Toggle navigation menu">
        <span></span><span></span><span></span>
      </button>
    `;

    // Attach listeners
    const hamburger = header.querySelector("#hamburger");
    const navLinks = header.querySelector("#nav-links");

    const themeToggle = header.querySelector("#themeToggle");
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem("aakar-theme", theme); } catch { /* Storage may be unavailable. */ }
      if (themeToggle) {
        const light = theme === "light";
        themeToggle.setAttribute("aria-label", `Switch to ${light ? "dark" : "light"} theme`);
        themeToggle.innerHTML = `<span aria-hidden="true">${light ? "☾" : "☀"}</span><span class="theme-toggle-label">${light ? "Dark mode" : "Light mode"}</span>`;
      }
    };
    let savedTheme = "dark";
    try { savedTheme = localStorage.getItem("aakar-theme") || "dark"; } catch { /* Use the default theme. */ }
    applyTheme(savedTheme === "light" ? "light" : "dark");
    themeToggle?.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        hamburger.classList.toggle("open", isOpen);
        hamburger.setAttribute("aria-expanded", isOpen);
      });
    }

    const logoutBtn = header.querySelector("#navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        auth.logout();
        router.navigate("/login");
      });
    }

    // Intercept clicks on data-route links
    header.querySelectorAll("a[data-route]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = link.getAttribute("data-route");
        if (navLinks) navLinks.classList.remove("open");
        if (hamburger) hamburger.classList.remove("open");
        router.navigate(route);
      });
    });
  }

  // Subscribe to auth & route changes
  auth.onAuthStateChanged(() => render());
  window.addEventListener("routechange", () => render());

  render();
  return header;
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
