import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	redirects: () => [{ source: "/", destination: "/parking-insights", permanent: false }],
};

export default nextConfig;
