const fs = require("node:fs/promises");
const path = require("node:path");

class StudentStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]", "utf8");
    }
  }

  async read() {
    await this.init();
    const contents = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(contents);
  }

  async write(students) {
    await this.init();
    await fs.writeFile(this.filePath, JSON.stringify(students, null, 2), "utf8");
  }

  async list() {
    return this.read();
  }

  async get(id) {
    const students = await this.read();
    return students.find((student) => student.id === id);
  }

  async create(student) {
    const students = await this.read();
    students.push(student);
    await this.write(students);
    return student;
  }

  async update(id, student) {
    const students = await this.read();
    const index = students.findIndex((item) => item.id === id);
    if (index === -1) return null;
    students[index] = student;
    await this.write(students);
    return student;
  }

  async remove(id) {
    const students = await this.read();
    const index = students.findIndex((item) => item.id === id);
    if (index === -1) return false;
    students.splice(index, 1);
    await this.write(students);
    return true;
  }
}

module.exports = { StudentStore };
