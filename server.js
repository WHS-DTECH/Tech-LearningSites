const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  getPool,
  initAdminSchema,
  getDashboard,
  getCourseStatus,
  updateCourseRequirement
} = require("./backend/adminStore");

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, "dist");

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

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function isAdminAuthorized(request) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return true;
  }

  const providedKey = request.headers["x-admin-key"];
  return providedKey && providedKey === configuredKey;
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

async function handleAdminApi(request, response, requestUrl) {
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

  const { pathname, searchParams } = requestUrl;

  if (request.method === "GET" && pathname === "/api/admin/health") {
    sendJson(response, 200, { ok: true, db: "connected" });
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