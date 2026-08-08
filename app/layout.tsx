import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'POKE — Product Showcase & QA Testing Platform',
  description: 'Poke web apps, report visual bugs, and collaborate with QA reviewers seamlessly.',
  openGraph: {
    title: 'POKE — Product Showcase & QA Testing Platform',
    description: 'Poke web apps, report visual bugs, and collaborate with QA reviewers seamlessly.',
    type: 'website',
    siteName: 'POKE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POKE — Product Showcase & QA Testing Platform',
    description: 'Poke web apps, report visual bugs, and collaborate with QA reviewers seamlessly.',
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('poke_theme');
                  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#f4f4f6] text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
