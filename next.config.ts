import type { NextConfig } from "next"
import path from "node:path"

const rootDir = process.cwd()

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
  },

  cacheComponents: true,
  // ===============================
  // 🚀 生产优化 —— 最关键的三行
  // ===============================
  output: "standalone",   // 让 Next.js 生成可独立运行的最小产物（大幅减小 Docker 镜像）
  compress: true,         // Gzip 压缩输出（确保小体积网络传输）
  // 避免开发环境通过非 localhost 访问时的 allowedDevOrigins 警告
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0", "::1", "172.20.10.3"],

  // 配置允许的外部图片域名
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dl.onwalk.net",
      },
      {
        protocol: "https",
        hostname: "www.svc.plus",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mmbiz.qpic.cn",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/public/images/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/public/images/**",
      },
    ],
  },

  webpack: (config) => {
    // 添加 YAML 文件支持
    config.module.rules.push({
      test: /\.ya?ml$/i,
      type: "asset/source",
    })

    // 显式 alias，保证 Turbopack 也能解析
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@components": path.join(rootDir, "src", "components"),
      "@i18n": path.join(rootDir, "src", "i18n"),
      "@lib": path.join(rootDir, "src", "lib"),
      "@types": path.join(rootDir, "types"),
      "@server": path.join(rootDir, "src", "server"),
      "@modules": path.join(rootDir, "src", "modules"),
      "@extensions": path.join(rootDir, "src", "modules", "extensions"),
      "@theme": path.join(rootDir, "src", "components", "theme"),
      "@templates": path.join(rootDir, "src", "modules", "templates"),
      "@src": path.join(rootDir, "src"),
      "@": path.join(rootDir, "src"),
    }

    // 添加模块搜索路径
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      rootDir,
      path.join(rootDir, "src"),
    ]

    return config
  },
  reactStrictMode: true,
  typedRoutes: false,
  turbopack: {
    root: path.resolve(rootDir),
  },

  async rewrites() {
    return [
      {
        source: "/editor",
        destination: "http://localhost:4000",
      },
      {
        source: "/editor/:path*",
        destination: "http://localhost:4000/:path*",
      },
      {
        source: "/images/:path+",
        destination: `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/images/:path+`,
      },
      {
        source: "/videos/:path+",
        destination: `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/videos/:path+`,
      },
    ]
  },
}

export default nextConfig
