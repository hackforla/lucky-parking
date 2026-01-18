import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN ?? "",
		socrataAppToken: process.env.SOCRATA_APP_TOKEN ?? "",
	});
}
