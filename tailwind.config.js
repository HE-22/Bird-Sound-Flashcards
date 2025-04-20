const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                bg: "#FAFAF7", // Bone-white
                primary: "#3CA66F", // Fern (Primary actions)
                "primary-700": "#2B8154", // Darker Fern (Hover/Pressed)
                accent: "#4FB4FF", // Sky (Secondary, Focus rings)
                text: "#1F1F1F", // Near Black
                "text-muted": "#5E6D66", // Muted Green/Gray
                border: "#E3E7E5",
                "shadow-color": "rgba(15, 61, 46, .08)", // Use in boxShadow utility if needed
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans], // Set Inter as default sans font
            },
            fontSize: {
                // Mapping spec sizes to Tailwind keys (adjust keys if needed)
                title: [
                    "2.25rem",
                    { lineHeight: "1.4", letterSpacing: "-0.02em" },
                ], // ~36px
                subtitle: [
                    "1.125rem",
                    { lineHeight: "1.4", letterSpacing: "0" },
                ], // ~18px
                "card-heading": [
                    "1.5rem",
                    { lineHeight: "1.4", letterSpacing: "-0.01em" },
                ], // ~24px
                body: ["1rem", { lineHeight: "1.4", letterSpacing: "0" }], // ~16px
                tiny: [
                    "0.875rem",
                    { lineHeight: "1.4", letterSpacing: "0.02em" },
                ], // ~14px
                "filter-chip": [
                    "0.875rem",
                    { lineHeight: "1.4", letterSpacing: "0" },
                ], // ~14px for segmented control
                "responsive-title-sm": [
                    "1.75rem",
                    { lineHeight: "1.4", letterSpacing: "-0.02em" },
                ], // ~28px for small screens
            },
            fontWeight: {
                // Mapping weights directly
                normal: "400",
                medium: "500",
                semibold: "600",
                bold: "700",
            },
            letterSpacing: {
                // Included in fontSize definition above, but can define separately if preferred
            },
            lineHeight: {
                // Defined in fontSize, but could add 'tight': '1.4' if needed globally
            },
            borderRadius: {
                card: "1rem",
                pill: "9999px",
            },
            spacing: {
                // Define custom spacing based on 1rem gutter if needed, though Tailwind defaults often suffice
                gutter: "1rem",
                18: "4.5rem", // For 4rem + 0.5rem padding example if needed
            },
            height: {
                11: "2.75rem", // For 44px buttons (approx)
                16: "4rem", // For bottom bar
            },
            padding: {
                safe: "env(safe-area-inset-bottom, 0.75rem)",
            },
            boxShadow: {
                card: "0 4px 10px 0 var(--shadow-color)",
                up: "0 -2px 8px 0 var(--shadow-color)", // Example for bottom bar shadow
            },
            aspectRatio: {
                "16/10": "16 / 10",
            },
            maxWidth: {
                grid: "90rem", // Matches spec
            },
            gridTemplateColumns: {
                // Ensure '12' is available
                12: "repeat(12, minmax(0, 1fr))",
            },
            keyframes: {
                shake: {
                    "0%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(4deg)" },
                    "75%": { transform: "rotate(-4deg)" },
                },
                // Keyframes for flip if needed separate from transition classes
            },
            animation: {
                shake: "shake 80ms ease-in-out 2", // 80ms duration, run twice
            },
            transitionTimingFunction: {
                flip: "cubic-bezier(.4, 0, .2, 1)",
            },
            transitionDuration: {
                300: "300ms",
            },
            // Add perspective and transform-style utilities if not inherently supported
            // or handle them via custom CSS / arbitrary values. Often handled in parent element style.
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require("@tailwindcss/aspect-ratio"), // Useful for card ratio
        // Add other plugins if needed, e.g., for custom form styling
    ],
};
