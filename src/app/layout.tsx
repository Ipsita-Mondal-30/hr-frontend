import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import AuthDebug from "@/components/AuthDebug";

export const metadata: Metadata = {
  title: "HR Portal",
  description: "Smart HR system with AI match scoring and insights",
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
          {/* <AuthDebug /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
