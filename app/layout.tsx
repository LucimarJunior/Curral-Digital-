import type { Metadata } from 'next';
import { Inter, Work_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Curral Digital - Login',
  description: 'Gestão inteligente para pecuária de precisão.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${workSans.variable}`}>
      <body suppressHydrationWarning className="antialiased selection:bg-[#012d1d]/20 selection:text-[#012d1d]">
        {children}
      </body>
    </html>
  );
}
