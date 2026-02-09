'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isLandingPage && <Navbar />}
      <main className={`flex-1 ${!isLandingPage ? 'pt-16' : ''}`}>{children}</main>
      {!isLandingPage && <Footer />}
    </div>
  );
}
