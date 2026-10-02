import type { Metadata } from 'next';
import Script from 'next/script';
import { Archivo, Google_Sans_Code, Xanh_Mono } from 'next/font/google';
import './globals.css';

const fontSans = Archivo({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Google_Sans_Code({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'monospace'],
});

const fontSerif = Xanh_Mono({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'mono',
  description: 'mono UI',
  icons: { icon: '/logo-solid.svg' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} min-h-dvh bg-kumo-base text-kumo-default antialiased font-sans`}
      >
        {children}
        {/* Restores the code-theme preference before first paint so
            highlighted blocks never flash the default theme. Injected
            into <head> by the beforeInteractive strategy (Next.js
            "preventing flash before hydration" guide). */}
        <Script id="mono-code-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("code-theme");if(t==="hc")document.documentElement.setAttribute("data-code-theme",t)}catch(e){}`}
        </Script>
      </body>
    </html>
  );
}
