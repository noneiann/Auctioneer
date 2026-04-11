import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.join(__dirname, "../../"),
	images: {
		domains: [
			"source.unsplash.com",
			"images.unsplash.com",
			"plus.unsplash.com",
			"picsum.photos",
			"via.placeholder.com",
		],
	},
};

export default nextConfig;
