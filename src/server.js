const { createApp } = require("./app");

const port = Number(process.env.PORT || 3000);
const dataFile = process.env.DATA_FILE || "./data/students.json";
const server = createApp({ dataFile });

server.listen(port, "0.0.0.0", () => {
  console.log(`Student API listening on port ${port}`);
});
