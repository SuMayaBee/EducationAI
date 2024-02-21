/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "img.clerk.com",
            }
        ],
       domains: ['qph.cf2.quoracdn.net'],
    },
    experimental: {
       // appDir: true,
    }, webpack(config) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        return config;
    },
};

export default nextConfig;


