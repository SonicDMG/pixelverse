import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelTicker - Retro Stock Analysis",
  description: "A cyberpunk pixel art stock analysis app powered by Langflow and MCP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="grid-bg fixed inset-0 pointer-events-none"></div>
        <div className="crt-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}

// Made with Bob
