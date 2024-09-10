"use client";

import dynamic from 'next/dynamic'
import { Inter } from "next/font/google";
import "./globals.css";
// import { UserProvider } from "@/contexts/UserContext";
const UserProvider = dynamic(() => import('@/contexts/UserContext'), { ssr: false })

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
