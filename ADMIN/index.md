---
layout: layouts/base.njk
title: Admin
permalink: /ADMIN/
templateEngineOverride: njk
---
<section class="page-shell section admin-login" id="admin-login">
  <h2 class="section-title">Admin Login</h2>
  <p>Enter your admin key to access the dashboard until Google login is enabled.</p>
  <form id="admin-login-form" class="admin-inline-form">
    <label for="admin-api-key">Admin key</label>
    <input id="admin-api-key" name="apiKey" type="password" required>
    <button type="submit" class="button">Sign in</button>
  </form>
  <p id="admin-login-message" class="admin-message" hidden></p>
</section>

<section class="page-shell section admin-dashboard" id="admin-dashboard" hidden>
  <div class="admin-dashboard-head">
    <div>
      <h2 class="section-title">HOD Update Dashboard</h2>
      <p>Track Term 1 and Term 3 completion for assessments, PDF statement, safety/practical updates, and topic buttons.</p>
    </div>
    <button id="admin-logout" class="button-secondary" type="button">Sign out</button>
  </div>

  <form class="admin-inline-form" id="admin-filters">
    <div class="admin-field admin-field-year">
      <label for="filter-year">Year</label>
      <input id="filter-year" type="number" min="2024" max="2100" step="1">
    </div>

    <div class="admin-field admin-field-term">
      <label for="filter-term">Term</label>
      <select id="filter-term">
        <option value="T1">T1</option>
        <option value="T3">T3</option>
      </select>
    </div>

    <div class="admin-field admin-field-subject">
      <label for="filter-subject">Subject</label>
      <select id="filter-subject">
        <option value="">All</option>
        <option value="DTECH">DTECH</option>
        <option value="DVC">DVC</option>
        <option value="FOOD">FOOD</option>
        <option value="TEXTILES">TEXTILES</option>
        <option value="WOOD">WOOD</option>
      </select>
    </div>

    <div class="admin-field admin-field-status">
      <label for="filter-status">Status</label>
      <select id="filter-status">
        <option value="">All</option>
        <option value="red">Red (missing both)</option>
        <option value="amber">Amber (part complete)</option>
        <option value="green">Green (complete)</option>
      </select>
    </div>

    <div class="admin-field admin-field-action">
      <button type="submit" class="button">Refresh</button>
    </div>
  </form>

  <div class="admin-summary-grid" id="admin-summary"></div>

  <div class="admin-tab-control" role="tablist" aria-label="Admin content pages">
    <button id="admin-tab-course" class="admin-tab-button is-active" role="tab" type="button" aria-selected="true" aria-controls="admin-panel-course">Course Status</button>
    <button id="admin-tab-uploader" class="admin-tab-button" role="tab" type="button" aria-selected="false" aria-controls="admin-panel-uploader">Uploader</button>
  </div>

  <section id="admin-panel-course" class="admin-tab-panel" role="tabpanel" aria-labelledby="admin-tab-course">
    <h3 class="admin-subhead">Course Status</h3>
    <p id="admin-courses-message" class="admin-message" hidden></p>
    <div class="admin-table-wrap">
      <table class="admin-table" id="admin-courses-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Subject</th>
            <th>Assessments</th>
            <th>PDF Statement</th>
            <th>Health &amp; Safety</th>
            <th>Practical Skills</th>
            <th>Topic Buttons</th>
            <th>Dashboard</th>
            <th>Updated by</th>
            <th>Notes</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </section>

  <section id="admin-panel-uploader" class="admin-tab-panel" role="tabpanel" aria-labelledby="admin-tab-uploader" hidden>
    <div class="admin-uploader-heading-row">
      <h3 class="admin-subhead">Uploader</h3>
      <label class="admin-field-label" for="uploader-course-select">Course</label>
      <select id="uploader-course-select" class="admin-inline-select"></select>
    </div>
    <p class="admin-message">Use this uploader to update the selected course page content directly.</p>

    <div class="admin-uploader-grid">
      <article class="admin-uploader-card">
        <h4>Area 1: Assessments List</h4>
        <p>Enter one assessment per line.</p>
        <textarea id="uploader-assessments" class="admin-uploader-textarea" rows="6" placeholder="Standard number and short assessment name"></textarea>
        <div class="admin-uploader-card-actions">
          <button id="uploader-save-assessments" type="button" class="button-secondary">Save Area 1</button>
          <p id="uploader-assessments-status" class="admin-message"></p>
        </div>
      </article>

      <article class="admin-uploader-card">
        <h4>Area 2: Red Bordered Buttons</h4>
        <p>Set the short label and destination URL for each button.</p>
        <div id="uploader-links"></div>
        <div class="admin-uploader-card-actions">
          <button id="uploader-save-links" type="button" class="button-secondary">Save Area 2</button>
          <p id="uploader-links-status" class="admin-message"></p>
        </div>
      </article>

      <article class="admin-uploader-card">
        <h4>Area 3: Assessment Statement PDF</h4>
        <p>Upload the latest PDF statement for <span id="uploader-course-label">11TEXT</span>.</p>
        <form id="uploader-pdf-form" class="admin-inline-form">
          <input id="uploader-statement-pdf" type="file" accept="application/pdf">
          <button type="submit" class="button-secondary">Upload PDF</button>
        </form>
        <p id="uploader-pdf-status" class="admin-message"></p>
        <div class="admin-uploader-drive-sync">
          <h5>Google Drive Sync</h5>
          <p>Import a PDF from the shared Google Drive folder into this course statement slot.</p>
          <div class="admin-uploader-drive-controls">
            <select id="uploader-drive-file-select" class="admin-inline-select"></select>
            <button id="uploader-drive-sync-button" type="button" class="button-secondary">Sync from Drive</button>
            <button id="uploader-drive-match-button" type="button" class="button-secondary">Sync matching PDF</button>
          </div>
          <p id="uploader-drive-match-hint" class="admin-message"></p>
          <p id="uploader-drive-status" class="admin-message"></p>
        </div>
      </article>
    </div>

    <div class="admin-uploader-actions">
      <label class="admin-field-label" for="uploader-actor-name">Uploaded by</label>
      <input id="uploader-actor-name" class="admin-inline-input" type="text" maxlength="80" placeholder="Staff name">
      <button id="uploader-save-content" type="button" class="button">Save All Areas</button>
      <p id="uploader-content-status" class="admin-message"></p>
    </div>

    <div class="admin-uploader-actions">
      <p id="uploader-last-update" class="admin-message"></p>
      <div id="uploader-activity-log" class="admin-uploader-activity"></div>
    </div>
  </section>
</section>

<script>
  const loginSection = document.getElementById("admin-login");
  const dashboardSection = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("admin-login-form");
  const logoutButton = document.getElementById("admin-logout");
  const filtersForm = document.getElementById("admin-filters");
  const loginMessage = document.getElementById("admin-login-message");
  const coursesMessage = document.getElementById("admin-courses-message");
  const summaryEl = document.getElementById("admin-summary");
  const coursesTableBody = document.querySelector("#admin-courses-table tbody");
  const tabCourseButton = document.getElementById("admin-tab-course");
  const tabUploaderButton = document.getElementById("admin-tab-uploader");
  const panelCourse = document.getElementById("admin-panel-course");
  const panelUploader = document.getElementById("admin-panel-uploader");
  const uploaderCourseSelect = document.getElementById("uploader-course-select");
  const uploaderCourseLabel = document.getElementById("uploader-course-label");
  const uploaderAssessments = document.getElementById("uploader-assessments");
  const uploaderLinksWrap = document.getElementById("uploader-links");
  const uploaderSaveAssessments = document.getElementById("uploader-save-assessments");
  const uploaderAssessmentsStatus = document.getElementById("uploader-assessments-status");
  const uploaderSaveLinks = document.getElementById("uploader-save-links");
  const uploaderLinksStatus = document.getElementById("uploader-links-status");
  const uploaderSaveContent = document.getElementById("uploader-save-content");
  const uploaderContentStatus = document.getElementById("uploader-content-status");
  const uploaderPdfForm = document.getElementById("uploader-pdf-form");
  const uploaderPdfInput = document.getElementById("uploader-statement-pdf");
  const uploaderPdfStatus = document.getElementById("uploader-pdf-status");
  const uploaderDriveFileSelect = document.getElementById("uploader-drive-file-select");
  const uploaderDriveSyncButton = document.getElementById("uploader-drive-sync-button");
  const uploaderDriveMatchButton = document.getElementById("uploader-drive-match-button");
  const uploaderDriveMatchHint = document.getElementById("uploader-drive-match-hint");
  const uploaderDriveStatus = document.getElementById("uploader-drive-status");
  const uploaderActorName = document.getElementById("uploader-actor-name");
  const uploaderLastUpdate = document.getElementById("uploader-last-update");
  const uploaderActivityLog = document.getElementById("uploader-activity-log");

  const DEFAULT_UPLOADER_COURSE_CODE = "11TEXT";
  const UPLOADER_LINK_ROWS = 7;
  const UPLOADER_ACTOR_STORAGE_KEY = "whsUploaderActorName";
  const LOCKED_BUTTON_LABELS = {
    0: "Health & Safety",
    6: "Practical Skills"
  };
  const STATUS_OPTIONS = [
    { value: "not_started", label: "--" },
    { value: "incomplete", label: "x" },
    { value: "complete", label: "tick" }
  ];

  const yearInput = document.getElementById("filter-year");
  const termInput = document.getElementById("filter-term");
  const subjectInput = document.getElementById("filter-subject");
  const statusInput = document.getElementById("filter-status");
  let selectedUploaderCourseCode = DEFAULT_UPLOADER_COURSE_CODE;
  let availableDriveFiles = [];
  let uploaderCourses = [];

  yearInput.value = new Date().getFullYear();
  termInput.value = "T1";
  uploaderActorName.value = localStorage.getItem(UPLOADER_ACTOR_STORAGE_KEY) || "";

  uploaderActorName.addEventListener("input", () => {
    localStorage.setItem(UPLOADER_ACTOR_STORAGE_KEY, uploaderActorName.value.trim());
  });

  function setMessage(element, message, isError = false) {
    element.hidden = !message;
    element.textContent = message || "";
    element.classList.toggle("is-error", Boolean(message && isError));
  }

  function formatDateTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  }

  function getUploaderActorName() {
    const name = String(uploaderActorName?.value || "").trim();
    return name || "Unknown staff";
  }

  function getSelectedUploaderCourseCode() {
    return selectedUploaderCourseCode || DEFAULT_UPLOADER_COURSE_CODE;
  }

  function getLockedButtonLabelsForSelectedCourse() {
    return LOCKED_BUTTON_LABELS;
  }

  function mapLinksToUploaderRows(links) {
    const safeLinks = Array.isArray(links) ? links : [];
    const rows = Array.from({ length: UPLOADER_LINK_ROWS }, () => ({ label: "", url: "#" }));
    const lockedLabels = getLockedButtonLabelsForSelectedCourse();

    if (safeLinks.length) {
      rows[0] = {
        ...rows[0],
        ...safeLinks[0],
        label: lockedLabels[0] || safeLinks[0].label || ""
      };
    }

    safeLinks.slice(1, -1).forEach((link, index) => {
      const rowIndex = index + 1;
      if (rowIndex < UPLOADER_LINK_ROWS - 1) {
        rows[rowIndex] = {
          ...rows[rowIndex],
          ...link
        };
      }
    });

    rows[UPLOADER_LINK_ROWS - 1] = {
      ...rows[UPLOADER_LINK_ROWS - 1],
      ...(safeLinks[safeLinks.length - 1] || {}),
      label: lockedLabels[UPLOADER_LINK_ROWS - 1] || ""
    };

    return rows;
  }

  function syncUploaderCourseLabel() {
    uploaderCourseLabel.textContent = getSelectedUploaderCourseCode();
  }

  async function loadUploaderCourseOptions() {
    const data = await apiRequest("/api/admin/course-content-targets");
    const courses = Array.isArray(data.courses) ? data.courses : [];
    uploaderCourses = courses;

    if (!courses.length) {
      uploaderCourseSelect.innerHTML = `<option value="${DEFAULT_UPLOADER_COURSE_CODE}">${DEFAULT_UPLOADER_COURSE_CODE}</option>`;
      selectedUploaderCourseCode = DEFAULT_UPLOADER_COURSE_CODE;
      uploaderCourseSelect.value = selectedUploaderCourseCode;
      syncUploaderCourseLabel();
      return;
    }

    uploaderCourseSelect.innerHTML = courses
      .map((course) => `<option value="${escapeHtml(course.courseCode)}">${escapeHtml(course.courseCode)} - ${escapeHtml(course.courseName || "")}</option>`)
      .join("");

    const hasCurrent = courses.some((course) => course.courseCode === selectedUploaderCourseCode);
    selectedUploaderCourseCode = hasCurrent ? selectedUploaderCourseCode : courses[0].courseCode;
    uploaderCourseSelect.value = selectedUploaderCourseCode;
    syncUploaderCourseLabel();
  }

  function getSelectedUploaderCourse() {
    return uploaderCourses.find((course) => course.courseCode === getSelectedUploaderCourseCode()) || null;
  }

  function normalizeMatchText(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function buildDriveMatchCandidates(course) {
    const safeCourse = course || {};
    const courseCode = String(safeCourse.courseCode || getSelectedUploaderCourseCode() || "").toUpperCase();
    const courseName = String(safeCourse.courseName || "").toUpperCase();
    const subjectCode = String(safeCourse.subjectCode || "").toUpperCase();
    const candidates = new Set();
    const subjectAliases = {
      DTECH: ["DIGITALTECH", "DIGITALTECHNOLOGIES"],
      DVC: ["DVC", "DESIGNVISUALCOMMUNICATION"],
      FOOD: ["FOOD", "HOSPITALITY", "HOSP"],
      TEXTILES: ["TEXTILES", "TEXTILE"],
      WOOD: ["WOOD", "WOODWORK", "FURNITURE", "FURN"]
    };

    [courseCode, courseName].forEach((value) => {
      const normalized = normalizeMatchText(value);
      if (normalized) {
        candidates.add(normalized);
      }
    });

    if (courseCode) {
      candidates.add(normalizeMatchText(courseCode.replace("-", "")));
      candidates.add(normalizeMatchText(courseCode.replace("-S1", " SEMESTER 1")));
      candidates.add(normalizeMatchText(courseCode.replace("-S2", " SEMESTER 2")));
    }

    if (subjectCode && subjectAliases[subjectCode]) {
      subjectAliases[subjectCode].forEach((alias) => candidates.add(normalizeMatchText(alias)));
    }

    return Array.from(candidates).filter(Boolean);
  }

  function scoreDriveFileForCourse(fileName, courseCode) {
    const normalizedFileName = normalizeMatchText(fileName);
    const course = getSelectedUploaderCourse();
    const candidates = buildDriveMatchCandidates(course);
    const safeCourseCode = normalizeMatchText(courseCode);

    if (!normalizedFileName || !safeCourseCode) {
      return -1;
    }

    let score = 0;

    if (normalizedFileName.includes(safeCourseCode)) {
      score += 100;
    }

    candidates.forEach((candidate) => {
      if (!candidate || candidate === safeCourseCode) {
        return;
      }

      if (normalizedFileName.includes(candidate)) {
        score += candidate.length >= 8 ? 40 : 15;
      }
    });

    if (/ASSESSMENTSTATEMENT/.test(normalizedFileName)) {
      score += 10;
    }

    return score || -1;
  }

  function findBestDriveFileForCourse(courseCode) {
    let bestIndex = -1;
    let bestScore = -1;
    let secondBestScore = -1;

    availableDriveFiles.forEach((file, index) => {
      const score = scoreDriveFileForCourse(file.fileName, courseCode);
      if (score > bestScore) {
        secondBestScore = bestScore;
        bestScore = score;
        bestIndex = index;
      } else if (score > secondBestScore) {
        secondBestScore = score;
      }
    });

    return {
      bestIndex,
      bestScore,
      secondBestScore,
      isClearMatch: bestIndex >= 0 && bestScore >= 70 && bestScore >= secondBestScore + 20
    };
  }

  function renderDriveFileOptions() {
    if (!availableDriveFiles.length) {
      uploaderDriveFileSelect.innerHTML = "<option value=''>No Drive PDFs found</option>";
      uploaderDriveFileSelect.disabled = true;
      uploaderDriveSyncButton.disabled = true;
      uploaderDriveMatchButton.disabled = true;
      setMessage(uploaderDriveMatchHint, "Best match: none available.");
      return;
    }

    uploaderDriveFileSelect.innerHTML = availableDriveFiles
      .map((file, index) => `<option value="${index}">${escapeHtml(file.fileName)}</option>`)
      .join("");

    const match = findBestDriveFileForCourse(getSelectedUploaderCourseCode());
    const preferredIndex = match.bestIndex >= 0 ? match.bestIndex : 0;
    uploaderDriveFileSelect.value = String(preferredIndex);
    uploaderDriveFileSelect.disabled = false;
    uploaderDriveSyncButton.disabled = false;
    uploaderDriveMatchButton.disabled = !match.isClearMatch;

    if (match.isClearMatch) {
      setMessage(uploaderDriveMatchHint, `Best match: ${availableDriveFiles[match.bestIndex].fileName}`);
    } else {
      setMessage(uploaderDriveMatchHint, "Best match: none yet for this course.");
    }
  }

  async function loadDriveFileOptions() {
    const data = await apiRequest("/api/admin/google-drive-pdfs");
    availableDriveFiles = Array.isArray(data.files) ? data.files : [];
    renderDriveFileOptions();
  }

  async function syncDriveFile(file) {
    await apiRequest(`/api/admin/course-content/${getSelectedUploaderCourseCode()}/statement/google-drive`, {
      method: "POST",
      body: JSON.stringify({
        fileId: file.fileId,
        fileName: file.fileName,
        updatedBy: getUploaderActorName()
      })
    });

    await loadUploaderData();
    await refreshCourseStatusAfterUploaderUpdate();
  }

  function renderUploaderActivity(activity) {
    if (!Array.isArray(activity) || !activity.length) {
      uploaderActivityLog.innerHTML = "<p class=\"admin-message\">No uploader activity recorded yet.</p>";
      return;
    }

    const items = activity.map((entry) => {
      const when = formatDateTime(entry.created_at) || "Unknown date";
      const who = escapeHtml(entry.actor_name || "Unknown staff");
      const isDriveSync = entry.activity_type === "statement-upload" && String(entry.detail || "").startsWith("Google Drive:");
      const action = entry.activity_type === "statement-upload"
        ? (isDriveSync ? "Synced statement PDF from Google Drive" : "Uploaded statement PDF")
        : "Saved content";
      const cleanDetail = isDriveSync
        ? String(entry.detail || "").replace(/^Google Drive:\s*/i, "")
        : entry.detail;
      const detail = cleanDetail ? ` - ${escapeHtml(cleanDetail)}` : "";
      return `<li><strong>${who}</strong> ${action} on ${escapeHtml(when)}${detail}</li>`;
    });

    uploaderActivityLog.innerHTML = `
      <h4>Recent uploader activity</h4>
      <ul>${items.join("")}</ul>
    `;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function apiRequest(path, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(path, {
      credentials: "same-origin",
      headers,
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  function renderUploaderLinks(links) {
    const safeLinks = mapLinksToUploaderRows(links);
    const lockedLabels = getLockedButtonLabelsForSelectedCourse();
    const rows = [];

    for (let i = 0; i < UPLOADER_LINK_ROWS; i += 1) {
      const link = safeLinks[i] || { label: "", url: "#" };
      const lockedLabel = lockedLabels[i];
      const labelValue = lockedLabel || link.label || "";
      rows.push(`
        <div class="admin-uploader-link-row">
          <input
            type="text"
            class="admin-inline-input${lockedLabel ? " is-locked" : ""}"
            data-link-field="label"
            data-link-index="${i}"
            value="${escapeHtml(labelValue)}"
            placeholder="Button ${i + 1} label"
            ${lockedLabel ? "readonly aria-readonly=\"true\"" : ""}
          >
          <input
            type="text"
            class="admin-inline-input"
            data-link-field="url"
            data-link-index="${i}"
            value="${escapeHtml(link.url || "#")}"
            placeholder="https:// or #"
          >
        </div>
      `);
    }

    uploaderLinksWrap.innerHTML = rows.join("");
  }

  function collectUploaderLinks() {
    const output = [];
    const lockedLabels = getLockedButtonLabelsForSelectedCourse();

    for (let i = 0; i < UPLOADER_LINK_ROWS; i += 1) {
      const labelInput = uploaderLinksWrap.querySelector(`[data-link-field='label'][data-link-index='${i}']`);
      const urlInput = uploaderLinksWrap.querySelector(`[data-link-field='url'][data-link-index='${i}']`);

      const label = (lockedLabels[i] || labelInput?.value || "").trim();
      const url = (urlInput?.value || "#").trim() || "#";

      if (label) {
        output.push({ label, url });
      }
    }

    const lastLabel = (lockedLabels[UPLOADER_LINK_ROWS - 1] || "").trim();
    const lastUrlInput = uploaderLinksWrap.querySelector(`[data-link-field='url'][data-link-index='${UPLOADER_LINK_ROWS - 1}']`);
    const lastUrl = (lastUrlInput?.value || "#").trim() || "#";

    if (lastLabel) {
      const lastIndex = output.findIndex((link) => link.label === lastLabel);
      if (lastIndex >= 0) {
        output.splice(lastIndex, 1);
      }

      output.push({ label: lastLabel, url: lastUrl });
    }

    return output;
  }

  function collectAssessments() {
    return uploaderAssessments.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async function saveUploaderContentSelection({ includeAssessments, includeLinks }) {
    const courseCode = getSelectedUploaderCourseCode();
    const current = await apiRequest(`/api/admin/course-content/${courseCode}`);
    const assessments = includeAssessments ? collectAssessments() : (current.assessments || []);
    const assessmentLinks = includeLinks ? collectUploaderLinks() : (current.assessmentLinks || []);

    await apiRequest(`/api/admin/course-content/${courseCode}`, {
      method: "POST",
      body: JSON.stringify({
        assessments,
        assessmentLinks,
        updatedBy: getUploaderActorName()
      })
    });
  }

  async function uploadUploaderPdfIfSelected() {
    const courseCode = getSelectedUploaderCourseCode();
    const file = uploaderPdfInput.files?.[0];
    if (!file) {
      return { uploaded: false };
    }

    const formData = new FormData();
    formData.append("statementPdf", file);
    formData.append("updatedBy", getUploaderActorName());

    await apiRequest(`/api/admin/course-content/${courseCode}/statement`, {
      method: "POST",
      body: formData
    });

    uploaderPdfInput.value = "";
    setMessage(uploaderPdfStatus, `Uploaded ${file.name}`);
    return { uploaded: true, fileName: file.name };
  }

  async function loadUploaderData() {
    const courseCode = getSelectedUploaderCourseCode();
    const data = await apiRequest(`/api/admin/course-content/${courseCode}`);

    const assessmentsText = (data.assessments || []).join("\n");
    uploaderAssessments.value = assessmentsText;
    renderUploaderLinks(data.assessmentLinks || []);

    if (data.hasStatementPdf) {
      setMessage(uploaderPdfStatus, `Current PDF: ${data.statementFilename || "uploaded"}`);
    } else {
      setMessage(uploaderPdfStatus, "No statement PDF uploaded yet.");
    }

    const when = formatDateTime(data.updatedAt);
    const who = data.updatedBy || "Unknown staff";
    setMessage(uploaderLastUpdate, when ? `Last update: ${who} on ${when}` : "No updates saved yet.");
    renderUploaderActivity(data.activity || []);
  }

  async function checkSession() {
    try {
      const data = await apiRequest("/api/admin/session", { method: "GET" });
      return Boolean(data.authenticated);
    } catch (error) {
      return false;
    }
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
  }

  function showLogin() {
    dashboardSection.hidden = true;
    loginSection.hidden = false;
  }

  function setActiveTab(tabName) {
    const isCourse = tabName === "course";

    tabCourseButton.classList.toggle("is-active", isCourse);
    tabUploaderButton.classList.toggle("is-active", !isCourse);
    tabCourseButton.setAttribute("aria-selected", String(isCourse));
    tabUploaderButton.setAttribute("aria-selected", String(!isCourse));
    panelCourse.hidden = !isCourse;
    panelUploader.hidden = isCourse;
  }

  function renderSummary(summary) {
    const cards = [
      { label: "Total courses", value: summary.total_courses },
      { label: "Courses complete", value: summary.courses_complete },
      { label: "Courses incomplete", value: summary.courses_incomplete }
    ];

    summaryEl.innerHTML = cards
      .map((card) => `
        <article class="admin-kpi">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
        </article>
      `)
      .join("");
  }

  function statusBadge(status) {
    const className = status === "green" ? "status-green" : status === "amber" ? "status-amber" : "status-red";
    return `<span class="admin-status-badge ${className}">${escapeHtml(status)}</span>`;
  }

  function normalizeStatusValue(value) {
    const safe = String(value || "").toLowerCase();
    if (safe === "pending") {
      return "incomplete";
    }
    if (safe === "not_started" || safe === "incomplete" || safe === "complete") {
      return safe;
    }
    return "not_started";
  }

  function renderStatusSelect(fieldName, currentValue) {
    const selected = normalizeStatusValue(currentValue);
    const options = STATUS_OPTIONS
      .map((option) => `<option value="${option.value}" ${selected === option.value ? "selected" : ""}>${option.label}</option>`)
      .join("");
    return `<select class="admin-inline-select" data-field="${fieldName}">${options}</select>`;
  }

  function renderCourses(courses) {
    if (!courses.length) {
      coursesTableBody.innerHTML = "";
      setMessage(coursesMessage, "No courses match the current filter.");
      return;
    }

    setMessage(coursesMessage, "");
    coursesTableBody.innerHTML = courses
      .map((course) => {
        const rowId = `${course.course_code}-${course.subject_code}`;
        return `
          <tr data-row-id="${escapeHtml(rowId)}" data-course-code="${escapeHtml(course.course_code)}">
            <td><strong>${escapeHtml(course.course_code)}</strong><br>${escapeHtml(course.course_name)}</td>
            <td>${escapeHtml(course.subject_code)}</td>
            <td>${renderStatusSelect("assessmentsStatus", course.assessments_status)}</td>
            <td>${renderStatusSelect("pdfStatementStatus", course.pdf_statement_status)}</td>
            <td>${renderStatusSelect("healthSafetyStatus", course.health_safety_status)}</td>
            <td>${renderStatusSelect("practicalSkillsStatus", course.practical_skills_status)}</td>
            <td>${renderStatusSelect("topicButtonsStatus", course.topic_buttons_status)}</td>
            <td>${statusBadge(course.dashboard_status)}</td>
            <td>${escapeHtml(course.updated_by || "-")}</td>
            <td><input class="admin-inline-input" data-field="notes" value="${escapeHtml(course.notes || "")}" placeholder="Optional note"></td>
            <td><button type="button" class="button-secondary" data-action="save">Save</button></td>
          </tr>
        `;
      })
      .join("");
  }

  async function loadDashboardData() {
    const year = Number.parseInt(yearInput.value, 10) || new Date().getFullYear();
    const term = termInput.value;
    const subject = subjectInput.value;
    const status = statusInput.value;

    const dashboard = await apiRequest(`/api/admin/dashboard?year=${year}&term=${encodeURIComponent(term)}`);
    const courseUrl = new URL("/api/admin/courses", window.location.origin);
    courseUrl.searchParams.set("year", year);
    courseUrl.searchParams.set("term", term);
    if (subject) {
      courseUrl.searchParams.set("subject", subject);
    }
    if (status) {
      courseUrl.searchParams.set("status", status);
    }

    const courses = await apiRequest(courseUrl.toString());

    renderSummary(dashboard.summary);
    renderCourses(courses.courses);
  }

  async function refreshCourseStatusAfterUploaderUpdate() {
    try {
      await loadDashboardData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "");

    try {
      const apiKey = document.getElementById("admin-api-key").value;
      await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ apiKey })
      });

      showDashboard();
      await loadDashboardData();
      await loadUploaderData();
    } catch (error) {
      setMessage(loginMessage, error.message, true);
    }
  });

  logoutButton.addEventListener("click", async () => {
    await apiRequest("/api/admin/logout", { method: "POST" });
    showLogin();
  });

  tabCourseButton.addEventListener("click", () => setActiveTab("course"));
  tabUploaderButton.addEventListener("click", () => setActiveTab("uploader"));

  uploaderCourseSelect.addEventListener("change", async () => {
    selectedUploaderCourseCode = uploaderCourseSelect.value || DEFAULT_UPLOADER_COURSE_CODE;
    syncUploaderCourseLabel();
    setMessage(uploaderAssessmentsStatus, "");
    setMessage(uploaderLinksStatus, "");
    setMessage(uploaderContentStatus, "");
    setMessage(uploaderPdfStatus, "");
    renderDriveFileOptions();
    await loadUploaderData();
  });

  filtersForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await loadDashboardData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
    }
  });

  coursesTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action='save']");
    if (!button) {
      return;
    }

    const row = button.closest("tr");
    const assessmentsStatus = row.querySelector("select[data-field='assessmentsStatus']").value;
    const pdfStatementStatus = row.querySelector("select[data-field='pdfStatementStatus']").value;
    const healthSafetyStatus = row.querySelector("select[data-field='healthSafetyStatus']").value;
    const practicalSkillsStatus = row.querySelector("select[data-field='practicalSkillsStatus']").value;
    const topicButtonsStatus = row.querySelector("select[data-field='topicButtonsStatus']").value;
    const notes = row.querySelector("input[data-field='notes']").value;

    button.disabled = true;
    button.textContent = "Saving...";

    try {
      await apiRequest("/api/admin/courses/status", {
        method: "POST",
        body: JSON.stringify({
          courseCode: row.dataset.courseCode,
          year: Number.parseInt(yearInput.value, 10),
          term: termInput.value,
          assessmentsStatus,
          pdfStatementStatus,
          healthSafetyStatus,
          practicalSkillsStatus,
          topicButtonsStatus,
          notes,
          updatedBy: "HOD"
        })
      });

      button.textContent = "Saved";
      setTimeout(() => {
        button.textContent = "Save";
      }, 1200);

      await loadDashboardData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
      button.textContent = "Save";
    } finally {
      button.disabled = false;
    }
  });

  uploaderSaveAssessments.addEventListener("click", async () => {
    uploaderSaveAssessments.disabled = true;
    uploaderSaveAssessments.textContent = "Saving...";
    setMessage(uploaderAssessmentsStatus, "");

    try {
      await saveUploaderContentSelection({ includeAssessments: true, includeLinks: false });
      await loadUploaderData();
      await refreshCourseStatusAfterUploaderUpdate();
      setMessage(uploaderAssessmentsStatus, "Area 1 saved.");
      uploaderSaveAssessments.textContent = "Saved";
      setTimeout(() => {
        uploaderSaveAssessments.textContent = "Save Area 1";
      }, 1200);
    } catch (error) {
      setMessage(uploaderAssessmentsStatus, error.message, true);
      uploaderSaveAssessments.textContent = "Save Area 1";
    } finally {
      uploaderSaveAssessments.disabled = false;
    }
  });

  uploaderSaveLinks.addEventListener("click", async () => {
    uploaderSaveLinks.disabled = true;
    uploaderSaveLinks.textContent = "Saving...";
    setMessage(uploaderLinksStatus, "");

    try {
      await saveUploaderContentSelection({ includeAssessments: false, includeLinks: true });
      await loadUploaderData();
      await refreshCourseStatusAfterUploaderUpdate();
      setMessage(uploaderLinksStatus, "Area 2 saved.");
      uploaderSaveLinks.textContent = "Saved";
      setTimeout(() => {
        uploaderSaveLinks.textContent = "Save Area 2";
      }, 1200);
    } catch (error) {
      setMessage(uploaderLinksStatus, error.message, true);
      uploaderSaveLinks.textContent = "Save Area 2";
    } finally {
      uploaderSaveLinks.disabled = false;
    }
  });

  uploaderSaveContent.addEventListener("click", async () => {
    uploaderSaveContent.disabled = true;
    uploaderSaveContent.textContent = "Saving all...";
    setMessage(uploaderContentStatus, "");

    try {
      await saveUploaderContentSelection({ includeAssessments: true, includeLinks: true });
      const uploadResult = await uploadUploaderPdfIfSelected();
      await loadUploaderData();
      await refreshCourseStatusAfterUploaderUpdate();

      const pdfMessage = uploadResult.uploaded ? " PDF uploaded too." : "";
      setMessage(uploaderContentStatus, `${getSelectedUploaderCourseCode()} saved.${pdfMessage}`);
      uploaderSaveContent.textContent = "Saved";
      setTimeout(() => {
        uploaderSaveContent.textContent = "Save All Areas";
      }, 1200);
    } catch (error) {
      setMessage(uploaderContentStatus, error.message, true);
      uploaderSaveContent.textContent = "Save All Areas";
    } finally {
      uploaderSaveContent.disabled = false;
    }
  });

  uploaderPdfForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(uploaderPdfStatus, "");

    const file = uploaderPdfInput.files?.[0];
    if (!file) {
      setMessage(uploaderPdfStatus, "Select a PDF first.", true);
      return;
    }

    const submitButton = uploaderPdfForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Uploading...";

    try {
      await uploadUploaderPdfIfSelected();
      await loadUploaderData();
      await refreshCourseStatusAfterUploaderUpdate();
      submitButton.textContent = "Uploaded";
      setTimeout(() => {
        submitButton.textContent = "Upload PDF";
      }, 1200);
    } catch (error) {
      setMessage(uploaderPdfStatus, error.message, true);
      submitButton.textContent = "Upload PDF";
    } finally {
      submitButton.disabled = false;
    }
  });

  uploaderDriveSyncButton.addEventListener("click", async () => {
    const selectedIndex = Number.parseInt(uploaderDriveFileSelect.value, 10);
    const selectedFile = availableDriveFiles[selectedIndex];

    if (!selectedFile) {
      setMessage(uploaderDriveStatus, "Select a Google Drive PDF first.", true);
      return;
    }

    uploaderDriveSyncButton.disabled = true;
    uploaderDriveSyncButton.textContent = "Syncing...";
    setMessage(uploaderDriveStatus, "");

    try {
      await syncDriveFile(selectedFile);
      setMessage(uploaderDriveStatus, `Synced ${selectedFile.fileName} from Google Drive.`);
      uploaderDriveSyncButton.textContent = "Synced";
      setTimeout(() => {
        uploaderDriveSyncButton.textContent = "Sync from Drive";
      }, 1200);
    } catch (error) {
      setMessage(uploaderDriveStatus, error.message, true);
      uploaderDriveSyncButton.textContent = "Sync from Drive";
    } finally {
      uploaderDriveSyncButton.disabled = false;
    }
  });

  uploaderDriveMatchButton.addEventListener("click", async () => {
    const match = findBestDriveFileForCourse(getSelectedUploaderCourseCode());
    const selectedFile = match.bestIndex >= 0 ? availableDriveFiles[match.bestIndex] : null;

    if (!selectedFile || !match.isClearMatch) {
      setMessage(uploaderDriveStatus, "No clear matching PDF found for this course.", true);
      return;
    }

    uploaderDriveMatchButton.disabled = true;
    uploaderDriveMatchButton.textContent = "Syncing...";

    try {
      await syncDriveFile(selectedFile);
      setMessage(uploaderDriveStatus, `Synced matching PDF: ${selectedFile.fileName}`);
      uploaderDriveMatchButton.textContent = "Synced";
      setTimeout(() => {
        uploaderDriveMatchButton.textContent = "Sync matching PDF";
      }, 1200);
    } catch (error) {
      setMessage(uploaderDriveStatus, error.message, true);
      uploaderDriveMatchButton.textContent = "Sync matching PDF";
    } finally {
      renderDriveFileOptions();
    }
  });

  (async () => {
    setActiveTab("course");

    const authenticated = await checkSession();

    if (!authenticated) {
      showLogin();
      return;
    }

    showDashboard();
    try {
      await loadDashboardData();
      await loadUploaderCourseOptions();
      await loadDriveFileOptions();
      await loadUploaderData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
    }
  })();
</script>
