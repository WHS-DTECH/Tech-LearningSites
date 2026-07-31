const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { formidable } = require("formidable");
const {
  getPool,
  initAdminSchema,
  getDashboard,
  getCourseStatus,
  updateCourseRequirement,
  getCourseContentTargets,
  getCourseContent,
  upsertCourseContent,
  saveCourseStatementPdf,
  getCourseStatementPdf
} = require("./backend/adminStore");

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, "dist");
const ADMIN_COOKIE_NAME = "whs_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const DEFAULT_GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1sLelrgqZRq1jKxH_AJ_21jpNjH8FSLLF?usp=drive_link";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    });
    response.end(data);
  });
}

function resolveRequestPath(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const relativePath = safePath === path.sep ? "" : safePath.replace(/^[/\\]+/, "");
  let filePath = path.join(distDir, relativePath);

  if (urlPath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  if (!path.extname(filePath)) {
    filePath = path.join(filePath, "index.html");
  }

  return filePath;
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function sendBinary(response, statusCode, fileBuffer, mimeType, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": mimeType || "application/octet-stream",
    ...extraHeaders
  });
  response.end(fileBuffer);
}

function getGoogleDriveFolderUrl() {
  return process.env.GOOGLE_DRIVE_SYNC_FOLDER_URL || DEFAULT_GOOGLE_DRIVE_FOLDER_URL;
}

async function fetchPublicDriveFolderPdfs() {
  const response = await fetch(getGoogleDriveFolderUrl(), {
    headers: {
      "User-Agent": "WHS-LearningSite/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Drive folder request failed with status ${response.status}`);
  }

  const html = await response.text();
  const fileMatches = [...html.matchAll(/data-id="([^"]+)"[^>]*data-tooltip="([^"]+\.pdf)\s+PDF"/gi)];
  const seenIds = new Set();
  const files = [];

  for (const match of fileMatches) {
    const fileId = match[1];
    const fileName = match[2].trim();
    if (!fileId || seenIds.has(fileId)) {
      continue;
    }

    seenIds.add(fileId);
    files.push({
      fileId,
      fileName,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
    });
  }

  const folderNameMatch = html.match(/Additional Links[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
  const folderName = folderNameMatch ? folderNameMatch[1].trim() : "Google Drive PDFs";

  return { folderName, files };
}

async function fetchPublicDrivePdfFile(fileId) {
  const response = await fetch(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`, {
    headers: {
      "User-Agent": "WHS-LearningSite/1.0"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Google Drive PDF download failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  if (!fileBuffer.length) {
    throw new Error("Downloaded Google Drive file is empty");
  }

  return {
    fileBuffer,
    mimeType: response.headers.get("content-type") || "application/pdf"
  };
}

function parseCookies(request) {
  const header = request.headers.cookie;

  if (!header) {
    return {};
  }

  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }

    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY || "local-dev-admin-secret";
}

function signSessionPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = signSessionPayload(payload);
  return `${payload}.${signature}`;
}

function safeCompare(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return false;
  }

  const [payload, signature] = token.split(".");
  const expiresAt = Number.parseInt(payload, 10);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = signSessionPayload(payload);
  return safeCompare(signature, expectedSignature);
}

function createSessionCookie(token) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}${secureFlag}`;
}

function clearSessionCookie() {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}

function isAdminAuthorized(request) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return true;
  }

  const providedKey = request.headers["x-admin-key"];
  if (providedKey && providedKey === configuredKey) {
    return true;
  }

  const cookies = parseCookies(request);
  return verifySessionToken(cookies[ADMIN_COOKIE_NAME]);
}

async function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
      }
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", (error) => reject(error));
  });
}

async function readMultipartBody(request) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024,
      allowEmptyFiles: false
    });

    form.parse(request, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

async function handleAdminApi(request, response, requestUrl) {
  const { pathname, searchParams } = requestUrl;

  if (request.method === "POST" && pathname === "/api/admin/login") {
    const configuredKey = process.env.ADMIN_API_KEY;

    if (!configuredKey) {
      sendJson(response, 503, {
        ok: false,
        error: "ADMIN_API_KEY is not configured"
      });
      return;
    }

    const body = await readJsonBody(request);

    if (!body.apiKey || body.apiKey !== configuredKey) {
      sendJson(response, 401, { ok: false, error: "Invalid admin key" });
      return;
    }

    const token = createSessionToken();
    sendJson(
      response,
      200,
      { ok: true },
      {
        "Set-Cookie": createSessionCookie(token)
      }
    );
    return;
  }

  if (request.method === "POST" && pathname === "/api/admin/logout") {
    sendJson(
      response,
      200,
      { ok: true },
      {
        "Set-Cookie": clearSessionCookie()
      }
    );
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/session") {
    sendJson(response, 200, {
      ok: true,
      authenticated: isAdminAuthorized(request)
    });
    return;
  }

  if (!isAdminAuthorized(request)) {
    sendJson(response, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  if (!getPool()) {
    sendJson(response, 503, {
      ok: false,
      error: "DATABASE_URL is not configured",
      hint: "Set DATABASE_URL and redeploy to enable admin APIs"
    });
    return;
  }

  await initAdminSchema();

  if (request.method === "GET" && pathname === "/api/admin/health") {
    sendJson(response, 200, { ok: true, db: "connected" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/course-content-targets") {
    const courses = await getCourseContentTargets();
    sendJson(response, 200, { ok: true, courses });
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/google-drive-pdfs") {
    const data = await fetchPublicDriveFolderPdfs();
    sendJson(response, 200, { ok: true, ...data });
    return;
  }

  if (request.method === "GET" && pathname.startsWith("/api/admin/course-content/")) {
    const courseCode = pathname.replace("/api/admin/course-content/", "").split("/")[0];
    const content = await getCourseContent(courseCode);
    sendJson(response, 200, { ok: true, ...content });
    return;
  }

  if (request.method === "POST" && pathname.startsWith("/api/admin/course-content/") && pathname.endsWith("/statement")) {
    const courseCode = pathname.replace("/api/admin/course-content/", "").replace("/statement", "");
    const { fields, files } = await readMultipartBody(request);
    const file = Array.isArray(files.statementPdf) ? files.statementPdf[0] : files.statementPdf;
    const uploaderNameRaw = Array.isArray(fields.updatedBy) ? fields.updatedBy[0] : fields.updatedBy;

    if (!file || !file.filepath) {
      throw new Error("statementPdf file is required");
    }

    const fileBuffer = await fs.promises.readFile(file.filepath);
    const result = await saveCourseStatementPdf({
      courseCode,
      fileName: file.originalFilename,
      mimeType: file.mimetype,
      fileBuffer,
      updatedBy: uploaderNameRaw || "ADMIN uploader"
    });

    sendJson(response, 200, result);
    return;
  }

  if (request.method === "POST" && pathname.startsWith("/api/admin/course-content/") && pathname.endsWith("/statement/google-drive")) {
    const courseCode = pathname.replace("/api/admin/course-content/", "").replace("/statement/google-drive", "");
    const body = await readJsonBody(request);

    if (!body.fileId || !body.fileName) {
      throw new Error("fileId and fileName are required");
    }

    const driveFile = await fetchPublicDrivePdfFile(body.fileId);
    const result = await saveCourseStatementPdf({
      courseCode,
      fileName: body.fileName,
      mimeType: driveFile.mimeType,
      fileBuffer: driveFile.fileBuffer,
      updatedBy: body.updatedBy || "Google Drive sync"
    });

    sendJson(response, 200, result);
    return;
  }

  if (request.method === "POST" && pathname.startsWith("/api/admin/course-content/")) {
    const courseCode = pathname.replace("/api/admin/course-content/", "").split("/")[0];
    const body = await readJsonBody(request);
    const result = await upsertCourseContent({
      courseCode,
      assessments: body.assessments,
      assessmentLinks: body.assessmentLinks,
      updatedBy: body.updatedBy || "ADMIN uploader"
    });

    sendJson(response, 200, result);
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/dashboard") {
    const year = Number.parseInt(searchParams.get("year"), 10);
    const term = searchParams.get("term") || "T1";
    const data = await getDashboard({
      year: Number.isInteger(year) ? year : undefined,
      term
    });

    sendJson(response, 200, { ok: true, ...data });
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/courses") {
    const year = Number.parseInt(searchParams.get("year"), 10);
    const term = searchParams.get("term") || "T1";
    const subject = searchParams.get("subject") || undefined;
    const status = searchParams.get("status") || undefined;

    const data = await getCourseStatus({
      year: Number.isInteger(year) ? year : undefined,
      term,
      subject,
      status
    });

    sendJson(response, 200, { ok: true, ...data });
    return;
  }

  if (request.method === "POST" && pathname === "/api/admin/courses/status") {
    const body = await readJsonBody(request);
    const result = await updateCourseRequirement(body);
    sendJson(response, 200, result);
    return;
  }

  sendJson(response, 404, { ok: false, error: "API route not found" });
}

async function handlePublicCourseContentApi(response, requestUrl) {
  if (!getPool()) {
    sendJson(response, 503, {
      ok: false,
      error: "DATABASE_URL is not configured"
    });
    return;
  }

  await initAdminSchema();

  const pathname = requestUrl.pathname;

  if (pathname.endsWith("/statement.pdf")) {
    const courseCode = pathname.replace("/api/course-content/", "").replace("/statement.pdf", "");
    const statement = await getCourseStatementPdf(courseCode);

    if (!statement) {
      sendJson(response, 404, { ok: false, error: "Statement PDF not found" });
      return;
    }

    sendBinary(response, 200, statement.fileBuffer, statement.mimeType, {
      "Content-Disposition": `inline; filename="${statement.fileName}"`
    });
    return;
  }

  const courseCode = pathname.replace("/api/course-content/", "").split("/")[0];
  const content = await getCourseContent(courseCode);

  sendJson(response, 200, {
    ok: true,
    courseCode: content.courseCode,
    assessments: content.assessments,
    assessmentLinks: content.assessmentLinks,
    hasStatementPdf: content.hasStatementPdf,
    statementUrl: content.hasStatementPdf ? `/api/course-content/${content.courseCode}/statement.pdf` : null,
    statementFilename: content.statementFilename
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname.startsWith("/api/admin/")) {
    handleAdminApi(request, response, requestUrl).catch((error) => {
      sendJson(response, 500, {
        ok: false,
        error: error.message || "Server error"
      });
    });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/course-content/")) {
    handlePublicCourseContentApi(response, requestUrl).catch((error) => {
      sendJson(response, 500, {
        ok: false,
        error: error.message || "Server error"
      });
    });
    return;
  }

  const filePath = resolveRequestPath(requestUrl.pathname);

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  sendFile(filePath, response);
});

server.listen(port, () => {
  if (!process.env.ADMIN_API_KEY) {
    console.warn("ADMIN_API_KEY is not set. Admin APIs are not protected by API key.");
  }

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Admin APIs will return 503 until configured.");
  }

  console.log(`WHS Learning Site listening on port ${port}`);
});