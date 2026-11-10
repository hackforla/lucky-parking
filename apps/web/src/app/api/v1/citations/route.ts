import { NextResponse } from "next/server";
import { CitationsRequestSchema, CitationsResultSchema } from "@/lib/citations/schema";

export const runtime = "nodejs";

// PARKING_API_KEY is deliberately read only by the Next.js server.
export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Expected a JSON request." }, { status: 400 });
	}
	const parsed = CitationsRequestSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid dates or location selection." }, { status: 422 });
	}
	const baseUrl = process.env.PARKING_API_URL;
	if (!baseUrl) {
		return NextResponse.json({ error: "The parking data service is not configured." }, { status: 503 });
	}
	try {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (process.env.PARKING_API_KEY) headers["X-API-Key"] = process.env.PARKING_API_KEY;
		const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/citations`, {
			method: "POST",
			headers,
			body: JSON.stringify(parsed.data),
			cache: "no-store",
			signal: AbortSignal.timeout(35_000),
		});
		if (!upstream.ok) {
			const status = upstream.status === 422 ? 422 : 503;
			return NextResponse.json(
				{
					error:
						status === 422
							? "Invalid date range or location selection."
							: "The parking data service is unavailable. Please try again.",
				},
				{ status }
			);
		}
		const result = CitationsResultSchema.safeParse(await upstream.json());
		if (!result.success) throw new Error("Invalid parking data response");
		return NextResponse.json(result.data, { headers: { "Cache-Control": "no-store" } });
	} catch {
		return NextResponse.json({ error: "The parking data service is unavailable. Please try again." }, { status: 503 });
	}
}
