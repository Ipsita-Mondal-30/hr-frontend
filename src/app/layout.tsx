import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import TokenHandler from "@/components/TokenHandler";

export const metadata: Metadata = {
  title: "Talora - Professional HR Management System",
  description: "Comprehensive HR management platform for modern organizations",
  icons: {
    icon: "/talora.png",
    shortcut: "/talora.png",
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
          <TokenHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
