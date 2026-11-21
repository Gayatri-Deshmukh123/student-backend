const http = require("node:http");
const { URL } = require("node:url");
const { StudentStore } = require("./store");

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Invalid JSON");
    error.status = 400;
    throw error;
  }
}

function validateStudent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "A JSON student object is required";
  }
  if (typeof input.name !== "string" || !input.name.trim()) {
    return "name is required";
  }
  if (typeof input.email !== "string" || !input.email.trim()) {
    return "email is required";
  }
  return null;
}

function createApp(options = {}) {
  const store = options.store || new StudentStore(options.dataFile || "./data/students.json");
  let nextId = 1;

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean);

      if (request.method === "GET" && url.pathname === "/health") {
        return sendJson(response, 200, { status: "ok" });
      }
      if (request.method === "GET" && url.pathname === "/ready") {
        await store.list();
        return sendJson(response, 200, { status: "ready" });
      }

      if (parts[0] !== "api" || parts[1] !== "students") {
        return sendJson(response, 404, { error: "Not found" });
      }

      if (request.method === "GET" && parts.length === 2) {
        return sendJson(response, 200, await store.list());
      }

      if (request.method === "POST" && parts.length === 2) {
        const input = await readJson(request);
        const validationError = validateStudent(input);
        if (validationError) return sendJson(response, 400, { error: validationError });

        while (await store.get(String(nextId))) nextId++;
        const student = {
          id: String(nextId++),
          name: input.name.trim(),
          email: input.email.trim(),
          ...(input.course === undefined ? {} : { course: String(input.course) })
        };
        await store.create(student);
        return sendJson(response, 201, student);
      }

      if (parts.length === 3) {
        const id = decodeURIComponent(parts[2]);
        if (request.method === "GET") {
          const student = await store.get(id);
          return student
            ? sendJson(response, 200, student)
            : sendJson(response, 404, { error: "Student not found" });
        }

        if (request.method === "PUT") {
          const input = await readJson(request);
          const validationError = validateStudent(input);
          if (validationError) return sendJson(response, 400, { error: validationError });
          const student = {
            id,
            name: input.name.trim(),
            email: input.email.trim(),
            ...(input.course === undefined ? {} : { course: String(input.course) })
          };
          const updated = await store.update(id, student);
          return updated
            ? sendJson(response, 200, updated)
            : sendJson(response, 404, { error: "Student not found" });
        }

        if (request.method === "DELETE") {
          const deleted = await store.remove(id);
          return deleted
            ? sendJson(response, 204)
            : sendJson(response, 404, { error: "Student not found" });
        }
      }

      return sendJson(response, 405, { error: "Method not allowed" });
    } catch (error) {
      sendJson(response, error.status || 500, {
        error: error.status ? error.message : "Internal server error"
      });
    }
  });

  return server;
}

module.exports = { createApp };
