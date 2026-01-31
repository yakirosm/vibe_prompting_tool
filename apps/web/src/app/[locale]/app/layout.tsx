import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />
      <main className="flex-1 container py-4">{children}</main>
    </div>
  );
}
