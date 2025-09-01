import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import FloatingFoodIcons from '@/components/ui/floating-food-icons';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StagKitchen',
  description: 'AI-powered recipes for bachelors',
  icons: [
    { rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try{
                var saved = localStorage.getItem('theme');
                var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = saved ? saved : (systemDark ? 'dark' : 'light');
                var root = document.documentElement;
                if(theme === 'dark') {
                  root.classList.add('dark');
                  root.style.colorScheme = 'dark';
                  root.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
                } else {
                  root.classList.remove('dark');
                  root.style.colorScheme = 'light';
                  root.style.backgroundColor = 'white';
                }
                
                // Re-enable transitions after a short delay
                setTimeout(function() {
                  var style = document.createElement('style');
                  style.textContent = '* { transition: all 0.3s ease !important; }';
                  document.head.appendChild(style);
                }, 100);
              }catch(e){}
            })();
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            html { 
              color-scheme: light; 
              background-color: white;
            }
            html.dark { 
              color-scheme: dark; 
              background-color: hsl(222.2 84% 4.9%);
            }
            body { 
              transition: none !important; 
              background-color: inherit;
            }
            * {
              transition: none !important;
            }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased flex flex-col min-h-screen bg-background finpay-bg-shapes relative`}>
        <FloatingFoodIcons />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
