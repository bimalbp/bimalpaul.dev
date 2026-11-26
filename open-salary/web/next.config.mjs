/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dataset is read from data/ at request time; make sure it ships with the server build.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
  async headers() {
    // The API is public and read-only: let any site or app call it.
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
    ];
  },
};
export default nextConfig;
