/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        // Channel + response palette per the playbook.
        prep: "#8a8a82",
        email: "#2563eb",
        linkedin: "#4f46e5",
        social: "#f26d5b",
        paid: "#f97316",
        content: "#0d9488",
        phone: "#16a34a",
        physical: "#c79a3a",
        persona: "#8b5cf6",
        positive: "#16a34a",
        passive: "#64748b",
        timing: "#d97706",
        negative: "#ef6b6b",
        optout: "#991b1b",
        outcome: "#0d9488",
        board: "#f4f2ee",
        ink: "#1f2430",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        lift: "0 8px 24px rgba(16,24,40,0.12)",
      },
    },
  },
  plugins: [],
};
