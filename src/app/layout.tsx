import type { Metadata } from 'next';
import './globals.css';
import PageTransition from '@/components/PageTransition';
import BottomTabBar from '@/components/BottomTabBar';
import AppInit from '@/components/AppInit';

export const metadata: Metadata = {
  title: "D Mall — Ghana's Favourite Online Marketplace",
  description: 'Shop millions of products with fast delivery across Ghana. Mobile Money payments accepted.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary">
        <AppInit />
        <PageTransition>
          {/* pb-16 on mobile gives breathing room above the bottom tab bar */}
          <div className="pb-16 md:pb-0">
            {children}
          </div>
        </PageTransition>
        <BottomTabBar />
      </body>
    </html>
  );
}
