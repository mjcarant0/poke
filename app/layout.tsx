import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'POKE — Minimalist Feedback & Bug Collector',
  description: 'Target-based bug reports and QA feedback collector for web applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f4f4f6] text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
