/** @type {import('tailwindcss').Config} */
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./redux/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        subtext: "0.9rem",
        subtextlg: "0.95rem",
      },
      screens: {
        "2xl-custom": "2144px",
      },
      fontFamily: {
        restart: ["RestartSoft", "sans-serif"],
        helvetica: ["HelveticaNowText", "sans-serif"],
        tinos: ["Tinos", "sans-serif"],
        popins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "primary-black": "#211E25",
        "purple-light": "#8C57B5",
        "dark-purple": "#6D1AAE",
        "primary-cloud": "#F9FBFC",
        "primary-grey": "#76727E",
        "primary-purple": "#973BE0",
        "primary-grey-2": "#EFF1F3",
        "primary-white": "#FCFDFF",
        "primary-red": "#F42F4E",
        "primary-border": "#E9EEF6",
        "primary-light-purple": "#EAE5F9",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderImage: {
        "at-card":
          "linear-gradient(114.04deg, rgba(197, 160, 245, 0.7) 26.23%, rgba(244, 98, 210, 0.7) 67.01%, rgba(151, 59, 224, 0.7) 97.19%) 1",
      },
      borderColor: {
        "custom-gradient-border":
          "linear-gradient(114.04deg, #C5A0F5 26.23%, #F462D2 67.01%, #973BE0 97.19%), linear-gradient(114.04deg, #C5A0F5 26.23%, #F462D2 67.01%, #973BE0 97.19%)",
        "custom-blue": "#DFDBF5",
      },
      backgroundImage: {
        "ats-card":
          "radial-gradient(92.73% 71.03% at 50% 0%, rgba(218, 191, 232, 0.12) 0%, rgba(150, 145, 167, 0.08) 49.92%, rgba(109, 72, 215, 0.08) 100%)",
        "line-gradient":
          "linear-gradient(to bottom, #C5A0F5 0%, #F462D2 30%, #973BE0 55%, rgba(255,255,255,0.2) 100%, rgba(255,255,255,0.3) 85%, #ffffff 9%)",

        "custom-gradient":
          "linear-gradient(151.99deg, #9AC4FF 3.87%, rgba(255, 255, 255, 0) 90.22%), linear-gradient(136.25deg, rgba(255, 255, 255, 0) 16.26%, #B871FF 113.51%)",
        "custom-gradient-2":
          "linear-gradient(114.04deg, #C5A0F5 26.23%, #F462D2 67.01%, #973BE0 97.19%), linear-gradient(114.04deg, #C5A0F5 26.23%, #F462D2 67.01%, #973BE0 97.19%)",
        "custom-grey-gradient":
          "linear-gradient(151.99deg, rgba(209, 228, 255, 0.2) 3.87%, rgba(255, 255, 255, 0) 90.22%), linear-gradient(136.25deg, rgba(255, 255, 255, 0) 16.26%, rgba(237, 219, 255, 0.3) 113.51%)",
        "lumina-gradient":
          "linear-gradient(113.04deg, rgba(172, 112, 250, 0.8) 26.28%, rgba(251, 60, 207, 0.8) 60%, rgba(139, 2, 247, 0.8) 88.3%)",
        "button-gradient":
          "radial-gradient(92.73% 71.03% at 50% 0%, rgba(218, 191, 232, 0.138) 0%, rgba(150, 145, 167, 0.092) 49.92%, rgba(109, 72, 215, 0.092) 100%)",
        "purple-gradient": "linear-gradient(180deg, #973BE0 0%, #BB74F3 100%)",
        "jobcard-gradient":
          "radial-gradient(92.73% 71.03% at 50% 0%, rgba(218, 191, 232, 0.12) 0%, rgba(218, 191, 232, 0.08) 49.92%, rgba(109, 72, 215, 0.08) 100%)",
        "auth-page":
          "linear-gradient(151.99deg, rgba(154, 196, 255, 0.2) 3.87%, rgba(255, 255, 255, 0) 90.22%), linear-gradient(136.25deg, rgba(255, 255, 255, 0) 16.26%, rgba(184, 113, 255, 0.2) 113.51%)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        animation: {},
      },
    },
  },
  plugins: [require("tailwindcss-animate"), addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
