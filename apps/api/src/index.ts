import app from "./app";
import "dotenv/config";
import { connect } from "@/database";

const { PORT = 3001 } = process.env;

async function start() {
	await connect();
	app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

void start();
