import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "HR Portal",
  description: "Smart HR system with AI match scoring and insights",
  icons: {
    icon: "/talora.png", // <- your new favicon
    shortcut: "/talora.png", // optional, for browsers that use shortcut icons
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
