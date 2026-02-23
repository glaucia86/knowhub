import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
