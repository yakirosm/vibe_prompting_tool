import { Header } from '@/components/layout/header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />
      <main className="flex-1 container py-4">{children}</main>
    </div>
  );
}
