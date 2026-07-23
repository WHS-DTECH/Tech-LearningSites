const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, "dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
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

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const filePath = resolveRequestPath(requestUrl.pathname);

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  sendFile(filePath, response);
});

server.listen(port, () => {
  console.log(`WHS Learning Site listening on port ${port}`);
});