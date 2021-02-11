require("dotenv").config({ path: __dirname + '/.env' });


var compression = require('compression')
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3007;
const router = require("./router.js");

app.use(cors());
app.use(compression());


app.get('/', (req, res) => {
  res.json('OK at ' + new Date());
})

app.use("/api", router);

app.listen(port, () => console.log(`Listening on port ${port}`));
