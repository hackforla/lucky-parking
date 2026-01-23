import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	redirects: () => [{ source: "/", destination: "/parking-insights", permanent: false }],
};

export default nextConfig;
