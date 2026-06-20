import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import { isClerkConfigured } from "@/lib/auth/config";
import { logAuthModeOnStartup } from "@/lib/auth/validate-clerk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ImmigrationAssist — Australian Immigration Lawyer Platform",
  description:
    "Case management, client portal, and AI-assisted document drafting for Australian immigration lawyers.",
};

logAuthModeOnStartup();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const useClerk = isClerkConfigured();

  return (
    <AuthProvider useClerk={useClerk}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
