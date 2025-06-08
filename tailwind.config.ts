export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        Anek_Devanagari: ['Anek', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#2563eb",
          secondary: "#4b5563",
          accent: "#facc15",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          info: "#38bdf8",
          success: "#15803d",
          warning: "#fb923c",
          error: "#b91c1c",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
  experimental: {
    optimizeUniversalDefaults: true,
  },
};