// src/app/layout.tsx - Simplified version

import './globals.css';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ProtectedLayout>
          {children}
        </ProtectedLayout>
      </body>
    </html>
  );
}