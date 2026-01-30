import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Prompt Ops Copilot - Transform Issues into Agent-Ready Prompts',
  description:
    'Convert amateur development issues into professional, structured prompts optimized for AI coding tools like Cursor, Lovable, Replit, and Codex.',
  keywords: [
    'prompt engineering',
    'AI prompts',
    'Cursor',
    'Lovable',
    'Replit',
    'Codex',
    'developer tools',
    'AI coding assistant',
  ],
  authors: [{ name: 'Prompt Ops Copilot' }],
  openGraph: {
    title: 'Prompt Ops Copilot',
    description: 'Transform amateur issues into professional AI prompts',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
