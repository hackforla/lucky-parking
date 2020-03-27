const express = require("express");
const app = express();
const port = 3000;

// api -> waiter
app.get("/start", (request, respond) => respond.send("Hello World!"));

app.listen(port, () => console.log(`Hello Breeze listening on port ${port}!`));
