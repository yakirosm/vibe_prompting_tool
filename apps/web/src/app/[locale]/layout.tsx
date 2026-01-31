import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { locales, localeDirection, type Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  const metadata = messages.metadata as { title?: string; description?: string };

  return {
    title: metadata?.title || 'Prompt Ops Copilot - Transform Issues into Agent-Ready Prompts',
    description:
      metadata?.description ||
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
      locale: locale === 'he' ? 'he_IL' : 'en_US',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = localeDirection[locale as Locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
