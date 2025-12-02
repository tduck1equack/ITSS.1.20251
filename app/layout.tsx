import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HUST LMS - Hệ thống Quản lý Học tập",
  description:
    "Nền tảng học tập trực tuyến hiện đại cho Đại học Bách Khoa Hà Nội",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <ToastProvider>
          <AuthProvider>
            <Theme
              accentColor="teal"
              grayColor="slate"
              radius="medium"
              scaling="100%"
            >
              {children}
            </Theme>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
