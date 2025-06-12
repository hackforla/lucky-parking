import bodyParser from "body-parser";
import { Handler } from "express";

export default bodyParser.json() as Handler;
