import express, { Application } from "express";
import bodyParser from "./middleware/body-parser";
import cors from "./middleware/cors";
import httplogger from "./middleware/http-logger";
import router from "./routes";

const { API_VERSION } = process.env;

const app: Application = express();

app.use(cors);
app.use(httplogger);
app.use(bodyParser);

app.use(`/${API_VERSION}`, router);

export default app;
