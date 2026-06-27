import type { Metadata } from "next";
import "@fontsource/geist";
import "@fontsource/geist-mono";
import "./globals.css"; 
export const metadata: Metadata = {
  title: "SlapME",
  description: "", 
  openGraph: {
    title: "SlapME",
    description:
      "", 
    images: ["/"],
  },
  other: {
    "talentapp:project_verification":
  "4a6ed415e60ee14f974499200831b1ed71156561eab6b2eff7c7347b9298a212400d4d3ffe5e4a7fd3d6592bee3f855c783435d09fe22f19f455ed33471db21d",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Geist, sans-serif",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {children} 
      </body>
    </html>
  );
}
