/**
 * router.js — Client-Side SPA Router with Route Guards and History / Hash Fallback
 */

import { auth } from "./auth.js";

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentPageInstance = null;
    this.appContainer = null;

    // Listen to browser navigation
    window.addEventListener("popstate", () => this._handleLocationChange());
    window.addEventListener("hashchange", () => this._handleLocationChange());
  }

  init(appContainer) {
    this.appContainer = appContainer;
    this._handleLocationChange();
  }

  register(path, pageFactory, options = {}) {
    this.routes[path] = {
      factory: pageFactory,
      requiresAuth: options.requiresAuth || false,
      title: options.title || "Aakar | 3D Space Exploration"
    };
  }

  getCurrentPath() {
    let path = window.location.pathname;
    // Check if hash-based routing is used as fallback
    if (window.location.hash && window.location.hash.startsWith("#/")) {
      path = window.location.hash.substring(1);
    }
    // Clean trailing slash
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path || "/";
  }

  navigate(path) {
    const cleanPath = path.startsWith("/") ? path : "/" + path;
    if (this.getCurrentPath() === cleanPath) return;

    try {
      window.history.pushState({}, "", cleanPath);
    } catch {
      window.location.hash = "#" + cleanPath;
    }
    this._handleLocationChange();
  }

  _handleLocationChange() {
    let path = this.getCurrentPath();
    let routeConfig = this.routes[path];

    // If exact route not found, check fallback or match home
    if (!routeConfig) {
      if (this.routes["/"]) {
        routeConfig = this.routes["/"];
        path = "/";
      } else {
        console.error("No matching route for:", path);
        return;
      }
    }

    const user = auth.getCurrentUser();

    // Route Guard 1: Protected route requires authentication
    if (routeConfig.requiresAuth && !user) {
      sessionStorage.setItem("aakar_redirect_after_login", path);
      this.navigate("/login");
      return;
    }

    // Route Guard 2: Logged in users visiting login or signup go to workspace
    if ((path === "/login" || path === "/signup") && user) {
      this.navigate("/workspace");
      return;
    }

    // Destroy previous page if it implements destroy()
    if (this.currentPageInstance && typeof this.currentPageInstance.destroy === "function") {
      try {
        this.currentPageInstance.destroy();
      } catch (err) {
        console.warn("Error destroying previous page:", err);
      }
    }

    this.currentRoute = path;
    document.title = routeConfig.title;

    // Render new page
    if (this.appContainer) {
      this.appContainer.innerHTML = "";
      window.scrollTo(0, 0);

      this.currentPageInstance = routeConfig.factory();
      if (this.currentPageInstance instanceof HTMLElement) {
        this.appContainer.appendChild(this.currentPageInstance);
      } else if (this.currentPageInstance && this.currentPageInstance.element) {
        this.appContainer.appendChild(this.currentPageInstance.element);
      }
    }

    // Dispatch custom routechange event
    window.dispatchEvent(
      new CustomEvent("routechange", {
        detail: { path, title: routeConfig.title }
      })
    );
  }
}

export const router = new Router();
