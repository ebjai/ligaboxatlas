/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
      { protocol: 'https', hostname: '*.espn.com' },
      { protocol: 'https', hostname: '*.dazn.com' },
      { protocol: 'https', hostname: '*.foxsports.com' },
      { protocol: 'https', hostname: '*.ringtv.com' },
      { protocol: 'https', hostname: '*.forbes.com' },
      { protocol: 'https', hostname: '*.businessinsider.com' },
      { protocol: 'https', hostname: '*.tmz.com' },
      { protocol: 'https', hostname: '' },
    ],
  },
  reactStrictMode: true,
};
export default nextConfig;
