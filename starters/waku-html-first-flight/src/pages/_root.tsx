import type { ReactNode } from 'react';

export default async function RootElement({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: 24 }}>{children}</body>
    </html>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
