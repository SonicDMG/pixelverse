import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "PixelTicker - Retro Stock Analysis",
      template: "%s | PixelTicker"
    },
    description: "A cyberpunk pixel art stock analysis app powered by Langflow and MCP. Get AI-driven insights on stocks with a retro aesthetic.",
    keywords: ["stock analysis", "AI", "Langflow", "MCP", "retro", "cyberpunk", "financial data", "stock market"],
    authors: [{ name: "PixelTicker Team" }],
    creator: "PixelTicker",
    openGraph: {
      title: "PixelTicker - Retro Stock Analysis",
      description: "AI-powered stock analysis with a retro cyberpunk twist",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "PixelTicker - Retro Stock Analysis",
      description: "AI-powered stock analysis with a retro cyberpunk twist",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="grid-bg fixed inset-0 pointer-events-none" aria-hidden="true"></div>
        <div className="crt-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}

// Made with Bob
