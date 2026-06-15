import { config } from "../src/config.js";
import { createDatabase } from "../src/db/database.js";
import { initialize } from "../src/db/initialize.js";

const db = createDatabase(config.databasePath);
await initialize({ db, config });
const count = db.prepare("SELECT COUNT(*) count FROM dataset_entries").get().count;
console.log(`种子导入完成，共 ${count} 条结构化资料。`);
db.close();
