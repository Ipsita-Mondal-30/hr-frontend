import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import AuthBootstrap from "@/components/AuthBootstrap";

export const metadata: Metadata = {
  title: "HR Portal",
  description: "Smart HR system with AI match scoring and insights",
  icons: {
    icon: "/talora.png",
    shortcut: "/talora.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden min-w-0">
        <AuthProvider>
          <AuthBootstrap />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
