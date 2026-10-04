import { defineConfig } from "vite";

// Sem @vitejs/plugin-react: o esbuild já compila JSX com o runtime automático,
// então não é preciso `import React` em cada arquivo.
export default defineConfig({
  esbuild: { jsx: "automatic" },
});
