'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div style={{ paddingTop: '70px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}