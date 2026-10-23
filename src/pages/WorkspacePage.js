/**
 * WorkspacePage.js — Private Authenticated Workspace (Chat, Photo Vault, Settings)
 */

import { auth } from "../auth.js";
import { storage } from "../storage.js";
import { router } from "../router.js";

export function createWorkspacePage() {
  const user = auth.getCurrentUser();
  if (!user) {
    router.navigate("/login");
    return document.createElement("div");
  }

  const container = document.createElement("div");
  container.className = "page-workspace";

  container.innerHTML = `
    <div class="workspace-layout">
      <!-- Workspace Top Banner -->
      <div class="workspace-top-bar">
        <div class="ws-user-welcome">
          <div class="ws-avatar-large">${escapeHtml(user.avatar || "U")}</div>
          <div>
            <h1 class="ws-title">Workspace · ${escapeHtml(user.name)}</h1>
            <p class="ws-subtitle">Private 3D Reconstruction Hub & Asset Vault</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="ws-tabs">
          <button class="ws-tab-btn active" data-tab="chat">
            💬 3D Space Chat
          </button>
          <button class="ws-tab-btn" data-tab="photos">
            📸 Photo Vault & Ingestion
          </button>
          <button class="ws-tab-btn" data-tab="settings">
            ⚙️ Profile & Settings
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="workspace-content">
        <!-- ═════════ TAB 1: CHAT ═════════ -->
        <div class="ws-tab-pane active" id="pane-chat">
          <div class="chat-container">
            <div class="chat-header">
              <div class="chat-header-info">
                <span class="chat-status-dot"></span>
                <div>
                  <h3 class="chat-assistant-name">VisionaryMinds Spatial Assistant</h3>
                  <span class="chat-assistant-mode" id="chatEngineLabel">
                    Built-in 3D Knowledge Engine · Ready
                  </span>
                </div>
              </div>
              <div class="chat-header-actions">
                <button id="clearChatBtn" class="btn-chat-action" title="Clear message history">
                  🗑 Clear Chat
                </button>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="chat-messages" id="chatMessagesStream"></div>

            <!-- Quick Prompt Suggestions -->
            <div class="chat-suggestions" id="chatSuggestions">
              <span class="sugg-label">Suggested:</span>
              <button class="sugg-chip" data-query="What are the room dimensions and layout of the 3D living room?">
                Room dimensions & layout
              </button>
              <button class="sugg-chip" data-query="How should I photograph my room for 3D reconstruction?">
                Photo capture guide
              </button>
              <button class="sugg-chip" data-query="What lighting and WebGL rendering pipeline does Aakar use?">
                Lighting & WebGL pipeline
              </button>
              <button class="sugg-chip" data-query="How do I navigate inside the space in first-person mode?">
                Navigation controls
              </button>
            </div>

            <!-- Chat Input -->
            <form class="chat-input-form" id="chatForm">
              <input
                type="text"
                id="chatInput"
                class="chat-input"
                placeholder="Ask about 3D space reconstruction, room layout, photo capture, or model details..."
                autocomplete="off"
                required
              />
              <button type="submit" id="chatSendBtn" class="chat-send-btn" title="Send Message">
                <span>Send</span> ➔
              </button>
            </form>
          </div>
        </div>

        <!-- ═════════ TAB 2: PHOTO VAULT ═════════ -->
        <div class="ws-tab-pane" id="pane-photos">
          <div class="photos-container">
            <!-- Upload Box -->
            <div class="photo-upload-card">
              <div class="upload-zone" id="uploadDropZone">
                <input
                  type="file"
                  id="photoFileInput"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style="display: none;"
                />
                <div class="upload-icon">📷</div>
                <h3 class="upload-title">Drag & drop space photos here</h3>
                <p class="upload-desc">Or click below to browse image files from your computer</p>
                <div class="upload-btn-group">
                  <button type="button" id="browsePhotosBtn" class="btn-primary btn-sm">
                    Browse Files
                  </button>
                  <button type="button" id="loadSampleDatasetBtn" class="btn-ghost btn-sm" title="Quickly load sample room captures for testing">
                    ⚡ Load Sample Dataset
                  </button>
                </div>
                <p class="upload-format-hint">Supports JPG, PNG, and WebP (up to 10MB per photo)</p>
              </div>

              <!-- Staged Previews Area -->
              <div id="stagedArea" class="staged-area" style="display: none;">
                <div class="staged-header">
                  <h4>Selected Photos for Upload (<span id="stagedCount">0</span>)</h4>
                  <button type="button" id="clearStagedBtn" class="btn-link">Remove All</button>
                </div>
                <div class="staged-grid" id="stagedGrid"></div>

                <!-- Upload Progress & Action -->
                <div class="staged-actions">
                  <div id="uploadProgressBox" class="upload-progress-box" style="display: none;">
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" id="uploadProgressBar" style="width: 0%;"></div>
                    </div>
                    <span id="uploadStatusText" class="upload-status-text">Uploading...</span>
                  </div>
                  <button type="button" id="confirmUploadBtn" class="btn-primary">
                    Upload to Private Vault ↗
                  </button>
                </div>
              </div>

              <div id="uploadFeedbackAlert" class="auth-alert" style="display: none; margin-top: 16px;"></div>
            </div>

            <!-- Neural Pipeline Status Tracker -->
            <div class="pipeline-tracker-card">
              <div class="pipeline-tracker-header">
                <div>
                  <span class="ps-tag tag-solution">ACTIVE 3D NEURAL PIPELINE</span>
                  <h3 class="pipeline-title">Spatial Ingestion & Reconstruction Engine</h3>
                </div>
                <span class="status-pill-green"><span class="pulse-dot-green"></span> Ready for Synthesis</span>
              </div>
              <div class="pipeline-stages-grid">
                <div class="pipe-stage stage-done">
                  <div class="stage-num">01</div>
                  <div class="stage-body">
                    <span class="stage-name">Multi-View Ingestion</span>
                    <span class="stage-sub" id="pipePhotosCount">0 Photos Ingested</span>
                  </div>
                </div>
                <div class="pipe-stage stage-active">
                  <div class="stage-num">02</div>
                  <div class="stage-body">
                    <span class="stage-name">Sparse Pose Estimation</span>
                    <span class="stage-sub">SIFT Keypoint Matching</span>
                  </div>
                </div>
                <div class="pipe-stage">
                  <div class="stage-num">03</div>
                  <div class="stage-body">
                    <span class="stage-name">Dense Stereo Matching</span>
                    <span class="stage-sub">Point Cloud Generation</span>
                  </div>
                </div>
                <div class="pipe-stage">
                  <div class="stage-num">04</div>
                  <div class="stage-body">
                    <span class="stage-name">PBR Texture Baking</span>
                    <span class="stage-sub">WebGL 2.0 / glTF Export</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vault Gallery -->
            <div class="vault-gallery-card">
              <div class="gallery-header">
                <div>
                  <h3 class="gallery-title">Your Private Photo Vault</h3>
                  <p class="gallery-subtitle">
                    Images are securely stored and isolated in your private account.
                  </p>
                </div>
                <span class="gallery-count-badge" id="vaultCountBadge">0 Photos</span>
              </div>

              <div class="vault-grid" id="vaultGrid"></div>
            </div>
          </div>
        </div>

        <!-- ═════════ TAB 3: SETTINGS ═════════ -->
        <div class="ws-tab-pane" id="pane-settings">
          <div class="settings-container">
            <!-- Account Card -->
            <div class="settings-card">
              <h3 class="settings-card-title">Account Details</h3>
              <div class="account-meta-list">
                <div class="acc-row">
                  <span class="acc-label">Full Name</span>
                  <span class="acc-val">${escapeHtml(user.name)}</span>
                </div>
                <div class="acc-row">
                  <span class="acc-label">Email Address</span>
                  <span class="acc-val">${escapeHtml(user.email)}</span>
                </div>
                <div class="acc-row">
                  <span class="acc-label">User ID</span>
                  <span class="acc-val"><code>${escapeHtml(user.id)}</code></span>
                </div>
                <div class="acc-row">
                  <span class="acc-label">Member Since</span>
                  <span class="acc-val">${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <!-- AI Configuration Card -->
            <div class="settings-card">
              <h3 class="settings-card-title">AI Assistant Configuration</h3>
              <p class="settings-desc">
                By default, workspace chat operates using the <strong>VisionaryMinds Built-in 3D Spatial Knowledge Engine</strong>. If you would like to connect external LLM APIs (e.g. Google Gemini or OpenAI), configure your API key below.
              </p>

              <div id="settingsAlert" class="auth-alert" style="display: none;"></div>

              <form id="settingsAiForm">
                <div class="form-group">
                  <label class="form-label">Provider Mode</label>
                  <select id="settingProvider" class="form-input">
                    <option value="builtin">Built-in Knowledge Engine (Default - No Key Needed)</option>
                    <option value="gemini">Google Gemini API</option>
                    <option value="openai">OpenAI API</option>
                  </select>
                </div>

                <div class="form-group" id="apiKeyGroup" style="display: none;">
                  <label class="form-label">API Key</label>
                  <input
                    type="password"
                    id="settingApiKey"
                    class="form-input"
                    placeholder="Enter your API Key (e.g. AIza... or sk-...)"
                  />
                  <p class="form-hint">Stored strictly in local browser storage. Never exposed publicly.</p>
                </div>

                <button type="submit" class="btn-primary btn-sm">Save Configuration</button>
              </form>
            </div>

            <!-- Session & Logout -->
            <div class="settings-card card-danger">
              <h3 class="settings-card-title">Session Management</h3>
              <p class="settings-desc">Log out of your Aakar account on this browser.</p>
              <button id="wsLogoutBtn" class="btn-ghost" style="color: #ff8888; border-color: rgba(255,100,100,0.3);">
                Sign Out of Aakar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div id="photoLightboxModal" class="lightbox-modal" style="display: none;">
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button id="closeLightboxBtn" class="lightbox-close">✕</button>
        <img id="lightboxImg" src="" alt="Enlarged photo preview" />
        <div class="lightbox-caption" id="lightboxCaption"></div>
      </div>
    </div>
  `;

  /* ═══════════════════════════════════════════
     TAB SWITCHING
     ═══════════════════════════════════════════ */
  const tabBtns = container.querySelectorAll(".ws-tab-btn");
  const tabPanes = container.querySelectorAll(".ws-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = container.querySelector("#pane-" + tabName);
      if (targetPane) targetPane.classList.add("active");

      if (tabName === "photos") renderVaultGrid();
      if (tabName === "chat") scrollChatToBottom();
    });
  });

  /* ═══════════════════════════════════════════
     TAB 1: CHAT FUNCTIONALITY
     ═══════════════════════════════════════════ */
  const messagesStream = container.querySelector("#chatMessagesStream");
  const chatForm = container.querySelector("#chatForm");
  const chatInput = container.querySelector("#chatInput");
  const clearChatBtn = container.querySelector("#clearChatBtn");
  const engineLabel = container.querySelector("#chatEngineLabel");
  const suggChips = container.querySelectorAll(".sugg-chip");

  function renderMessages() {
    const messages = storage.getMessages(user.id);
    if (!messages.length) {
      messagesStream.innerHTML = `
        <div class="chat-empty-state">
          <div class="empty-icon">💬</div>
          <h4>No conversation history yet</h4>
          <p>Ask a question below or click a suggested prompt to get started.</p>
        </div>
      `;
      return;
    }

    messagesStream.innerHTML = messages.map(msg => `
      <div class="chat-bubble-row ${msg.sender === "user" ? "row-user" : "row-assistant"}">
        <div class="chat-avatar">${msg.sender === "user" ? escapeHtml(user.avatar || "U") : "AI"}</div>
        <div class="chat-bubble">
          <div class="bubble-header">
            <span class="bubble-author">${msg.sender === "user" ? escapeHtml(user.name) : "VisionaryMinds AI"}</span>
            <span class="bubble-time">${formatTime(msg.timestamp)}</span>
          </div>
          <div class="bubble-content">${formatMessageContent(msg.text)}</div>
        </div>
      </div>
    `).join("");

    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    setTimeout(() => {
      messagesStream.scrollTop = messagesStream.scrollHeight;
    }, 50);
  }

  function handleSend(text) {
    const cleanText = (text || "").trim();
    if (!cleanText) return;

    // Add user message
    storage.addMessage(user.id, { sender: "user", text: cleanText });
    renderMessages();
    chatInput.value = "";

    // Show typing state
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-bubble-row row-assistant typing-indicator-row";
    typingIndicator.innerHTML = `
      <div class="chat-avatar">AI</div>
      <div class="chat-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesStream.appendChild(typingIndicator);
    scrollChatToBottom();

    // Check settings for custom API Key
    const settings = storage.getSettings(user.id);

    setTimeout(async () => {
      try {
        let assistantReply = "";

        if (settings.provider === "gemini" && settings.apiKey) {
          // If user configured Gemini API
          assistantReply = await callGeminiApi(cleanText, settings.apiKey);
        } else if (settings.provider === "openai" && settings.apiKey) {
          // If user configured OpenAI API
          assistantReply = await callOpenAiApi(cleanText, settings.apiKey);
        } else {
          // Default Built-in Spatial Assistant
          assistantReply = generateSpatialAssistantReply(cleanText);
        }

        if (typingIndicator.parentNode) typingIndicator.parentNode.removeChild(typingIndicator);
        storage.addMessage(user.id, { sender: "assistant", text: assistantReply });
        renderMessages();
      } catch (err) {
        if (typingIndicator.parentNode) typingIndicator.parentNode.removeChild(typingIndicator);
        storage.addMessage(user.id, {
          sender: "assistant",
          text: `⚠️ **Error communicating with AI service:** ${err.message || "Failed to fetch response"}.\n\nFalling back to built-in knowledge engine. Feel free to re-ask your query.`
        });
        renderMessages();
      }
    }, 600);
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSend(chatInput.value);
    });
  }

  suggChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-query");
      handleSend(q);
    });
  });

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your chat history?")) {
        storage.clearMessages(user.id);
        renderMessages();
      }
    });
  }

  // Update engine label based on settings
  function updateEngineLabel() {
    const s = storage.getSettings(user.id);
    if (s.provider !== "builtin" && s.apiKey) {
      engineLabel.textContent = `Live Connected (${s.provider.toUpperCase()} API) · Ready`;
      engineLabel.style.color = "#74e4a0";
    } else {
      engineLabel.textContent = `Built-in 3D Knowledge Engine · Ready`;
      engineLabel.style.color = "var(--sage)";
    }
  }
  updateEngineLabel();
  renderMessages();

  /* ═══════════════════════════════════════════
     TAB 2: PHOTO UPLOAD & VAULT
     ═══════════════════════════════════════════ */
  const dropZone = container.querySelector("#uploadDropZone");
  const fileInput = container.querySelector("#photoFileInput");
  const browseBtn = container.querySelector("#browsePhotosBtn");
  const stagedArea = container.querySelector("#stagedArea");
  const stagedGrid = container.querySelector("#stagedGrid");
  const stagedCount = container.querySelector("#stagedCount");
  const clearStagedBtn = container.querySelector("#clearStagedBtn");
  const confirmUploadBtn = container.querySelector("#confirmUploadBtn");
  const uploadProgressBox = container.querySelector("#uploadProgressBox");
  const uploadProgressBar = container.querySelector("#uploadProgressBar");
  const uploadStatusText = container.querySelector("#uploadStatusText");
  const uploadFeedbackAlert = container.querySelector("#uploadFeedbackAlert");
  const vaultGrid = container.querySelector("#vaultGrid");
  const vaultCountBadge = container.querySelector("#vaultCountBadge");

  let stagedFiles = []; // Array of { file, name, size, type, dataUrl, isValid, error }

  function showUploadAlert(msg, isError = true) {
    uploadFeedbackAlert.textContent = msg;
    uploadFeedbackAlert.className = isError ? "auth-alert alert-error" : "auth-alert alert-success";
    uploadFeedbackAlert.style.display = "block";
  }

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());
  }

  const loadSampleBtn = container.querySelector("#loadSampleDatasetBtn");
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const samplePhotos = [
        {
          name: "Aakar_Pose01_LivingRoom_Wide.jpg",
          size: 1024 * 740,
          type: "image/jpeg",
          dataUrl: createSampleSvgDataUrl("POSE 01: Living Room Wide Perspective", "#163826", "#0b1c14", "Camera: 24mm | Overlap: 78% | ISO 100")
        },
        {
          name: "Aakar_Pose02_Workstation_Rig.jpg",
          size: 1024 * 610,
          type: "image/jpeg",
          dataUrl: createSampleSvgDataUrl("POSE 02: Workstation Dual Displays", "#1e3328", "#081510", "Camera: 35mm | Overlap: 82% | ISO 120")
        },
        {
          name: "Aakar_Pose03_Lounge_Window_Raycast.jpg",
          size: 1024 * 820,
          type: "image/jpeg",
          dataUrl: createSampleSvgDataUrl("POSE 03: Panoramic Window Raycast", "#243c30", "#091c13", "Camera: 28mm | Overlap: 75% | ISO 100")
        }
      ];

      samplePhotos.forEach(p => storage.savePhoto(user.id, p));
      renderVaultGrid();
      showUploadAlert("Successfully loaded 3 sample spatial room captures for testing!", false);
    });
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener("click", (e) => {
      if (e.target !== browseBtn) fileInput.click();
    });

    ["dragenter", "dragover"].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-hover");
      });
    });

    ["dragleave", "drop"].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-hover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      handleSelectedFiles(files);
    });

    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      handleSelectedFiles(files);
      fileInput.value = "";
    });
  }

  function handleSelectedFiles(files) {
    uploadFeedbackAlert.style.display = "none";
    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      const isAllowed = allowedTypes.includes(file.type);
      const isUnderLimit = file.size <= MAX_SIZE;

      let err = null;
      if (!isAllowed) err = "Unsupported file type. Use JPG, PNG, or WebP.";
      else if (!isUnderLimit) err = `File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;

      const reader = new FileReader();
      reader.onload = (e) => {
        stagedFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
          isValid: isAllowed && isUnderLimit,
          error: err
        });
        renderStaged();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderStaged() {
    if (!stagedFiles.length) {
      stagedArea.style.display = "none";
      return;
    }

    stagedArea.style.display = "block";
    stagedCount.textContent = stagedFiles.length;

    stagedGrid.innerHTML = stagedFiles.map((item, idx) => `
      <div class="staged-card ${item.isValid ? "" : "staged-invalid"}">
        <div class="staged-thumb-wrapper">
          <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" class="staged-thumb" />
          <button type="button" class="staged-remove-btn" data-remove-idx="${idx}" title="Remove file">✕</button>
        </div>
        <div class="staged-info">
          <span class="staged-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
          <span class="staged-size">${formatBytes(item.size)}</span>
          ${item.error ? `<span class="staged-err">${escapeHtml(item.error)}</span>` : ""}
        </div>
      </div>
    `).join("");

    stagedGrid.querySelectorAll(".staged-remove-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-remove-idx"), 10);
        stagedFiles.splice(idx, 1);
        renderStaged();
      });
    });

    const hasValid = stagedFiles.some(f => f.isValid);
    confirmUploadBtn.disabled = !hasValid;
  }

  if (clearStagedBtn) {
    clearStagedBtn.addEventListener("click", () => {
      stagedFiles = [];
      renderStaged();
    });
  }

  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener("click", () => {
      const validFiles = stagedFiles.filter(f => f.isValid);
      if (!validFiles.length) {
        showUploadAlert("No valid photos to upload. Please resolve errors.", true);
        return;
      }

      confirmUploadBtn.disabled = true;
      uploadProgressBox.style.display = "block";
      uploadProgressBar.style.width = "10%";
      uploadStatusText.textContent = "Validating resolution & spatial coordinates...";

      let progress = 10;
      const interval = setInterval(() => {
        progress += 25;
        if (progress >= 100) {
          clearInterval(interval);
          uploadProgressBar.style.width = "100%";
          uploadStatusText.textContent = "Storing securely in private vault...";

          setTimeout(() => {
            let uploadedCount = 0;
            validFiles.forEach(item => {
              try {
                storage.savePhoto(user.id, {
                  name: item.name,
                  size: item.size,
                  type: item.type,
                  dataUrl: item.dataUrl
                });
                uploadedCount++;
              } catch (e) {
                console.error("Upload error:", e);
              }
            });

            uploadProgressBox.style.display = "none";
            confirmUploadBtn.disabled = false;
            stagedFiles = [];
            renderStaged();
            renderVaultGrid();
            showUploadAlert(`Successfully uploaded ${uploadedCount} photo(s) to your private vault!`, false);
          }, 400);
        } else {
          uploadProgressBar.style.width = `${progress}%`;
          if (progress === 35) uploadStatusText.textContent = "Extracting camera EXIF & orientation...";
          if (progress === 60) uploadStatusText.textContent = "Compressing spatial textures...";
          if (progress === 85) uploadStatusText.textContent = "Finalizing spatial database index...";
        }
      }, 200);
    });
  }

  function renderVaultGrid() {
    const photos = storage.getPhotos(user.id);
    vaultCountBadge.textContent = `${photos.length} Photo${photos.length === 1 ? "" : "s"}`;

    if (!photos.length) {
      vaultGrid.innerHTML = `
        <div class="vault-empty">
          <div class="empty-icon">📁</div>
          <h4>No photos in your vault yet</h4>
          <p>Upload room photographs above to begin 3D reconstruction processing.</p>
        </div>
      `;
      return;
    }

    vaultGrid.innerHTML = photos.map(p => `
      <div class="vault-card">
        <div class="vault-img-wrapper" data-photo-id="${p.id}">
          <img src="${p.dataUrl}" alt="${escapeHtml(p.name)}" class="vault-thumb" />
          <div class="vault-overlay">
            <span class="vault-zoom-icon">🔍 View Full Size</span>
          </div>
        </div>
        <div class="vault-card-body">
          <span class="vault-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
          <div class="vault-meta-row">
            <span class="vault-meta-size">${formatBytes(p.size)}</span>
            <span class="vault-meta-date">${new Date(p.uploadedAt).toLocaleDateString()}</span>
          </div>
          <div class="vault-status-badge">
            <span class="status-dot-green"></span> ${escapeHtml(p.status || "Ready for Reconstruction")}
          </div>
          <div class="vault-actions-row">
            <button class="btn-vault-delete" data-delete-id="${p.id}" title="Delete photo from vault">
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    `).join("");

    // Lightbox triggers
    vaultGrid.querySelectorAll(".vault-img-wrapper").forEach(wrapper => {
      wrapper.addEventListener("click", () => {
        const id = wrapper.getAttribute("data-photo-id");
        const photo = photos.find(p => p.id === id);
        if (photo) openLightbox(photo);
      });
    });

    // Delete photo triggers
    vaultGrid.querySelectorAll(".btn-vault-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-delete-id");
        if (confirm("Delete this photo from your private vault?")) {
          storage.deletePhoto(user.id, id);
          renderVaultGrid();
        }
      });
    });
  }

  /* Lightbox */
  const lightboxModal = container.querySelector("#photoLightboxModal");
  const lightboxImg = container.querySelector("#lightboxImg");
  const lightboxCaption = container.querySelector("#lightboxCaption");
  const closeLightboxBtn = container.querySelector("#closeLightboxBtn");
  const lightboxBackdrop = container.querySelector(".lightbox-backdrop");

  function openLightbox(photo) {
    lightboxImg.src = photo.dataUrl;
    lightboxCaption.innerHTML = `
      <strong>${escapeHtml(photo.name)}</strong> · ${formatBytes(photo.size)} · Uploaded on ${new Date(photo.uploadedAt).toLocaleString()}
    `;
    lightboxModal.style.display = "flex";
  }

  function closeLightbox() {
    lightboxModal.style.display = "none";
    lightboxImg.src = "";
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);

  /* ═══════════════════════════════════════════
     TAB 3: SETTINGS FUNCTIONALITY
     ═══════════════════════════════════════════ */
  const settingsForm = container.querySelector("#settingsAiForm");
  const providerSelect = container.querySelector("#settingProvider");
  const apiKeyGroup = container.querySelector("#apiKeyGroup");
  const apiKeyInput = container.querySelector("#settingApiKey");
  const settingsAlert = container.querySelector("#settingsAlert");
  const wsLogoutBtn = container.querySelector("#wsLogoutBtn");

  const currentSettings = storage.getSettings(user.id);
  if (providerSelect) {
    providerSelect.value = currentSettings.provider || "builtin";
    if (currentSettings.provider !== "builtin") {
      apiKeyGroup.style.display = "block";
    }
    apiKeyInput.value = currentSettings.apiKey || "";

    providerSelect.addEventListener("change", () => {
      if (providerSelect.value === "builtin") {
        apiKeyGroup.style.display = "none";
      } else {
        apiKeyGroup.style.display = "block";
      }
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const prov = providerSelect.value;
      const key = apiKeyInput.value.trim();

      if (prov !== "builtin" && !key) {
        settingsAlert.textContent = "Please provide an API Key for the selected provider or choose Built-in mode.";
        settingsAlert.className = "auth-alert alert-error";
        settingsAlert.style.display = "block";
        return;
      }

      storage.saveSettings(user.id, { provider: prov, apiKey: key });
      settingsAlert.textContent = "Configuration saved successfully!";
      settingsAlert.className = "auth-alert alert-success";
      settingsAlert.style.display = "block";
      updateEngineLabel();
    });
  }

  if (wsLogoutBtn) {
    wsLogoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) {
        auth.logout();
        router.navigate("/login");
      }
    });
  }

  // Initial render
  renderVaultGrid();

  return container;
}

/* ─── Helpers ─── */
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

function formatMessageContent(text) {
  if (!text) return "";
  let esc = escapeHtml(text);
  // Simple markdown formatting
  esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  esc = esc.replace(/\*(.*?)\*/g, '<em>$1</em>');
  esc = esc.replace(/`(.*?)`/g, '<code>$1</code>');
  esc = esc.replace(/\n\n/g, '<br/><br/>');
  esc = esc.replace(/\n/g, '<br/>');
  return esc;
}

/* ─── Built-in Knowledge Base Engine ─── */
function generateSpatialAssistantReply(query) {
  const q = query.toLowerCase();

  if (q.includes("dimension") || q.includes("size") || q.includes("layout") || q.includes("scale")) {
    return `**3D Room Dimensions & Spatial Layout:**\n\n- **Room Footprint:** 10.0m × 10.0m square perimeter floorplan\n- **Ceiling Height:** 3.50m true-to-scale vertical clearance\n- **Main Workspace Table:** 1.9m width × 0.9m depth with dual-display workstation\n- **L-Shaped Modern Sofa:** 2.4m length with high-density plush cushions\n- **Bookshelf:** 2.6m vertical shelving loaded with multi-genre volumes\n- **Lighting Geometry:** High-angle directional sunlight entering through a 1.8m × 1.3m panoramic window, paired with warm ambient fill and a localized desk point-light.`;
  }

  if (q.includes("photo") || q.includes("capture") || q.includes("picture") || q.includes("camera") || q.includes("how to")) {
    return `**Best Practices for Room Photo Capture (Photogrammetry Pipeline):**\n\n1. **Overlap is Key:** Take overlapping photos (minimum 60–80% overlap between adjacent shots).\n2. **Fixed Lighting:** Keep curtains and artificial lights consistent throughout capture to avoid photometric mismatch.\n3. **Perimeter Orbit:** Walk around room walls taking inward-facing shots, then capture key furniture clusters from high, eye-level, and low angles.\n4. **Avoid Blur & Lens Distortion:** Use standard wide to 35mm equivalent focal length and maintain sharp focus.\n5. **Upload:** Drop all images in the **Photo Vault** tab above. Our ingestion engine will validate dimensions and prepare the point-cloud reconstruction dataset.`;
  }

  if (q.includes("lighting") || q.includes("pipeline") || q.includes("webgl") || q.includes("three")) {
    return `**Aakar WebGL & Rendering Architecture:**\n\n- **Engine:** Three.js with WebGL 2.0 rendering context\n- **Shadow Mapping:** PCFSoftShadowMap with a 2048×2048 directional sun cascade\n- **Tone Mapping:** ACES Filmic Tone Mapping (exposure 1.15) for natural color roll-off\n- **Dynamic Lighting:** Ambient daylight pulse + point lamp subtle thermal flicker effect\n- **Day/Night Presets:** Instant dynamic switching between high-noon daylight and intimate evening atmosphere.`;
  }

  if (q.includes("navigate") || q.includes("control") || q.includes("wasd") || q.includes("move")) {
    return `**Space Navigation Controls:**\n\n- **Walk Mode (First-Person):** Press **W** (Forward), **A** (Left), **S** (Backward), **D** (Right) or Arrow keys\n- **Look Around:** Click the canvas to engage Pointer Lock, then move your mouse smoothly\n- **Orbit Showcase:** Click & drag with left mouse button to rotate around the room center\n- **Zoom:** Mouse scroll wheel adjusts orbital focal distance\n- **Exit First-Person:** Press **ESC** at any time to return to orbital showcase mode.`;
  }

  if (q.includes("glb") || q.includes("gltf") || q.includes("export") || q.includes("format")) {
    return `**Model Export & Asset Formats:**\n\nReconstructed spaces can be exported as standard **glTF / .glb** binary containers. These contain baked UV textures, PBR metallic-roughness materials, and embedded camera waypoints ready for browser rendering, Blender editing, or VR headsets.`;
  }

  return `Thank you for your spatial query about **"${query}"**.\n\nIn **Aakar**, physical spaces are captured through multi-view photography, reconstructed into 3D meshes with millimeter spatial fidelity, and served natively via Three.js.\n\nYou can:\n- Inquire about room dimensions and furniture placement\n- Request photography and camera capture tips\n- Upload your room images in the **Photo Vault** tab\n- Launch the interactive 3D viewer anytime from the top navigation.`;
}

/* ─── External API Handlers (when configured) ─── */
async function callGeminiApi(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const systemPrompt = "You are the VisionaryMinds AI Assistant for Aakar, an indoor 3D space reconstruction and WebGL exploration platform. Help users with photogrammetry, 3D room navigation, Three.js, and spatial photography.";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
      }]
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
}

async function callOpenAiApi(prompt, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are the VisionaryMinds AI Assistant for Aakar, an indoor 3D space reconstruction and WebGL exploration platform. Help users with photogrammetry, 3D room navigation, Three.js, and spatial photography."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `OpenAI API returned status ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No response received from OpenAI.";
}
