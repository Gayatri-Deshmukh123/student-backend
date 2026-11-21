const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");
const { createApp } = require("../src/app");

async function withServer(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "student-api-"));
  const dataFile = path.join(directory, "students.json");
  const server = createApp({ dataFile });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())
    );
  }
}

test("student CRUD and health endpoints", async () => {
  await withServer(async (baseUrl) => {
    let response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });

    response = await fetch(`${baseUrl}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Lovelace", email: "ada@example.com", course: "CS" })
    });
    assert.equal(response.status, 201);
    const created = await response.json();
    assert.equal(created.name, "Ada Lovelace");

    response = await fetch(`${baseUrl}/api/students/${created.id}`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).email, "ada@example.com");

    response = await fetch(`${baseUrl}/api/students/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Byron", email: "ada@example.com", course: "Math" })
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).name, "Ada Byron");

    response = await fetch(`${baseUrl}/api/students/${created.id}`, { method: "DELETE" });
    assert.equal(response.status, 204);

    response = await fetch(`${baseUrl}/api/students/${created.id}`);
    assert.equal(response.status, 404);
  });
});

test("rejects invalid student input", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" })
    });
    assert.equal(response.status, 400);
  });
});
