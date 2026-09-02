import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mono",
  description: "mono UI",
  icons: { icon: "/logo-solid.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-kumo-base text-kumo-default antialiased">
        {children}
      </body>
    </html>
  );
}
