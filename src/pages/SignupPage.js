/**
 * SignupPage.js — User Registration Page
 */

import { auth } from "../auth.js";
import { router } from "../router.js";

export function createSignupPage() {
  const container = document.createElement("div");
  container.className = "page-auth";

  container.innerHTML = `
    <div class="auth-card-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <a href="/" data-route="/" class="auth-logo">AA<span>KAR</span></a>
          <h1 class="auth-title">Create your account</h1>
          <p class="auth-subtitle">Join VisionaryMinds to reconstruct and explore custom 3D indoor spaces.</p>
        </div>

        <div id="signupAlert" class="auth-alert" style="display: none;"></div>

        <form id="signupForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="signupName" class="form-label">Full Name</label>
            <input
              type="text"
              id="signupName"
              class="form-input"
              placeholder="e.g. Aarti Gupta"
              required
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label for="signupEmail" class="form-label">Email address</label>
            <input
              type="email"
              id="signupEmail"
              class="form-input"
              placeholder="name@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="signupPassword" class="form-label">Password</label>
            <input
              type="password"
              id="signupPassword"
              class="form-input"
              placeholder="Minimum 6 characters"
              required
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="signupConfirm" class="form-label">Confirm Password</label>
            <input
              type="password"
              id="signupConfirm"
              class="form-input"
              placeholder="Re-enter your password"
              required
              autocomplete="new-password"
            />
          </div>

          <button type="submit" id="signupSubmitBtn" class="btn-primary btn-block">
            Create Account ↗
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a href="/login" data-route="/login">Sign in here →</a></p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector("#signupForm");
  const nameInput = container.querySelector("#signupName");
  const emailInput = container.querySelector("#signupEmail");
  const passInput = container.querySelector("#signupPassword");
  const confirmInput = container.querySelector("#signupConfirm");
  const alertEl = container.querySelector("#signupAlert");

  function showAlert(msg, isError = true) {
    alertEl.textContent = msg;
    alertEl.className = isError ? "auth-alert alert-error" : "auth-alert alert-success";
    alertEl.style.display = "block";
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alertEl.style.display = "none";

      const name = nameInput.value;
      const email = emailInput.value;
      const pass = passInput.value;
      const confirm = confirmInput.value;

      const result = auth.signup(name, email, pass, confirm);
      if (!result.success) {
        showAlert(result.error, true);
        return;
      }

      showAlert("Account created successfully! Entering workspace...", false);
      setTimeout(() => {
        router.navigate("/workspace");
      }, 400);
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
