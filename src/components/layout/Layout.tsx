import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <main className="container py-8">
        {children}
      </main>
    </div>
  );
}
