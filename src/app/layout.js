import { Toaster } from "react-hot-toast";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: "Pet House | Adopt & Care",
  description: "Find your new best friend or book pet care services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Toaster position="top-center" />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}