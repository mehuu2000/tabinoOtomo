'use client'
import { AppProvider } from './appContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}