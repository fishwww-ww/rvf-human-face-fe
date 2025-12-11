import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite 5.4.x 优化配置
  server: {
    port: 3000, // 自定义启动端口（默认 5173）
    open: true, // 启动后自动打开浏览器
    host: "0.0.0.0", // 允许局域网访问
  },
  css: {
    devSourcemap: true, // 开发环境 CSS SourceMap（调试样式更方便）
    preprocessorOptions: {
      css: {
        map: true, // 开启 CSS 映射
      },
    },
  },
  build: {
    outDir: "dist", // 构建输出目录
    sourcemap: false, // 生产环境关闭 SourceMap（减小体积）
    chunkSizeWarningLimit: 1000, // 增大包体积警告阈值（Vite 5.x 优化）
  },
});
