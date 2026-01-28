import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "PixelSpace - Retro Space Exploration",
      template: "%s | PixelSpace"
    },
    description: "A cyberpunk pixel art space exploration app powered by Langflow and MCP. Explore the cosmos with AI-driven insights and a retro aesthetic.",
    keywords: ["space exploration", "astronomy", "AI", "Langflow", "MCP", "retro", "cyberpunk", "cosmos", "planets", "stars"],
    authors: [{ name: "PixelSpace Team" }],
    creator: "PixelSpace",
    openGraph: {
      title: "PixelSpace - Retro Space Exploration",
      description: "AI-powered space exploration with a retro cyberpunk twist",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "PixelSpace - Retro Space Exploration",
      description: "AI-powered space exploration with a retro cyberpunk twist",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

// Made with Bob
