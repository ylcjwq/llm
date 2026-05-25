import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/contracts"],
	output: "standalone",
	outputFileTracingRoot: path.join(__dirname, "../../"),
	async rewrites() {
		return [
			{ source: "/api/:path*", destination: "http://localhost:3001/api/:path*" },
		];
	},
};

export default nextConfig;
