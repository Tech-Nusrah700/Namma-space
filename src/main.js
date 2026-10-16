/**
 * main.js — Application Entry Point
 * Initializes router, routes, navbar, footer, and global effects.
 */

import "./style.css";
import { router } from "./router.js";
import { createNavbar } from "./components/Navbar.js";
import { createFooter } from "./components/Footer.js";

// Pages
import { createHomePage } from "./pages/HomePage.js";
import { createExplorePage } from "./pages/ExplorePage.js";
import { createAboutPage } from "./pages/AboutPage.js";
import { createLoginPage } from "./pages/LoginPage.js";
import { createSignupPage } from "./pages/SignupPage.js";
import { createWorkspacePage } from "./pages/WorkspacePage.js";
import { createProfilePage } from "./pages/ProfilePage.js";

// Mount Navbar and Footer
const navbarRoot = document.getElementById("navbar-root");
const appRoot = document.getElementById("app-root");
const footerRoot = document.getElementById("footer-root");

if (navbarRoot) {
  navbarRoot.appendChild(createNavbar());
}

if (footerRoot) {
  footerRoot.appendChild(createFooter());
}

// Register Routes
router.register("/", createHomePage, {
  title: "Aakar | 3D Space Exploration"
});

router.register("/explore", createExplorePage, {
  title: "Explore 3D Environment | Aakar"
});

router.register("/about", createAboutPage, {
  title: "About & Process | Aakar"
});

router.register("/login", createLoginPage, {
  title: "Log In | Aakar"
});

router.register("/signup", createSignupPage, {
  title: "Sign Up | Aakar"
});

router.register("/workspace", createWorkspacePage, {
  requiresAuth: true,
  title: "Workspace · Chat & Photos | Aakar"
});

router.register("/profile", createProfilePage, {
  requiresAuth: true,
  title: "Profile & Settings | Aakar"
});

// Initialize router with app container
if (appRoot) {
  router.init(appRoot);
}

// Global window scroll effects for navbar
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  }
}, { passive: true });
