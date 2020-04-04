require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3007;
const router = require("./router.js");
const path = require("path");

app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api", router);

app.listen(port, () => console.log(`Listening on port ${port}`));
