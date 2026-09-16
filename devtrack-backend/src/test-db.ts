import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    await client.connect();
    console.log("✅ PostgreSQL connection successful!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:");
    console.error(error);
  } finally {
    await client.end();
  }
}

test();