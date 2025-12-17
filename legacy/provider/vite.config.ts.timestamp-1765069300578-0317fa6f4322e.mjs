// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/Public/thelokals.com/thelokals.com/packages/provider/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Public/thelokals.com/thelokals.com/node_modules/@vitejs/plugin-react/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Public\\thelokals.com\\thelokals.com\\packages\\provider";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__vite_injected_original_dirname, "../.."), "");
  return {
    server: {
      port: Number(process.env.PORT) || 5173,
      host: "0.0.0.0"
    },
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      target: "esnext",
      minify: "terser",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["react-hot-toast", "react-helmet"]
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production"
        }
      }
    },
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom", "react-router-dom"],
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "."),
        "@core": path.resolve(__vite_injected_original_dirname, "../core"),
        "@thelocals/core": path.resolve(__vite_injected_original_dirname, "../core")
      }
    },
    envDir: path.resolve(__vite_injected_original_dirname, "../..")
    // Load .env from monorepo root
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQdWJsaWNcXFxcdGhlbG9rYWxzLmNvbVxcXFx0aGVsb2thbHMuY29tXFxcXHBhY2thZ2VzXFxcXHByb3ZpZGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQdWJsaWNcXFxcdGhlbG9rYWxzLmNvbVxcXFx0aGVsb2thbHMuY29tXFxcXHBhY2thZ2VzXFxcXHByb3ZpZGVyXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QdWJsaWMvdGhlbG9rYWxzLmNvbS90aGVsb2thbHMuY29tL3BhY2thZ2VzL3Byb3ZpZGVyL3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICAvLyBMb2FkIGVudiBmaWxlIGZyb20gbW9ub3JlcG8gcm9vdCAodHdvIGxldmVscyB1cCBmcm9tIHBhY2thZ2VzL3Byb3ZpZGVyKVxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uJyksICcnKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwb3J0OiBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCkgfHwgNTE3MyxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG91dERpcjogJy4vZGlzdCcsXHJcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgICAndWktdmVuZG9yJzogWydyZWFjdC1ob3QtdG9hc3QnLCAncmVhY3QtaGVsbWV0J10sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICAgIGRyb3BfY29uc29sZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGRlZHVwZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4nKSxcclxuICAgICAgICAnQGNvcmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vY29yZScpLFxyXG4gICAgICAgICdAdGhlbG9jYWxzL2NvcmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vY29yZScpLFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZW52RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKSwgLy8gTG9hZCAuZW52IGZyb20gbW9ub3JlcG8gcm9vdFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUhsQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssUUFBUSxrQ0FBVyxPQUFPLEdBQUcsRUFBRTtBQUU5RCxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNLE9BQU8sUUFBUSxJQUFJLElBQUksS0FBSztBQUFBLE1BQ2xDLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDekQsYUFBYSxDQUFDLG1CQUFtQixjQUFjO0FBQUEsVUFDakQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsVUFBVTtBQUFBLFVBQ1IsY0FBYyxRQUFRLElBQUksYUFBYTtBQUFBLFFBQ3pDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUCxRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLE1BQ2pELE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEdBQUc7QUFBQSxRQUNoQyxTQUFTLEtBQUssUUFBUSxrQ0FBVyxTQUFTO0FBQUEsUUFDMUMsbUJBQW1CLEtBQUssUUFBUSxrQ0FBVyxTQUFTO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUE7QUFBQSxFQUN6QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
