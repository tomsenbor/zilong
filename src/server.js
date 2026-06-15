import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDatabase } from "./db/database.js";
import { initialize } from "./db/initialize.js";

const db = createDatabase(config.databasePath);
await initialize({ db, config });
const app = createApp({ db, config });
const server = app.listen(config.port, () => {
  console.log(`星露谷攻略站已启动：http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
