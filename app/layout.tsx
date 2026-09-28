import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/lib/auth/client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Reelcraft — Hire world-class creative talent",
  description:
    "Reelcraft is a premium marketplace connecting brands with motion designers, 3D artists, VFX artists, editors, animators, and compositors.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23101114'/%3E%3Cpath d='M9 22V10h6.2c2.9 0 4.8 1.6 4.8 4.1 0 1.9-1.1 3.2-2.8 3.7L20.5 22h-3.2l-3.7-5.6H12V22H9Zm3-7.7h3c1.3 0 2-.6 2-1.7s-.7-1.7-2-1.7h-3v3.4Z' fill='%23f2f0ea'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        <AuthProvider>
          <ToastProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
