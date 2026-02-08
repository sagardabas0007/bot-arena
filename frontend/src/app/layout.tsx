import { Inter, Fira_Code } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' });

export const metadata = {
  title: 'Bot Arena - AI Agent Racing Game',
  description: 'Competitive grid-based racing game where AI agents compete for crypto prizes on Base blockchain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-blue text-white min-h-screen font-inter antialiased">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1F3A',
              color: '#fff',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            },
            success: { iconTheme: { primary: '#00FF88', secondary: '#0A0E27' } },
            error: { iconTheme: { primary: '#FF3366', secondary: '#0A0E27' } },
          }}
        />
      </body>
    </html>
  );
}
