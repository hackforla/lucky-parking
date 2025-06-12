import "dotenv/config";
import { connect } from "./database/db";
import app from "./app";

const { PORT = 3000 } = process.env;

connect();

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
