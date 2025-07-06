import localFont from "next/font/local";

import "./globals.css";
import { UserProvider } from "@/redux/userContext";
import { Toaster } from "react-hot-toast";


const overusedGrotesk = localFont({
  src: [
    {
      path: "./fonts/overused/OverusedGrotesk-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-BlackItalic.woff",
      weight: "900",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Book.woff",
      weight: "450", // Assuming "Book" is somewhere between Regular and Medium
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-BookItalic.woff",
      weight: "450",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-ExtraBold.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-ExtraBoldItalic.woff",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Italic.woff", // Assuming this is Regular Italic
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/overused/OverusedGrotesk-SemiBoldItalic.woff",
      weight: "600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-overused-grotesk",
});

// Define Roboto font
const roboto = localFont({
  src: [
    {
      path: "./fonts/roboto/Roboto-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-BlackItalic.woff",
      weight: "900",
      style: "italic",
    },
    {
      path: "./fonts/roboto/Roboto-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/roboto/Roboto-Italic.woff", // Assuming this is Regular Italic
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/roboto/Roboto-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/roboto/Roboto-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/roboto/Roboto-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-Thin.woff",
      weight: "100", // Roboto Thin is usually 100
      style: "normal",
    },
    {
      path: "./fonts/roboto/Roboto-ThinItalic.woff",
      weight: "100",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-roboto",
});

// Define Guminert font
const guminert = localFont({
  src: [
    {
      path: "./fonts/guminert/Guminert Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Bold Italic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Extra Bold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Extra Bold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Extra Bold Italic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Extra Bold Italic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Light Itaic.otf", // Note: "Itaic" typo in filename
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Light Itaic.ttf", // Note: "Itaic" typo in filename
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Medium Italic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Medium Italic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Regular Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Regular Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Semi Bold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Semi Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/guminert/Guminert Semi Bold Italic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/guminert/Guminert Semi Bold Italic.ttf",
      weight: "600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-guminert",
});
export const metadata = {
  title: "AI-Powered To-Do App",
  description: "Automatically sort, prioritize, and track your tasks with smart suggestions and reminders.",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
         className={`
          ${overusedGrotesk.variable}
          ${roboto.variable}
          ${guminert.variable}
          
          antialiased
        `}
      >
        <Toaster position="bottom-right" reverseOrder={false} />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
