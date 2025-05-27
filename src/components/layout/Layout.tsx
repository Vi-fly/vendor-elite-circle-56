
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  noFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, noFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
};

export default Layout;
