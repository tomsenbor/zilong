import bcrypt from "bcryptjs";
import { seedDatabase } from "./seed.js";

export async function initialize({ db, config }) {
  const passwordHash = await bcrypt.hash(config.adminPassword, 12);
  db.prepare(`
    INSERT INTO admins(username, password_hash) VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
  `).run(config.adminUsername, passwordHash);
  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES ('game_version', '1.6.15')").run();
  seedDatabase(db);
}
