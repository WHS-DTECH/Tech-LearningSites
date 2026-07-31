---
layout: layouts/base.njk
title: Admin
permalink: /ADMIN/
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
      <p>Track Term 1 and Term 3 course outline and assessment statement completion.</p>
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

  <h3 class="admin-subhead">By Subject</h3>
  <div class="admin-subject-grid" id="admin-subjects"></div>

  <div class="admin-tab-control" role="tablist" aria-label="Admin content pages">
    <button id="admin-tab-course" class="admin-tab-button is-active" role="tab" type="button" aria-selected="true" aria-controls="admin-panel-course">Course Status</button>
    <button id="admin-tab-uploader" class="admin-tab-button" role="tab" type="button" aria-selected="false" aria-controls="admin-panel-uploader">11TEXT Uploader</button>
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
            <th>Outline</th>
            <th>Statement</th>
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
    <h3 class="admin-subhead">11TEXT Uploader</h3>
    <p class="admin-message">Use this uploader to update the 11TEXT course page content directly.</p>

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
        <p>Upload the latest PDF statement for 11TEXT.</p>
        <form id="uploader-pdf-form" class="admin-inline-form">
          <input id="uploader-statement-pdf" type="file" accept="application/pdf">
          <button type="submit" class="button-secondary">Upload PDF</button>
        </form>
        <p id="uploader-pdf-status" class="admin-message"></p>
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
  const subjectsEl = document.getElementById("admin-subjects");
  const coursesTableBody = document.querySelector("#admin-courses-table tbody");
  const tabCourseButton = document.getElementById("admin-tab-course");
  const tabUploaderButton = document.getElementById("admin-tab-uploader");
  const panelCourse = document.getElementById("admin-panel-course");
  const panelUploader = document.getElementById("admin-panel-uploader");
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
  const uploaderActorName = document.getElementById("uploader-actor-name");
  const uploaderLastUpdate = document.getElementById("uploader-last-update");
  const uploaderActivityLog = document.getElementById("uploader-activity-log");

  const UPLOADER_COURSE_CODE = "11TEXT";
  const UPLOADER_LINK_ROWS = 5;
  const UPLOADER_ACTOR_STORAGE_KEY = "whsUploaderActorName";
  const LOCKED_BUTTON_LABELS = {
    0: "Health & Safety",
    4: "Practical Skills"
  };

  const yearInput = document.getElementById("filter-year");
  const termInput = document.getElementById("filter-term");
  const subjectInput = document.getElementById("filter-subject");
  const statusInput = document.getElementById("filter-status");

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

  function renderUploaderActivity(activity) {
    if (!Array.isArray(activity) || !activity.length) {
      uploaderActivityLog.innerHTML = "<p class=\"admin-message\">No uploader activity recorded yet.</p>";
      return;
    }

    const items = activity.map((entry) => {
      const when = formatDateTime(entry.created_at) || "Unknown date";
      const who = escapeHtml(entry.actor_name || "Unknown staff");
      const action = entry.activity_type === "statement-upload" ? "Uploaded statement PDF" : "Saved content";
      const detail = entry.detail ? ` - ${escapeHtml(entry.detail)}` : "";
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
    const safeLinks = Array.isArray(links) ? links : [];
    const rows = [];

    for (let i = 0; i < UPLOADER_LINK_ROWS; i += 1) {
      const link = safeLinks[i] || { label: "", url: "#" };
      const lockedLabel = LOCKED_BUTTON_LABELS[i];
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

    for (let i = 0; i < UPLOADER_LINK_ROWS; i += 1) {
      const labelInput = uploaderLinksWrap.querySelector(`[data-link-field='label'][data-link-index='${i}']`);
      const urlInput = uploaderLinksWrap.querySelector(`[data-link-field='url'][data-link-index='${i}']`);

      const label = (LOCKED_BUTTON_LABELS[i] || labelInput?.value || "").trim();
      const url = (urlInput?.value || "#").trim() || "#";

      if (label) {
        output.push({ label, url });
      }
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
    const current = await apiRequest(`/api/admin/course-content/${UPLOADER_COURSE_CODE}`);
    const assessments = includeAssessments ? collectAssessments() : (current.assessments || []);
    const assessmentLinks = includeLinks ? collectUploaderLinks() : (current.assessmentLinks || []);

    await apiRequest(`/api/admin/course-content/${UPLOADER_COURSE_CODE}`, {
      method: "POST",
      body: JSON.stringify({
        assessments,
        assessmentLinks,
        updatedBy: getUploaderActorName()
      })
    });
  }

  async function uploadUploaderPdfIfSelected() {
    const file = uploaderPdfInput.files?.[0];
    if (!file) {
      return { uploaded: false };
    }

    const formData = new FormData();
    formData.append("statementPdf", file);
    formData.append("updatedBy", getUploaderActorName());

    await apiRequest(`/api/admin/course-content/${UPLOADER_COURSE_CODE}/statement`, {
      method: "POST",
      body: formData
    });

    uploaderPdfInput.value = "";
    setMessage(uploaderPdfStatus, `Uploaded ${file.name}`);
    return { uploaded: true, fileName: file.name };
  }

  async function loadUploaderData() {
    const data = await apiRequest(`/api/admin/course-content/${UPLOADER_COURSE_CODE}`);

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
      { label: "Fully complete", value: summary.fully_complete },
      { label: "Outline complete", value: summary.outline_complete },
      { label: "Statement complete", value: summary.statement_complete },
      { label: "Missing outline", value: summary.missing_outline },
      { label: "Missing statement", value: summary.missing_statement }
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

  function renderSubjects(subjects) {
    subjectsEl.innerHTML = subjects
      .map((subject) => `
        <article class="admin-subject-card">
          <h4>${escapeHtml(subject.code)}</h4>
          <p>${escapeHtml(subject.name)}</p>
          <p><strong>${escapeHtml(subject.fully_complete)}</strong> / ${escapeHtml(subject.total_courses)} complete</p>
          <p>${escapeHtml(subject.still_required)} still required</p>
        </article>
      `)
      .join("");
  }

  function statusBadge(status) {
    const className = status === "green" ? "status-green" : status === "amber" ? "status-amber" : "status-red";
    return `<span class="admin-status-badge ${className}">${escapeHtml(status)}</span>`;
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
            <td>
              <select class="admin-inline-select" data-field="outlineStatus">
                <option value="pending" ${course.outline_status === "pending" ? "selected" : ""}>pending</option>
                <option value="complete" ${course.outline_status === "complete" ? "selected" : ""}>complete</option>
              </select>
            </td>
            <td>
              <select class="admin-inline-select" data-field="statementStatus">
                <option value="pending" ${course.statement_status === "pending" ? "selected" : ""}>pending</option>
                <option value="complete" ${course.statement_status === "complete" ? "selected" : ""}>complete</option>
              </select>
            </td>
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
    renderSubjects(dashboard.subjects);
    renderCourses(courses.courses);
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
    const outlineStatus = row.querySelector("select[data-field='outlineStatus']").value;
    const statementStatus = row.querySelector("select[data-field='statementStatus']").value;
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
          outlineStatus,
          statementStatus,
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

      const pdfMessage = uploadResult.uploaded ? " PDF uploaded too." : "";
      setMessage(uploaderContentStatus, `All areas saved.${pdfMessage}`);
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
      await loadUploaderData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
    }
  })();
</script>
