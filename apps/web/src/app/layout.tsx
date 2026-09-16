import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodoraX | On-Demand Food Delivery',
  description: 'Fast, reliable food delivery powered by FoodoraX.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-cream text-brand-dark min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}