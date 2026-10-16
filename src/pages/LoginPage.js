/**
 * LoginPage.js — User Authentication Login Page
 */

import { auth } from "../auth.js";
import { router } from "../router.js";

export function createLoginPage() {
  const container = document.createElement("div");
  container.className = "page-auth";

  container.innerHTML = `
    <div class="auth-card-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <a href="/" data-route="/" class="auth-logo">AA<span>KAR</span></a>
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to access your private 3D workspace and photo vault.</p>
        </div>

        <div id="loginAlert" class="auth-alert" style="display: none;"></div>

        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="loginEmail" class="form-label">Email address</label>
            <input
              type="email"
              id="loginEmail"
              class="form-input"
              placeholder="name@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label for="loginPassword" class="form-label">Password</label>
            </div>
            <input
              type="password"
              id="loginPassword"
              class="form-input"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" id="loginSubmitBtn" class="btn-primary btn-block">
            Sign In ↗
          </button>
        </form>

        <!-- Quick Demo Account Fill -->
        <div class="auth-demo-box">
          <div class="demo-box-header">
            <span>Quick Testing?</span>
          </div>
          <button id="fillDemoBtn" type="button" class="btn-demo">
            Use Demo Account (demo@visionaryminds.com)
          </button>
        </div>

        <div class="auth-footer">
          <p>Don't have an account? <a href="/signup" data-route="/signup">Create an account →</a></p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector("#loginForm");
  const emailInput = container.querySelector("#loginEmail");
  const passwordInput = container.querySelector("#loginPassword");
  const alertEl = container.querySelector("#loginAlert");
  const demoBtn = container.querySelector("#fillDemoBtn");

  function showAlert(msg, isError = true) {
    alertEl.textContent = msg;
    alertEl.className = isError ? "auth-alert alert-error" : "auth-alert alert-success";
    alertEl.style.display = "block";
  }

  // Demo auto-fill
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      emailInput.value = "demo@visionaryminds.com";
      passwordInput.value = "password123";
      alertEl.style.display = "none";
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alertEl.style.display = "none";

      const email = emailInput.value;
      const password = passwordInput.value;

      const result = auth.login(email, password);
      if (!result.success) {
        showAlert(result.error, true);
        return;
      }

      showAlert("Login successful! Redirecting to workspace...", false);
      const redirectTarget = sessionStorage.getItem("aakar_redirect_after_login") || "/workspace";
      sessionStorage.removeItem("aakar_redirect_after_login");

      setTimeout(() => {
        router.navigate(redirectTarget);
      }, 350);
    });
  }

  // Intercept data-route links
  container.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute("data-route"));
    });
  });

  return container;
}
