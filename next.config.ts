import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // STATIC_EXPORT=1 builds a plain static copy (out/) for sharing as a public link; static
  // export can't use partial prerendering, so those features are off for that build only.
  ...(process.env.STATIC_EXPORT ? { output: "export" as const } : { cacheComponents: true, partialPrefetching: true }),
};

export default nextConfig;
