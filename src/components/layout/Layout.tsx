import React from 'react';
import { Header } from '../Header';
import Footer from '../Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {

  // Define the paths where footer should be hidden
  const hideFooter = () => {
    const path = location.pathname;

    // Exact paths
    const staticRoutesToHide = ['/login', '/register'];

    // Dynamic patterns
    const dynamicPatterns = [/^\/chat\/[^/]+$/];

    const matchesStatic = staticRoutesToHide.includes(path);
    const matchesDynamic = dynamicPatterns.some((pattern) => pattern.test(path));

    return matchesStatic || matchesDynamic;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter() && <Footer />}
    </div>
  );
}