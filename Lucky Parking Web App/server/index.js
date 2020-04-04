const express = require("express");
const app = express();
const port = 3007;
const router = require("./router.js");
const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", router);

app.listen(port, () => console.log(`Listening on port ${port}`));
