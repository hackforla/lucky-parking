import client from "./client";
import { Db } from "mongodb";

const { DB_NAME } = process.env;

let db: Db | undefined;

export const connect = async () => {
	try {
		const mongo = await client.connect();
		db = mongo.db(DB_NAME);
		return db;
	} catch (e) {
		console.error(e);
	}
};

export const getDb = (): Db => {
	if (!db) throw new Error("Database is not connected");
	return db;
};
