const express = require("express");
const routes = require("./routes");
import { connectToDatabase } from "./services/database.service";

const PORT = 3000;

const app = express();

connectToDatabase()
  .then(() => {
    app.use("/", routes);

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
