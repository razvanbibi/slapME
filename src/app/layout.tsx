import type { Metadata } from "next";
import "@fontsource/geist";        //Geist 
import "@fontsource/geist-mono";   // Geist Mono font
import "./globals.css";
export const metadata: Metadata = {
  title: "CeloDaily",
  description: "Daily check-ins on Celo to grow your streak and earn rewards",
  openGraph: {
    title: "CeloDaily",
    description:
      "Building a daily habit on Celo",
    images: ["/og-banner.png"],
  },
  other: {
    "talentapp:project_verification":
  "f875fa7a1ea67452fbabe71721d26b614545ac878afe43a4c515c2de15ebead92a186fdcb478cf471873bad34d52b244c1e836e3b0aed2159bc272e9c33054a0",

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
