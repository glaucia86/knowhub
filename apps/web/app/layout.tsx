import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'KnowHub — Your Private AI Knowledge Base',
  description:
    'Capture, organize and retrieve knowledge locally. KnowHub is a privacy-first, local-only AI assistant for developers, researchers and knowledge workers.',
  keywords: [
    'knowledge management',
    'local AI',
    'privacy',
    'Ollama',
    'second brain',
    'open source',
  ],
  openGraph: {
    title: 'KnowHub — Your Private AI Knowledge Base',
    description: 'Capture, organize and retrieve knowledge locally. Zero cloud. Zero tracking.',
    type: 'website',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
