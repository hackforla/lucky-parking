import client from "./client";

let db;

try {
  db = await client.connect();
  console.log("Server connected to MongoDB");
} catch (e) {
  console.error(e);
} finally {
  await client.close();
}

export default db;
