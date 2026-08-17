import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  // Lockfiles exist in parent directories too, and Turbopack otherwise infers
  // one of those as the workspace root.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
}

export default nextConfig
