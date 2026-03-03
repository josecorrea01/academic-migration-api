require("dotenv").config({ quiet: true });

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

async function start() {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

start();