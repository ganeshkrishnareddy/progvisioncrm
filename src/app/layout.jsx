import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ProgVision Portal",
  description: "ProgVision Digital — Candidate & Admin Onboarding Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`bg-[#0B1220] text-white min-h-screen relative ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
