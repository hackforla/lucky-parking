import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import routes from "./routes";
import "./database/db";

const { PORT = 3000 } = process.env;
const VERSION = "v1";

const app = express();

app.use(morgan("[:date[iso]] :method :url :status (:response-time ms)"));

app.use(cors());

app.use(bodyParser.json());

app.use(`/${VERSION}`, routes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
