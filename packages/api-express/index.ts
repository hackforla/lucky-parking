import "dotenv/config";
import bodyParser from "body-parser";
import express from "express";

import routes from "./routes";
import "./database/db";

const { PORT = 3000 } = process.env;
const VERSION = "v1";

const app = express();

app.use(bodyParser.json());

app.use(`/${VERSION}`, routes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
