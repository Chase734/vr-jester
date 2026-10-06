import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { FacilityProvider } from "@/lib/facility-store";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VR Jester",
  description: "AI-powered resident engagement, delivered through VR.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <FacilityProvider>{children}</FacilityProvider>
      </body>
    </html>
  );
}
