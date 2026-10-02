import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { FacilityProvider } from "@/lib/facility-store";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VR Jester",
  description: "Real places. Real experiences. Bucket list moments without boundaries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <FacilityProvider>{children}</FacilityProvider>
      </body>
    </html>
  );
}
