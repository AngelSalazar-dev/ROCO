import { migrate } from "./db";

migrate()
  .then(() => { console.log("Migration OK"); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
