
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: 'Lumina Finance | Intelligent Budgeting',
  description: 'A modern budgeting and expense tracking app with AI insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <MobileNav />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
