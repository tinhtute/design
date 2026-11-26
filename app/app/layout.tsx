import type { Metadata } from 'next';
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `let theme;
try { theme = localStorage.getItem('theme'); } catch {}
const dark = theme === 'dark' ||
  (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.dataset.mode = dark ? 'dark' : 'light';
document.documentElement.classList.toggle('dark', dark);`,
          }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} min-h-dvh bg-kumo-base text-kumo-default antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
