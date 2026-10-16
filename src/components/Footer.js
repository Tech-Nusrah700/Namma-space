/**
 * Footer.js — Site Footer
 */

import { router } from "../router.js";

export function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-left">
        <a class="logo" href="/" data-route="/">AA<span>KAR</span></a>
        <p>Real Spaces. Digital Experiences.<br/>High-fidelity indoor 3D reconstruction and browser exploration.</p>
      </div>

      <nav class="footer-links" aria-label="Footer navigation">
        <span class="footer-heading">Navigation</span>
        <a href="/" data-route="/">Home</a>
        <a href="/explore" data-route="/explore">Explore 3D</a>
        <a href="/about" data-route="/about">About & Process</a>
        <a href="/workspace" data-route="/workspace">Private Workspace</a>
      </nav>

      <div class="footer-right">
        <span class="footer-heading">Visionary Minds</span>
        <p>Digitally reconstructing physical spaces with web-first WebGL technology.</p>
        <a href="https://github.com/Tech-Nusrah700/Namma-space.git"
           target="_blank" rel="noopener noreferrer"
           class="footer-gh">
          GitHub Repository ↗
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2024–2026 Aakar · Team Visionary Minds · All rights reserved</span>
    </div>
  `;

  footer.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const route = link.getAttribute("data-route");
      router.navigate(route);
    });
  });

  return footer;
}
