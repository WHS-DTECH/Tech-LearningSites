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

  const yearInput = document.getElementById("filter-year");
  const termInput = document.getElementById("filter-term");
  const subjectInput = document.getElementById("filter-subject");
  const statusInput = document.getElementById("filter-status");

  yearInput.value = new Date().getFullYear();
  termInput.value = "T1";

  function setMessage(element, message, isError = false) {
    element.hidden = !message;
    element.textContent = message || "";
    element.classList.toggle("is-error", Boolean(message && isError));
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
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
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
    } catch (error) {
      setMessage(loginMessage, error.message, true);
    }
  });

  logoutButton.addEventListener("click", async () => {
    await apiRequest("/api/admin/logout", { method: "POST" });
    showLogin();
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

  (async () => {
    const authenticated = await checkSession();

    if (!authenticated) {
      showLogin();
      return;
    }

    showDashboard();
    try {
      await loadDashboardData();
    } catch (error) {
      setMessage(coursesMessage, error.message, true);
    }
  })();
</script>
